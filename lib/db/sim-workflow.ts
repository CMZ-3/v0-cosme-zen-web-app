import { db } from "@/lib/db"
import {
  stockCards,
  stockMovements,
  simWorkflow,
  type SimWorkflowRow,
} from "@/lib/db/schema"
import { computeAvailable, deriveInventoryStatus } from "@/lib/db/stock-mutations"
import { rowToStockItem } from "@/lib/db/sim-mapping"
import { eq } from "drizzle-orm"
import type {
  PurchaseOrder,
  ReceiveRecord,
  SavedReservation,
  JobReservation,
  StockItem,
  SimulationBatch,
} from "@/lib/stock-types"

// ------------------------------------------------------------
// Server-side port of the stock simulation workflow. The database is the single
// source of truth: stock levels live in stock_cards, the canonical ledger is
// stock_movements, and workflow metadata (POs, reservations, receive records,
// document counters) lives in the single-row sim_workflow table.
// Every mutation runs in one transaction so nothing can drift.
// ------------------------------------------------------------

type DocType = "SSI" | "SRE" | "SIN" | "SRR"
type Counters = Record<DocType, number>

function genDocNo(counters: Counters, type: DocType): string {
  counters[type] = (counters[type] || 0) + 1
  const d = new Date()
  const stamp = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `${type}-${stamp}-${String(counters[type]).padStart(3, "0")}`
}

function nowTs(): string {
  return new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16)
}

function estDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const WORKFLOW_ID = "default"

/** Load (creating if needed) the single workflow row. */
async function loadWorkflowRow(tx: typeof db): Promise<SimWorkflowRow> {
  const [row] = await tx.select().from(simWorkflow).where(eq(simWorkflow.id, WORKFLOW_ID)).limit(1)
  if (row) return row
  const [created] = await tx.insert(simWorkflow).values({ id: WORKFLOW_ID }).returning()
  return created
}

