import { NextResponse } from "next/server"
import {
  updateProductionStep,
  deleteProductionStep,
  completeStep,
  getProductionSteps,
} from "@/lib/db/production-tracking-queries"

// PATCH /api/job-orders/:id/steps/:stepId
//   { action: "complete" }                        → mark done + activate next
//   { name?, description?, targetQty?, unit?, status? } → edit fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const { id, stepId } = await params
  try {
    const body = await req.json()
    if (body.action === "complete") {
      const steps = await completeStep(stepId)
      return NextResponse.json({ steps })
    }
    await updateProductionStep(stepId, {
      name: body.name,
      description: body.description,
      targetQty: body.targetQty !== undefined ? Number(body.targetQty) : undefined,
      unit: body.unit,
      status: body.status,
    })
    const steps = await getProductionSteps(id)
    return NextResponse.json({ steps })
  } catch (err) {
    console.error("[v0] update step failed:", err)
    const msg = err instanceof Error ? err.message : "Failed to update step"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE /api/job-orders/:id/steps/:stepId → remove step + its records
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const { id, stepId } = await params
  try {
    await deleteProductionStep(stepId)
    const steps = await getProductionSteps(id)
    return NextResponse.json({ steps })
  } catch (err) {
    console.error("[v0] delete step failed:", err)
    return NextResponse.json({ error: "Failed to delete step" }, { status: 500 })
  }
}
