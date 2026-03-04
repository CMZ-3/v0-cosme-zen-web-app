// ============================
// Stock Module — Type Definitions
// ============================

// Stock Card (Master Data)
export type StockStatus = "active" | "inactive" | "discontinued"
export type ItemType = "raw_material" | "packaging" | "finished_good"
export type InventoryStatus = "healthy" | "low" | "out_of_stock" | "over_stock"

export interface StockCard {
  id: string
  itemCode: string
  itemName: string
  itemNameEn?: string
  itemType: ItemType
  category: string
  unit: string
  balance: number
  reservedStock: number
  incomingStock: number
  available: number  // balance - reserved + incoming
  initialStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  unitCost?: number
  supplier?: string
  location?: string
  barcode?: string
  tradeName?: string
  inciName?: string
  casNo?: string
  storageTemp?: string
  expiryDate?: string
  status: StockStatus
  inventoryStatus: InventoryStatus
  createdAt: string
  updatedAt: string
}

// Stock Dashboard KPI
export interface StockDashboard {
  totalItems: number
  totalInventoryValue?: number
  statusBreakdown: { healthy: number; low: number; outOfStock: number; overStock: number }
  totalIncoming: number
  totalReserved: number
  totalAvailable: number
}

// Movement types
export type MovementType =
  | "buy_in" | "use_out" | "adjust_in" | "adjust_out"
  | "transfer" | "production" | "return" | "damage" | "loss" | "found"

export type MovementStatus = "draft" | "pending" | "approved" | "rejected"

export interface StockMovement {
  id: string
  referenceNumber: string
  movementType: MovementType
  stockCardId: string
  itemCode: string
  itemName: string
  quantity: number
  unitCost?: number
  totalCost?: number
  status: MovementStatus
  lotNumber?: string
  expireDate?: string
  supplierLotNo?: string
  notes?: string
  createdBy: string
  createdAt: string
}

// Stock Lot
export type LotStatus = "available" | "exhausted"
export type LotCategory = "sealed" | "opened"

export interface StockLot {
  id: string
  stockCardId: string
  lotNumber: string
  quantity: number
  reservedQty: number
  expireDate?: string
  manufacturedDate?: string
  supplierLotNo?: string
  unitCost?: number
  sourceType: string
  status: LotStatus
  lotCategory: LotCategory
  parentLotId?: string
  notes?: string
  createdAt: string
}

// Reservation
export interface StockReservation {
  id: string
  stockCardId: string
  jobOrderId: string
  jobNo: string
  reservedQuantity: number
  status: "active" | "released" | "consumed"
  reservedAt: string
  releasedAt?: string
}

// Linked Product
export interface LinkedProduct {
  entityType: "product" | "formula"
  entityId: string
  code: string
  name: string
  componentType: string
  quantity: number
  unit: string
}

// Alert
export type AlertType = "low_stock" | "out_of_stock" | "over_stock" | "reorder" | "expiry_warning"

export interface StockAlert {
  id: string
  stockCardId: string
  itemCode: string
  itemName: string
  alertType: AlertType
  thresholdValue: number
  currentValue: number
  isResolved: boolean
  createdAt: string
  resolvedAt?: string
}

// STM Document
export type StmStatus = "draft" | "pending" | "approved" | "rejected"

export interface StmDocument {
  id: string
  docNumber: string
  docType: "requisition" | "receive"
  sourceType: "manual" | "job_order"
  jobOrderId?: string
  status: StmStatus
  notes?: string
  itemCount: number
  createdBy: string
  createdAt: string
}

// Color / label maps
export const itemTypeLabels: Record<ItemType, string> = {
  raw_material: "Raw Material",
  packaging: "Packaging",
  finished_good: "Finished Good",
}

export const itemTypeColors: Record<ItemType, string> = {
  raw_material: "bg-blue-100 text-blue-700",
  packaging: "bg-amber-100 text-amber-700",
  finished_good: "bg-emerald-100 text-emerald-700",
}

export const stockStatusColors: Record<StockStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-zinc-100 text-zinc-600",
  discontinued: "bg-red-100 text-red-700",
}

export const inventoryStatusLabels: Record<InventoryStatus, string> = {
  healthy: "Healthy",
  low: "Low Stock",
  out_of_stock: "Out of Stock",
  over_stock: "Over Stock",
}

