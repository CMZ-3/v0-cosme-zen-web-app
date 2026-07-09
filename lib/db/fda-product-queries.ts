import { db } from "@/lib/db"
import { fdaRegistrations, products } from "@/lib/db/schema"
import { eq, desc, ilike, or } from "drizzle-orm"
import type { FdaRegistrationRow, ProductRow } from "@/lib/db/schema"
import type { FdaListItem, FdaKPISummary, RegistrationType, FdaStatus } from "@/lib/fda-types"
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
