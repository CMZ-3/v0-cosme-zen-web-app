import { NextResponse } from "next/server"
import { getDeliveryOrder, patchDeliveryStatus, deleteDeliveryOrder, cloneDeliveryOrder } from "@/lib/db/delivery-queries"
import type { DeliveryStatus } from "@/lib/delivery-types"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await getDeliveryOrder(id)
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.action === "clone") {
      const cloned = await cloneDeliveryOrder(id)
      return cloned
        ? NextResponse.json({ id: cloned.id, deliveryNumber: cloned.deliveryNumber })
        : NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { status, trackingNumber, receiverName, podNotes, jobStatus } = body
    if (!status) return NextResponse.json({ error: "status required" }, { status: 400 })
    const order = await patchDeliveryStatus(id, status as DeliveryStatus, {
      trackingNumber,
      receiverName,
      podNotes,
      jobStatus,
    })
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = await deleteDeliveryOrder(id)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
