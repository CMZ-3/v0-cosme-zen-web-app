import { db } from "@/lib/db"
import {
  fdaRegistrations, products,
  fdaIngredients, fdaManufacturingSteps, fdaRawMaterialSpecs, fdaDocuments, fdaChecklist, fdaAuditLogs,
} from "@/lib/db/schema"
import { eq, desc, ilike, or, asc } from "drizzle-orm"
import type {
  FdaRegistrationRow, ProductRow,
  FdaIngredientRow, FdaManufacturingStepRow, FdaRawMaterialSpecRow,
  FdaDocumentRow, FdaChecklistRow, FdaAuditLogRow,
} from "@/lib/db/schema"
import type {
  FdaListItem, FdaRegistration, FdaKPISummary, RegistrationType, FdaStatus,
  FdaIngredient, FdaManufacturingStep, FdaRawMaterialSpec, FdaDocument, FdaChecklistItem, FdaAuditLog,
} from "@/lib/fda-types"
import type { ProductListItem, ProductKPISummary, ProductCategory, ProductStatus, FDAStatus, ContainerType } from "@/lib/product-types"

// ─── FDA Registrations ────────────────────────────────────────────────────

function rowToFda(r: FdaRegistrationRow): FdaListItem {
  return {
    id: r.id,
    registrationCode: r.registrationCode,
    registrationType: r.registrationType as RegistrationType,
    registrationNumber: r.registrationNumber ?? undefined,
    productNameTh: r.productNameTh,
    productNameEn: r.productNameEn ?? undefined,
    tradeName: r.tradeName ?? undefined,
    cosmeticType: r.cosmeticType ?? undefined,
    status: r.status as FdaStatus,
    expiryDate: r.expiryDate ?? undefined,
    daysUntilExpiry: r.daysUntilExpiry ?? undefined,
    customerName: r.customerName ?? undefined,
    manufacturerName: r.manufacturerName ?? undefined,
    renewalCount: r.renewalCount,
    ingredientCount: r.ingredientCount ?? undefined,
    serviceFee: r.serviceFee ?? undefined,
    submittedDate: r.submittedDate ?? undefined,
    createdAt: r.createdAt,
  }
}

export async function listFdaRegistrations(search?: string): Promise<FdaListItem[]> {
  const rows = search
    ? await db
        .select()
        .from(fdaRegistrations)
        .where(
          or(
            ilike(fdaRegistrations.productNameTh, `%${search}%`),
            ilike(fdaRegistrations.productNameEn, `%${search}%`),
            ilike(fdaRegistrations.registrationCode, `%${search}%`),
            ilike(fdaRegistrations.customerName, `%${search}%`)
          )
        )
        .orderBy(desc(fdaRegistrations.createdAt))
    : await db.select().from(fdaRegistrations).orderBy(desc(fdaRegistrations.createdAt))
  return rows.map(rowToFda)
}

export async function getFdaById(id: string): Promise<FdaListItem | null> {
  const rows = await db.select().from(fdaRegistrations).where(eq(fdaRegistrations.id, id)).limit(1)
  return rows[0] ? rowToFda(rows[0]) : null
}

/** Returns the full FdaRegistration shape (all columns) — used by the detail page tabs */
export async function getFdaDetail(id: string): Promise<FdaRegistration | null> {
  const rows = await db.select().from(fdaRegistrations).where(eq(fdaRegistrations.id, id)).limit(1)
  if (!rows[0]) return null
  const r = rows[0]
  return {
    id: r.id,
    registrationCode: r.registrationCode,
    registrationType: r.registrationType as RegistrationType,
    registrationNumber: r.registrationNumber ?? undefined,
    licenseNumber: r.licenseNumber ?? undefined,
    productNameTh: r.productNameTh,
    productNameEn: r.productNameEn ?? undefined,
    fdaProductName: r.fdaProductName ?? undefined,
    tradeName: r.tradeName ?? undefined,
    tradeNameEn: r.tradeNameEn ?? undefined,
    productNameSuffix: r.productNameSuffix ?? undefined,
    cosmeticType: r.cosmeticType ?? undefined,
    cosmeticForm: r.cosmeticForm ?? undefined,
    usageFormat: r.usageFormat ?? undefined,
    applicationArea: r.applicationArea ?? undefined,
    productPurpose: r.productPurpose ?? undefined,
    containerType: r.containerType ?? undefined,
    productForm: r.productForm ?? undefined,
    usageInstructions: r.usageInstructions ?? undefined,
    warnings: r.warnings ?? undefined,
    combinedRegistrationNos: r.combinedRegistrationNos ?? undefined,
    registrationDate: r.registrationDate ?? undefined,
    submittedDate: r.submittedDate ?? undefined,
    expiryDate: r.expiryDate ?? undefined,
    renewalCount: r.renewalCount,
    manufacturerName: r.manufacturerName ?? undefined,
    manufacturerAddress: r.manufacturerAddress ?? undefined,
    manufacturerLicense: r.manufacturerLicense ?? undefined,
    manufacturerStorageAddress: r.manufacturerStorageAddress ?? undefined,
    importerName: r.importerName ?? undefined,
    importerAddress: r.importerAddress ?? undefined,
    formulaId: r.formulaId ?? undefined,
    customerId: r.customerId ?? undefined,
    customerName: r.customerName ?? undefined,
    status: r.status as FdaStatus,
    approvalComment: r.approvalComment ?? undefined,
    rejectionReason: r.rejectionReason ?? undefined,
    serviceFee: r.serviceFee ?? 0,
    feeNotes: r.feeNotes ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt ? r.updatedAt.toISOString().slice(0, 10) : r.createdAt,
    createdBy: r.createdBy ?? undefined,
  }
}

