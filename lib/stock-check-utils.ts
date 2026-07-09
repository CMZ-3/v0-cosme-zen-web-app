import type { StockCard } from "@/lib/stock-types"
import type { Formula, FormulaIngredient } from "@/lib/formula-types"

// =====================================================================
// Stock Check Sessions (Story 3.9) — proportional allocation engine
// =====================================================================
// Given a set of production jobs (formula + batch_qty), compute how much of
// each raw material is required, compare against available stock, and allocate
// proportionally when supply is short across competing jobs.

export type CheckStatus = "sufficient" | "partial" | "shortage"

export interface CheckJobInput {
  id: string
  formulaId: string
  batchQty: number
}

export interface CheckItem {
  stockCardId: string
  itemCode: string
  itemName: string
  unit: string
  requiredQty: number
  availableQty: number
  allocatedQty: number
  shortageQty: number
  status: CheckStatus
  /** Per-job breakdown of the requirement for this material. */
  perJob: { jobId: string; formulaCode: string; requiredQty: number; allocatedQty: number }[]
}

export interface CheckSession {
  totalItems: number
  sufficientItems: number
  partialItems: number
  shortageItems: number
  items: CheckItem[]
}

export const checkStatusLabel: Record<CheckStatus, string> = {
  sufficient: "Sufficient",
  partial: "Partial",
  shortage: "Shortage",
}

export const checkStatusColor: Record<CheckStatus, string> = {
  sufficient: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  shortage: "bg-red-100 text-red-700 border-red-200",
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // drop parenthetical notes e.g. "(Vitamin B3)"
    .replace(/[^a-z0-9ก-๙\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Resolve which stock card an ingredient maps to. Prefers explicit
 * stockCardId/itemCode; otherwise matches by normalized name (either direction
 * of substring containment).
 */
export function resolveIngredientCard(
  ing: FormulaIngredient,
  cards: StockCard[],
): StockCard | undefined {
  if (ing.stockCardId) {
    const byId = cards.find((c) => c.id === ing.stockCardId)
    if (byId) return byId
  }
  if (ing.itemCode) {
    const byCode = cards.find((c) => c.itemCode.toUpperCase() === ing.itemCode!.toUpperCase())
    if (byCode) return byCode
  }
  const needle = normalizeName(ing.ingredientName)
  if (!needle) return undefined
  return cards.find((c) => {
    const hay = normalizeName(c.itemName)
    return hay === needle || hay.includes(needle) || needle.includes(hay)
  })
}

/**
 * Run a stock check for a list of jobs.
 * required = (percentage / 100) * batchSize * batchQty, aggregated per card.
 * Allocation is proportional to each job's requirement when supply is short.
 */
export function runStockCheck(
  jobs: CheckJobInput[],
  formulas: Formula[],
  ingredients: FormulaIngredient[],
  cards: StockCard[],
): CheckSession {
  // Aggregate requirements keyed by stock card.
  const agg = new Map<
    string,
    { card: StockCard; total: number; perJob: { jobId: string; formulaCode: string; requiredQty: number }[] }
  >()

  for (const job of jobs) {
    const formula = formulas.find((f) => f.id === job.formulaId)
    if (!formula) continue
    const formulaIngredients = ingredients.filter((i) => i.formulaId === formula.id)
    for (const ing of formulaIngredients) {
      const card = resolveIngredientCard(ing, cards)
      if (!card) continue // untracked ingredient — skip
      const required = (ing.percentage / 100) * formula.batchSize * job.batchQty
      if (required <= 0) continue
      const entry = agg.get(card.id) ?? { card, total: 0, perJob: [] }
      entry.total += required
      const existing = entry.perJob.find((p) => p.jobId === job.id)
      if (existing) {
        existing.requiredQty += required
      } else {
        entry.perJob.push({ jobId: job.id, formulaCode: formula.formulaCode, requiredQty: required })
      }
      agg.set(card.id, entry)
    }
  }

  const items: CheckItem[] = []
  for (const { card, total, perJob } of agg.values()) {
    const available = card.available
    // Proportional allocation.
    const ratio = total > 0 ? Math.min(1, Math.max(0, available) / total) : 0
    const allocatedTotal = Math.min(total, Math.max(0, available))
    const shortage = Math.max(0, total - allocatedTotal)
    let status: CheckStatus = "sufficient"
    if (allocatedTotal <= 0 && total > 0) status = "shortage"
    else if (allocatedTotal < total) status = "partial"

    const perJobAlloc = perJob.map((p) => ({
      jobId: p.jobId,
      formulaCode: p.formulaCode,
      requiredQty: round(p.requiredQty),
      allocatedQty: round(p.requiredQty * ratio),
    }))

    items.push({
      stockCardId: card.id,
      itemCode: card.itemCode,
      itemName: card.itemName,
      unit: card.unit,
      requiredQty: round(total),
      availableQty: available,
      allocatedQty: round(allocatedTotal),
      shortageQty: round(shortage),
      status,
      perJob: perJobAlloc,
    })
  }

  // Worst shortages first.
  items.sort((a, b) => b.shortageQty - a.shortageQty || a.itemName.localeCompare(b.itemName))

  return {
    totalItems: items.length,
    sufficientItems: items.filter((i) => i.status === "sufficient").length,
    partialItems: items.filter((i) => i.status === "partial").length,
    shortageItems: items.filter((i) => i.status === "shortage").length,
    items,
  }
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}
