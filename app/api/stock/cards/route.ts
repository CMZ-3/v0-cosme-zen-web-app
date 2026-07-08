import { NextResponse } from "next/server"
import { getStockCards } from "@/lib/db/stock-queries"

export async function GET() {
  try {
    const cards = await getStockCards()
    return NextResponse.json({ cards })
  } catch (err) {
    console.error("[v0] GET /api/stock/cards error:", err)
    return NextResponse.json({ error: "Failed to load stock cards" }, { status: 500 })
  }
}
