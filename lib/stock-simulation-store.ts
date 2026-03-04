// ============================
// Stock Simulation Store — Client-side state management
// ============================
import type {
  StockItem,
  Formula,
  SimulationBatch,
  SavedReservation,
  JobReservation,
  PurchaseOrder,
  ReceiveRecord,
  MovementLogEntry,
} from "./stock-types"

// ════════════════════════════════════════════════════
// INITIAL DATA
// ════════════════════════════════════════════════════

const INIT_STOCK = (): StockItem[] => [
  { id: "RM001", name: "Shea Butter", code: "RM-001", category: "Emollient", balance: 100, reserved: 0, incoming: 50, unit: "kg", min: 50, max: 200, cost: 180, lot: "LOT-2026-A1", supplier: "Organic Supply Co.", temp: "25C", expiry: "2027-06-15" },
  { id: "RM002", name: "Glycerin 99.5%", code: "RM-005", category: "Humectant", balance: 200, reserved: 0, incoming: 0, unit: "kg", min: 100, max: 500, cost: 85, lot: "LOT-2026-B3", supplier: "Chem Supply Co.", temp: "Room", expiry: "2028-01-20" },
  { id: "RM003", name: "Vitamin C Powder (LAA)", code: "RM-009", category: "Active Ingredient", balance: 5, reserved: 0, incoming: 3, unit: "kg", min: 10, max: 50, cost: 2800, lot: "LOT-2026-C2", supplier: "DSM Nutritional", temp: "15C", expiry: "2026-12-01" },
  { id: "RM004", name: "Aloe Vera Extract 10x", code: "RM-014", category: "Botanical", balance: 50, reserved: 0, incoming: 0, unit: "kg", min: 30, max: 150, cost: 220, lot: "LOT-2026-D1", supplier: "Botanical Farm Co.", temp: "20C", expiry: "2027-03-30" },
  { id: "RM005", name: "Fragrance: Jasmine", code: "EO-023", category: "Fragrance", balance: 2, reserved: 0, incoming: 0, unit: "kg", min: 5, max: 20, cost: 950, lot: "LOT-2026-E4", supplier: "Givaudan TH", temp: "20C", expiry: "2028-09-15" },
  { id: "RM006", name: "Niacinamide Powder", code: "RM-021", category: "Active Ingredient", balance: 8, reserved: 0, incoming: 5, unit: "kg", min: 10, max: 30, cost: 1200, lot: "LOT-2026-F1", supplier: "Lonza (TH)", temp: "25C", expiry: "2027-08-20" },
  { id: "RM007", name: "Hyaluronic Acid (HA)", code: "RM-030", category: "Active Ingredient", balance: 1, reserved: 0, incoming: 2, unit: "kg", min: 3, max: 10, cost: 5500, lot: "LOT-2026-G2", supplier: "Bloomage BioTech", temp: "10C", expiry: "2027-04-10" },
  { id: "RM008", name: "DI Water", code: "RM-100", category: "Base", balance: 1250, reserved: 0, incoming: 0, unit: "kg", min: 500, max: 3000, cost: 3, lot: "BULK", supplier: "In-House", temp: "Room", expiry: "N/A" },
  { id: "PKG01", name: "Bottle 100ml Clear", code: "PKG-101", category: "Packaging", balance: 1000, reserved: 0, incoming: 0, unit: "pcs", min: 500, max: 5000, cost: 8, lot: "PKG-A1", supplier: "Thai Packaging", temp: "Room", expiry: "N/A" },
  { id: "PKG02", name: "Pump Head Black", code: "PKG-102", category: "Packaging", balance: 1200, reserved: 0, incoming: 500, unit: "pcs", min: 500, max: 5000, cost: 5, lot: "PKG-A2", supplier: "Thai Packaging", temp: "Room", expiry: "N/A" },
  { id: "PKG03", name: "Jar 50g Frosted", code: "PKG-201", category: "Packaging", balance: 800, reserved: 0, incoming: 0, unit: "pcs", min: 300, max: 3000, cost: 12, lot: "PKG-B1", supplier: "Glass Pack Co.", temp: "Room", expiry: "N/A" },
  { id: "PKG04", name: "Tube 120ml White", code: "PKG-301", category: "Packaging", balance: 600, reserved: 0, incoming: 300, unit: "pcs", min: 400, max: 2000, cost: 6, lot: "PKG-C1", supplier: "Thai Packaging", temp: "Room", expiry: "N/A" },
]