export async function getFdaKPI(): Promise<FdaKPISummary> {
  const rows = await db.select().from(fdaRegistrations)
  const byStatus = (s: FdaStatus) => rows.filter((r) => r.status === s).length
  const expiringWithin = (days: number) =>
    rows.filter((r) => r.daysUntilExpiry != null && r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= days).length
  return {
    total: rows.length,
    totalJk: rows.filter((r) => r.registrationType === "jk").length,
    totalJr: rows.filter((r) => r.registrationType === "jr").length,
    approved: byStatus("approved"),
    draft: byStatus("draft"),
    submitted: byStatus("submitted"),
    rejected: byStatus("rejected"),
    expired: byStatus("expired"),
    expiring30: expiringWithin(30),
    expiring60: expiringWithin(60),
    expiring90: expiringWithin(90),
  }
}

export async function createFdaRegistration(
  data: Omit<FdaRegistrationRow, "updatedAt">
): Promise<FdaRegistrationRow> {
  const rows = await db.insert(fdaRegistrations).values(data).returning()
  return rows[0]
}

export async function updateFdaStatus(
  id: string,
  status: FdaStatus,
  extra?: { approvalComment?: string; rejectionReason?: string }
): Promise<boolean> {
  const rows = await db
    .update(fdaRegistrations)
    .set({ status, ...extra })
    .where(eq(fdaRegistrations.id, id))
    .returning()
  return rows.length > 0
}

export async function updateFdaRegistration(
  id: string,
  data: Partial<Omit<FdaRegistrationRow, "id" | "registrationCode" | "createdAt" | "updatedAt">>
): Promise<boolean> {
  const rows = await db
    .update(fdaRegistrations)
    .set(data)
    .where(eq(fdaRegistrations.id, id))
    .returning()
  return rows.length > 0
}

export async function deleteFdaRegistration(id: string): Promise<boolean> {
  const rows = await db.delete(fdaRegistrations).where(eq(fdaRegistrations.id, id)).returning()
  return rows.length > 0
}

export async function cloneFdaRegistration(id: string): Promise<FdaRegistrationRow | null> {
  const rows = await db.select().from(fdaRegistrations).where(eq(fdaRegistrations.id, id)).limit(1)
  if (!rows[0]) return null
  const src = rows[0]
  const { nanoid } = await import("nanoid")
  const newId = nanoid(12)
  const now = new Date().toISOString().slice(0, 10)
  const prefix = src.registrationType === "jk" ? "JK" : "JR"
  const code = `${prefix}-${now.replace(/-/g, "")}-${newId.slice(0, 4).toUpperCase()}`
  const inserted = await db.insert(fdaRegistrations).values({
    ...src,
    id: newId,
    registrationCode: code,
    registrationNumber: null,
    status: "draft",
    createdAt: now,
    renewalCount: (src.renewalCount ?? 0) + 1,
  }).returning()
  return inserted[0]
}

// ─── PIF sub-table mutations ──────────────────────────────────────────────

export async function addFdaIngredient(data: Omit<import("@/lib/fda-types").FdaIngredient, "id">): Promise<import("@/lib/fda-types").FdaIngredient> {
  const { nanoid } = await import("nanoid")
  const rows = await db.insert(fdaIngredients).values({ ...data, id: nanoid(12) }).returning()
  return rows[0] as unknown as import("@/lib/fda-types").FdaIngredient
}

