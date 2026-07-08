import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockCards, stockLots, stockMovements, stockReservations, simWorkflow, formulas, formulaIngredients, jobOrders, deliveryOrders } from "@/lib/db/schema"
import { INIT_STOCK, INIT_POS, INIT_JOBS, INIT_MOVEMENTS } from "@/lib/stock-simulation-store"
import { stockItemToCardValues } from "@/lib/db/sim-mapping"
import { NEW_STOCK_CARDS, FORMULA_ROWS, INGREDIENT_ROWS, JOB_ORDER_ROWS } from "@/lib/db/formula-seed-data"
import { mockDeliveryOrders } from "@/lib/delivery-mock-data"
import type { StockItem } from "@/lib/stock-types"

// Reset + seed the unified stock catalog. This REPLACES all stock rows with the
// 12-item simulation catalog so the whole module shares one source of truth.
// Destructive by design (it is the "Reset demo data" action); requires ?reset=1.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    if (url.searchParams.get("reset") !== "1") {
      return NextResponse.json(
        { ok: false, error: "Pass ?reset=1 to confirm a destructive reseed." },
        { status: 400 },
      )
    }

    const catalog = INIT_STOCK()
    const byName = new Map<string, StockItem>()
    catalog.forEach((c) => byName.set(c.name, c))
    // Best-effort resolver: exact name, then partial include match.
    const resolve = (name: string): StockItem | undefined => {
      if (byName.has(name)) return byName.get(name)
      return catalog.find((c) => c.name.includes(name) || name.includes(c.name))
    }

    const cardRows = catalog.map((item) => stockItemToCardValues(item))

    // Initial ledger history (mapped from the simulation demo movement log).
    const typeMap: Record<string, string> = { IN: "buy_in", OUT: "use_out", ADJUST: "adjust_in", RESERVE: "reserve" }
    const movementRows = INIT_MOVEMENTS().map((m, i) => {
      const item = resolve(m.item)
      return {
        id: `seed-mv-${i + 1}`,
        referenceNumber: m.ref,
        movementType: typeMap[m.type] ?? "adjust_in",
        stockCardId: item?.id ?? "unknown",
        itemCode: item?.code ?? "?",
        itemName: item?.name ?? m.item,
        quantity: Math.abs(m.qty),
        status: "approved",
        notes: m.note,
        createdBy: "seed",
      }
    })

    await db.transaction(async (tx) => {
      // Clear existing rows (order-independent since there are no FK constraints).
      await tx.delete(stockMovements)
      await tx.delete(stockLots)
      await tx.delete(stockReservations)
      await tx.delete(stockCards)
      await tx.delete(simWorkflow)

      await tx.insert(stockCards).values(cardRows)
      if (movementRows.length) await tx.insert(stockMovements).values(movementRows)

      await tx.insert(simWorkflow).values({
        id: "default",
        purchaseOrders: INIT_POS(),
        jobReservations: INIT_JOBS(),
        savedReservations: [],
        receiveRecords: [],
        docCounters: { SSI: 0, SRE: 0, SIN: 5, SRR: 0 },
      })
    })

    // Seed formula + delivery modules on full reset.
    await seedFormulas()
    await seedDelivery()

    return NextResponse.json({
      ok: true,
      seeded: {
        stockCards: cardRows.length,
        stockMovements: movementRows.length,
        simWorkflow: 1,
        formulas: FORMULA_ROWS.length,
        formulaIngredients: INGREDIENT_ROWS.length,
        jobOrders: JOB_ORDER_ROWS.length,
        deliveryOrders: mockDeliveryOrders.length,
      },
    })
  } catch (err) {
    console.error("[v0] seed error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// GET ?part=formulas  — re-seed formulas/ingredients/job_orders
// GET ?part=delivery  — re-seed delivery orders from mock
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const part = url.searchParams.get("part")
    if (part === "formulas") {
      await seedFormulas()
      return NextResponse.json({
        ok: true,
        seeded: { formulas: FORMULA_ROWS.length, formulaIngredients: INGREDIENT_ROWS.length, jobOrders: JOB_ORDER_ROWS.length },
      })
    }
    if (part === "delivery") {
      await seedDelivery()
      return NextResponse.json({ ok: true, seeded: { deliveryOrders: mockDeliveryOrders.length } })
    }
    return NextResponse.json({ ok: false, error: "Use ?part=formulas or ?part=delivery" }, { status: 400 })
  } catch (err) {
    console.error("[v0] seed GET error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

async function seedDelivery() {
  await db.delete(deliveryOrders)
  const rows = mockDeliveryOrders.map((o) => ({
    id: o.id,
    deliveryNumber: o.deliveryNumber,
    jobOrderId: null,
    customerId: o.customerId ?? null,
    customerName: o.customerName,
    customerBrand: o.customerBrand ?? null,
    salesOrderRef: o.salesOrderRef ?? null,
    orderDate: o.orderDate,
    deliveryDate: o.deliveryDate ?? null,
    actualDeliveryDate: o.actualDeliveryDate ?? null,
    deliveryAddress: o.deliveryAddress ?? null,
    deliveryCity: o.deliveryCity ?? null,
    deliveryProvince: o.deliveryProvince ?? null,
    deliveryPostalCode: o.deliveryPostalCode ?? null,
    contactName: o.contactName ?? null,
    contactPhone: o.contactPhone ?? null,
    status: o.status,
    totalQuantity: o.totalQuantity ?? null,
    totalAmount: o.totalAmount ?? null,
    shippingMethod: o.shippingMethod ?? null,
    trackingNumber: o.trackingNumber ?? null,
    shippingCost: null,
    weightKg: o.weightKg ?? null,
    boxesCount: o.boxesCount ?? null,
    productSummary: o.productSummary ?? null,
    jobStatus: o.jobStatus ?? null,
    pickedBy: null,
    pickedAt: null,
    shippedBy: null,
    shippedAt: null,
    receiverName: null,
    podNotes: null,
    podSignedAt: null,
    notes: null,
    createdBy: "seed",
  }))
  await db.insert(deliveryOrders).values(rows)
}

async function seedFormulas() {
  await db.transaction(async (tx) => {
    // Upsert the 6 new shared-ingredient stock cards (do not touch existing ones).
    for (const card of NEW_STOCK_CARDS) {
      await tx
        .insert(stockCards)
        .values({
          ...card,
          status: "active",
          barcode: `BC-${card.itemCode}`,
          defaultLot: `LOT-${card.id}-001`,
        })
        .onConflictDoNothing()
    }

    // Replace all formula data on every seed.
    await tx.delete(jobOrders)
    await tx.delete(formulaIngredients)
    await tx.delete(formulas)

    await tx.insert(formulas).values(FORMULA_ROWS)
    await tx.insert(formulaIngredients).values(
      INGREDIENT_ROWS.map((r) => ({
        ...r,
        stockCardId: r.stockCardId ?? null,
        notes: r.notes ?? null,
      })),
    )
    await tx.insert(jobOrders).values(
      JOB_ORDER_ROWS.map((r) => ({
        id: r.id,
        jobNo: r.jobNo,
        formulaId: r.formulaId,
        formulaName: r.formulaName,
        formulaCode: r.formulaCode,
        customer: r.customer,
        batchSizeKg: r.batchSizeKg,
        plannedQty: r.plannedQty,
        unit: r.unit,
        status: r.status,
        priority: r.priority,
        plannedStart: r.plannedStart ?? null,
        plannedEnd: r.plannedEnd ?? null,
        actualStart: ("actualStart" in r ? r.actualStart as string : null) ?? null,
        actualEnd: ("actualEnd" in r ? r.actualEnd as string : null) ?? null,
        assignedTo: r.assignedTo ?? null,
        productionNotes: null,
        materials: [],
        batches: [],
        qcResults: [],
        costBreakdown: {},
      })),
    )
  })
}
