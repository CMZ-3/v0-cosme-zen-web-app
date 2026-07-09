import { NextResponse } from "next/server"
import { getStockCards } from "@/lib/db/stock-queries"
import { createStockCard, type CreateStockCardInput } from "@/lib/db/stock-mutations"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const typeFilter = searchParams.get("type")
    const limitParam = searchParams.get("limit")
    let cards = await getStockCards()
    if (typeFilter) {
      cards = cards.filter((c) => c.itemType === typeFilter)
    }
    if (limitParam) {
      cards = cards.slice(0, Number(limitParam))
    }
    return NextResponse.json({ cards })
  } catch (err) {
    console.error("[v0] GET /api/stock/cards error:", err)
    return NextResponse.json({ error: "Failed to load stock cards" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateStockCardInput
    const result = await createStockCard(body)
    return NextResponse.json({ ok: true, ...result }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/stock/cards error:", err)
    const message = err instanceof Error ? err.message : "Failed to create stock card"
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
