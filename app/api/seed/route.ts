import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { stockCards, stockLots, stockMovements, stockReservations } from "@/lib/db/schema"
import {
  mockStockCards,
  mockStockMovements,
  mockStockLots,
  mockReservations,
} from "@/lib/stock-mock-data"

// One-time seed of the Stock module tables from the existing mock data.
// Safe to re-run: rows conflict on primary key and are skipped.
export async function POST() {
  try {
    const cardRows = mockStockCards.map((c) => ({
      id: c.id,
      itemCode: c.itemCode,
      itemName: c.itemName,
      itemNameEn: c.itemNameEn ?? null,
      itemType: c.itemType,
      category: c.category,
      unit: c.unit,
      balance: c.balance,
      reservedStock: c.reservedStock,
      incomingStock: c.incomingStock,
      available: c.available,
      initialStock: c.initialStock,
      minStock: c.minStock,
      maxStock: c.maxStock,
      reorderPoint: c.reorderPoint,
      unitCost: c.unitCost ?? null,
      supplier: c.supplier ?? null,
      location: c.location ?? null,
      barcode: c.barcode ?? null,
      tradeName: c.tradeName ?? null,
      inciName: c.inciName ?? null,
      casNo: c.casNo ?? null,
      storageTemp: c.storageTemp ?? null,
      expiryDate: c.expiryDate ?? null,
      status: c.status,
      inventoryStatus: c.inventoryStatus,
    }))

    const lotRows = mockStockLots.map((l) => ({
      id: l.id,
      stockCardId: l.stockCardId,
      lotNumber: l.lotNumber,
      quantity: l.quantity,
      reservedQty: l.reservedQty,
      expireDate: l.expireDate ?? null,
      manufacturedDate: l.manufacturedDate ?? null,
      supplierLotNo: l.supplierLotNo ?? null,
      unitCost: l.unitCost ?? null,
      sourceType: l.sourceType,
      status: l.status,
      lotCategory: l.lotCategory,
      parentLotId: l.parentLotId ?? null,
      notes: l.notes ?? null,
    }))

    const movementRows = mockStockMovements.map((m) => ({
      id: m.id,
      referenceNumber: m.referenceNumber,
      movementType: m.movementType,
      stockCardId: m.stockCardId,
      itemCode: m.itemCode,
      itemName: m.itemName,
      quantity: m.quantity,
      unitCost: m.unitCost ?? null,
      totalCost: m.totalCost ?? null,
      status: m.status,
      lotNumber: m.lotNumber ?? null,
      expireDate: m.expireDate ?? null,
      supplierLotNo: m.supplierLotNo ?? null,
      notes: m.notes ?? null,
      createdBy: m.createdBy,
    }))

    const reservationRows = mockReservations.map((r) => ({
      id: r.id,
      stockCardId: r.stockCardId,
      jobOrderId: r.jobOrderId,
      jobNo: r.jobNo,
      reservedQuantity: r.reservedQuantity,
      status: r.status,
    }))

    if (cardRows.length) await db.insert(stockCards).values(cardRows).onConflictDoNothing()
    if (lotRows.length) await db.insert(stockLots).values(lotRows).onConflictDoNothing()
    if (movementRows.length) await db.insert(stockMovements).values(movementRows).onConflictDoNothing()
    if (reservationRows.length) await db.insert(stockReservations).values(reservationRows).onConflictDoNothing()

    return NextResponse.json({
      ok: true,
      seeded: {
        stockCards: cardRows.length,
        stockLots: lotRows.length,
        stockMovements: movementRows.length,
        stockReservations: reservationRows.length,
      },
    })
  } catch (err) {
    console.error("[v0] seed error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
