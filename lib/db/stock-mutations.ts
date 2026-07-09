import { db } from "@/lib/db"
import {
  stockCards,
  stockLots,
  stockMovements,
  stockReservations,
  type StockCardRow,
} from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import type { InventoryStatus, MovementType } from "@/lib/stock-types"

// ------------------------------------------------------------
// Business rules (per PRD)
//   available (ATP) = balance - reserved + incoming
//   inventoryStatus derived from balance vs min/max
// The database is the source of truth: every write recomputes these on the
// server inside a transaction so balances can never drift.
// ------------------------------------------------------------

/** Movement types that ADD to on-hand balance. */
export const IN_TYPES: MovementType[] = ["buy_in", "adjust_in", "return", "found", "production"]
/** Movement types that REMOVE from on-hand balance. */
export const OUT_TYPES: MovementType[] = ["use_out", "adjust_out", "damage", "loss"]

/** Available-to-Promise. */
export function computeAvailable(balance: number, reserved: number, incoming: number): number {
  return balance - reserved + incoming
}

/** Derive the inventory status bucket from balance thresholds. */
export function deriveInventoryStatus(
  balance: number,
  minStock: number,
  maxStock: number,
): InventoryStatus {
  if (balance <= 0) return "out_of_stock"
  if (minStock > 0 && balance < minStock) return "low"
  if (maxStock > 0 && balance > maxStock) return "over_stock"
  return "healthy"
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function refNumber(prefix: string): string {
  const d = new Date()
  const stamp = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `${prefix}-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`
}

/** Recompute available + status for a card row and return the patch. */
function recalc(card: StockCardRow, nextBalance: number, nextReserved: number, nextIncoming: number) {
  return {
    balance: nextBalance,
    reservedStock: nextReserved,
    incomingStock: nextIncoming,
    available: computeAvailable(nextBalance, nextReserved, nextIncoming),
    inventoryStatus: deriveInventoryStatus(nextBalance, card.minStock, card.maxStock),
    updatedAt: new Date(),
  }
}

// ------------------------------------------------------------
// Inputs
// ------------------------------------------------------------

export interface ReceiveInput {
  stockCardId: string
  quantity: number
  movementType?: "buy_in" | "adjust_in" | "return" | "found" | "production"
  unitCost?: number
  lotNumber?: string
  expireDate?: string
  manufacturedDate?: string
  supplierLotNo?: string
  notes?: string
  createdBy?: string
  /** When true, this receipt fulfils expected incoming stock, so reduce incoming. */
  fromIncoming?: boolean
}

export interface IssueInput {
  stockCardId: string
  quantity: number
  movementType?: "use_out" | "adjust_out" | "damage" | "loss"
  notes?: string
  createdBy?: string
}

export interface ReserveInput {
  stockCardId: string
  jobOrderId: string
  jobNo: string
  quantity: number
}

export interface CreateStockCardInput {
  itemCode: string
  itemName: string
  itemNameEn?: string
  itemType: string
  category: string
  unit: string
  initialStock?: number
  minStock?: number
  maxStock?: number
  reorderPoint?: number
  unitCost?: number
  supplier?: string
  location?: string
  barcode?: string
  tradeName?: string
  inciName?: string
  casNo?: string
  storageTemp?: string
  expiryDate?: string
  status?: string
  createdBy?: string
}

// ------------------------------------------------------------
// Create a new stock card. When an opening balance is supplied we also write an
// approved "buy_in" opening movement so the ledger stays consistent, and (when
// a lot number would help traceability) an opening lot. Balance-derived fields
// (available, inventoryStatus) are always computed on the server.
// ------------------------------------------------------------
export async function createStockCard(input: CreateStockCardInput) {
  const code = input.itemCode?.trim()
  if (!code) throw new Error("Item code is required")
  if (!input.itemName?.trim()) throw new Error("Item name is required")

  const initial = Number(input.initialStock ?? 0)
  const minStock = Number(input.minStock ?? 0)
  const maxStock = Number(input.maxStock ?? 0)
  const reorderPoint = Number(input.reorderPoint ?? 0)
  const balance = Number.isFinite(initial) && initial > 0 ? initial : 0

  return db.transaction(async (tx) => {
    // Enforce unique item code (schema has no unique constraint on it).
    const [dupe] = await tx
      .select({ id: stockCards.id })
      .from(stockCards)
      .where(eq(stockCards.itemCode, code))
      .limit(1)
    if (dupe) throw new Error(`Item code "${code}" already exists`)

    const id = `STK-${code}`
    const now = new Date()
    const inventoryStatus = deriveInventoryStatus(balance, minStock, maxStock)

    await tx.insert(stockCards).values({
      id,
      userId: null,
      itemCode: code,
      itemName: input.itemName.trim(),
      itemNameEn: input.itemNameEn?.trim() || null,
      itemType: input.itemType,
      category: input.category?.trim() || "Uncategorized",
      unit: input.unit?.trim() || "ea",
      balance,
      reservedStock: 0,
      incomingStock: 0,
      available: computeAvailable(balance, 0, 0),
      initialStock: balance,
      minStock,
      maxStock,
      reorderPoint,
      unitCost: input.unitCost != null ? Number(input.unitCost) : null,
      supplier: input.supplier?.trim() || null,
      location: input.location?.trim() || null,
      barcode: input.barcode?.trim() || null,
      tradeName: input.tradeName?.trim() || null,
      inciName: input.inciName?.trim() || null,
      casNo: input.casNo?.trim() || null,
      storageTemp: input.storageTemp?.trim() || null,
      expiryDate: input.expiryDate?.trim() || null,
      defaultLot: null,
      status: input.status ?? "active",
      inventoryStatus,
      createdAt: now,
      updatedAt: now,
    })

    // Opening balance movement for the ledger.
    if (balance > 0) {
      await tx.insert(stockMovements).values({
        id: genId("mv"),
        userId: null,
        referenceNumber: refNumber("OPN"),
        movementType: "adjust_in",
        stockCardId: id,
        itemCode: code,
        itemName: input.itemName.trim(),
        quantity: balance,
        unitCost: input.unitCost != null ? Number(input.unitCost) : null,
        totalCost: input.unitCost != null ? Number(input.unitCost) * balance : null,
        status: "approved",
        notes: "Opening balance (new stock card)",
        createdBy: input.createdBy ?? "system",
      })
    }

    return { id, itemCode: code, balance, inventoryStatus }
  })
}

export interface ImportStockRow {
  itemCode: string
  itemName: string
  itemNameEn?: string
  itemType?: string
  category?: string
  unit?: string
  balance?: number
  minStock?: number
  maxStock?: number
  reorderPoint?: number
  unitCost?: number
  supplier?: string
  location?: string
  barcode?: string
  tradeName?: string
  inciName?: string
  casNo?: string
  storageTemp?: string
  expiryDate?: string
}

export interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
}

