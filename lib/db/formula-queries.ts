/**
 * Formula query layer — converts DB rows (formulas, formula_ingredients) to
 * the `Formula` and `FormulaIngredient` types used by the existing UI components.
 */
import { db } from "@/lib/db"
import {
  formulas, formulaIngredients, stockCards,
  formulaPhases, formulaProcessingSteps, formulaQcSpecs, formulaVersions,
} from "@/lib/db/schema"
import { sql, eq, count, asc } from "drizzle-orm"
import type {
  Formula, FormulaIngredient, FormulaKPISummary,
  FormulaPhase, FormulaProcessingStep, FormulaQcSpec, FormulaVersion,
} from "@/lib/formula-types"

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

type DbFormula = typeof formulas.$inferSelect & { ingredientCount?: number }

function rowToFormula(row: DbFormula): Formula {
  return {
    id: row.id,
    formulaCode: row.code,
    formulaName: row.name,
    formulaNameEn: row.nameEn ?? null,
    formulaType: "master",
    status: (row.status as Formula["status"]) ?? "active",
    productType: row.category ?? null,
    cosmeticForm: "Solution",
    batchSize: row.batchSizeKg ?? 10,
    batchUnit: "kg",
    version: 1,
    versionString: row.version ?? "1.0",
    ingredientCount: row.ingredientCount ?? 0,
    notes: row.notes ?? null,
    createdAt: row.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString?.() ?? null,
  }
}

type DbIngredient = typeof formulaIngredients.$inferSelect

