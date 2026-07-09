import { NextResponse } from "next/server"
import { listFdaRegistrations, getFdaKPI, createFdaRegistration } from "@/lib/db/fda-product-queries"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search") ?? undefined
    const [list, kpi] = await Promise.all([listFdaRegistrations(search), getFdaKPI()])
    return NextResponse.json({ registrations: list, kpi })
  } catch (err) {
    console.error("[v0] GET /api/fda error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const now = new Date().toISOString().slice(0, 10)
    const id = `fda-${crypto.randomUUID().slice(0, 8)}`
    const code = `FDA-${now.replace(/-/g, "").slice(2)}-${Math.floor(Math.random() * 900 + 100)}`
    const row = await createFdaRegistration({
      id,
      registrationCode: body.registrationCode ?? code,
      registrationType: body.registrationType ?? "jk",
      registrationNumber: body.registrationNumber ?? null,
      productNameTh: body.productNameTh ?? "",
      productNameEn: body.productNameEn ?? null,
      tradeName: body.tradeName ?? null,
      cosmeticType: body.cosmeticType ?? null,
      status: body.status ?? "draft",
      expiryDate: body.expiryDate ?? null,
      daysUntilExpiry: body.daysUntilExpiry ?? null,
      customerName: body.customerName ?? null,
      manufacturerName: body.manufacturerName ?? null,
      renewalCount: body.renewalCount ?? 0,
      ingredientCount: body.ingredientCount ?? null,
      serviceFee: body.serviceFee ?? null,
      submittedDate: body.submittedDate ?? null,
      createdAt: body.createdAt ?? now,
    })
    return NextResponse.json({ registration: row }, { status: 201 })
  } catch (err) {
    console.error("[v0] POST /api/fda error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
