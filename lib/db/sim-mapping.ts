import type { StockCardRow, StockMovementRow } from "./schema"
import type { StockItem, MovementLogEntry, InventoryStatus, ItemType } from "@/lib/stock-types"

// ============================================================
// Mapping helpers between the DB (stock_cards / stock_movements)
// and the simulation-level view models (StockItem / MovementLogEntry).
//
// stock_cards is the single source of truth for stock levels; the simulation
// tabs consume the lighter StockItem shape, so we translate on read/write.
// ============================================================

export function deriveItemType(id: string, code: string): ItemType {
  const key = `${id} ${code}`.toUpperCase()
  if (key.includes("PKG") || key.includes("PK-")) return "packaging"
  if (key.includes("FG-")) return "finished_good"
  return "raw_material"
}

export function deriveInventoryStatus(available: number, min: number, max: number): InventoryStatus {
  if (available <= 0) return "out_of_stock"
  if (available < min) return "low"
  if (max > 0 && available > max) return "over_stock"
  return "healthy"
}

/** DB row -> simulation StockItem (used to hydrate the simulation state). */
export function rowToStockItem(row: StockCardRow): StockItem {
  return {
    id: row.id,
    name: row.itemName,
    code: row.itemCode,
    category: row.category,
    balance: row.balance,
    reserved: row.reservedStock,
    incoming: row.incomingStock,
    unit: row.unit,
    min: row.minStock,
    max: row.maxStock,
    cost: row.unitCost ?? 0,
    lot: row.defaultLot ?? "",
    supplier: row.supplier ?? "",
    temp: row.storageTemp ?? "",
    expiry: row.expiryDate ?? "",
  }
}

/** Simulation catalog item -> stock_cards insert row (used when seeding). */
export function stockItemToCardValues(item: StockItem, userId: string | null = null) {
  const available = item.balance - item.reserved + item.incoming
  return {
    id: item.id,
    userId,
    itemCode: item.code,
    itemName: item.name,
    itemNameEn: item.name,
    itemType: deriveItemType(item.id, item.code),
    category: item.category,
    unit: item.unit,
    balance: item.balance,
    reservedStock: item.reserved,
    incomingStock: item.incoming,
    available,
    initialStock: item.balance,
    minStock: item.min,
    maxStock: item.max,
    reorderPoint: item.min,
    unitCost: item.cost,
    supplier: item.supplier,
    storageTemp: item.temp,
    expiryDate: item.expiry,
    defaultLot: item.lot,
    status: "active" as const,
    inventoryStatus: deriveInventoryStatus(available, item.min, item.max),
  }
}

/** Map a canonical stock_movements row to the simulation MovementLogEntry view. */
export function movementRowToLogEntry(row: StockMovementRow): MovementLogEntry {
  const t = row.movementType
  let type: MovementLogEntry["type"] = "ADJUST"
  let sign = 1
  if (["buy_in", "adjust_in", "return", "found"].includes(t)) type = "IN"
  else if (["use_out", "adjust_out", "damage", "loss", "production"].includes(t)) {
    type = "OUT"
    sign = -1
  } else if (t === "reserve") {
    type = "RESERVE"
    sign = -1
  } else if (t === "release") {
    type = "RESERVE"
  }

  const ts = new Date(row.createdAt)
    .toLocaleString("sv-SE")
    .replace("T", " ")
    .slice(0, 16)

  // stock_movements stores quantity as a positive magnitude; the simulation
  // ledger expects a signed value (negative for out / reserve).
  return {
    ts,
    item: row.itemName,
    type,
    qty: sign * Math.abs(row.quantity),
    ref: row.referenceNumber,
    note: row.notes ?? "",
  }
}
