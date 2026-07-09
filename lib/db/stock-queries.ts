import { db } from "@/lib/db"
import {
  stockCards,
  stockLots,
  stockMovements,
  stockReservations,
  type StockCardRow,
  type StockLotRow,
  type StockMovementRow,
  type StockReservationRow,
} from "@/lib/db/schema"
import { and, asc, desc, eq } from "drizzle-orm"
import type {
  StockCard,
  StockLot,
  StockMovement,
  StockReservation,
} from "@/lib/stock-types"

// ------------------------------------------------------------
// Row -> domain type mappers. Keep the API response shape identical to the
// existing mock types so frontend components need no type changes.
// ------------------------------------------------------------

function toCard(r: StockCardRow): StockCard {
  return {
    id: r.id,
    itemCode: r.itemCode,
    itemName: r.itemName,
    itemNameEn: r.itemNameEn ?? undefined,
    itemType: r.itemType as StockCard["itemType"],
    category: r.category,
    unit: r.unit,
    balance: r.balance,
    reservedStock: r.reservedStock,
    incomingStock: r.incomingStock,
    available: r.available,
    initialStock: r.initialStock,
    minStock: r.minStock,
    maxStock: r.maxStock,
    reorderPoint: r.reorderPoint,
    unitCost: r.unitCost ?? undefined,
    supplier: r.supplier ?? undefined,
    location: r.location ?? undefined,
    barcode: r.barcode ?? undefined,
    tradeName: r.tradeName ?? undefined,
    inciName: r.inciName ?? undefined,
    casNo: r.casNo ?? undefined,
    storageTemp: r.storageTemp ?? undefined,
    expiryDate: r.expiryDate ?? undefined,
    status: r.status as StockCard["status"],
    inventoryStatus: r.inventoryStatus as StockCard["inventoryStatus"],
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }
}

function toLot(r: StockLotRow): StockLot {
  return {
    id: r.id,
    stockCardId: r.stockCardId,
    lotNumber: r.lotNumber,
    quantity: r.quantity,
    reservedQty: r.reservedQty,
    expireDate: r.expireDate ?? undefined,
    manufacturedDate: r.manufacturedDate ?? undefined,
    supplierLotNo: r.supplierLotNo ?? undefined,
    unitCost: r.unitCost ?? undefined,
    sourceType: r.sourceType,
    status: r.status as StockLot["status"],
    lotCategory: r.lotCategory as StockLot["lotCategory"],
    parentLotId: r.parentLotId ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }
}

function toMovement(r: StockMovementRow): StockMovement {
  return {
    id: r.id,
    referenceNumber: r.referenceNumber,
    movementType: r.movementType as StockMovement["movementType"],
    stockCardId: r.stockCardId ?? "",
    itemCode: r.itemCode ?? "",
    itemName: r.itemName,
    quantity: r.quantity,
    unitCost: r.unitCost ?? undefined,
    totalCost: r.totalCost ?? undefined,
    status: r.status as StockMovement["status"],
    lotNumber: r.lotNumber ?? undefined,
    expireDate: r.expireDate ?? undefined,
    supplierLotNo: r.supplierLotNo ?? undefined,
    notes: r.notes ?? undefined,
    createdBy: r.createdBy,
    createdAt: r.createdAt.toISOString(),
  }
}

function toReservation(r: StockReservationRow): StockReservation {
  return {
    id: r.id,
    stockCardId: r.stockCardId,
    jobOrderId: r.jobOrderId,
    jobNo: r.jobNo,
    reservedQuantity: r.reservedQuantity,
    status: r.status as StockReservation["status"],
    reservedAt: r.reservedAt.toISOString(),
    releasedAt: r.releasedAt?.toISOString(),
  }
}

// ------------------------------------------------------------
// Reads
// ------------------------------------------------------------

export async function getStockCards(): Promise<StockCard[]> {
  const rows = await db.select().from(stockCards).orderBy(asc(stockCards.itemCode))
  return rows.map(toCard)
}

export async function getStockCard(id: string): Promise<StockCard | null> {
  const rows = await db.select().from(stockCards).where(eq(stockCards.id, id)).limit(1)
  return rows[0] ? toCard(rows[0]) : null
}

export async function getStockLots(stockCardId?: string): Promise<StockLot[]> {
  const rows = stockCardId
    ? await db.select().from(stockLots).where(eq(stockLots.stockCardId, stockCardId))
    : await db.select().from(stockLots)
  return rows.map(toLot)
}

export async function getStockMovements(stockCardId?: string): Promise<StockMovement[]> {
  const rows = stockCardId
    ? await db
        .select()
        .from(stockMovements)
        .where(eq(stockMovements.stockCardId, stockCardId))
        .orderBy(desc(stockMovements.createdAt))
    : await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt))
  return rows.map(toMovement)
}

export async function updateStockMovement(id: string, data: Partial<{ notes: string; status: string }>): Promise<boolean> {
  const rows = await db.update(stockMovements).set(data).where(eq(stockMovements.id, id)).returning()
  return rows.length > 0
}

export async function deleteStockMovement(id: string): Promise<boolean> {
  const rows = await db.delete(stockMovements).where(eq(stockMovements.id, id)).returning()
  return rows.length > 0
}

export async function getStockReservations(
  stockCardId?: string,
  jobOrderId?: string,
): Promise<StockReservation[]> {
  const conditions = [
    stockCardId ? eq(stockReservations.stockCardId, stockCardId) : undefined,
    jobOrderId ? eq(stockReservations.jobOrderId, jobOrderId) : undefined,
  ].filter(Boolean) as ReturnType<typeof eq>[]

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(stockReservations)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : await db.select().from(stockReservations)
  return rows.map(toReservation)
}