// ------------------------------------------------------------
// Bulk import stock cards from parsed spreadsheet rows. Rows are matched to
// existing cards by itemCode: existing ones are UPDATED (metadata + thresholds,
// never silently overwriting live balances), new ones are INSERTED. Balances
// are only set from the sheet for brand-new cards to avoid clobbering ledger
// state on re-import.
// ------------------------------------------------------------
export async function bulkImportStockCards(
  rows: ImportStockRow[],
  createdBy = "import",
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] }
  if (!Array.isArray(rows) || rows.length === 0) return result

  // Preload existing cards keyed by itemCode.
  const existing = await db.select().from(stockCards)
  const byCode = new Map(existing.map((c) => [c.itemCode, c]))

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const code = String(raw.itemCode ?? "").trim()
    const name = String(raw.itemName ?? "").trim()
    if (!code || !name) {
      result.skipped++
      result.errors.push(`Row ${i + 1}: missing itemCode or itemName`)
      continue
    }

    const minStock = Number(raw.minStock ?? 0) || 0
    const maxStock = Number(raw.maxStock ?? 0) || 0
    const reorderPoint = Number(raw.reorderPoint ?? 0) || 0
    const unitCost = raw.unitCost != null && raw.unitCost !== ("" as unknown) ? Number(raw.unitCost) : null

    try {
      const current = byCode.get(code)
      if (current) {
        // Update metadata + thresholds; keep live balance/reserved/incoming.
        const patch = {
          itemName: name,
          itemNameEn: raw.itemNameEn?.trim() || current.itemNameEn,
          itemType: raw.itemType || current.itemType,
          category: raw.category?.trim() || current.category,
          unit: raw.unit?.trim() || current.unit,
          minStock,
          maxStock,
          reorderPoint,
          unitCost: unitCost ?? current.unitCost,
          supplier: raw.supplier?.trim() || current.supplier,
          location: raw.location?.trim() || current.location,
          barcode: raw.barcode?.trim() || current.barcode,
          tradeName: raw.tradeName?.trim() || current.tradeName,
          inciName: raw.inciName?.trim() || current.inciName,
          casNo: raw.casNo?.trim() || current.casNo,
          storageTemp: raw.storageTemp?.trim() || current.storageTemp,
          expiryDate: raw.expiryDate?.trim() || current.expiryDate,
          inventoryStatus: deriveInventoryStatus(current.balance, minStock, maxStock),
          updatedAt: new Date(),
        }
        await db.update(stockCards).set(patch).where(eq(stockCards.id, current.id))
        result.updated++
      } else {
        const balance = Number(raw.balance ?? 0) || 0
        const id = `STK-${code}`
        const now = new Date()
        await db.insert(stockCards).values({
          id,
          userId: null,
          itemCode: code,
          itemName: name,
          itemNameEn: raw.itemNameEn?.trim() || null,
          itemType: raw.itemType || "raw_material",
          category: raw.category?.trim() || "Uncategorized",
          unit: raw.unit?.trim() || "ea",
          balance,
          reservedStock: 0,
          incomingStock: 0,
          available: computeAvailable(balance, 0, 0),
          initialStock: balance,
          minStock,
          maxStock,
          reorderPoint,
          unitCost,
          supplier: raw.supplier?.trim() || null,
          location: raw.location?.trim() || null,
          barcode: raw.barcode?.trim() || null,
          tradeName: raw.tradeName?.trim() || null,
          inciName: raw.inciName?.trim() || null,
          casNo: raw.casNo?.trim() || null,
          storageTemp: raw.storageTemp?.trim() || null,
          expiryDate: raw.expiryDate?.trim() || null,
          defaultLot: null,
          status: "active",
          inventoryStatus: deriveInventoryStatus(balance, minStock, maxStock),
          createdAt: now,
          updatedAt: now,
        })
        if (balance > 0) {
          await db.insert(stockMovements).values({
            id: genId("mv"),
            userId: null,
            referenceNumber: refNumber("IMP"),
            movementType: "adjust_in",
            stockCardId: id,
            itemCode: code,
            itemName: name,
            quantity: balance,
            unitCost,
            totalCost: unitCost != null ? unitCost * balance : null,
            status: "approved",
            notes: "Opening balance (Excel import)",
            createdBy,
          })
        }
        byCode.set(code, { ...(existing[0] ?? {}), id, itemCode: code } as (typeof existing)[number])
        result.created++
      }
    } catch (err) {
      result.skipped++
      result.errors.push(`Row ${i + 1} (${code}): ${err instanceof Error ? err.message : "failed"}`)
    }
  }

  return result
}

