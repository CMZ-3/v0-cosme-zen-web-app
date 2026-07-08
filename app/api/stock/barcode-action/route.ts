import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockCards, stockMovements } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { computeAvailable, deriveInventoryStatus } from "@/lib/db/stock-mutations"

// ---------------------------------------------------------------------------
// Barcode action endpoint — handles scan quick-actions and count finalize
// ---------------------------------------------------------------------------
// POST /api/stock/barcode-action
//
// Body variants:
//
// { action: "issue",   cardId: string, qty: number, ref?: string }
// { action: "receive", cardId: string, qty: number, ref?: string }
// { action: "finalize_count", adjustments: [{ cardId, counted, system, itemName, itemCode }][] }

function mvId() {
  return `mv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action } = body

    // ------------------------------------------------------------------
    // Issue (use_out) — scan and deduct
    // ------------------------------------------------------------------
    if (action === "issue" || action === "receive") {
      const { cardId, qty, ref } = body as { cardId: string; qty: number; ref?: string }
      if (!cardId || !qty || qty <= 0) {
        return NextResponse.json({ error: "cardId and qty > 0 required" }, { status: 400 })
      }

      const movType = action === "issue" ? "use_out" : "buy_in"
      const sign = action === "issue" ? -1 : 1

      const [card] = await db.select().from(stockCards).where(eq(stockCards.id, cardId)).limit(1)
      if (!card) return NextResponse.json({ error: "Stock card not found" }, { status: 404 })

      const nextBalance = card.balance + sign * qty
      if (action === "issue" && nextBalance < 0) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
      }

      await db.transaction(async (tx) => {
        await tx
          .update(stockCards)
          .set({
            balance: nextBalance,
            available: computeAvailable(nextBalance, card.reservedStock, card.incomingStock),
            inventoryStatus: deriveInventoryStatus(nextBalance, card.minStock, card.maxStock),
            updatedAt: new Date(),
          })
          .where(eq(stockCards.id, cardId))

        await tx.insert(stockMovements).values({
          id: mvId(),
          referenceNumber: ref ?? `BC-${action.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
          movementType: movType,
          stockCardId: card.id,
          itemCode: card.itemCode,
          itemName: card.itemName,
          quantity: qty,
          status: "approved",
          notes: `Barcode ${action}: ${qty} ${card.unit}`,
          createdBy: "barcode",
        })
      })

      return NextResponse.json({ ok: true, action, newBalance: nextBalance })
    }

    // ------------------------------------------------------------------
    // Finalize physical count — create adjust_in / adjust_out per variance
    // ------------------------------------------------------------------
    if (action === "finalize_count") {
      const { adjustments } = body as {
        adjustments: Array<{
          cardId: string
          counted: number
          system: number
          itemName: string
          itemCode: string
        }>
      }

      if (!Array.isArray(adjustments) || adjustments.length === 0) {
        return NextResponse.json({ error: "adjustments array required" }, { status: 400 })
      }

      const refNo = `PHYCOUNT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`
      let adjusted = 0

      await db.transaction(async (tx) => {
        for (const adj of adjustments) {
          const variance = adj.counted - adj.system
          if (variance === 0) continue

          const [card] = await tx.select().from(stockCards).where(eq(stockCards.id, adj.cardId)).limit(1)
          if (!card) continue

          const nextBalance = card.balance + variance
          await tx
            .update(stockCards)
            .set({
              balance: nextBalance,
              available: computeAvailable(nextBalance, card.reservedStock, card.incomingStock),
              inventoryStatus: deriveInventoryStatus(nextBalance, card.minStock, card.maxStock),
              updatedAt: new Date(),
            })
            .where(eq(stockCards.id, adj.cardId))

          await tx.insert(stockMovements).values({
            id: mvId(),
            referenceNumber: refNo,
            movementType: variance > 0 ? "adjust_in" : "adjust_out",
            stockCardId: card.id,
            itemCode: card.itemCode,
            itemName: card.itemName,
            quantity: Math.abs(variance),
            status: "approved",
            notes: `Physical count: system ${adj.system} → counted ${adj.counted} (${variance > 0 ? "+" : ""}${variance})`,
            createdBy: "barcode",
          })
          adjusted++
        }
      })

      return NextResponse.json({ ok: true, refNo, adjusted })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (err) {
    console.error("[barcode-action] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
