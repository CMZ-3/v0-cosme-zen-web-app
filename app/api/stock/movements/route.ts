import { NextResponse } from "next/server"
import { getStockMovements } from "@/lib/db/stock-queries"
import { receiveStock, issueStock } from "@/lib/db/stock-mutations"
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

// Incoming vs outgoing movement types. Incoming ones increase balance (and may
// create a lot); outgoing ones deplete balance via FEFO.
type IncomingType = NonNullable<Parameters<typeof receiveStock>[0]["movementType"]>
type OutgoingType = NonNullable<Parameters<typeof issueStock>[0]["movementType"]>

const INCOMING: IncomingType[] = ["buy_in", "adjust_in", "return", "found"]
const OUTGOING: OutgoingType[] = ["use_out", "adjust_out", "damage", "loss"]

// POST /api/stock/movements → create a movement (dispatches to receive/issue).
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { stockCardId, movementType, quantity } = body as {
      stockCardId?: string
      movementType?: MovementType
      quantity?: number
    }

    if (!stockCardId || !movementType) {
      return NextResponse.json({ error: "stockCardId and movementType are required" }, { status: 400 })
    }
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: "Quantity must be a positive number" }, { status: 400 })
    }

    if (INCOMING.includes(movementType as IncomingType)) {
      const result = await receiveStock({
        stockCardId,
        quantity: qty,
        movementType: movementType as IncomingType,
        unitCost: body.unitCost != null && body.unitCost !== "" ? Number(body.unitCost) : undefined,
        lotNumber: body.lotNumber || undefined,
        expireDate: body.expireDate || undefined,
        supplierLotNo: body.supplierLotNo || undefined,
        notes: body.notes || undefined,
        createdBy: body.createdBy || "admin",
      })
      return NextResponse.json({ ok: true, ...result }, { status: 201 })
    }

    if (OUTGOING.includes(movementType as OutgoingType)) {
      const result = await issueStock({
        stockCardId,
        quantity: qty,
        movementType: movementType as OutgoingType,
        notes: body.notes || undefined,
        createdBy: body.createdBy || "admin",
      })
      return NextResponse.json({ ok: true, ...result }, { status: 201 })
    }

    return NextResponse.json(
      { error: `Movement type "${movementType}" is not supported here. Use reserve/transfer flows instead.` },
      { status: 400 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create movement"
    console.error("[v0] POST /api/stock/movements error:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