export async function updateFdaIngredient(id: string, data: Partial<FdaIngredient>): Promise<boolean> {
  const rows = await db.update(fdaIngredients).set(data).where(eq(fdaIngredients.id, id)).returning()
  return rows.length > 0
}

export async function deleteFdaIngredient(id: string): Promise<boolean> {
  const rows = await db.delete(fdaIngredients).where(eq(fdaIngredients.id, id)).returning()
  return rows.length > 0
}

export async function addFdaManufacturingStep(data: Omit<FdaManufacturingStep, "id">): Promise<FdaManufacturingStep> {
  const { nanoid } = await import("nanoid")
  const rows = await db.insert(fdaManufacturingSteps).values({ ...data, id: nanoid(12) }).returning()
  return rows[0] as unknown as FdaManufacturingStep
}

export async function updateFdaManufacturingStep(id: string, data: Partial<FdaManufacturingStep>): Promise<boolean> {
  const rows = await db.update(fdaManufacturingSteps).set(data).where(eq(fdaManufacturingSteps.id, id)).returning()
  return rows.length > 0
}

export async function deleteFdaManufacturingStep(id: string): Promise<boolean> {
  const rows = await db.delete(fdaManufacturingSteps).where(eq(fdaManufacturingSteps.id, id)).returning()
  return rows.length > 0
}

export async function addFdaRawMaterialSpec(data: Omit<FdaRawMaterialSpec, "id">): Promise<FdaRawMaterialSpec> {
  const { nanoid } = await import("nanoid")
  const rows = await db.insert(fdaRawMaterialSpecs).values({ ...data, id: nanoid(12) }).returning()
  return rows[0] as unknown as FdaRawMaterialSpec
}

export async function updateFdaRawMaterialSpec(id: string, data: Partial<FdaRawMaterialSpec>): Promise<boolean> {
  const rows = await db.update(fdaRawMaterialSpecs).set(data).where(eq(fdaRawMaterialSpecs.id, id)).returning()
  return rows.length > 0
}

export async function deleteFdaRawMaterialSpec(id: string): Promise<boolean> {
  const rows = await db.delete(fdaRawMaterialSpecs).where(eq(fdaRawMaterialSpecs.id, id)).returning()
  return rows.length > 0
}

// ─── FDA detail: sub-tables ───────────────────────────────────────────────

export async function getFdaIngredients(registrationId: string): Promise<FdaIngredient[]> {
  const rows = await db.select().from(fdaIngredients)
    .where(eq(fdaIngredients.registrationId, registrationId))
    .orderBy(asc(fdaIngredients.sortOrder))
  return rows.map((r: FdaIngredientRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    ingredientName: r.ingredientName,
    inciName: r.inciName ?? undefined,
    thaiName: r.thaiName ?? undefined,
    casNumber: r.casNumber ?? undefined,
    percentage: r.percentage ?? undefined,
    percentageMin: r.percentageMin ?? undefined,
    percentageMax: r.percentageMax ?? undefined,
    function: r.function ?? undefined,
    origin: r.origin ?? undefined,
    supplier: r.supplier ?? undefined,
    isRestricted: r.isRestricted,
    maxAllowedPercentage: r.maxAllowedPercentage ?? undefined,
    restrictions: r.restrictions ?? undefined,
    restrictionNotes: r.restrictionNotes ?? undefined,
    sortOrder: r.sortOrder,
  }))
}

export async function getFdaManufacturingSteps(registrationId: string): Promise<FdaManufacturingStep[]> {
  const rows = await db.select().from(fdaManufacturingSteps)
    .where(eq(fdaManufacturingSteps.registrationId, registrationId))
    .orderBy(asc(fdaManufacturingSteps.stepNumber))
  return rows.map((r: FdaManufacturingStepRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    stepNumber: r.stepNumber,
    stepName: r.stepName,
    description: r.description ?? undefined,
    equipment: r.equipment ?? undefined,
    temperatureRange: r.temperatureRange ?? undefined,
    timeDuration: r.timeDuration ?? undefined,
    criticalParameters: r.criticalParameters ?? undefined,
    qualityChecks: r.qualityChecks ?? undefined,
  }))
}