function rowToIngredient(row: DbIngredient): FormulaIngredient {
  return {
    id: row.id,
    formulaId: row.formulaId,
    ingredientName: row.rawMaterialName,
    inciName: null,
    phase: null,
    percentage: row.percentage,
    function: null,
    stockCardId: row.stockCardId ?? null,
    notes: row.notes ?? null,
    sortOrder: row.sortOrder,
    unitCost: null,
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch all formulas with ingredient counts. */
export async function listFormulas(): Promise<Formula[]> {
  // Count ingredients per formula
  const counts = await db
    .select({ formulaId: formulaIngredients.formulaId, cnt: count() })
    .from(formulaIngredients)
    .groupBy(formulaIngredients.formulaId)

  const countMap = new Map(counts.map((c) => [c.formulaId, Number(c.cnt)]))

  const rows = await db.select().from(formulas).orderBy(formulas.code)
  return rows.map((r) => rowToFormula({ ...r, ingredientCount: countMap.get(r.id) ?? 0 }))
}

/** Fetch KPI summary counts grouped by status. */
export async function getFormulaKpi(): Promise<FormulaKPISummary> {
  const rows = await db
    .select({ status: formulas.status, cnt: count() })
    .from(formulas)
    .groupBy(formulas.status)

  const m: Record<string, number> = {}
  rows.forEach((r) => { m[r.status] = Number(r.cnt) })
  const total = Object.values(m).reduce((s, n) => s + n, 0)
  return {
    total,
    active: m.active ?? 0,
    approved: m.approved ?? 0,
    draft: m.draft ?? 0,
    archived: m.archived ?? 0,
    discontinued: m.discontinued ?? 0,
  }
}

/** Fetch a single formula by id. */
export async function getFormulaById(id: string): Promise<Formula | null> {
  const rows = await db.select().from(formulas).where(eq(formulas.id, id))
  if (!rows[0]) return null
  const cnt = await db
    .select({ cnt: count() })
    .from(formulaIngredients)
    .where(eq(formulaIngredients.formulaId, id))
  return rowToFormula({ ...rows[0], ingredientCount: Number(cnt[0]?.cnt ?? 0) })
}

/**
 * Fetch ingredients for a formula, ordered by sortOrder.
 * LEFT JOINs the linked stock card (via stockCardId, resolved by auto-match)
 * to enrich each ingredient with INCI name, item code, and unit cost pulled
 * from the live stock catalog.
 */
export async function getFormulaIngredients(formulaId: string): Promise<FormulaIngredient[]> {
  const rows = await db
    .select({
      ing: formulaIngredients,
      stockItemCode: stockCards.itemCode,
      stockInci: stockCards.inciName,
      stockUnitCost: stockCards.unitCost,
    })
    .from(formulaIngredients)
    .leftJoin(stockCards, eq(formulaIngredients.stockCardId, stockCards.id))
    .where(eq(formulaIngredients.formulaId, formulaId))
    .orderBy(formulaIngredients.sortOrder)

  return rows.map(({ ing, stockItemCode, stockInci, stockUnitCost }) => ({
    ...rowToIngredient(ing),
    itemCode: stockItemCode ?? null,
    inciName: stockInci ?? null,
    unitCost: stockUnitCost ?? null,
  }))
}

/** Insert a new formula + ingredients. Returns the created Formula. */
export async function createFormula(input: {
  name: string
  nameEn?: string
  category?: string
  base?: string
  batchSizeKg?: number
  notes?: string
  ingredients?: Array<{ rawMaterialName: string; supplier?: string; percentage: number; stockCardId?: string }>
}): Promise<Formula> {
  // Generate sequential code (CPX-NNN)
  const existing = await db.select({ code: formulas.code }).from(formulas)
  const maxNum = existing
    .map((r) => {
      const m = r.code.match(/(\d+)$/)
      return m ? parseInt(m[1]) : 0
    })
    .reduce((a, b) => Math.max(a, b), 0)
  const newNum = maxNum + 1
  const code = `FRM-${String(newNum).padStart(3, "0")}`
  const id = `F-${String(newNum).padStart(3, "0")}`

  await db.transaction(async (tx) => {
    await tx.insert(formulas).values({
      id,
      code,
      name: input.name,
      nameEn: input.nameEn ?? null,
      category: input.category ?? "body_wash",
      base: input.base ?? null,
      batchSizeKg: input.batchSizeKg ?? 10,
      notes: input.notes ?? null,
    })
    if (input.ingredients?.length) {
      await tx.insert(formulaIngredients).values(
        input.ingredients.map((ing, i) => ({
          id: `FI-${id}-${String(i + 1).padStart(2, "0")}`,
          formulaId: id,
          sortOrder: i + 1,
          rawMaterialName: ing.rawMaterialName,
          supplier: ing.supplier ?? null,
          percentage: ing.percentage,
          stockCardId: ing.stockCardId ?? null,
        })),
      )
    }
  })

  const created = await getFormulaById(id)
  return created!
}

// ---------------------------------------------------------------------------
// Formula sub-table queries (phases, steps, qc specs, versions)
// ---------------------------------------------------------------------------

export async function getFormulaPhases(formulaId: string): Promise<FormulaPhase[]> {
  const rows = await db.select().from(formulaPhases)
    .where(eq(formulaPhases.formulaId, formulaId))
    .orderBy(asc(formulaPhases.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    formulaId: r.formulaId,
    phaseKey: r.phaseKey,
    phaseName: r.phaseName,
    sortOrder: r.sortOrder,
  }))
}

export async function getFormulaProcessingSteps(formulaId: string): Promise<FormulaProcessingStep[]> {
  const rows = await db.select().from(formulaProcessingSteps)
    .where(eq(formulaProcessingSteps.formulaId, formulaId))
    .orderBy(asc(formulaProcessingSteps.phase), asc(formulaProcessingSteps.stepNumber))
  return rows.map((r) => ({
    id: r.id,
    formulaId: r.formulaId,
    phase: r.phase,
    stepNumber: r.stepNumber,
    instruction: r.instruction,
    temperatureMin: r.temperatureMin ?? null,
    temperatureMax: r.temperatureMax ?? null,
    durationMinutes: r.durationMinutes ?? null,
    speedRpm: r.speedRpm ?? null,
    equipment: r.equipment ?? null,
    notes: r.notes ?? null,
  }))
}

export async function getFormulaQcSpecs(formulaId: string): Promise<FormulaQcSpec[]> {
  const rows = await db.select().from(formulaQcSpecs)
    .where(eq(formulaQcSpecs.formulaId, formulaId))
    .orderBy(asc(formulaQcSpecs.sortOrder))
  return rows.map((r) => ({
    id: r.id,
    formulaId: r.formulaId,
    parameterName: r.parameterName,
    unit: r.unit ?? null,
    targetValue: r.targetValue ?? null,
    minValue: r.minValue ?? null,
    maxValue: r.maxValue ?? null,
    testMethod: r.testMethod ?? null,
    notes: r.notes ?? null,
    sortOrder: r.sortOrder,
  }))
}

export async function getFormulaVersions(formulaId: string): Promise<FormulaVersion[]> {
  const rows = await db.select().from(formulaVersions)
    .where(eq(formulaVersions.formulaId, formulaId))
    .orderBy(asc(formulaVersions.versionNumber))
  return rows.map((r) => ({
    id: r.id,
    formulaId: r.formulaId,
    versionNumber: r.versionNumber,
    changeDescription: r.changeDescription ?? null,
    createdAt: r.createdAt.toISOString(),
    createdBy: r.createdBy ?? null,
  }))
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

type FormulaStatus = "draft" | "approved" | "active" | "archived" | "discontinued"

/** Update the status field of a formula. */
export async function updateFormulaStatus(id: string, status: FormulaStatus): Promise<boolean> {
  const rows = await db
    .update(formulas)
    .set({ status, updatedAt: new Date() })
    .where(eq(formulas.id, id))
    .returning()
  return rows.length > 0
}

/** Delete a formula (and its ingredients via ON DELETE CASCADE or explicit). */
export async function deleteFormula(id: string): Promise<boolean> {
  // Delete ingredients first (no cascade configured)
  await db.delete(formulaIngredients).where(eq(formulaIngredients.formulaId, id))
  const rows = await db.delete(formulas).where(eq(formulas.id, id)).returning()
  return rows.length > 0
}

/** Clone a formula — copies header + ingredients with new ids/code. */
export async function cloneFormula(id: string): Promise<Formula | null> {
  const src = await getFormulaById(id)
  if (!src) return null

  // Generate new code / id
  const existing = await db.select({ code: formulas.code }).from(formulas)
  const maxNum = existing
    .map((r) => { const m = r.code.match(/(\d+)$/); return m ? parseInt(m[1]) : 0 })
    .reduce((a, b) => Math.max(a, b), 0)
  const newNum = maxNum + 1
  const newCode = `FRM-${String(newNum).padStart(3, "0")}`
  const newId = `F-${String(newNum).padStart(3, "0")}`

  // Clone ingredients
  const srcIngredients = await getFormulaIngredients(id)

  await db.transaction(async (tx) => {
    const srcRow = await tx.select().from(formulas).where(eq(formulas.id, id)).limit(1)
    if (!srcRow[0]) return
    await tx.insert(formulas).values({
      ...srcRow[0],
      id: newId,
      code: newCode,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    if (srcIngredients.length) {
      await tx.insert(formulaIngredients).values(
        srcIngredients.map((ing, i) => ({
          id: `FI-${newId}-${String(i + 1).padStart(2, "0")}`,
          formulaId: newId,
          sortOrder: ing.sortOrder ?? (i + 1),
          rawMaterialName: ing.ingredientName,
          supplier: null,
          percentage: ing.percentage,
          stockCardId: ing.stockCardId ?? null,
          unit: "kg",
          notes: ing.notes ?? null,
        })),
      )
    }
  })

  return getFormulaById(newId)
}

/** Add a single ingredient to an existing formula. */
export async function addFormulaIngredient(
  formulaId: string,
  data: { rawMaterialName: string; percentage: number; phase?: string; stockCardId?: string | null }
): Promise<void> {
  const existing = await db.select({ sortOrder: formulaIngredients.sortOrder })
    .from(formulaIngredients).where(eq(formulaIngredients.formulaId, formulaId))
  const nextOrder = (existing.reduce((m, r) => Math.max(m, r.sortOrder), 0)) + 1
  const ingId = `FI-${formulaId}-${String(nextOrder).padStart(2, "0")}-${Date.now().toString(36)}`
  await db.insert(formulaIngredients).values({
    id: ingId,
    formulaId,
    sortOrder: nextOrder,
    rawMaterialName: data.rawMaterialName,
    supplier: null,
    percentage: data.percentage,
    stockCardId: data.stockCardId ?? null,
    unit: "kg",
    notes: null,
  })
}

/** Delete a single ingredient row. */
export async function deleteFormulaIngredient(ingId: string): Promise<boolean> {
  const rows = await db.delete(formulaIngredients).where(eq(formulaIngredients.id, ingId)).returning()
  return rows.length > 0
}
