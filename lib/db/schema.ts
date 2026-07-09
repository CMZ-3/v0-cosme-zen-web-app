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

// ============================================================
// Delivery Module table
// ============================================================

export const deliveryOrders = pgTable("delivery_orders", {
  id: text("id").primaryKey(),
  deliveryNumber: text("deliveryNumber").notNull(),
  jobOrderId: text("jobOrderId"),
  customerId: text("customerId"),
  customerName: text("customerName").notNull(),
  customerBrand: text("customerBrand"),
  salesOrderRef: text("salesOrderRef"),
  orderDate: text("orderDate").notNull(),
  deliveryDate: text("deliveryDate"),
  actualDeliveryDate: text("actualDeliveryDate"),
  deliveryAddress: text("deliveryAddress"),
  deliveryCity: text("deliveryCity"),
  deliveryProvince: text("deliveryProvince"),
  deliveryPostalCode: text("deliveryPostalCode"),
  contactName: text("contactName"),
  contactPhone: text("contactPhone"),
  status: text("status").notNull().default("draft"),
  totalQuantity: integer("totalQuantity"),
  totalAmount: doublePrecision("totalAmount"),
  shippingMethod: text("shippingMethod"),
  trackingNumber: text("trackingNumber"),
  shippingCost: doublePrecision("shippingCost"),
  weightKg: doublePrecision("weightKg"),
  boxesCount: integer("boxesCount"),
  productSummary: text("productSummary"),
  jobStatus: text("jobStatus"),
  pickedBy: text("pickedBy"),
  pickedAt: text("pickedAt"),
  shippedBy: text("shippedBy"),
  shippedAt: text("shippedAt"),
  receiverName: text("receiverName"),
  podNotes: text("podNotes"),
  podSignedAt: text("podSignedAt"),
  notes: text("notes"),
  createdBy: text("createdBy"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export type DeliveryOrderRow = typeof deliveryOrders.$inferSelect

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

// ============================================================
// Customers table
// ============================================================
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  customerCode: text("customerCode").notNull(),
  customerName: text("customerName").notNull(),
  customerNameEn: text("customerNameEn"),
  customerType: text("customerType").notNull().default("juristic"),
  customerTier: text("customerTier").notNull().default("standard"),
  businessType: text("businessType").notNull().default("brand_owner"),
  contactPerson: text("contactPerson"),
  email: text("email"),
  phone: text("phone"),
  creditLimit: doublePrecision("creditLimit"),
  creditUsed: doublePrecision("creditUsed"),
  isActive: boolean("isActive").notNull().default(true),
  totalOrders: integer("totalOrders").notNull().default(0),
  totalRevenue: doublePrecision("totalRevenue").notNull().default(0),
  productCount: integer("productCount").notNull().default(0),
  brandCount: integer("brandCount").notNull().default(0),
  leadSource: text("leadSource"),
  province: text("province"),
  country: text("country").notNull().default("Thailand"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postalCode"),
  taxId: text("taxId"),
  creditDays: integer("creditDays").notNull().default(30),
  salesRepresentative: text("salesRepresentative"),
  website: text("website"),
  notes: text("notes"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Suppliers table
// ============================================================
export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  supplierCode: text("supplierCode").notNull(),
  supplierName: text("supplierName").notNull(),
  supplierNameEn: text("supplierNameEn"),
  supplierType: text("supplierType").notNull().default("raw_material"),
  country: text("country").notNull().default("Thailand"),
  city: text("city"),
  contactPerson: text("contactPerson"),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("isActive").notNull().default(true),
  isApproved: boolean("isApproved").notNull().default(false),
  grade: text("grade").notNull().default("B"),
  qualityRating: doublePrecision("qualityRating"),
  deliveryRating: doublePrecision("deliveryRating"),
  priceRating: doublePrecision("priceRating"),
  materialTags: jsonb("materialTags").notNull().default([]),
  status: text("status").notNull().default("active"),
  description: text("description"),
  address: text("address"),
  taxId: text("taxId"),
  paymentTerms: text("paymentTerms"),
  paymentDays: integer("paymentDays").notNull().default(30),
  website: text("website"),
  notes: text("notes"),
  avgLeadTimeDays: integer("avgLeadTimeDays"),
  ytdOrderValue: doublePrecision("ytdOrderValue"),
  moq: text("moq"),
  onTimeDeliveryPct: doublePrecision("onTimeDeliveryPct"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// FDA / อย. Registrations table
// ============================================================
export const fdaRegistrations = pgTable("fda_registrations", {
  id: text("id").primaryKey(),
  registrationCode: text("registrationCode").notNull(),
  registrationType: text("registrationType").notNull().default("jk"), // jk | jr
  registrationNumber: text("registrationNumber"),
  productNameTh: text("productNameTh").notNull(),
  productNameEn: text("productNameEn"),
  tradeName: text("tradeName"),
  cosmeticType: text("cosmeticType"),
  status: text("status").notNull().default("draft"),
  expiryDate: text("expiryDate"),
  daysUntilExpiry: integer("daysUntilExpiry"),
  customerName: text("customerName"),
  manufacturerName: text("manufacturerName"),
  renewalCount: integer("renewalCount").notNull().default(0),
  ingredientCount: integer("ingredientCount"),
  serviceFee: doublePrecision("serviceFee"),
  submittedDate: text("submittedDate"),
  createdAt: text("createdAt").notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Products table
// ============================================================
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull(),
  nameInternal: text("nameInternal").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  customerName: text("customerName").notNull(),
  brandName: text("brandName"),
  category: text("category").notNull().default("other"),
  sellingPrice: doublePrecision("sellingPrice"),
  totalCostPerUnit: doublePrecision("totalCostPerUnit").notNull().default(0),
  marginPercent: doublePrecision("marginPercent").notNull().default(0),
  fdaStatus: text("fdaStatus").notNull().default("not_registered"),
  status: text("status").notNull().default("draft"),
  packageSize: text("packageSize"),
  containerType: text("containerType").notNull().default("bottle"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

// ============================================================
// Production tracking tables
// ------------------------------------------------------------
// A job order has an ordered list of production steps; each step accumulates
// daily production records (good/defect qty, operator, note). No FK constraints
// per stack guidance — joined by jobOrderId / stepId in application code.
// ============================================================
export const productionSteps = pgTable("production_steps", {
  id: text("id").primaryKey(),
  jobOrderId: text("jobOrderId").notNull(),
  stepNumber: integer("stepNumber").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("pending"), // done | active | pending
  targetQty: integer("targetQty").notNull().default(0),
  completedQty: integer("completedQty").notNull().default(0),
  goodQty: integer("goodQty").notNull().default(0),
  defectQty: integer("defectQty").notNull().default(0),
  unit: text("unit").notNull().default("units"),
  startDate: text("startDate"),
  endDate: text("endDate"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const dailyProductionRecords = pgTable("daily_production_records", {
  id: text("id").primaryKey(),
  stepId: text("stepId").notNull(),
  jobOrderId: text("jobOrderId").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  batchId: text("batchId").notNull().default(""),
  goodQty: integer("goodQty").notNull().default(0),
  defectQty: integer("defectQty").notNull().default(0),
  operatorName: text("operatorName").notNull().default(""),
  note: text("note").notNull().default(""),
  cumulativeTotal: integer("cumulativeTotal").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
})

export type CustomerRow = typeof customers.$inferSelect
export type SupplierRow = typeof suppliers.$inferSelect
export type FdaRegistrationRow = typeof fdaRegistrations.$inferSelect
export type ProductRow = typeof products.$inferSelect

export type FormulaRow = typeof formulas.$inferSelect
export type FormulaIngredientRow = typeof formulaIngredients.$inferSelect
export type JobOrderRow = typeof jobOrders.$inferSelect
export type ProductionStepRow = typeof productionSteps.$inferSelect
export type DailyProductionRecordRow = typeof dailyProductionRecords.$inferSelect

export type StockCardRow = typeof stockCards.$inferSelect
export type StockLotRow = typeof stockLots.$inferSelect
export type StockMovementRow = typeof stockMovements.$inferSelect
export type StockReservationRow = typeof stockReservations.$inferSelect
export type SimWorkflowRow = typeof simWorkflow.$inferSelect
