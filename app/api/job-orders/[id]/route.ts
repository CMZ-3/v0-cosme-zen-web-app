import { NextResponse } from "next/server"
import { getJobOrder, updateJobOrderStatus, deleteJobOrder, cloneJobOrder, updateJobOrder } from "@/lib/db/job-order-queries"
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
    const body = await req.json()

    if (body.action === "clone") {
      const newId = await cloneJobOrder(id)
      return newId
        ? NextResponse.json({ id: newId })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (body.action === "edit") {
      const { action, ...data } = body
      const ok = await updateJobOrder(id, data)
      return ok
        ? NextResponse.json({ ok: true })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Default: status change
    const { status } = body
    if (!status) return NextResponse.json({ error: "status required" }, { status: 400 })
    await updateJobOrderStatus(id, status as JOStatus)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const ok = await deleteJobOrder(id)
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
