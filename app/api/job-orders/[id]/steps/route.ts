import { NextResponse } from "next/server"
import {
  getProductionSteps,
  applyStepTemplate,
  addProductionStep,
} from "@/lib/db/production-tracking-queries"

// GET /api/job-orders/:id/steps → list production steps (+ daily records)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const steps = await getProductionSteps(id)
    return NextResponse.json({ steps })
  } catch (err) {
    console.error("[v0] getProductionSteps failed:", err)
    return NextResponse.json({ error: "Failed to load steps" }, { status: 500 })
  }
}

// POST /api/job-orders/:id/steps
//   { action: "apply_template", targetQty, unit, template? }  → seed default steps
//   { action: "add", name, description, targetQty, unit }     → append one step
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    if (body.action === "add") {
      if (!body.name?.trim()) {
        return NextResponse.json({ error: "Step name is required" }, { status: 400 })
      }
      const step = await addProductionStep({
        jobOrderId: id,
        name: body.name.trim(),
        description: body.description ?? "",
        targetQty: Number(body.targetQty) || 0,
        unit: body.unit ?? "units",
      })
      return NextResponse.json({ step }, { status: 201 })
    }
    // default: apply template
    const steps = await applyStepTemplate(
      id,
      Number(body.targetQty) || 0,
      body.unit ?? "units",
      body.template,
    )
    return NextResponse.json({ steps }, { status: 201 })
  } catch (err) {
    console.error("[v0] create/apply steps failed:", err)
    const msg = err instanceof Error ? err.message : "Failed to create steps"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
