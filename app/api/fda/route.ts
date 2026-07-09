import { NextResponse } from "next/server"
import { listFdaRegistrations, getFdaKPI, createFdaRegistration, updateFdaStatus } from "@/lib/db/fda-product-queries"

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
      // Extended detail columns
      licenseNumber: body.licenseNumber ?? null,
      fdaProductName: body.fdaProductName ?? null,
      tradeNameEn: body.tradeNameEn ?? null,
      productNameSuffix: body.productNameSuffix ?? null,
      cosmeticForm: body.cosmeticForm ?? null,
      usageFormat: body.usageFormat ?? null,
      applicationArea: body.applicationArea ?? null,
      productPurpose: body.productPurpose ?? null,
      containerType: body.containerType ?? null,
      productForm: body.productForm ?? null,
      usageInstructions: body.usageInstructions ?? null,
      warnings: body.warnings ?? null,
      combinedRegistrationNos: body.combinedRegistrationNos ?? null,
      registrationDate: body.registrationDate ?? null,
      manufacturerAddress: body.manufacturerAddress ?? null,
      manufacturerLicense: body.manufacturerLicense ?? null,
      manufacturerStorageAddress: body.manufacturerStorageAddress ?? null,
      importerName: body.importerName ?? null,
      importerAddress: body.importerAddress ?? null,
      formulaId: body.formulaId ?? null,
      customerId: body.customerId ?? null,
      approvalComment: body.approvalComment ?? null,
      rejectionReason: body.rejectionReason ?? null,
      feeNotes: body.feeNotes ?? null,
      notes: body.notes ?? null,
      createdBy: body.createdBy ?? null,
      // Original columns
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

// Bulk status update — used by "Submit All Selected" on FDA table
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const ids: string[] = body.ids ?? []
    const status: string = body.status ?? "submitted"
    if (!ids.length) {
      return NextResponse.json({ error: "ids required" }, { status: 400 })
    }
    const results = await Promise.all(
      ids.map((id) => updateFdaStatus(id, status as Parameters<typeof updateFdaStatus>[1]))
    )
    const updated = results.filter(Boolean).length
    return NextResponse.json({ ok: true, updated })
  } catch (err) {
    console.error("[v0] PATCH /api/fda error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