// ------------------------------------------------------------
// Receive (stock in) — increases balance, creates a lot + movement
// ------------------------------------------------------------

export async function receiveStock(input: ReceiveInput) {
  const qty = Number(input.quantity)
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive number")
  }
  const movementType = input.movementType ?? "buy_in"

  return db.transaction(async (tx) => {
    const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, input.stockCardId)).limit(1)
    if (!card) throw new Error("Stock card not found")

    const nextBalance = card.balance + qty
    const nextIncoming = input.fromIncoming ? Math.max(0, card.incomingStock - qty) : card.incomingStock

    const patch = recalc(card, nextBalance, card.reservedStock, nextIncoming)
    await tx.update(stockCards).set(patch).where(eq(stockCards.id, card.id))

    // Create a lot when a lot number is provided (traceability / FEFO).
    let lotId: string | undefined
    if (input.lotNumber?.trim()) {
      lotId = genId("lot")
      await tx.insert(stockLots).values({
        id: lotId,
        userId: card.userId,
        stockCardId: card.id,
        lotNumber: input.lotNumber.trim(),
        quantity: qty,
        reservedQty: 0,
        expireDate: input.expireDate ?? null,
        manufacturedDate: input.manufacturedDate ?? null,
        supplierLotNo: input.supplierLotNo ?? null,
        unitCost: input.unitCost ?? null,
        sourceType: movementType,
        status: "available",
        lotCategory: "sealed",
      })
    }

    const movementId = genId("mv")
    await tx.insert(stockMovements).values({
      id: movementId,
      userId: card.userId,
      referenceNumber: refNumber("RCV"),
      movementType,
      stockCardId: card.id,
      itemCode: card.itemCode,
      itemName: card.itemName,
      quantity: qty,
      unitCost: input.unitCost ?? null,
      totalCost: input.unitCost != null ? input.unitCost * qty : null,
      status: "approved",
      lotNumber: input.lotNumber ?? null,
      expireDate: input.expireDate ?? null,
      supplierLotNo: input.supplierLotNo ?? null,
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? "system",
    })

    return { movementId, lotId, balance: patch.balance, available: patch.available, inventoryStatus: patch.inventoryStatus }
  })
}

