import { NextResponse } from "next/server"
import { getFormulaById, getFormulaIngredients } from "@/lib/db/formula-queries"

// GET /api/formulas/:id  →  { formula, ingredients }
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [formula, ingredients] = await Promise.all([
      getFormulaById(id),
      getFormulaIngredients(id),
    ])
    if (!formula) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ formula, ingredients })
  } catch (err) {
    console.error("[v0] GET /api/formulas/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
