import { db } from "@/lib/db"
import { productionSteps, dailyProductionRecords } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"
import type { ProductionStep, DailyRecord, StepStatus } from "@/lib/job-order-types"

// ─── Standard step template ────────────────────────────────────────────────
// The default cosmetics manufacturing flow. Applied to a job order when it has
// no steps yet. Targets are scaled to the order quantity at apply time.
export interface StepTemplateItem {
  name: string
  description: string
}

export const DEFAULT_STEP_TEMPLATE: StepTemplateItem[] = [
  { name: "รับออเดอร์", description: "Receive & confirm job order" },
  { name: "เตรียมวัตถุดิบ", description: "Weigh & prepare raw materials" },
  { name: "ผสม", description: "Mixing / compounding" },
  { name: "บรรจุ", description: "Filling into containers" },
  { name: "QC ระหว่างผลิต", description: "In-process quality control" },
  { name: "ติดฉลาก", description: "Labeling & coding" },
  { name: "แพ็ค", description: "Secondary packing" },
  { name: "จัดส่ง", description: "Finishing & hand-off to delivery" },
]

// ─── mappers ────────────────────────────────────────────────────────────────
function rowToStep(
  s: typeof productionSteps.$inferSelect,
  records: DailyRecord[],
): ProductionStep {
  return {
    id: s.id,
    stepNumber: s.stepNumber,
    name: s.name,
    description: s.description,
    status: s.status as StepStatus,
    targetQty: s.targetQty,
    completedQty: s.completedQty,
    goodQty: s.goodQty,
    defectQty: s.defectQty,
    unit: s.unit,
    startDate: s.startDate,
    endDate: s.endDate,
    dailyRecords: records,
  }
}

