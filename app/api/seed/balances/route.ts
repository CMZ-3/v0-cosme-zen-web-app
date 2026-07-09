import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockCards } from "@/lib/db/schema"
import { receiveStock } from "@/lib/db/stock-mutations"

// Seeded balance map by itemType:
// raw_material: 50–500 kg depending on usage frequency (soap bases large, actives small)
// packaging: 500–5000 pcs
// finished_good: 200–2000 units
// others: skip

const QTY_BY_TYPE: Record<string, number> = {
  raw_material: 200,
  packaging: 1500,
  packaging_aux: 800,
  finished_good: 500,
  tester: 50,
}

// Specific overrides for high-usage items (soap bases are consumed in large batches)
const ITEM_QTY_OVERRIDES: Record<string, number> = {
  "RAM0010101": 800,
  "RAM0010102": 600,
  "RAM0010102-1": 500,
  "RAM0010201": 700,
  "RAM0030201": 300,
  "RAM0030601": 250,
  "RAM0040101": 400,
  "RAM0040201": 350,
}

export async function POST() {
  try {
    const allCards = await db.select({
      id: stockCards.id,
      itemCode: stockCards.itemCode,
      itemType: stockCards.itemType,
      balance: stockCards.balance,
    }).from(stockCards)

    // Only seed items that currently have balance = 0
    const zeroBalance = allCards.filter(
      (c) => c.balance === 0 && c.itemType in QTY_BY_TYPE
    )

    let seeded = 0
    const errors: string[] = []

    for (const card of zeroBalance) {
      const code = card.itemCode
      const qty = ITEM_QTY_OVERRIDES[code] ?? QTY_BY_TYPE[card.itemType] ?? 100
      try {
        await receiveStock({
          stockCardId: card.id,
          quantity: qty,
          movementType: "buy_in",
          notes: "Opening balance — seed",
          createdBy: "system",
        })
        seeded++
      } catch (e) {
        errors.push(`${code}: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    return NextResponse.json({
      ok: true,
      seeded,
      skipped: allCards.length - zeroBalance.length,
      errors: errors.slice(0, 10),
    })
  } catch (err) {
    console.error("[v0] seed/balances error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