export const FORMULAS: Record<string, Formula> = {
  f1: {
    name: "Vitamin C Brightening Serum",
    unitWeight: 110,
    ingredients: [
      { id: "RM008", percent: 70 },
      { id: "RM003", percent: 2 },
      { id: "RM002", percent: 10 },
      { id: "RM007", percent: 0.5 },
      { id: "RM005", percent: 0.5 },
      { id: "PKG01", perUnit: 1, yieldPerUnit: 1 },
      { id: "PKG02", perUnit: 1, yieldPerUnit: 1 },
    ],
  },
  f2: {
    name: "Aloe Vera Soothing Gel",
    unitWeight: 55,
    ingredients: [
      { id: "RM008", percent: 60 },
      { id: "RM004", percent: 20 },
      { id: "RM002", percent: 5 },
      { id: "RM006", percent: 2 },
      { id: "PKG03", perUnit: 1, yieldPerUnit: 1 },
    ],
  },
  f3: {
    name: "Deep Clean Foam Cleanser",
    unitWeight: 125,
    ingredients: [
      { id: "RM008", percent: 65 },
      { id: "RM001", percent: 5 },
      { id: "RM002", percent: 15 },
      { id: "RM005", percent: 0.2 },
      { id: "PKG04", perUnit: 1, yieldPerUnit: 1 },
    ],
  },
  f4: {
    name: "Niacinamide Brightening Cream",
    unitWeight: 55,
    ingredients: [
      { id: "RM008", percent: 55 },
      { id: "RM006", percent: 5 },
      { id: "RM001", percent: 10 },
      { id: "RM002", percent: 8 },
      { id: "RM007", percent: 0.3 },
      { id: "PKG03", perUnit: 1, yieldPerUnit: 1 },
    ],
  },
  f5: {
    name: "HA Hydrating Mist",
    unitWeight: 105,
    ingredients: [
      { id: "RM008", percent: 85 },
      { id: "RM007", percent: 1 },
      { id: "RM002", percent: 3 },
      { id: "PKG01", perUnit: 1, yieldPerUnit: 1 },
      { id: "PKG02", perUnit: 1, yieldPerUnit: 1 },
    ],
  },
}

const INIT_POS = (): PurchaseOrder[] => [
  { poNo: "SIN-260225-001", supplier: "Organic Supply Co.", items: [{ itemId: "RM001", name: "Shea Butter", qty: 50, receivedQty: 0 }], status: "PENDING", eta: "2026-03-01" },
  { poNo: "SIN-260225-002", supplier: "Chem Supply Co.", items: [{ itemId: "RM003", name: "Vitamin C Powder", qty: 3, receivedQty: 0 }, { itemId: "PKG02", name: "Pump Head Black", qty: 500, receivedQty: 0 }], status: "PENDING", eta: "2026-03-03" },
  { poNo: "SIN-260225-003", supplier: "Lonza (TH)", items: [{ itemId: "RM006", name: "Niacinamide Powder", qty: 5, receivedQty: 0 }], status: "PENDING", eta: "2026-03-05" },
  { poNo: "SIN-260225-004", supplier: "Bloomage BioTech", items: [{ itemId: "RM007", name: "Hyaluronic Acid", qty: 2, receivedQty: 0 }], status: "PENDING", eta: "2026-03-07" },
  { poNo: "SIN-260225-005", supplier: "Thai Packaging", items: [{ itemId: "PKG04", name: "Tube 120ml White", qty: 300, receivedQty: 0 }], status: "PENDING", eta: "2026-02-28" },
]

const INIT_JOBS = (): JobReservation[] => [
  { jobNo: "JO-2026-001", itemCode: "RM001", itemName: "Shea Butter", qtyNeeded: 30, qtyAllocated: 0, status: "WAITING" },
  { jobNo: "JO-2026-001", itemCode: "RM002", itemName: "Glycerin 99.5%", qtyNeeded: 15, qtyAllocated: 15, status: "READY" },
  { jobNo: "JO-2026-002", itemCode: "RM003", itemName: "Vitamin C Powder", qtyNeeded: 2, qtyAllocated: 2, status: "READY" },
  { jobNo: "JO-2026-002", itemCode: "RM002", itemName: "Glycerin 99.5%", qtyNeeded: 10, qtyAllocated: 10, status: "READY" },
]

