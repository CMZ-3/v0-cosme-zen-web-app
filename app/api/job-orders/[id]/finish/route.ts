import { NextResponse } from "next/server"
import { getJobOrder, updateJobOrderStatus } from "@/lib/db/job-order-queries"
import { receiveStock } from "@/lib/db/stock-mutations"
import { getStockCard } from "@/lib/db/stock-queries"

// POST /api/job-orders/[id]/finish
// Body: { stockCardId: string, quantity: number, lotNumber?: string, notes?: string }
// Marks JO as delivered + creates a production receipt movement on the FG stock card.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { stockCardId, quantity, lotNumber, notes } = body as {
      stockCardId?: string
      quantity?: number
      lotNumber?: string
      notes?: string
    }

    if (!stockCardId) return NextResponse.json({ error: "stockCardId required" }, { status: 400 })
    const qty = Number(quantity)
    if (!qty || qty <= 0) return NextResponse.json({ error: "quantity must be > 0" }, { status: 400 })

    // Verify JO exists
    const jo = await getJobOrder(id)
    if (!jo) return NextResponse.json({ error: "Job order not found" }, { status: 404 })

    // Verify stock card exists
    const card = await getStockCard(stockCardId)
    if (!card) return NextResponse.json({ error: "Stock card not found" }, { status: 404 })

    // Create production receipt on the FG stock card
    const movement = await receiveStock({
      stockCardId,
      quantity: qty,
      movementType: "production" as Parameters<typeof receiveStock>[0]["movementType"],
      lotNumber: lotNumber || undefined,
      notes: notes || `Finished from JO #${jo.orderNumber}`,
      createdBy: "admin",
    })

    // Update JO status → delivered
    await updateJobOrderStatus(id, "delivered")

    return NextResponse.json({ ok: true, movement, joId: id }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to finish job order"
    console.error("[v0] POST /api/job-orders/[id]/finish error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
