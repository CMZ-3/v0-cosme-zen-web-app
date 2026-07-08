import { NextResponse } from "next/server"
import {
  getStockCard,
  getStockLots,
  getStockMovements,
  getStockReservations,
} from "@/lib/db/stock-queries"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const card = await getStockCard(id)
    if (!card) {
      return NextResponse.json({ error: "Stock card not found" }, { status: 404 })
    }
    const [lots, movements, reservations] = await Promise.all([
      getStockLots(id),
      getStockMovements(id),
      getStockReservations(id),
    ])
    return NextResponse.json({ card, lots, movements, reservations })
  } catch (err) {
    console.error("[v0] GET /api/stock/cards/[id] error:", err)
    return NextResponse.json({ error: "Failed to load stock card" }, { status: 500 })
  }
}
