/**
 * Formula query layer — converts DB rows (formulas, formula_ingredients) to
 * the `Formula` and `FormulaIngredient` types used by the existing UI components.
 */
import { db } from "@/lib/db"
import { formulas, formulaIngredients, stockCards } from "@/lib/db/schema"
import { sql, eq, count } from "drizzle-orm"
import type { Formula, FormulaIngredient, FormulaKPISummary } from "@/lib/formula-types"

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