export async function getFdaRawMaterialSpecs(registrationId: string): Promise<FdaRawMaterialSpec[]> {
  const rows = await db.select().from(fdaRawMaterialSpecs)
    .where(eq(fdaRawMaterialSpecs.registrationId, registrationId))
    .orderBy(asc(fdaRawMaterialSpecs.sortOrder))
  return rows.map((r: FdaRawMaterialSpecRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    materialName: r.materialName,
    grade: r.grade ?? undefined,
    supplier: r.supplier ?? undefined,
    standardRef: r.standardRef ?? undefined,
    appearanceSpec: r.appearanceSpec ?? undefined,
    phSpec: r.phSpec ?? undefined,
    assaySpec: r.assaySpec ?? undefined,
    microSpec: r.microSpec ?? undefined,
    sortOrder: r.sortOrder,
  }))
}

export async function getFdaDocuments(registrationId: string): Promise<FdaDocument[]> {
  const rows = await db.select().from(fdaDocuments)
    .where(eq(fdaDocuments.registrationId, registrationId))
    .orderBy(asc(fdaDocuments.sortOrder))
  return rows.map((r: FdaDocumentRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    documentType: r.documentType as FdaDocument["documentType"],
    // Map DB column names → FdaDocument interface fields
    fileName: r.fileName ?? r.documentName,
    title: r.documentName,
    fileSize: r.fileSize ?? undefined,
    description: r.notes ?? undefined,
    createdAt: r.uploadedAt ?? new Date().toISOString().slice(0, 10),
  }))
}

export async function getFdaChecklist(registrationId: string): Promise<FdaChecklistItem[]> {
  const rows = await db.select().from(fdaChecklist)
    .where(eq(fdaChecklist.registrationId, registrationId))
    .orderBy(asc(fdaChecklist.sortOrder))
  return rows.map((r: FdaChecklistRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    // Map DB category+item → checklistKey used by the tab component
    checklistKey: `${r.category}_${r.id}`,
    isCompleted: r.isCompleted,
    notes: r.notes ?? undefined,
  }))
}

export async function getFdaAuditLogs(registrationId: string): Promise<FdaAuditLog[]> {
  const rows = await db.select().from(fdaAuditLogs)
    .where(eq(fdaAuditLogs.registrationId, registrationId))
    .orderBy(desc(fdaAuditLogs.createdAt))
  return rows.map((r: FdaAuditLogRow) => ({
    id: r.id,
    registrationId: r.registrationId,
    action: r.action,
    performedBy: r.performedBy,
    note: r.note ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }))
}

// ─── Products ─────────────────────────────────────────────────────────────

function rowToProduct(r: ProductRow): ProductListItem {
  return {
    id: r.id,
    sku: r.sku,
    nameInternal: r.nameInternal,
    thumbnailUrl: r.thumbnailUrl ?? undefined,
    customerName: r.customerName,
    brandName: r.brandName ?? undefined,
    category: r.category as ProductCategory,
    sellingPrice: r.sellingPrice ?? undefined,
    totalCostPerUnit: r.totalCostPerUnit,
    marginPercent: r.marginPercent,
    fdaStatus: r.fdaStatus as FDAStatus,
    status: r.status as ProductStatus,
    packageSize: r.packageSize ?? "",
    containerType: r.containerType as ContainerType,
  }
}

export async function listProducts(search?: string): Promise<ProductListItem[]> {
  const rows = search
    ? await db
        .select()
        .from(products)
        .where(
          or(
            ilike(products.nameInternal, `%${search}%`),
            ilike(products.sku, `%${search}%`),
            ilike(products.customerName, `%${search}%`)
          )
        )
        .orderBy(desc(products.createdAt))
    : await db.select().from(products).orderBy(desc(products.createdAt))
  return rows.map(rowToProduct)
}

export async function getProductById(id: string): Promise<ProductListItem | null> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1)
  return rows[0] ? rowToProduct(rows[0]) : null
}

export async function getProductKPI(): Promise<ProductKPISummary> {
  const rows = await db.select().from(products)
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === "active").length,
    inDevelopment: rows.filter((r) => r.status === "in_development").length,
    fdaWarning: rows.filter((r) => r.fdaStatus === "expired" || r.fdaStatus === "pending").length,
    discontinued: rows.filter((r) => r.status === "discontinued").length,
  }
}

export async function createProduct(
  data: Omit<ProductRow, "createdAt" | "updatedAt">
): Promise<ProductRow> {
  const rows = await db.insert(products).values(data).returning()
  return rows[0]
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<ProductRow, "id" | "createdAt" | "updatedAt">>
): Promise<boolean> {
  const rows = await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id)).returning()
  return rows.length > 0
}

export async function deleteProduct(id: string): Promise<boolean> {
  const rows = await db.update(products).set({ status: "discontinued", updatedAt: new Date() }).where(eq(products.id, id)).returning()
  return rows.length > 0
}
