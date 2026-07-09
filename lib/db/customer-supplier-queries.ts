import { db } from "@/lib/db"
import { customers, suppliers } from "@/lib/db/schema"
import { eq, desc, ilike, or } from "drizzle-orm"
import type { CustomerRow, SupplierRow } from "@/lib/db/schema"
import type { CustomerListItem, CustomerDetail, CustomerKPI } from "@/lib/customer-types"
import type { SupplierListItem, SupplierDetail, SupplierKPI } from "@/lib/supplier-types"

// ─── Customers ──────────────────────────────────────────────────────────────

function rowToCustomer(r: CustomerRow): CustomerListItem {
  return {
    id: r.id,
    customerCode: r.customerCode,
    customerName: r.customerName,
    customerNameEn: r.customerNameEn ?? undefined,
    customerType: r.customerType as CustomerListItem["customerType"],
    customerTier: r.customerTier as CustomerListItem["customerTier"],
    businessType: r.businessType as CustomerListItem["businessType"],
    contactPerson: r.contactPerson ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    creditLimit: r.creditLimit ?? undefined,
    creditUsed: r.creditUsed ?? undefined,
    isActive: r.isActive,
    totalOrders: r.totalOrders,
    totalRevenue: r.totalRevenue,
    productCount: r.productCount,
    brandCount: r.brandCount,
    leadSource: r.leadSource ?? undefined,
    province: r.province ?? undefined,
    country: r.country,
  }
}

export async function listCustomers(search?: string): Promise<CustomerListItem[]> {
  const rows = search
    ? await db
        .select()
        .from(customers)
        .where(
          or(
            ilike(customers.customerName, `%${search}%`),
            ilike(customers.customerCode, `%${search}%`),
            ilike(customers.contactPerson, `%${search}%`)
          )
        )
        .orderBy(desc(customers.totalRevenue))
    : await db.select().from(customers).orderBy(desc(customers.totalRevenue))
  return rows.map(rowToCustomer)
}

export async function getCustomerById(id: string): Promise<CustomerListItem | null> {
  const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return rows[0] ? rowToCustomer(rows[0]) : null
}

export async function getCustomerDetail(id: string): Promise<CustomerDetail | null> {
  const rows = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  if (!rows[0]) return null
  const r = rows[0]
  return {
    // CustomerListItem fields
    ...rowToCustomer(r),
    // Extended detail fields from the full DB row
    address: r.address ?? undefined,
    city: r.city ?? undefined,
    postalCode: r.postalCode ?? undefined,
    taxId: r.taxId ?? undefined,
    branchCode: undefined,
    creditDays: r.creditDays,
    salesRepresentative: r.salesRepresentative ?? undefined,
    website: r.website ?? undefined,
    fax: undefined,
    lineId: undefined,
    logoUrl: undefined,
    notes: r.notes ?? undefined,
    createdAt: r.createdAt.toISOString().slice(0, 10),
    updatedAt: r.updatedAt.toISOString().slice(0, 10),
    // Sub-arrays — populated from separate tables once they exist
    contacts: [],
    addresses: [],
    brands: [],
    contracts: [],
    briefs: [],
    complaints: [],
    contactLogs: [],
    documents: [],
  }
}

export async function getCustomerKPI(): Promise<CustomerKPI> {
  const rows = await db.select().from(customers)
  const active = rows.filter((r) => r.isActive)
  const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0)
  const totalOrders = rows.reduce((s, r) => s + r.totalOrders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalBrands = rows.reduce((s, r) => s + r.brandCount, 0)
  return {
    totalCustomers: rows.length,
    activeCustomers: active.length,
    totalRevenue,
    avgOrderValue,
    totalBrands,
  }
}

export async function createCustomer(
  data: Omit<CustomerRow, "createdAt" | "updatedAt">
): Promise<CustomerRow> {
  const rows = await db.insert(customers).values(data).returning()
  return rows[0]
}

export async function updateCustomer(
  id: string,
  data: Partial<Omit<CustomerRow, "id" | "customerCode" | "createdAt" | "updatedAt">>
): Promise<CustomerRow | null> {
  const rows = await db
    .update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning()
  return rows[0] ?? null
}

export async function deleteCustomer(id: string): Promise<boolean> {
  const rows = await db.delete(customers).where(eq(customers.id, id)).returning()
  return rows.length > 0
}

