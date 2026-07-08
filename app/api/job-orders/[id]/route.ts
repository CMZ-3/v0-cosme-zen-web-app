import { NextResponse } from "next/server"
import { getJobOrder, updateJobOrderStatus } from "@/lib/db/job-order-queries"
import type { JOStatus } from "@/lib/job-order-types"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const jo = await getJobOrder(id)
    if (!jo) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ jobOrder: jo })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { status } = await req.json()
    await updateJobOrderStatus(id, status as JOStatus)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
