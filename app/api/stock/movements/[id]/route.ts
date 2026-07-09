import { NextResponse } from "next/server"
import { deleteStockMovement } from "@/lib/db/stock-queries"

export const dynamic = "force-dynamic"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const ok = await deleteStockMovement(id)
    return ok
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[v0] DELETE /api/stock/movements/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
