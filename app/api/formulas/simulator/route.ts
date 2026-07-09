import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formulas, formulaIngredients, stockCards } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import type { Formula as SimFormula } from "@/lib/stock-types"

export const dynamic = "force-dynamic"

// Returns all active DB formulas mapped to the SimFormula shape expected by
// the stock simulator. Ingredients are enriched with live stock quantities,
// unit costs, and display names from stock_cards.
export async function GET() {
  try {
    const rows = await db.select().from(formulas)

    // Pre-fetch ALL stock cards in one query for efficient lookup
    const allCards = await db.select().from(stockCards)
    const cardMap = new Map(allCards.map((c) => [c.id, c]))

    const result: Record<string, SimFormula & { label: string }> = {}

    for (const row of rows) {
      const ings = await db
        .select()
        .from(formulaIngredients)
        .where(eq(formulaIngredients.formulaId, row.id))
        .orderBy(formulaIngredients.sortOrder)

      // Map ingredients with full stock card data when linked
      const simIngredients = ings.map((i) => {
        const card = i.stockCardId ? cardMap.get(i.stockCardId) : undefined
        return {
          id: i.stockCardId ?? `ing-${i.id}`,
          percent: i.percentage,
          name: card?.itemName ?? i.rawMaterialName,
          stockCardId: i.stockCardId ?? null,
          stockQty: card?.balance ?? 0,
          unitCost: card?.unitCost ?? 0,
          unit: card?.unit ?? i.unit ?? "kg",
        }
      })

      if (simIngredients.length === 0) continue

      result[row.id] = {
        name: row.name,
        label: row.code ? `${row.code} — ${row.name}` : row.name,
        unitWeight: 0,
        ingredients: simIngredients,
      }
    }

    return NextResponse.json({ formulas: result })
  } catch (err) {
    console.error("[v0] formulas/simulator error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
