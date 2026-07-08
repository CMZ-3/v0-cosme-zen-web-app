import { db } from "@/lib/db"
import { deliveryOrders } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

import type { DeliveryOrder, DeliveryStatus } from "@/lib/delivery-types"

// ── helpers ──────────────────────────────────────────────────────────────────

function rowToDeliveryOrder(row: typeof deliveryOrders.$inferSelect): DeliveryOrder {
  return {
    id: row.id,
    deliveryNumber: row.deliveryNumber,
    customerId: row.customerId ?? undefined,
    customerName: row.customerName,
    customerBrand: row.customerBrand ?? undefined,
    salesOrderRef: row.salesOrderRef ?? undefined,
    orderDate: row.orderDate,
    deliveryDate: row.deliveryDate ?? undefined,
    actualDeliveryDate: row.actualDeliveryDate ?? undefined,
    deliveryAddress: row.deliveryAddress ?? undefined,
    deliveryCity: row.deliveryCity ?? undefined,
    deliveryProvince: row.deliveryProvince ?? undefined,
    deliveryPostalCode: row.deliveryPostalCode ?? undefined,
    contactName: row.contactName ?? undefined,
    contactPhone: row.contactPhone ?? undefined,
    status: row.status as DeliveryStatus,
    totalQuantity: row.totalQuantity ?? undefined,
    totalAmount: row.totalAmount ?? undefined,
    shippingMethod: row.shippingMethod ?? undefined,
    trackingNumber: row.trackingNumber ?? undefined,
    shippingCost: row.shippingCost ?? undefined,
    weightKg: row.weightKg ?? undefined,
    boxesCount: row.boxesCount ?? undefined,
    productSummary: row.productSummary ?? undefined,
    jobStatus: (row.jobStatus as DeliveryOrder["jobStatus"]) ?? null,
    pickedBy: row.pickedBy ?? undefined,
    pickedAt: row.pickedAt ?? undefined,
    shippedBy: row.shippedBy ?? undefined,
    shippedAt: row.shippedAt ?? undefined,
    receiverName: row.receiverName ?? undefined,
    podNotes: row.podNotes ?? undefined,
    podSignedAt: row.podSignedAt ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.createdBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

// ── read ──────────────────────────────────────────────────────────────────────

export async function listDeliveryOrders(): Promise<{
  orders: DeliveryOrder[]
  kpi: { total: number; preparing: number; picking: number; shipped: number; delivered: number; completed: number; pendingClose: number }
}> {
  const rows = await db
    .select()
    .from(deliveryOrders)
    .orderBy(desc(deliveryOrders.createdAt))

  const orders = rows.map(rowToDeliveryOrder)

  const kpi = {
    total: orders.length,
    preparing: orders.filter((o) => o.status === "reserved").length,
    picking: orders.filter((o) => o.status === "picking").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
    pendingClose: orders.filter((o) => o.jobStatus === "pending_close").length,
  }

  return { orders, kpi }
}

export async function getDeliveryOrder(id: string): Promise<DeliveryOrder | null> {
  const rows = await db.select().from(deliveryOrders).where(eq(deliveryOrders.id, id))
  if (!rows[0]) return null
  return rowToDeliveryOrder(rows[0])
}

// ── write ──────────────────────────────────────────────────────────────────────

export interface CreateDeliveryInput {
  jobOrderId?: string
  customerId?: string
  customerName: string
  customerBrand?: string
  salesOrderRef?: string
  orderDate: string
  deliveryDate?: string
  shippingMethod?: string
  trackingNumber?: string
  contactName?: string
  contactPhone?: string
  deliveryAddress?: string
  deliveryCity?: string
  deliveryProvince?: string
  deliveryPostalCode?: string
  weightKg?: number
  boxesCount?: number
  totalQuantity?: number
  totalAmount?: number
  productSummary?: string
  notes?: string
}

export async function createDeliveryOrder(input: CreateDeliveryInput): Promise<DeliveryOrder> {
  // Generate next DO number: DO-XXXX
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(deliveryOrders)
  const nextNum = (Number(countResult[0]?.count ?? 0) + 1).toString().padStart(4, "0")
  const deliveryNumber = `DO-${nextNum}`

  const id = `del-${crypto.randomUUID().slice(0, 8)}`
  const now = new Date().toISOString().split("T")[0]

  const [row] = await db
    .insert(deliveryOrders)
    .values({
      id,
      deliveryNumber,
      jobOrderId: input.jobOrderId ?? null,
      customerId: input.customerId ?? null,
      customerName: input.customerName,
      customerBrand: input.customerBrand ?? null,
      salesOrderRef: input.salesOrderRef ?? null,
      orderDate: input.orderDate || now,
      deliveryDate: input.deliveryDate ?? null,
      shippingMethod: input.shippingMethod ?? null,
      trackingNumber: input.trackingNumber ?? null,
      contactName: input.contactName ?? null,
      contactPhone: input.contactPhone ?? null,
      deliveryAddress: input.deliveryAddress ?? null,
      deliveryCity: input.deliveryCity ?? null,
      deliveryProvince: input.deliveryProvince ?? null,
      deliveryPostalCode: input.deliveryPostalCode ?? null,
      weightKg: input.weightKg ?? null,
      boxesCount: input.boxesCount ?? null,
      totalQuantity: input.totalQuantity ?? null,
      totalAmount: input.totalAmount ?? null,
      productSummary: input.productSummary ?? null,
      notes: input.notes ?? null,
      status: "draft",
    })
    .returning()

  return rowToDeliveryOrder(row)
}

export async function patchDeliveryStatus(
  id: string,
  newStatus: DeliveryStatus,
  extra?: Partial<Pick<DeliveryOrder, "trackingNumber" | "actualDeliveryDate" | "receiverName" | "podNotes" | "jobStatus">>,
): Promise<DeliveryOrder | null> {
  const now = new Date()
  const updateData: Partial<typeof deliveryOrders.$inferInsert> = {
    status: newStatus,
    updatedAt: now,
  }

  if (newStatus === "picking") updateData.pickedAt = now.toISOString()
  if (newStatus === "shipped") {
    updateData.shippedAt = now.toISOString()
    if (extra?.trackingNumber) updateData.trackingNumber = extra.trackingNumber
  }
  if (newStatus === "delivered" || newStatus === "completed") {
    updateData.actualDeliveryDate = now.toISOString().split("T")[0]
    if (extra?.receiverName) updateData.receiverName = extra.receiverName
    if (extra?.podNotes) updateData.podNotes = extra.podNotes
  }
  if (newStatus === "completed") {
    updateData.jobStatus = "closed"
  } else if (newStatus === "delivered") {
    updateData.jobStatus = "pending_close"
  }
  if (extra?.jobStatus) updateData.jobStatus = extra.jobStatus

  const rows = await db
    .update(deliveryOrders)
    .set(updateData)
    .where(eq(deliveryOrders.id, id))
    .returning()

  if (!rows[0]) return null
  return rowToDeliveryOrder(rows[0])
}
