import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

interface ProductLotRow {
  id: string
  lotNumber: string
  mfgDate: string
  expDate: string
  quantity: number
  qcResult: string
  status: string
  notes?: string
  [key: string]: unknown
}

async function getLots(productId: string): Promise<ProductLotRow[]> {
  const rows = await db.select({ lots: products.lots }).from(products).where(eq(products.id, productId))
  if (rows.length === 0) return []
  return (rows[0].lots as ProductLotRow[]) ?? []
}

async function saveLots(productId: string, lots: ProductLotRow[]): Promise<boolean> {
  const rows = await db
    .update(products)
    .set({ lots: lots as unknown as typeof products.$inferInsert["lots"], updatedAt: new Date() })
    .where(eq(products.id, productId))
    .returning()
  return rows.length > 0
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const lots = await getLots(id)
    return NextResponse.json(lots)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { nanoid } = await import("nanoid")
    const lots = await getLots(id)
    const newLot: ProductLotRow = {
      id: nanoid(10),
      lotNumber: body.lotNumber ?? `LOT-${Date.now()}`,
      mfgDate: body.mfgDate ?? new Date().toISOString().slice(0, 10),
      expDate: body.expDate ?? "",
      quantity: Number(body.quantity ?? 0),
      qcResult: body.qcResult ?? "pending",
      status: "active",
      notes: body.notes ?? "",
    }
    lots.push(newLot)
    await saveLots(id, lots)
    return NextResponse.json(newLot, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { lotId, ...updates } = await req.json()
    if (!lotId) return NextResponse.json({ error: "lotId required" }, { status: 400 })
    const lots = await getLots(id)
    const idx = lots.findIndex((l) => l.id === lotId)
    if (idx === -1) return NextResponse.json({ error: "Lot not found" }, { status: 404 })
    lots[idx] = { ...lots[idx], ...updates }
    await saveLots(id, lots)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
