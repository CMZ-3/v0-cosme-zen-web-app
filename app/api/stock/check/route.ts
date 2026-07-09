import { NextResponse } from "next/server"
import { listFormulas, getFormulaIngredients } from "@/lib/db/formula-queries"
import { getStockCards } from "@/lib/db/stock-queries"
import { runStockCheck, type CheckJobInput } from "@/lib/stock-check-utils"
import type { FormulaIngredient } from "@/lib/formula-types"

// POST /api/stock/check
// body: { jobs: [{ id, formulaId, batchQty }] }
// Runs the availability check entirely server-side against live DB data so the
// result reflects real stock balances and formula ingredients.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const jobs: CheckJobInput[] = Array.isArray(body.jobs) ? body.jobs : []
    const valid = jobs.filter((j) => j.formulaId && j.batchQty > 0)

    if (valid.length === 0) {
      return NextResponse.json({ error: "At least one job with a formula and batch quantity is required" }, { status: 400 })
    }

    const [formulas, cards] = await Promise.all([listFormulas(), getStockCards()])

    // Load ingredients only for the distinct formulas referenced by the jobs.
    const formulaIds = Array.from(new Set(valid.map((j) => j.formulaId)))
    const ingredientLists = await Promise.all(formulaIds.map((id) => getFormulaIngredients(id)))
    const ingredients: FormulaIngredient[] = ingredientLists.flat()

    const session = runStockCheck(valid, formulas, ingredients, cards)
    return NextResponse.json({ session })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to run stock check"
    console.error("[v0] POST /api/stock/check error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
