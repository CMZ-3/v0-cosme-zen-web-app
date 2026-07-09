import { NextResponse } from "next/server"
import { listDeliveryOrders, createDeliveryOrder } from "@/lib/db/delivery-queries"
import type { CreateDeliveryInput } from "@/lib/db/delivery-queries"

export async function GET() {
  try {
    const data = await listDeliveryOrders()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[v0] GET /api/delivery-orders error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateDeliveryInput
    if (!body.customerName?.trim()) {
      return NextResponse.json({ error: "customerName is required" }, { status: 400 })
    }
    const order = await createDeliveryOrder(body)
    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/delivery-orders error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
