import { NextResponse } from "next/server"
import { deleteStockMovement } from "@/lib/db/stock-queries"
import { db } from "@/lib/db"
import { stockMovements } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { notes, referenceNumber } = await req.json()
    const update: Record<string, string> = {}
    if (notes !== undefined) update.notes = notes
    if (referenceNumber !== undefined) update.referenceNumber = referenceNumber
    if (Object.keys(update).length === 0)
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
    const rows = await db.update(stockMovements).set(update).where(eq(stockMovements.id, id)).returning()
    return rows.length > 0
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Not found" }, { status: 404 })
  } catch (err) {
    console.error("[v0] PATCH /api/stock/movements/[id] error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

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
