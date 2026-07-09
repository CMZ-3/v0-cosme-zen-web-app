import { NextResponse } from "next/server"
import { listCustomers, getCustomerKPI, createCustomer } from "@/lib/db/customer-supplier-queries"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") ?? undefined
    const [list, kpi] = await Promise.all([listCustomers(search), getCustomerKPI()])
    return NextResponse.json({ customers: list, kpi })
  } catch (err) {
    console.error("[v0] GET /api/customers error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const now = new Date().toISOString().slice(0, 10)
    const id = `cust-${crypto.randomUUID().slice(0, 8)}`
    const code = `CUS-${now.replace(/-/g, "").slice(2)}-${Math.floor(Math.random() * 900 + 100)}`
    const row = await createCustomer({
      id,
      customerCode: body.customerCode ?? code,
      customerName: body.customerName,
      customerNameEn: body.customerNameEn ?? null,
      customerType: body.customerType ?? "juristic",
      customerTier: body.customerTier ?? "standard",
      businessType: body.businessType ?? "brand_owner",
      contactPerson: body.contactPerson ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      creditLimit: body.creditLimit ?? null,
      creditUsed: 0,
      isActive: true,
      totalOrders: 0,
      totalRevenue: 0,
      productCount: 0,
      brandCount: 0,
      leadSource: body.leadSource ?? null,
      province: body.province ?? null,
      country: body.country ?? "Thailand",
      address: body.address ?? null,
      city: body.city ?? null,
      postalCode: body.postalCode ?? null,
      taxId: body.taxId ?? null,
      creditDays: body.creditDays ?? 30,
      salesRepresentative: body.salesRepresentative ?? null,
      website: body.website ?? null,
      notes: body.notes ?? null,
    })
    return NextResponse.json({ customer: row }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/customers error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
