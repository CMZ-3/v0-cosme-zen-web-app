import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { formulas, formulaIngredients } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Formula as SimFormula } from "@/lib/stock-types"

export const dynamic = "force-dynamic"

// Returns all active DB formulas mapped to the SimFormula shape expected by
// the stock simulator (name + ingredients with stockCardId as the item id).
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(formulas)

    const result: Record<string, SimFormula & { label: string }> = {}

    for (const row of rows) {
      const ings = await db
        .select()
        .from(formulaIngredients)
        .where(eq(formulaIngredients.formulaId, row.id))
        .orderBy(formulaIngredients.sortOrder)

      // Map ingredients: use stockCardId when linked, otherwise fall back to
      // an ingredient-id slug so the formula still appears in the simulator
      // (percentage breakdown will show even without a live stock card link).
      const simIngredients = ings.map((i) => ({
        id: i.stockCardId ?? `ing-${i.id}`,
        percent: i.percentage,
      }))

      if (simIngredients.length === 0) continue

      result[row.id] = {
        name: row.name,
        label: row.code ? `${row.code} — ${row.name}` : row.name,
        unitWeight: 0, // batch-based — no per-unit weight needed
        ingredients: simIngredients,
      }
    }

    return NextResponse.json({ formulas: result })
  } catch (err) {
    console.error("[v0] formulas/simulator error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
