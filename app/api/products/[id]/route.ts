import { NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db/fda-product-queries"

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const ok = await updateProduct(id, body)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[v0] PATCH /api/products/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = await deleteProduct(id)
    return ok
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[v0] DELETE /api/products/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
