import { NextResponse } from "next/server"
import { getCustomerDetail } from "@/lib/db/customer-supplier-queries"

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