export const inventoryStatusColors: Record<InventoryStatus, string> = {
  healthy: "bg-emerald-100 text-emerald-700",
  low: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
  over_stock: "bg-blue-100 text-blue-700",
}

export const movementTypeLabels: Record<MovementType, string> = {
  buy_in: "Buy In",
  use_out: "Use Out",
  adjust_in: "Adjust In",
  adjust_out: "Adjust Out",
  transfer: "Transfer",
  production: "Production",
  return: "Return",
  damage: "Damage",
  loss: "Loss",
  found: "Found",
}

export const movementTypeColors: Record<MovementType, string> = {
  buy_in: "bg-emerald-100 text-emerald-700",
  adjust_in: "bg-green-100 text-green-700",
  return: "bg-teal-100 text-teal-700",
  found: "bg-lime-100 text-lime-700",
  use_out: "bg-red-100 text-red-700",
  adjust_out: "bg-orange-100 text-orange-700",
  production: "bg-rose-100 text-rose-700",
  damage: "bg-red-100 text-red-700",
  loss: "bg-pink-100 text-pink-700",
  transfer: "bg-blue-100 text-blue-700",
}

export const movementStatusColors: Record<MovementStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
}

export const alertTypeLabels: Record<AlertType, string> = {
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  over_stock: "Over Stock",
  reorder: "Reorder Point",
  expiry_warning: "Expiry Warning",
}

export const alertTypeColors: Record<AlertType, string> = {
  low_stock: "bg-amber-100 text-amber-700",
  out_of_stock: "bg-red-100 text-red-700",
  over_stock: "bg-blue-100 text-blue-700",
  reorder: "bg-orange-100 text-orange-700",
  expiry_warning: "bg-purple-100 text-purple-700",
}

// ============================
// Simulation / Formula Types
// ============================

export interface FormulaIngredient {
  id: string
  percent?: number
  perUnit?: number
  yieldPerUnit?: number
}

export interface Formula {
  name: string
  unitWeight: number
  ingredients: FormulaIngredient[]
}

export interface SimulationBatch {
  id: number
  formulaId: string
  formulaName: string
  batchSize: number
  pieces: number
  requirements: { id: string; qty: number; isPkg: boolean }[]
}

export type ReservationStatus = "DRAFT" | "LINKED" | "CONSUMED" | "CANCELLED"

export interface SavedReservation {
  id: string
  ssiRef: string
  name: string
  formulaName: string
  date: string
  batchData: SimulationBatch
  status: ReservationStatus
  linkedJo: string | null
}

export interface JobReservation {
  jobNo: string
  itemCode: string
  itemName: string
  qtyNeeded: number
  qtyAllocated: number
  status: "READY" | "WAITING"
}

// ============================
// Purchase Order / Incoming Types
// ============================

export interface POItem {
  itemId: string
  name: string
  qty: number
  receivedQty: number
  shortageQty?: number
  extraQty?: number
}

export type POStatus = "PENDING" | "PARTIAL" | "RECEIVED"

export interface PurchaseOrder {
  poNo: string
  supplier: string
  items: POItem[]
  status: POStatus
  eta: string
  autoGenerated?: boolean
  reason?: string
  extraNote?: string | null
  ssiRef?: string
}

// ============================
// Receive Record (SRR) Types
// ============================

export interface ReceiveRecordItem {
  itemId: string
  name: string
  qty: number
  excessQty: number
}

export interface ReceiveRecord {
  srrNo: string
  sinRef: string
  supplier: string
  items: ReceiveRecordItem[]
  receivedAt: string
  isPartial: boolean
  hasExcess: boolean
  totalExcess: number
  note: string
}

// ============================
// Movement Log Entry (for simulation)
// ============================

export interface MovementLogEntry {
  ts: string
  item: string
  type: "IN" | "OUT" | "ADJUST" | "RESERVE"
  qty: number
  ref: string
  note: string
}

// ============================
// Stock Item (Simulation-level)
// ============================

export interface StockItem {
  id: string
  name: string
  code: string
  category: string
  balance: number
  reserved: number
  incoming: number
  unit: string
  min: number
  max: number
  cost: number
  lot: string
  supplier: string
  temp: string
  expiry: string
}
