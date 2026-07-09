import { NextResponse } from "next/server"
import { addDailyRecord } from "@/lib/db/production-tracking-queries"

// POST /api/job-orders/:id/steps/:stepId/records
//   { date, goodQty, defectQty, operatorName, note?, batchId? }
// Adds a daily production record and rolls up the step tallies. Returns the
// refreshed step list so the client can update in place.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; stepId: string }> },
) {
  const { id, stepId } = await params
  try {
    const body = await req.json()
    const good = Number(body.goodQty) || 0
    const defect = Number(body.defectQty) || 0
    if (good <= 0 && defect <= 0) {
      return NextResponse.json(
        { error: "Enter at least one good or defect unit" },
        { status: 400 },
      )
    }
    if (!body.date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }
    const steps = await addDailyRecord({
      stepId,
      jobOrderId: id,
      date: body.date,
      batchId: body.batchId ?? "",
      goodQty: good,
      defectQty: defect,
      operatorName: body.operatorName ?? "",
      note: body.note ?? "",
    })
    return NextResponse.json({ steps }, { status: 201 })
  } catch (err) {
    console.error("[v0] add daily record failed:", err)
    const msg = err instanceof Error ? err.message : "Failed to add record"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
