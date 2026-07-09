import { NextResponse } from "next/server"
import { getProductById } from "@/lib/db/fda-product-queries"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err) {
    console.error("[v0] GET /api/products/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
