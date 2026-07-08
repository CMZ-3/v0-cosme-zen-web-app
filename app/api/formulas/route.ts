import { NextResponse } from "next/server"
import { listFormulas, getFormulaKpi, createFormula } from "@/lib/db/formula-queries"

// GET /api/formulas  →  { formulas, kpi }
export async function GET() {
  try {
    const [formulaList, kpi] = await Promise.all([listFormulas(), getFormulaKpi()])
    return NextResponse.json({ formulas: formulaList, kpi })
  } catch (err) {
    console.error("[v0] GET /api/formulas error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// POST /api/formulas  →  { formula }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, nameEn, category, base, batchSizeKg, notes, ingredients } = body
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }
    const formula = await createFormula({ name, nameEn, category, base, batchSizeKg, notes, ingredients })
    return NextResponse.json({ formula }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/formulas error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
