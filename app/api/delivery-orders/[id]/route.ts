import { NextResponse } from "next/server"
import { getDeliveryOrder, patchDeliveryStatus } from "@/lib/db/delivery-queries"
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
