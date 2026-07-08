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
      .where(eq(formulas.status, "active"))

    const result: Record<string, SimFormula & { label: string }> = {}

    for (const row of rows) {
      const ings = await db
        .select()
        .from(formulaIngredients)
        .where(eq(formulaIngredients.formulaId, row.id))
        .orderBy(formulaIngredients.sortOrder)

      // Only include ingredients that have a linked stockCardId (otherwise the
      // simulator cannot match them to real stock items).
      const simIngredients = ings
        .filter((i) => i.stockCardId)
        .map((i) => ({
          id: i.stockCardId as string,
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