/** Append a ledger entry to stock_movements. */
async function appendMovement(
  tx: typeof db,
  entry: {
    movementType: string
    stockCardId?: string | null
    itemCode?: string | null
    itemName: string
    quantity: number
    referenceNumber: string
    notes?: string
  },
) {
  await tx.insert(stockMovements).values({
    id: `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    referenceNumber: entry.referenceNumber,
    movementType: entry.movementType,
    stockCardId: entry.stockCardId ?? null,
    itemCode: entry.itemCode ?? null,
    itemName: entry.itemName,
    quantity: entry.quantity,
    status: "approved",
    notes: entry.notes ?? null,
    createdBy: "system",
  })
}

/** Recompute + persist a stock card's balance/reserved/incoming/ATP/status. */
async function patchCard(
  tx: typeof db,
  card: { id: string; minStock: number; maxStock: number },
  next: { balance: number; reserved: number; incoming: number },
) {
  await tx
    .update(stockCards)
    .set({
      balance: next.balance,
      reservedStock: next.reserved,
      incomingStock: next.incoming,
      available: computeAvailable(next.balance, next.reserved, next.incoming),
      inventoryStatus: deriveInventoryStatus(next.balance, card.minStock, card.maxStock),
      updatedAt: new Date(),
    })
    .where(eq(stockCards.id, card.id))
}

// ------------------------------------------------------------
// Read: assemble the full workflow state (minus client-only memoryBank)
// ------------------------------------------------------------

export interface WorkflowSnapshot {
  stock: StockItem[]
  purchaseOrders: PurchaseOrder[]
  jobReservations: JobReservation[]
  savedReservations: SavedReservation[]
  receiveRecords: ReceiveRecord[]
  docCounters: Counters
}

export async function getWorkflowSnapshot(): Promise<WorkflowSnapshot> {
  const cards = await db.select().from(stockCards)
  const row = await loadWorkflowRow(db)
  return {
    stock: cards.map(rowToStockItem).sort((a, b) => a.id.localeCompare(b.id)),
    purchaseOrders: (row.purchaseOrders as PurchaseOrder[]) ?? [],
    jobReservations: (row.jobReservations as JobReservation[]) ?? [],
    savedReservations: (row.savedReservations as SavedReservation[]) ?? [],
    receiveRecords: (row.receiveRecords as ReceiveRecord[]) ?? [],
    docCounters: (row.docCounters as Counters) ?? { SSI: 0, SRE: 0, SIN: 0, SRR: 0 },
  }
}

// ------------------------------------------------------------
// Split & Reserve — turns a client memoryBank into saved reservations
// ------------------------------------------------------------

export async function splitReserve(prefix: string, memoryBank: SimulationBatch[]) {
  if (!memoryBank?.length) throw new Error("Memory bank is empty")

  return db.transaction(async (tx) => {
    const row = await loadWorkflowRow(tx)
    const counters = { ...(row.docCounters as Counters) }
    const cards = await tx.select().from(stockCards)
    const cardById = new Map(cards.map((c) => [c.id, { ...c }]))

    const ssiNo = genDocNo(counters, "SSI")
    const newReservations: SavedReservation[] = []

    for (const sim of memoryBank) {
      const sreNo = genDocNo(counters, "SRE")
      const name = prefix ? `${prefix} -- ${sim.formulaName}` : sim.formulaName

      newReservations.push({
        id: sreNo,
        ssiRef: ssiNo,
        name,
        formulaName: sim.formulaName,
        date: new Date().toLocaleTimeString(),
        batchData: sim,
        status: "DRAFT",
        linkedJo: null,
      })

      // Increment reserved on each required stock card and recompute ATP.
      for (const req of sim.requirements) {
        const card = cardById.get(req.id)
        if (!card) continue
        card.reservedStock += req.qty
        await patchCard(tx, card, {
          balance: card.balance,
          reserved: card.reservedStock,
          incoming: card.incomingStock,
        })
      }

      await appendMovement(tx, {
        movementType: "reserve",
        itemName: sim.formulaName,
        quantity: 0,
        referenceNumber: `${ssiNo} -> ${sreNo}`,
        notes: `Reserved ${sim.batchSize}kg batch`,
      })
    }

    await tx
      .update(simWorkflow)
      .set({
        docCounters: counters,
        savedReservations: [...newReservations, ...((row.savedReservations as SavedReservation[]) ?? [])],
        updatedAt: new Date(),
      })
      .where(eq(simWorkflow.id, WORKFLOW_ID))

    return { ssiNo, created: newReservations.length }
  })
}

// ------------------------------------------------------------
// Link a reservation to a job order
// ------------------------------------------------------------

export async function linkReservation(resId: string, jobNo: string) {
  return db.transaction(async (tx) => {
    const row = await loadWorkflowRow(tx)
    const saved = (row.savedReservations as SavedReservation[]) ?? []
    const res = saved.find((r) => r.id === resId)
    if (!res) throw new Error("Reservation not found")

    const cards = await tx.select().from(stockCards)
    const cardById = new Map(cards.map((c) => [c.id, c]))

    const updatedSaved = saved.map((r) =>
      r.id === resId ? { ...r, status: "LINKED" as const, linkedJo: jobNo } : r,
    )

    const jobRes = [...((row.jobReservations as JobReservation[]) ?? [])]
    for (const req of res.batchData.requirements) {
      const card = cardById.get(req.id)
      const available = card ? card.balance : 0
      jobRes.push({
        jobNo,
        itemCode: req.id,
        itemName: card?.itemName ?? req.id,
        qtyNeeded: req.qty,
        qtyAllocated: Math.min(req.qty, available),
        status: available >= req.qty ? "READY" : "WAITING",
      })
    }

    await appendMovement(tx, {
      movementType: "reserve",
      itemName: res.formulaName,
      quantity: 0,
      referenceNumber: jobNo,
      notes: `Linked ${resId} -> ${jobNo}`,
    })

    await tx
      .update(simWorkflow)
      .set({ savedReservations: updatedSaved, jobReservations: jobRes, updatedAt: new Date() })
      .where(eq(simWorkflow.id, WORKFLOW_ID))

    return { linked: jobNo }
  })
}

// ------------------------------------------------------------
// Partial / full receive against a purchase order (+ FIFO auto-allocation)
// ------------------------------------------------------------

export async function partialReceive(poNo: string, quantities: number[]) {
  return db.transaction(async (tx) => {
    const row = await loadWorkflowRow(tx)
    const counters = { ...(row.docCounters as Counters) }
    const pos = ((row.purchaseOrders as PurchaseOrder[]) ?? []).map((po) => ({
      ...po,
      items: po.items.map((it) => ({ ...it })),
    }))
    const po = pos.find((p) => p.poNo === poNo)
    if (!po || po.status === "RECEIVED") throw new Error("PO not found or already received")

    const cards = await tx.select().from(stockCards)
    const cardById = new Map(cards.map((c) => [c.id, { ...c }]))
    const jobRes = ((row.jobReservations as JobReservation[]) ?? []).map((j) => ({ ...j }))

    let anyReceived = false
    let totalExcess = 0
    const receivedItems: ReceiveRecord["items"] = []

    po.items.forEach((poItem, idx) => {
      const receiveQty = Math.max(0, quantities[idx] || 0)
      if (receiveQty <= 0) return
      anyReceived = true

      const remaining = poItem.qty - (poItem.receivedQty || 0)
      const excessQty = Math.max(0, receiveQty - remaining)
      totalExcess += excessQty
      poItem.receivedQty = (poItem.receivedQty || 0) + receiveQty
      receivedItems.push({ itemId: poItem.itemId, name: poItem.name, qty: receiveQty, excessQty })

      const card = cardById.get(poItem.itemId)
      if (card) {
        card.balance += receiveQty
        card.incomingStock = Math.max(0, card.incomingStock - Math.min(receiveQty, remaining))

        // FIFO auto-allocation to WAITING jobs for this item.
        let remainingBalance = card.balance
        jobRes
          .filter((j) => j.itemCode === poItem.itemId && j.status === "WAITING")
          .sort((a, b) => a.jobNo.localeCompare(b.jobNo))
          .forEach((j) => {
            const stillNeeded = j.qtyNeeded - j.qtyAllocated
            if (remainingBalance >= stillNeeded) {
              j.qtyAllocated += stillNeeded
              j.status = "READY"
              remainingBalance -= stillNeeded
            } else if (remainingBalance > 0) {
              j.qtyAllocated += remainingBalance
              remainingBalance = 0
            }
          })
      }
    })

    if (!anyReceived) throw new Error("No quantities to receive")

    const allDone = po.items.every((it) => (it.receivedQty || 0) >= it.qty)
    po.status = allDone ? "RECEIVED" : "PARTIAL"

    // Persist affected stock cards.
    for (const ri of receivedItems) {
      const card = cardById.get(ri.itemId)
      if (!card) continue
      await patchCard(tx, card, {
        balance: card.balance,
        reserved: card.reservedStock,
        incoming: card.incomingStock,
      })
    }

    const srrNo = genDocNo(counters, "SRR")
    const hasExcess = totalExcess > 0
    const newRecord: ReceiveRecord = {
      srrNo,
      sinRef: po.poNo,
      supplier: po.supplier,
      items: receivedItems,
      receivedAt: nowTs(),
      isPartial: !allDone,
      hasExcess,
      totalExcess,
      note: hasExcess ? `Received with excess (+${totalExcess})` : allDone ? "Full receive" : "Partial receive",
    }

    // Ledger: one IN entry per received item.
    for (const ri of receivedItems) {
      const card = cardById.get(ri.itemId)
      await appendMovement(tx, {
        movementType: "buy_in",
        stockCardId: card?.id ?? null,
        itemCode: card?.itemCode ?? null,
        itemName: ri.name,
        quantity: ri.qty,
        referenceNumber: srrNo,
        notes: `${allDone ? "Full" : "Partial"} Receive from ${po.poNo}${ri.excessQty > 0 ? ` (excess +${ri.excessQty})` : ""}`,
      })
    }

    await tx
      .update(simWorkflow)
      .set({
        purchaseOrders: pos,
        jobReservations: jobRes,
        receiveRecords: [newRecord, ...((row.receiveRecords as ReceiveRecord[]) ?? [])],
        docCounters: counters,
        updatedAt: new Date(),
      })
      .where(eq(simWorkflow.id, WORKFLOW_ID))

    return { srrNo, status: po.status }
  })
}

// ------------------------------------------------------------
// Generate a purchase order for a short item
// ------------------------------------------------------------

export async function generatePO(itemId: string, shortageQty: number, orderQty: number) {
  return db.transaction(async (tx) => {
    const row = await loadWorkflowRow(tx)
    const counters = { ...(row.docCounters as Counters) }
    const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, itemId)).limit(1)
    if (!card) throw new Error("Stock card not found")

    const poNo = genDocNo(counters, "SIN")
    const extraQty = Math.max(0, orderQty - shortageQty)

    // Increase incoming and recompute ATP.
    const nextIncoming = card.incomingStock + orderQty
    await patchCard(tx, card, {
      balance: card.balance,
      reserved: card.reservedStock,
      incoming: nextIncoming,
    })

    const newPO: PurchaseOrder = {
      poNo,
      supplier: card.supplier ?? "Unknown",
      items: [
        {
          itemId: card.id,
          name: card.itemName,
          qty: orderQty,
          receivedQty: 0,
          shortageQty: Math.min(shortageQty, orderQty),
          extraQty,
        },
      ],
      status: "PENDING",
      eta: estDate(7),
      autoGenerated: true,
      reason: "shortage",
      extraNote: extraQty > 0 ? `Extra +${extraQty}` : null,
    }

    await appendMovement(tx, {
      movementType: "reserve",
      stockCardId: card.id,
      itemCode: card.itemCode,
      itemName: card.itemName,
      quantity: 0,
      referenceNumber: poNo,
      notes: `Ordered ${orderQty} ${card.unit}${extraQty > 0 ? ` (shortage ${Math.min(shortageQty, orderQty)} + extra ${extraQty})` : " (shortage)"}`,
    })

    await tx
      .update(simWorkflow)
      .set({
        purchaseOrders: [...((row.purchaseOrders as PurchaseOrder[]) ?? []), newPO],
        docCounters: counters,
        updatedAt: new Date(),
      })
      .where(eq(simWorkflow.id, WORKFLOW_ID))

    return { poNo }
  })
}
