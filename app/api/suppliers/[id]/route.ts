import { NextResponse } from "next/server"
import {
  getSupplierDetail,
  updateSupplier,
  deleteSupplier,
  setSupplierActive,
  setSupplierApproved,
} from "@/lib/db/customer-supplier-queries"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const detail = await getSupplierDetail(id)
    if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ detail })
  } catch (err) {
    console.error("[v0] GET /api/suppliers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const EDITABLE_FIELDS = [
  "supplierName", "supplierNameEn", "supplierType", "country", "city",
  "contactPerson", "email", "phone", "grade", "status", "description",
  "address", "taxId", "paymentTerms", "paymentDays", "website", "notes",
  "avgLeadTimeDays", "moq", "materialTags",
] as const

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Approve/unapprove shortcut
    if (typeof body.isApproved === "boolean" && Object.keys(body).length === 1) {
      const row = await setSupplierApproved(id, body.isApproved)
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ supplier: row })
    }

    // Archive/unarchive shortcut
    if (typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
      const row = await setSupplierActive(id, body.isActive)
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ supplier: row })
    }

    const data: Record<string, unknown> = {}
    for (const key of EDITABLE_FIELDS) {
      if (key in body) data[key] = body[key]
    }

    const row = await updateSupplier(id, data)
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ supplier: row })
  } catch (err) {
    console.error("[v0] PATCH /api/suppliers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = await deleteSupplier(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] DELETE /api/suppliers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
