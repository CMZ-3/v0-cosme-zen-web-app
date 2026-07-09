import { NextResponse } from "next/server"
import { getStockReservations } from "@/lib/db/stock-queries"
import { reserveStock, releaseReservation } from "@/lib/db/stock-mutations"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const stockCardId = searchParams.get("stockCardId") ?? undefined
    const jobOrderId = searchParams.get("jobOrderId") ?? undefined
    const reservations = await getStockReservations(stockCardId, jobOrderId)
    return NextResponse.json({ reservations })
  } catch (err) {
    console.error("[v0] GET /api/stock/reservations error:", err)
    return NextResponse.json({ error: "Failed to load reservations" }, { status: 500 })
  }
}

// action: "reserve" (default) creates a reservation; "release" frees one.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const action = body.action ?? "reserve"

    if (action === "release") {
      if (!body.reservationId) {
        return NextResponse.json({ error: "reservationId is required" }, { status: 400 })
      }
      const result = await releaseReservation(body.reservationId)
      return NextResponse.json({ ok: true, ...result })
    }

    const result = await reserveStock({
      stockCardId: body.stockCardId,
      jobOrderId: body.jobOrderId ?? "manual",
      jobNo: body.jobNo ?? "MANUAL",
      quantity: body.quantity,
    })
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update reservation"
    console.error("[v0] POST /api/stock/reservations error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
