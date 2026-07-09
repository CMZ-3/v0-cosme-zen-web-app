import { NextResponse } from "next/server"
import {
  getFormulaById,
  getFormulaIngredients,
  getFormulaPhases,
  getFormulaProcessingSteps,
  getFormulaQcSpecs,
  getFormulaVersions,
} from "@/lib/db/formula-queries"

// GET /api/formulas/:id  →  { formula, ingredients, phases, steps, qcSpecs, versions }
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [formula, ingredients, phases, steps, qcSpecs, versions] = await Promise.all([
      getFormulaById(id),
      getFormulaIngredients(id),
      getFormulaPhases(id),
      getFormulaProcessingSteps(id),
      getFormulaQcSpecs(id),
      getFormulaVersions(id),
    ])
    if (!formula) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ formula, ingredients, phases, steps, qcSpecs, versions })
  } catch (err) {
    console.error("[v0] GET /api/formulas/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
