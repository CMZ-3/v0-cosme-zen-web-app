import { NextResponse } from "next/server"
import { listJobOrders, createJobOrder } from "@/lib/db/job-order-queries"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const orders = await listJobOrders()
    return NextResponse.json({ jobOrders: orders })
  } catch (err) {
    console.error("[v0] job-orders GET error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { formulaId, formulaName, formulaCode, customer, batchSizeKg, plannedQty, unit, priority, plannedStart, plannedEnd, assignedTo } = body

    if (!formulaName?.trim()) {
      return NextResponse.json({ error: "formulaName is required" }, { status: 400 })
    }

    const id = await createJobOrder({
      formulaId,
      formulaName: formulaName.trim(),
      formulaCode,
      customer,
      batchSizeKg: Number(batchSizeKg) || 10,
      plannedQty: plannedQty ? Number(plannedQty) : undefined,
      unit: unit ?? "kg",
      priority: priority ?? "normal",
      plannedStart,
      plannedEnd,
      assignedTo,
    })
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    console.error("[v0] job-orders POST error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