function rowToRecord(r: typeof dailyProductionRecords.$inferSelect): DailyRecord {
  return {
    id: r.id,
    date: r.date,
    stepId: r.stepId,
    batchId: r.batchId,
    goodQty: r.goodQty,
    defectQty: r.defectQty,
    operatorName: r.operatorName,
    note: r.note,
    cumulativeTotal: r.cumulativeTotal,
    createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

// ─── reads ────────────────────────────────────────────────────────────────
/** Load all steps for a job order, each with its daily records (newest first). */
export async function getProductionSteps(jobOrderId: string): Promise<ProductionStep[]> {
  const steps = await db
    .select()
    .from(productionSteps)
    .where(eq(productionSteps.jobOrderId, jobOrderId))
    .orderBy(asc(productionSteps.sortOrder), asc(productionSteps.stepNumber))

  if (steps.length === 0) return []

  const records = await db
    .select()
    .from(dailyProductionRecords)
    .where(eq(dailyProductionRecords.jobOrderId, jobOrderId))
    .orderBy(asc(dailyProductionRecords.date), asc(dailyProductionRecords.createdAt))

  const byStep = new Map<string, DailyRecord[]>()
  for (const r of records) {
    const arr = byStep.get(r.stepId) ?? []
    arr.push(rowToRecord(r))
    byStep.set(r.stepId, arr)
  }
  // newest first for display
  for (const arr of byStep.values()) arr.reverse()

  return steps.map((s) => rowToStep(s, byStep.get(s.id) ?? []))
}

// ─── template / step CRUD ──────────────────────────────────────────────────
function genId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Ensure a job order has production steps. If it already has some, returns them
 * unchanged. Otherwise creates the default template with the first step active.
 */
export async function applyStepTemplate(
  jobOrderId: string,
  targetQty: number,
  unit = "units",
  template: StepTemplateItem[] = DEFAULT_STEP_TEMPLATE,
): Promise<ProductionStep[]> {
  const existing = await db
    .select()
    .from(productionSteps)
    .where(eq(productionSteps.jobOrderId, jobOrderId))
  if (existing.length > 0) return getProductionSteps(jobOrderId)

  const now = new Date()
  const rows = template.map((t, i) => ({
    id: genId("step"),
    jobOrderId,
    stepNumber: i + 1,
    name: t.name,
    description: t.description,
    status: (i === 0 ? "active" : "pending") as StepStatus,
    targetQty,
    completedQty: 0,
    goodQty: 0,
    defectQty: 0,
    unit,
    startDate: i === 0 ? now.toISOString().slice(0, 10) : null,
    endDate: null,
    sortOrder: i,
    createdAt: now,
    updatedAt: now,
  }))
  await db.insert(productionSteps).values(rows)
  return getProductionSteps(jobOrderId)
}

export interface AddStepInput {
  jobOrderId: string
  name: string
  description?: string
  targetQty: number
  unit?: string
}

/** Append a new step to the end of a job order's step list. */
export async function addProductionStep(input: AddStepInput): Promise<ProductionStep> {
  const existing = await db
    .select()
    .from(productionSteps)
    .where(eq(productionSteps.jobOrderId, input.jobOrderId))
  const maxNum = existing.reduce((m, s) => Math.max(m, s.stepNumber), 0)
  const maxSort = existing.reduce((m, s) => Math.max(m, s.sortOrder), -1)
  const now = new Date()
  const row = {
    id: genId("step"),
    jobOrderId: input.jobOrderId,
    stepNumber: maxNum + 1,
    name: input.name,
    description: input.description ?? "",
    status: "pending" as StepStatus,
    targetQty: input.targetQty,
    completedQty: 0,
    goodQty: 0,
    defectQty: 0,
    unit: input.unit ?? "units",
    startDate: null,
    endDate: null,
    sortOrder: maxSort + 1,
    createdAt: now,
    updatedAt: now,
  }
  await db.insert(productionSteps).values(row)
  return rowToStep(row, [])
}

export interface UpdateStepInput {
  name?: string
  description?: string
  targetQty?: number
  unit?: string
  status?: StepStatus
}

/** Patch editable fields of a step. */
export async function updateProductionStep(stepId: string, patch: UpdateStepInput) {
  const set: Record<string, unknown> = { updatedAt: new Date() }
  if (patch.name !== undefined) set.name = patch.name
  if (patch.description !== undefined) set.description = patch.description
  if (patch.targetQty !== undefined) set.targetQty = patch.targetQty
  if (patch.unit !== undefined) set.unit = patch.unit
  if (patch.status !== undefined) {
    set.status = patch.status
    if (patch.status === "done") set.endDate = new Date().toISOString().slice(0, 10)
    if (patch.status === "active") set.startDate = new Date().toISOString().slice(0, 10)
  }
  await db.update(productionSteps).set(set).where(eq(productionSteps.id, stepId))
}

/** Delete a step and all its daily records. */
export async function deleteProductionStep(stepId: string) {
  await db.delete(dailyProductionRecords).where(eq(dailyProductionRecords.stepId, stepId))
  await db.delete(productionSteps).where(eq(productionSteps.id, stepId))
}

/**
 * Mark a step complete and activate the next pending step (by sortOrder).
 * Returns the refreshed step list for the job order.
 */
export async function completeStep(stepId: string): Promise<ProductionStep[]> {
  const [step] = await db.select().from(productionSteps).where(eq(productionSteps.id, stepId))
  if (!step) throw new Error("Step not found")

  await db
    .update(productionSteps)
    .set({ status: "done", endDate: new Date().toISOString().slice(0, 10), updatedAt: new Date() })
    .where(eq(productionSteps.id, stepId))

  // Activate the next pending step in order.
  const siblings = await db
    .select()
    .from(productionSteps)
    .where(eq(productionSteps.jobOrderId, step.jobOrderId))
    .orderBy(asc(productionSteps.sortOrder), asc(productionSteps.stepNumber))
  const next = siblings.find((s) => s.id !== stepId && s.status === "pending")
  if (next) {
    await db
      .update(productionSteps)
      .set({ status: "active", startDate: new Date().toISOString().slice(0, 10), updatedAt: new Date() })
      .where(eq(productionSteps.id, next.id))
  }
  return getProductionSteps(step.jobOrderId)
}

// ─── daily records ──────────────────────────────────────────────────────────
export interface AddRecordInput {
  stepId: string
  jobOrderId: string
  date: string
  batchId?: string
  goodQty: number
  defectQty: number
  operatorName: string
  note?: string
}

/**
 * Add a daily production record and roll up the parent step's tallies
 * (good/defect/completed) plus the record's cumulative total. Runs in a
 * transaction so the step aggregates never drift from the record log.
 */
export async function addDailyRecord(input: AddRecordInput): Promise<ProductionStep[]> {
  return db.transaction(async (tx) => {
    const [step] = await tx.select().from(productionSteps).where(eq(productionSteps.id, input.stepId))
    if (!step) throw new Error("Step not found")

    const good = Math.max(0, Math.round(input.goodQty || 0))
    const defect = Math.max(0, Math.round(input.defectQty || 0))
    const newCompleted = step.completedQty + good + defect

    await tx.insert(dailyProductionRecords).values({
      id: genId("rec"),
      stepId: input.stepId,
      jobOrderId: input.jobOrderId,
      date: input.date,
      batchId: input.batchId ?? "",
      goodQty: good,
      defectQty: defect,
      operatorName: input.operatorName,
      note: input.note ?? "",
      cumulativeTotal: newCompleted,
      createdAt: new Date(),
    })

    await tx
      .update(productionSteps)
      .set({
        goodQty: step.goodQty + good,
        defectQty: step.defectQty + defect,
        completedQty: newCompleted,
        updatedAt: new Date(),
      })
      .where(eq(productionSteps.id, input.stepId))

    return getProductionStepsTx(tx, input.jobOrderId)
  })
}

// Transaction-scoped variant of getProductionSteps (avoids nested db access).
async function getProductionStepsTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  jobOrderId: string,
): Promise<ProductionStep[]> {
  const steps = await tx
    .select()
    .from(productionSteps)
    .where(eq(productionSteps.jobOrderId, jobOrderId))
    .orderBy(asc(productionSteps.sortOrder), asc(productionSteps.stepNumber))
  const records = await tx
    .select()
    .from(dailyProductionRecords)
    .where(eq(dailyProductionRecords.jobOrderId, jobOrderId))
    .orderBy(asc(dailyProductionRecords.date), asc(dailyProductionRecords.createdAt))
  const byStep = new Map<string, DailyRecord[]>()
  for (const r of records) {
    const arr = byStep.get(r.stepId) ?? []
    arr.push(rowToRecord(r))
    byStep.set(r.stepId, arr)
  }
  for (const arr of byStep.values()) arr.reverse()
  return steps.map((s) => rowToStep(s, byStep.get(s.id) ?? []))
}
