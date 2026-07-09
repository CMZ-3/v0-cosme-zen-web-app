import { NextResponse } from "next/server"
import {
  getFormulaById,
  getFormulaIngredients,
  getFormulaPhases,
  getFormulaProcessingSteps,
  getFormulaQcSpecs,
  getFormulaVersions,
  updateFormulaStatus,
  deleteFormula,
  cloneFormula,
  addFormulaIngredient,
  deleteFormulaIngredient,
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

// PATCH /api/formulas/:id
// body: { action: "status", status: string }
//       { action: "clone" }
//       { action: "add_ingredient", rawMaterialName, percentage, phase?, stockCardId? }
//       { action: "delete_ingredient", ingredientId }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action } = body

    if (action === "status") {
      const { status } = body
      const validStatuses = ["draft", "approved", "active", "archived", "discontinued"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
      }
      const ok = await updateFormulaStatus(id, status)
      if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
      const formula = await getFormulaById(id)
      return NextResponse.json({ formula })
    }

    if (action === "clone") {
      const cloned = await cloneFormula(id)
      if (!cloned) return NextResponse.json({ error: "Formula not found" }, { status: 404 })
      return NextResponse.json({ formula: cloned })
    }

    if (action === "add_ingredient") {
      const { rawMaterialName, percentage, phase, stockCardId } = body
      if (!rawMaterialName?.trim() || percentage == null) {
        return NextResponse.json({ error: "rawMaterialName and percentage are required" }, { status: 400 })
      }
      await addFormulaIngredient(id, { rawMaterialName, percentage: parseFloat(percentage), phase, stockCardId })
      const ingredients = await getFormulaIngredients(id)
      return NextResponse.json({ ingredients })
    }

    if (action === "delete_ingredient") {
      const { ingredientId } = body
      if (!ingredientId) return NextResponse.json({ error: "ingredientId required" }, { status: 400 })
      const ok = await deleteFormulaIngredient(ingredientId)
      if (!ok) return NextResponse.json({ error: "Ingredient not found" }, { status: 404 })
      const ingredients = await getFormulaIngredients(id)
      return NextResponse.json({ ingredients })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err) {
    console.error("[v0] PATCH /api/formulas/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// DELETE /api/formulas/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = await deleteFormula(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error("[v0] DELETE /api/formulas/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
