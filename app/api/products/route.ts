import { NextResponse } from "next/server"
import { listProducts, getProductKPI, createProduct } from "@/lib/db/fda-product-queries"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") ?? undefined
    const [list, kpi] = await Promise.all([listProducts(search), getProductKPI()])
    return NextResponse.json({ products: list, kpi })
  } catch (err) {
    console.error("[v0] GET /api/products error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = `prod-${crypto.randomUUID().slice(0, 8)}`
    const sku = body.sku ?? `SKU-${Math.floor(Math.random() * 9000 + 1000)}`
    const row = await createProduct({
      id,
      sku,
      nameInternal: body.nameInternal ?? "",
      thumbnailUrl: body.thumbnailUrl ?? null,
      customerName: body.customerName ?? "",
      brandName: body.brandName ?? null,
      category: body.category ?? "other",
      sellingPrice: body.sellingPrice ?? null,
      totalCostPerUnit: body.totalCostPerUnit ?? 0,
      marginPercent: body.marginPercent ?? 0,
      fdaStatus: body.fdaStatus ?? "not_registered",
      status: body.status ?? "draft",
      packageSize: body.packageSize ?? null,
      containerType: body.containerType ?? "bottle",
    })
    return NextResponse.json({ product: row }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/products error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