const INIT_MOVEMENTS = (): MovementLogEntry[] => [
  { ts: "2026-02-25 08:30", item: "Glycerin 99.5%", type: "IN", qty: 200, ref: "SIN-260225-001", note: "Full PO received" },
  { ts: "2026-02-24 14:15", item: "Vitamin C Powder", type: "OUT", qty: -3, ref: "JO-2026-002", note: "Issued to production" },
  { ts: "2026-02-24 09:00", item: "Bottle 100ml Clear", type: "IN", qty: 500, ref: "SIN-260224-001", note: "Partial PO received" },
  { ts: "2026-02-23 16:45", item: "Shea Butter", type: "RESERVE", qty: -30, ref: "JO-2026-001", note: "Reserved for production" },
  { ts: "2026-02-23 11:20", item: "DI Water", type: "ADJUST", qty: 50, ref: "ADJ-001", note: "Inventory count correction" },
]

// ════════════════════════════════════════════════════
// STATE MANAGER (React-friendly with immutable updates)
// ════════════════════════════════════════════════════

export interface StockSimulationState {
  stock: StockItem[]
  purchaseOrders: PurchaseOrder[]
  jobReservations: JobReservation[]
  memoryBank: SimulationBatch[]
  savedReservations: SavedReservation[]
  receiveRecords: ReceiveRecord[]
  movementLog: MovementLogEntry[]
  docCounters: { SSI: number; SRE: number; SIN: number; SRR: number }
}

export function createInitialState(): StockSimulationState {
  return {
    stock: INIT_STOCK(),
    purchaseOrders: INIT_POS(),
    jobReservations: INIT_JOBS(),
    memoryBank: [],
    savedReservations: [],
    receiveRecords: [],
    movementLog: INIT_MOVEMENTS(),
    docCounters: { SSI: 0, SRE: 0, SIN: 5, SRR: 0 },
  }
}

// ════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════

export function generateDocNo(counters: StockSimulationState["docCounters"], prefix: keyof StockSimulationState["docCounters"]): string {
  counters[prefix]++
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const num = String(counters[prefix]).padStart(3, "0")
  return `${prefix}-${yy}${mm}${dd}-${num}`
}

export function calcRequired(ing: { percent?: number; perUnit?: number; yieldPerUnit?: number }, batchSize: number, pieces: number): number {
  if (ing.percent) return (batchSize * ing.percent) / 100
  if (ing.perUnit) {
    const ypu = ing.yieldPerUnit || 1
    return Math.ceil(pieces / ypu) * ing.perUnit
  }
  return 0
}

export function getPiecesFromBatch(formulaId: string, batchSize: number): number {
  const f = FORMULAS[formulaId]
  if (!f || !f.unitWeight || f.unitWeight <= 0) return 0
  return Math.floor((batchSize * 1000) / f.unitWeight)
}

export function getStockItem(stock: StockItem[], id: string): StockItem | undefined {
  return stock.find((s) => s.id === id)
}

export function calcTotalReserved(jobReservations: JobReservation[], itemId: string): number {
  return jobReservations.filter((j) => j.itemCode === itemId).reduce((s, j) => s + j.qtyAllocated, 0)
}

export function calcAvailable(item: StockItem, jobReservations: JobReservation[]): number {
  return item.balance - calcTotalReserved(jobReservations, item.id) + item.incoming
}

export function getItemStatus(available: number, item: StockItem): { label: string; cls: string } {
  if (available <= 0) return { label: "Out of Stock", cls: "red" }
  if (available < item.min) return { label: "Low Stock", cls: "orange" }
  if (available > item.max) return { label: "Over Stock", cls: "blue" }
  return { label: "Healthy", cls: "green" }
}

export function getPendingPOQty(purchaseOrders: PurchaseOrder[], itemId: string): number {
  let total = 0
  purchaseOrders
    .filter((p) => p.status === "PENDING" || p.status === "PARTIAL")
    .forEach((po) => {
      po.items.forEach((it) => {
        if (it.itemId === itemId) total += it.qty - (it.receivedQty || 0)
      })
    })
  return total
}

export function getEstDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

export function nowTimestamp(): string {
  return new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16)
}

export const FORMULA_COLORS = ["#8b5cf6", "#4c8bf5", "#5ea58c", "#f59e0b", "#ec4899", "#ef4444", "#10b981", "#06b6d4", "#a855f7", "#f97316"]
