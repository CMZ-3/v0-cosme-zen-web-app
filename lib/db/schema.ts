import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core"

// ============================================================
// Stock Module tables
// ------------------------------------------------------------
// Note: no foreign key constraints by default (per stack guidance) — relations
// are joined in application code. Every row carries an optional `userId` for
// future per-user scoping; the current app is single-tenant so it is nullable.
// ============================================================

export const stockCards = pgTable("stock_cards", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  itemCode: text("itemCode").notNull(),
  itemName: text("itemName").notNull(),
  itemNameEn: text("itemNameEn"),
  itemType: text("itemType").notNull(), // raw_material | packaging | finished_good
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  balance: doublePrecision("balance").notNull().default(0),
  reservedStock: doublePrecision("reservedStock").notNull().default(0),
  incomingStock: doublePrecision("incomingStock").notNull().default(0),
  available: doublePrecision("available").notNull().default(0),
  initialStock: doublePrecision("initialStock").notNull().default(0),
  minStock: doublePrecision("minStock").notNull().default(0),
  maxStock: doublePrecision("maxStock").notNull().default(0),
  reorderPoint: doublePrecision("reorderPoint").notNull().default(0),
  unitCost: doublePrecision("unitCost"),
  supplier: text("supplier"),
  location: text("location"),
  barcode: text("barcode"),
  tradeName: text("tradeName"),
  inciName: text("inciName"),
  casNo: text("casNo"),
  storageTemp: text("storageTemp"),
  expiryDate: text("expiryDate"),
  defaultLot: text("defaultLot"), // default lot label used by the simulation StockItem view
  status: text("status").notNull().default("active"), // active | inactive | discontinued
  inventoryStatus: text("inventoryStatus").notNull().default("healthy"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const stockLots = pgTable("stock_lots", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  stockCardId: text("stockCardId").notNull(),
  lotNumber: text("lotNumber").notNull(),
  quantity: doublePrecision("quantity").notNull().default(0),
  reservedQty: doublePrecision("reservedQty").notNull().default(0),
  expireDate: text("expireDate"),
  manufacturedDate: text("manufacturedDate"),
  supplierLotNo: text("supplierLotNo"),
  unitCost: doublePrecision("unitCost"),
  sourceType: text("sourceType").notNull().default("manual"),
  status: text("status").notNull().default("available"), // available | exhausted
  lotCategory: text("lotCategory").notNull().default("sealed"), // sealed | opened
  parentLotId: text("parentLotId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
})

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  referenceNumber: text("referenceNumber").notNull(),
  movementType: text("movementType").notNull(),
  // Nullable so the ledger can hold workflow-level entries (e.g. formula-level
  // reservations) that are not tied to a single stock card.
  stockCardId: text("stockCardId"),
  itemCode: text("itemCode"),
  itemName: text("itemName").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  unitCost: doublePrecision("unitCost"),
  totalCost: doublePrecision("totalCost"),
  status: text("status").notNull().default("approved"),
  lotNumber: text("lotNumber"),
  expireDate: text("expireDate"),
  supplierLotNo: text("supplierLotNo"),
  notes: text("notes"),
  createdBy: text("createdBy").notNull().default("system"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
})

export const stockReservations = pgTable("stock_reservations", {
  id: text("id").primaryKey(),
  userId: text("userId"),
  stockCardId: text("stockCardId").notNull(),
  jobOrderId: text("jobOrderId").notNull(),
  jobNo: text("jobNo").notNull(),
  reservedQuantity: doublePrecision("reservedQuantity").notNull().default(0),
  status: text("status").notNull().default("active"), // active | released | consumed
  reservedAt: timestamp("reservedAt", { withTimezone: true }).notNull().defaultNow(),
  releasedAt: timestamp("releasedAt", { withTimezone: true }),
})

// ============================================================
// Formula & Job Order Module tables
// ============================================================

export const formulas = pgTable("formulas", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  nameEn: text("nameEn"),
  category: text("category").notNull().default("body_wash"),
  base: text("base"),
  batchSizeKg: doublePrecision("batchSizeKg").notNull().default(10),
  yield: doublePrecision("yield").notNull().default(100),
  status: text("status").notNull().default("active"), // active | archived | draft
  version: text("version").notNull().default("1.0"),
  registrationNo: text("registrationNo"),
  productionSteps: jsonb("productionSteps").notNull().default([]),
  qcStandards: jsonb("qcStandards").notNull().default({}),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const formulaIngredients = pgTable("formula_ingredients", {
  id: text("id").primaryKey(),
  formulaId: text("formulaId").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
  rawMaterialName: text("rawMaterialName").notNull(),
  supplier: text("supplier"),
  percentage: doublePrecision("percentage").notNull(),
  stockCardId: text("stockCardId"), // nullable — links to stock_cards when available
  unit: text("unit").notNull().default("kg"),
  notes: text("notes"),
})

export const jobOrders = pgTable("job_orders", {
  id: text("id").primaryKey(),
  jobNo: text("jobNo").notNull(),
  formulaId: text("formulaId"),
  formulaName: text("formulaName").notNull(),
  formulaCode: text("formulaCode"),
  customer: text("customer"),
  batchSizeKg: doublePrecision("batchSizeKg").notNull().default(10),
  plannedQty: integer("plannedQty"),
  unit: text("unit").notNull().default("kg"),
  status: text("status").notNull().default("pending"), // pending | in_progress | qc | completed | cancelled
  priority: text("priority").notNull().default("normal"), // low | normal | high | urgent
  plannedStart: text("plannedStart"),
  plannedEnd: text("plannedEnd"),
  actualStart: text("actualStart"),
  actualEnd: text("actualEnd"),
  assignedTo: text("assignedTo"),
  productionNotes: text("productionNotes"),
  materials: jsonb("materials").notNull().default([]),    // snapshot of ingredient requirements
  batches: jsonb("batches").notNull().default([]),
  qcResults: jsonb("qcResults").notNull().default([]),
  costBreakdown: jsonb("costBreakdown").notNull().default({}),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

// Single-row store (id='default') for simulation workflow metadata that is not
// stock levels: purchase orders, job reservations, saved reservations, receive
// records, and document counters. Stock levels live in stock_cards and the
// canonical ledger lives in stock_movements.
export const simWorkflow = pgTable("sim_workflow", {
  id: text("id").primaryKey().default("default"),
  userId: text("userId"),
  purchaseOrders: jsonb("purchaseOrders").notNull().default([]),
  jobReservations: jsonb("jobReservations").notNull().default([]),
  savedReservations: jsonb("savedReservations").notNull().default([]),
  receiveRecords: jsonb("receiveRecords").notNull().default([]),
  docCounters: jsonb("docCounters").notNull().default({ SSI: 0, SRE: 0, SIN: 5, SRR: 0 }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export type FormulaRow = typeof formulas.$inferSelect
export type FormulaIngredientRow = typeof formulaIngredients.$inferSelect
export type JobOrderRow = typeof jobOrders.$inferSelect

export type StockCardRow = typeof stockCards.$inferSelect
export type StockLotRow = typeof stockLots.$inferSelect
export type StockMovementRow = typeof stockMovements.$inferSelect
export type StockReservationRow = typeof stockReservations.$inferSelect
export type SimWorkflowRow = typeof simWorkflow.$inferSelect