// ------------------------------------------------------------
// Issue (stock out) — FEFO lot depletion, guards against over-issue
// ------------------------------------------------------------

export async function issueStock(input: IssueInput) {
  const qty = Number(input.quantity)
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive number")
  }
  const movementType = input.movementType ?? "use_out"

  return db.transaction(async (tx) => {
    const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, input.stockCardId)).limit(1)
    if (!card) throw new Error("Stock card not found")

    // Cannot issue more than the free (available-of-balance) quantity. We guard
    // against physical balance minus what is already reserved.
    const issuable = card.balance - card.reservedStock
    if (qty > issuable) {
      throw new Error(
        `Cannot issue ${qty} ${card.unit}. Only ${issuable} ${card.unit} available (balance ${card.balance} − reserved ${card.reservedStock}).`,
      )
    }

    const nextBalance = card.balance - qty
    const patch = recalc(card, nextBalance, card.reservedStock, card.incomingStock)
    await tx.update(stockCards).set(patch).where(eq(stockCards.id, card.id))

    // FEFO: deplete earliest-expiring available lots first.
    let remaining = qty
    const lots = await tx
      .select()
      .from(stockLots)
      .where(and(eq(stockLots.stockCardId, card.id), eq(stockLots.status, "available")))
      .orderBy(asc(stockLots.expireDate))

    for (const lot of lots) {
      if (remaining <= 0) break
      const free = lot.quantity - lot.reservedQty
      if (free <= 0) continue
      const take = Math.min(free, remaining)
      const newQty = lot.quantity - take
      await tx
        .update(stockLots)
        .set({ quantity: newQty, status: newQty <= 0 ? "exhausted" : "available" })
        .where(eq(stockLots.id, lot.id))
      remaining -= take
    }

    const movementId = genId("mv")
    await tx.insert(stockMovements).values({
      id: movementId,
      userId: card.userId,
      referenceNumber: refNumber("ISS"),
      movementType,
      stockCardId: card.id,
      itemCode: card.itemCode,
      itemName: card.itemName,
      quantity: qty,
      unitCost: card.unitCost ?? null,
      totalCost: card.unitCost != null ? card.unitCost * qty : null,
      status: "approved",
      notes: input.notes ?? null,
      createdBy: input.createdBy ?? "system",
    })

    return { movementId, balance: patch.balance, available: patch.available, inventoryStatus: patch.inventoryStatus }
  })
}

// ------------------------------------------------------------
// Reserve / Release — adjusts reservedStock and recomputes ATP
// ------------------------------------------------------------

export async function reserveStock(input: ReserveInput) {
  const qty = Number(input.quantity)
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive number")
  }

  return db.transaction(async (tx) => {
    const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, input.stockCardId)).limit(1)
    if (!card) throw new Error("Stock card not found")

    const freeToReserve = card.balance - card.reservedStock
    if (qty > freeToReserve) {
      throw new Error(
        `Cannot reserve ${qty} ${card.unit}. Only ${freeToReserve} ${card.unit} unreserved.`,
      )
    }

    const nextReserved = card.reservedStock + qty
    const patch = recalc(card, card.balance, nextReserved, card.incomingStock)
    await tx.update(stockCards).set(patch).where(eq(stockCards.id, card.id))

    const reservationId = genId("rsv")
    await tx.insert(stockReservations).values({
      id: reservationId,
      userId: card.userId,
      stockCardId: card.id,
      jobOrderId: input.jobOrderId,
      jobNo: input.jobNo,
      reservedQuantity: qty,
      status: "active",
    })

    return { reservationId, reserved: patch.reservedStock, available: patch.available }
  })
}

export async function releaseReservation(reservationId: string) {
  return db.transaction(async (tx) => {
    const [rsv] = await tx
      .select()
      .from(stockReservations)
      .where(eq(stockReservations.id, reservationId))
      .limit(1)
    if (!rsv) throw new Error("Reservation not found")
    if (rsv.status !== "active") throw new Error("Reservation is not active")

    const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, rsv.stockCardId)).limit(1)
    if (!card) throw new Error("Stock card not found")

    const nextReserved = Math.max(0, card.reservedStock - rsv.reservedQuantity)
    const patch = recalc(card, card.balance, nextReserved, card.incomingStock)
    await tx.update(stockCards).set(patch).where(eq(stockCards.id, card.id))

    await tx
      .update(stockReservations)
      .set({ status: "released", releasedAt: new Date() })
      .where(eq(stockReservations.id, reservationId))

    return { reserved: patch.reservedStock, available: patch.available }
  })
}
