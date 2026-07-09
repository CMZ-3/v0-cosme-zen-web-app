import { NextResponse } from "next/server"
import {
  getCustomerDetail,
  updateCustomer,
  deleteCustomer,
  setCustomerActive,
} from "@/lib/db/customer-supplier-queries"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const detail = await getCustomerDetail(id)
    if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ detail })
  } catch (err) {
    console.error("[v0] GET /api/customers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const EDITABLE_FIELDS = [
  "customerName", "customerNameEn", "customerType", "customerTier", "businessType",
  "contactPerson", "email", "phone", "creditLimit", "creditDays", "leadSource",
  "province", "country", "address", "city", "postalCode", "taxId",
  "salesRepresentative", "website", "notes", "isActive",
] as const

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // Archive/unarchive shortcut
    if (typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
      const row = await setCustomerActive(id, body.isActive)
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({ customer: row })
    }

    // Whitelist editable fields
    const data: Record<string, unknown> = {}
    for (const key of EDITABLE_FIELDS) {
      if (key in body) data[key] = body[key]
    }

    const row = await updateCustomer(id, data)
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ customer: row })
  } catch (err) {
    console.error("[v0] PATCH /api/customers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const ok = await deleteCustomer(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] DELETE /api/customers/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