export async function setCustomerActive(id: string, isActive: boolean): Promise<CustomerRow | null> {
  const rows = await db
    .update(customers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning()
  return rows[0] ?? null
}

// ─── Suppliers ──────────────────────────────────────────────────────────────

function rowToSupplier(r: SupplierRow): SupplierListItem {
  return {
    id: r.id,
    supplierCode: r.supplierCode,
    supplierName: r.supplierName,
    supplierNameEn: r.supplierNameEn ?? undefined,
    supplierType: r.supplierType as SupplierListItem["supplierType"],
    country: r.country,
    city: r.city ?? undefined,
    contactPerson: r.contactPerson ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    isActive: r.isActive,
    isApproved: r.isApproved,
    grade: r.grade as SupplierListItem["grade"],
    qualityRating: r.qualityRating ?? undefined,
    deliveryRating: r.deliveryRating ?? undefined,
    priceRating: r.priceRating ?? undefined,
    materialTags: (r.materialTags as SupplierListItem["materialTags"]) ?? [],
    status: r.status as SupplierListItem["status"],
  }
}

export async function listSuppliers(search?: string): Promise<SupplierListItem[]> {
  const rows = search
    ? await db
        .select()
        .from(suppliers)
        .where(
          or(
            ilike(suppliers.supplierName, `%${search}%`),
            ilike(suppliers.supplierCode, `%${search}%`),
            ilike(suppliers.contactPerson, `%${search}%`)
          )
        )
        .orderBy(desc(suppliers.createdAt))
    : await db.select().from(suppliers).orderBy(desc(suppliers.createdAt))
  return rows.map(rowToSupplier)
}

export async function getSupplierById(id: string): Promise<SupplierListItem | null> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  return rows[0] ? rowToSupplier(rows[0]) : null
}

export async function getSupplierDetail(id: string): Promise<SupplierDetail | null> {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1)
  if (!rows[0]) return null
  const r = rows[0]
  return {
    ...rowToSupplier(r),
    description: r.description ?? undefined,
    address: r.address ?? undefined,
    taxId: r.taxId ?? undefined,
    branchCode: undefined,
    paymentTerms: r.paymentTerms ?? undefined,
    paymentDays: r.paymentDays,
    website: r.website ?? undefined,
    fax: undefined,
    notes: r.notes ?? undefined,
    avgLeadTimeDays: r.avgLeadTimeDays ?? undefined,
    ytdOrderValue: r.ytdOrderValue ?? undefined,
    moq: r.moq ?? undefined,
    onTimeDeliveryPct: r.onTimeDeliveryPct ?? undefined,
    contacts: [],
    addresses: [],
    certificates: [],
    catalogItems: [],
    documents: [],
    createdAt: r.createdAt.toISOString().slice(0, 10),
    updatedAt: r.updatedAt.toISOString().slice(0, 10),
  }
}

export async function getSupplierKPI(): Promise<SupplierKPI> {
  const rows = await db.select().from(suppliers)
  const active = rows.filter((r) => r.isActive)
  const approved = rows.filter((r) => r.isApproved)
  const pending = rows.filter((r) => !r.isApproved && r.status === "pending")
  const rated = rows.filter((r) => r.qualityRating != null)
  const avgRating =
    rated.length > 0
      ? rated.reduce((s, r) => s + (r.qualityRating ?? 0), 0) / rated.length
      : 0
  return {
    totalSuppliers: rows.length,
    activeSuppliers: active.length,
    approvedSuppliers: approved.length,
    pendingApproval: pending.length,
    avgRating: Math.round(avgRating * 10) / 10,
  }
}

export async function createSupplier(
  data: Omit<SupplierRow, "createdAt" | "updatedAt">
): Promise<SupplierRow> {
  const rows = await db.insert(suppliers).values(data).returning()
  return rows[0]
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<SupplierRow, "id" | "supplierCode" | "createdAt" | "updatedAt">>
): Promise<SupplierRow | null> {
  const rows = await db
    .update(suppliers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(suppliers.id, id))
    .returning()
  return rows[0] ?? null
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const rows = await db.delete(suppliers).where(eq(suppliers.id, id)).returning()
  return rows.length > 0
}

export async function setSupplierActive(id: string, isActive: boolean): Promise<SupplierRow | null> {
  const rows = await db
    .update(suppliers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(suppliers.id, id))
    .returning()
  return rows[0] ?? null
}

export async function setSupplierApproved(id: string, isApproved: boolean): Promise<SupplierRow | null> {
  const rows = await db
    .update(suppliers)
    .set({ isApproved, updatedAt: new Date() })
    .where(eq(suppliers.id, id))
    .returning()
  return rows[0] ?? null
}
