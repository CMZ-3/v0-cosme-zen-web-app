import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockCards, stockLots, stockMovements, stockReservations, simWorkflow } from "@/lib/db/schema"
import { INIT_STOCK, INIT_POS, INIT_JOBS, INIT_MOVEMENTS } from "@/lib/stock-simulation-store"
import { stockItemToCardValues } from "@/lib/db/sim-mapping"
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

    return NextResponse.json({
      ok: true,
      seeded: { stockCards: cardRows.length, stockMovements: movementRows.length, simWorkflow: 1 },
    })
  } catch (err) {
    console.error("[v0] seed error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
