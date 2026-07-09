import { NextResponse } from "next/server"
import { listSuppliers, getSupplierKPI, createSupplier } from "@/lib/db/customer-supplier-queries"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") ?? undefined
    const [list, kpi] = await Promise.all([listSuppliers(search), getSupplierKPI()])
    return NextResponse.json({ suppliers: list, kpi })
  } catch (err) {
    console.error("[v0] GET /api/suppliers error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = `sup-${crypto.randomUUID().slice(0, 8)}`
    const code = `SUP-${Math.floor(Math.random() * 900 + 100)}`
    const row = await createSupplier({
      id,
      supplierCode: body.supplierCode ?? code,
      supplierName: body.supplierName,
      supplierNameEn: body.supplierNameEn ?? null,
      supplierType: body.supplierType ?? "raw_material",
      country: body.country ?? "Thailand",
      city: body.city ?? null,
      contactPerson: body.contactPerson ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      isActive: true,
      isApproved: false,
      grade: body.grade ?? "B",
      qualityRating: body.qualityRating ?? null,
      deliveryRating: body.deliveryRating ?? null,
      priceRating: body.priceRating ?? null,
      materialTags: body.materialTags ?? [],
      status: "pending",
      description: body.description ?? null,
      address: body.address ?? null,
      taxId: body.taxId ?? null,
      paymentTerms: body.paymentTerms ?? null,
      paymentDays: body.paymentDays ?? 30,
      website: body.website ?? null,
      notes: body.notes ?? null,
      avgLeadTimeDays: body.avgLeadTimeDays ?? null,
      ytdOrderValue: null,
      moq: body.moq ?? null,
      onTimeDeliveryPct: null,
    })
    return NextResponse.json({ supplier: row }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/suppliers error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
