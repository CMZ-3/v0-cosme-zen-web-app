import { NextResponse } from "next/server"
import { getStockMovements } from "@/lib/db/stock-queries"
import { receiveStock, issueStock, IN_TYPES, OUT_TYPES } from "@/lib/db/stock-mutations"
import type { MovementType } from "@/lib/stock-types"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const stockCardId = searchParams.get("stockCardId") ?? undefined
    const movements = await getStockMovements(stockCardId)
    return NextResponse.json({ movements })
  } catch (err) {
    console.error("[v0] GET /api/stock/movements error:", err)
    return NextResponse.json({ error: "Failed to load movements" }, { status: 500 })
  }
}

// Create a movement. Routes to receive (IN) or issue (OUT) based on movementType.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const movementType = body.movementType as MovementType | undefined

    if (movementType && OUT_TYPES.includes(movementType)) {
      const result = await issueStock({
        stockCardId: body.stockCardId,
        quantity: body.quantity,
        movementType: movementType as never,
        notes: body.notes,
        createdBy: body.createdBy,
      })
      return NextResponse.json({ ok: true, ...result })
    }

    if (!movementType || IN_TYPES.includes(movementType)) {
      const result = await receiveStock({
        stockCardId: body.stockCardId,
        quantity: body.quantity,
        movementType: movementType as never,
        unitCost: body.unitCost,
        lotNumber: body.lotNumber,
        expireDate: body.expireDate,
        manufacturedDate: body.manufacturedDate,
        supplierLotNo: body.supplierLotNo,
        notes: body.notes,
        createdBy: body.createdBy,
        fromIncoming: body.fromIncoming,
      })
      return NextResponse.json({ ok: true, ...result })
    }

    return NextResponse.json({ error: `Unsupported movementType: ${movementType}` }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create movement"
    console.error("[v0] POST /api/stock/movements error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
