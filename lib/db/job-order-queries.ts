import { db } from "@/lib/db"
import { jobOrders, formulaIngredients, formulas, stockCards } from "@/lib/db/schema"
import { eq, desc, inArray } from "drizzle-orm"
import type { JobOrder, MaterialCheck, JOStatus, Priority } from "@/lib/job-order-types"

// ─── helpers ─────────────────────────────────────────────────────────────────

function safeArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
function safeObj<T extends object>(v: unknown): T {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T)
}
function nowTs() {
  return new Date().toISOString()
}

// Map a DB row + formula ingredients into the full JobOrder shape expected by
// the existing UI components. JSONB blobs (batches, qcResults, costBreakdown)
// are passed through directly; productionSteps default to an empty array since
// they are driven by the UI rather than the DB at this stage.
export function rowToJobOrder(
  row: typeof jobOrders.$inferSelect,
  materials: MaterialCheck[] = [],
): JobOrder {
  // Map DB status values to the UI's JOStatus union.
  const rawStatus: string = row.status ?? "new"
  const statusMap: Record<string, JOStatus> = {
    pending: "new",
    new: "new",
    in_progress: "in_production",
    in_production: "in_production",
    preparing_rm: "preparing_rm",
    qc: "qc",
    packing: "packing",
    completed: "delivered",
    delivered: "delivered",
    cancelled: "cancelled",
  }
  const status: JOStatus = statusMap[rawStatus] ?? "new"
  // DB stores "normal"; UI type uses "medium" — map here.
  const rawPriority: string = row.priority ?? "normal"
  const priority: Priority =
    rawPriority === "high" ? "high" : rawPriority === "low" ? "low" : "medium"

  return {
    id: row.id,
    orderNumber: row.jobNo,
    customerId: "",
    customerName: row.customer ?? "—",
    brandName: row.formulaCode ?? row.formulaName,
    productName: row.formulaName,
    sku: row.formulaCode ?? "",
    formulaCode: row.formulaCode ?? "",
    fdaRegNumber: "",
    fdaStatus: "active",
    quantity: row.plannedQty ?? Math.round(row.batchSizeKg),
    unitSize: row.unit,
    batchSize: row.batchSizeKg,
    numberOfBatches: 1,
    status,
    priority,
    totalValue: 0,
    costPerUnit: 0,
    sellingPricePerUnit: 0,
    paymentTerms: "30 days",
    dueDate: row.plannedEnd ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    startDate: row.plannedStart ?? row.createdAt?.toISOString().slice(0, 10) ?? nowTs().slice(0, 10),
    productionSteps: safeArr(row.batches).length > 0
      ? safeArr(row.batches)
      : [],
    batches: safeArr(row.batches),
    materials,
    qcResults: safeArr(row.qcResults),
    costBreakdown: Object.assign(
      { rawMaterial: 0, packaging: 0, labor: 0, qcOverhead: 0, total: 0 },
      safeObj(row.costBreakdown),
    ),
    yieldAnalysis: {
      totalInput: row.batchSizeKg,
      totalOutput: row.batchSizeKg,
      yieldLoss: 0,
      yieldLossPercent: 0,
      unit: "kg",
    },
    notes: row.productionNotes ?? "",
    createdAt: row.createdAt?.toISOString() ?? nowTs(),
    updatedAt: row.updatedAt?.toISOString() ?? nowTs(),
  }
}

// Build MaterialCheck[] from formula_ingredients joined with live stock_cards.
export async function buildMaterials(
  formulaId: string | null | undefined,
  batchSizeKg: number,
): Promise<MaterialCheck[]> {
  if (!formulaId) return []

  const ingredients = await db
    .select()
    .from(formulaIngredients)
    .where(eq(formulaIngredients.formulaId, formulaId))
    .orderBy(formulaIngredients.sortOrder)

  if (ingredients.length === 0) return []

  // Fetch stock cards for linked ingredients in one query.
  const cardIds = ingredients.map((i) => i.stockCardId).filter(Boolean) as string[]
  const cards =
    cardIds.length > 0
      ? await db
          .select()
          .from(stockCards)
          .where(
            cardIds.length === 1
              ? eq(stockCards.id, cardIds[0])
              : inArray(stockCards.id, cardIds),
          )
      : []

  const cardMap = new Map(cards.map((c) => [c.id, c]))

  return ingredients.map((ing, i) => {
    const requiredKg = (ing.percentage / 100) * batchSizeKg
    const card = ing.stockCardId ? cardMap.get(ing.stockCardId) : undefined
    const stockQty = card?.balance ?? 0
    const available = card?.available ?? stockQty
    const status: MaterialCheck["status"] =
      available >= requiredKg ? "sufficient" : stockQty > 0 ? "ordered" : "shortage"

    return {
      id: ing.id,
      name: ing.rawMaterialName,
      requiredQty: Math.round(requiredKg * 100) / 100,
      requiredUnit: ing.unit,
      lot: card?.defaultLot ?? `LOT-${ing.id.slice(-6).toUpperCase()}`,
      stockQty,
      status,
      reservedQty: card ? (card.balance - (card.available ?? card.balance)) : 0,
    }
  })
}

// ─── public queries ───────────────────────────────────────────────────────────

export async function listJobOrders(): Promise<JobOrder[]> {
  const rows = await db.select().from(jobOrders).orderBy(desc(jobOrders.createdAt))

  return Promise.all(
    rows.map(async (row) => {
      const materials = await buildMaterials(row.formulaId, row.batchSizeKg)
      return rowToJobOrder(row, materials)
    }),
  )
}

export async function getJobOrder(id: string): Promise<JobOrder | null> {
  const rows = await db.select().from(jobOrders).where(eq(jobOrders.id, id))
  if (!rows[0]) return null
  const materials = await buildMaterials(rows[0].formulaId, rows[0].batchSizeKg)
  return rowToJobOrder(rows[0], materials)
}

export async function updateJobOrderStatus(id: string, status: JOStatus) {
  await db
    .update(jobOrders)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobOrders.id, id))
}

export async function createJobOrder(data: {
  formulaId?: string
  formulaName: string
  formulaCode?: string
  customer?: string
  batchSizeKg: number
  plannedQty?: number
  unit: string
  priority: string
  plannedStart?: string
  plannedEnd?: string
  assignedTo?: string
}): Promise<string> {
  const id = `jo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const year = new Date().getFullYear().toString().slice(2)
  const month = String(new Date().getMonth() + 1).padStart(2, "0")
  const seq = Math.floor(Math.random() * 900) + 100

  await db.insert(jobOrders).values({
    id,
    jobNo: `JO-${year}${month}-${seq}`,
    formulaId: data.formulaId ?? null,
    formulaName: data.formulaName,
    formulaCode: data.formulaCode ?? null,
    customer: data.customer ?? null,
    batchSizeKg: data.batchSizeKg,
    plannedQty: data.plannedQty ?? null,
    unit: data.unit,
    status: "new",
    priority: data.priority,
    plannedStart: data.plannedStart ?? null,
    plannedEnd: data.plannedEnd ?? null,
    assignedTo: data.assignedTo ?? null,
    productionNotes: null,
    materials: [],
    batches: [],
    qcResults: [],
    costBreakdown: {},
  })
  return id
}
