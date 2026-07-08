import { NextResponse } from "next/server"
import { getStockMovements } from "@/lib/db/stock-queries"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const stockCardId = searchParams.get("stockCardId") ?? undefined
    const movements = await getStockMovements(stockCardId)
    return NextResponse.json({ movements })
  } catch (err) {
    console.error("[v0] GET /api/stock/movements error:", err)
    return NextResponse.json({ error: "Failed to load movements" }, { status: 500 })
  }
}
