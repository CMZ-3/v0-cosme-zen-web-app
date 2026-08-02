// MoPH (กระทรวงสาธารณสุข) banned / restricted ingredient screening — CLIENT-SIDE aid.
//
// The Ministry of Public Health publishes the legally-binding lists (ประกาศกระทรวงสาธารณสุข
// เรื่อง ชื่อวัตถุที่ห้ามใช้ / วัตถุที่อาจใช้เป็นส่วนผสมฯ). This module carries a curated ~50-entry
// subset of the most common offenders so the PIF editor and formula detail can flag rows
// instantly, without a server round-trip. It is a screening aid, not the compliance authority —
// an admin must keep this list in sync with the current MoPH notifications.
//
// Matching is by normalised INCI name (trim / collapse whitespace / uppercase) against each
// rule's alias substrings, so "Mercuric chloride", "AMMONIATED MERCURY" and "MERCURY" all hit
// the mercury rule.

export type ScreenStatus = "banned" | "restricted" | "ok"

export interface IngredientRule {
  /** Normalised-uppercase substrings — any hit matches the rule. */
  aliases: string[]
  status: "banned" | "restricted"
  /** Max % w/w for restricted substances. */
  limit?: number
  /** Thai condition note (product type / use restriction). */
  note?: string
}

export interface ScreenResult {
  status: ScreenStatus
  limit?: number
  note?: string
  /** The rule that matched (undefined when status === "ok"). */
  matchedAliases?: string[]
  /** True when status is "restricted" AND a percentage was supplied that exceeds the limit. */
  overLimit?: boolean
  /** The percentage that was evaluated, if any. */
  percentage?: number
}

/** Curated subset of the MoPH lists — an admin must maintain this against the current ประกาศ. */
export const MOPH_INGREDIENT_RULES: IngredientRule[] = [
  // ── วัตถุที่ห้ามใช้ (banned) ────────────────────────────────────────────────
  { aliases: ["HYDROQUINONE"], status: "banned", note: "สารฟอกสีผิว — ห้ามใช้ในเครื่องสำอาง" },
  { aliases: ["MERCURY", "MERCURIC", "MERCUROUS", "CALOMEL", "AMMONIATED MERCURY", "MERCURO"], status: "banned", note: "ปรอทและสารประกอบของปรอท" },
  { aliases: ["TRETINOIN", "RETINOIC ACID", "ISOTRETINOIN"], status: "banned", note: "กรดวิตามินเอ — ยา ห้ามใช้ในเครื่องสำอาง" },
  { aliases: ["CLOBETASOL"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["BETAMETHASONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["DEXAMETHASONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["PREDNISOLONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["HYDROCORTISONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["TRIAMCINOLONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["FLUOCINOLONE"], status: "banned", note: "สเตียรอยด์" },
  { aliases: ["CHLOROFORM"], status: "banned" },
  { aliases: ["METHANOL", "METHYL ALCOHOL"], status: "banned", note: "เมทานอล" },
  { aliases: ["LEAD ACETATE", "PLUMBUM"], status: "banned", note: "สารประกอบตะกั่ว" },
  { aliases: ["ARSENIC"], status: "banned", note: "สารหนูและสารประกอบ" },
  { aliases: ["CADMIUM"], status: "banned", note: "แคดเมียมและสารประกอบ" },
  { aliases: ["ANTIMONY"], status: "banned", note: "พลวงและสารประกอบ" },
  { aliases: ["SELENIUM"], status: "banned", note: "ซีลีเนียมและสารประกอบ (ยกเว้น selenium disulfide ตามเงื่อนไข)" },
  { aliases: ["BITHIONOL"], status: "banned" },
  { aliases: ["HEXACHLOROPHENE"], status: "banned" },
  { aliases: ["CHLORAMPHENICOL"], status: "banned", note: "ยาปฏิชีวนะ — ห้ามใช้ในเครื่องสำอาง" },
  { aliases: ["DIETHYLENE GLYCOL"], status: "banned" },
  { aliases: ["VINYL CHLORIDE"], status: "banned", note: "สารก่อมะเร็ง — ห้ามใช้เป็น propellant" },
  { aliases: ["ESTRADIOL", "ESTROGEN", "ESTRONE", "ETHINYLESTRADIOL"], status: "banned", note: "ฮอร์โมน" },
  { aliases: ["DIOXANE", "1,4-DIOXANE"], status: "banned" },
  { aliases: ["NITROBENZENE"], status: "banned" },
  { aliases: ["PHENOL"], status: "banned", note: "ฟีนอล (ยกเว้นบางเงื่อนไข)" },
  { aliases: ["PYROGALLOL"], status: "banned", note: "ห้ามในผลิตภัณฑ์ย้อมผมทั่วไป" },
  { aliases: ["DICHLOROMETHANE", "METHYLENE CHLORIDE"], status: "banned" },
  { aliases: ["ZIRCONIUM"], status: "banned", note: "สารประกอบเซอร์โคเนียมใน aerosol" },

  // ── วัตถุที่จำกัดปริมาณ/เงื่อนไข (restricted) ──────────────────────────────────
  { aliases: ["SALICYLIC ACID"], status: "restricted", limit: 2, note: "ผลิตภัณฑ์ที่ไม่ล้างออก (leave-on) ≤ 2%" },
  { aliases: ["TRICLOSAN"], status: "restricted", limit: 0.3 },
  { aliases: ["TRICLOCARBAN"], status: "restricted", limit: 0.2 },
  { aliases: ["FORMALDEHYDE", "FORMALIN"], status: "restricted", limit: 0.2, note: "สารกันเสีย ≤ 0.2% (คิดเป็น free formaldehyde)" },
  { aliases: ["HYDROGEN PEROXIDE"], status: "restricted", limit: 12, note: "ผลิตภัณฑ์เกี่ยวกับเส้นผม ≤ 12%" },
  { aliases: ["RESORCINOL"], status: "restricted", limit: 5, note: "ผลิตภัณฑ์ย้อมผม ≤ 5%" },
  { aliases: ["PHENOXYETHANOL"], status: "restricted", limit: 1, note: "สารกันเสีย ≤ 1%" },
  { aliases: ["ZINC PYRITHIONE"], status: "restricted", limit: 1, note: "ผลิตภัณฑ์ล้างออก (rinse-off) ≤ 1%" },
  { aliases: ["BENZOIC ACID", "SODIUM BENZOATE"], status: "restricted", limit: 0.5, note: "สารกันเสีย ≤ 0.5% (คิดเป็นกรด)" },
  { aliases: ["SORBIC ACID", "POTASSIUM SORBATE"], status: "restricted", limit: 0.6, note: "สารกันเสีย ≤ 0.6% (คิดเป็นกรด)" },
  { aliases: ["THIOGLYCOLIC ACID", "THIOGLYCOLATE"], status: "restricted", limit: 8, note: "ผลิตภัณฑ์ดัด/ยืดผม ≤ 8%" },
  { aliases: ["TOLUENE"], status: "restricted", limit: 25, note: "ผลิตภัณฑ์เกี่ยวกับเล็บ ≤ 25%" },
  { aliases: ["AMMONIA"], status: "restricted", limit: 6, note: "≤ 6% (คิดเป็น NH3)" },
  { aliases: ["KOJIC ACID"], status: "restricted", limit: 1, note: "สารทำให้ผิวขาว ≤ 1%" },
  { aliases: ["ARBUTIN", "ALPHA-ARBUTIN", "BETA-ARBUTIN"], status: "restricted", limit: 2, note: "ผลิตภัณฑ์ผิวหน้า ≤ 2% (ต้องไม่ปลดปล่อย hydroquinone)" },
  { aliases: ["METHYLISOTHIAZOLINONE"], status: "restricted", limit: 0.01, note: "สารกันเสีย ผลิตภัณฑ์ล้างออกเท่านั้น ≤ 0.01%" },
  { aliases: ["METHYLCHLOROISOTHIAZOLINONE"], status: "restricted", limit: 0.0015, note: "สารกันเสีย (MCI/MI 3:1) ผลิตภัณฑ์ล้างออก ≤ 0.0015%" },
  { aliases: ["CLIMBAZOLE"], status: "restricted", limit: 0.5, note: "ผลิตภัณฑ์เกี่ยวกับเส้นผม ≤ 0.5%" },
  { aliases: ["P-PHENYLENEDIAMINE", "PARAPHENYLENEDIAMINE", "PPD"], status: "restricted", limit: 2, note: "สารย้อมผม ≤ 2% (คิดเป็นเบสอิสระ)" },
  { aliases: ["GLUTARAL", "GLUTARALDEHYDE"], status: "restricted", limit: 0.1, note: "สารกันเสีย ≤ 0.1%" },
  { aliases: ["BORIC ACID", "BORATE"], status: "restricted", limit: 5, note: "ตามชนิดผลิตภัณฑ์ ≤ 5%" },
  { aliases: ["OXYBENZONE", "BENZOPHENONE-3"], status: "restricted", limit: 6, note: "สารกันแดด ≤ 6%" },
  { aliases: ["RETINOL", "RETINYL PALMITATE", "RETINYL ACETATE"], status: "restricted", limit: 1, note: "วิตามินเอ (leave-on ใบหน้า) — จำกัดปริมาณ" },
]

/** Trim / collapse whitespace / uppercase — the shared join key for screening. */
export function normalizeInci(name: string | null | undefined): string {
  return (name ?? "").replace(/\s+/g, " ").trim().toUpperCase()
}

/**
 * Screen one ingredient by name(s) and optional percentage.
 * Checks both the INCI name and the trade/ingredient name. Empty / unknown names are "ok".
 * When a percentage is supplied and the substance is restricted, `overLimit` flags an exceedance.
 */
export function screenIngredient(
  name: string | null | undefined,
  inciName?: string | null,
  percentage?: number | null,
): ScreenResult {
  const candidates = [normalizeInci(inciName), normalizeInci(name)].filter(Boolean)
  if (candidates.length === 0) return { status: "ok" }

  for (const rule of MOPH_INGREDIENT_RULES) {
    const hit = candidates.some((c) => rule.aliases.some((alias) => c.includes(alias)))
    if (hit) {
      const pct = percentage ?? undefined
      const overLimit =
        rule.status === "restricted" && rule.limit != null && pct != null ? pct > rule.limit : false
      return {
        status: rule.status,
        limit: rule.limit,
        note: rule.note,
        matchedAliases: rule.aliases,
        overLimit,
        percentage: pct,
      }
    }
  }
  return { status: "ok" }
}

export interface ScreenableIngredient {
  ingredientName?: string | null
  inciName?: string | null
  percentage?: number | null
}

export interface ComplianceSummary {
  banned: number
  restricted: number
  overLimit: number
  ok: number
  total: number
  /** True when there is at least one banned substance or a restricted substance over its limit. */
  hasCritical: boolean
}

/** Aggregate screening results across a list of ingredients — for the compliance banner. */
export function summarizeCompliance(ingredients: ScreenableIngredient[]): ComplianceSummary {
  const summary: ComplianceSummary = {
    banned: 0,
    restricted: 0,
    overLimit: 0,
    ok: 0,
    total: ingredients.length,
    hasCritical: false,
  }
  for (const ing of ingredients) {
    const r = screenIngredient(ing.ingredientName, ing.inciName, ing.percentage)
    if (r.status === "banned") summary.banned++
    else if (r.status === "restricted") {
      summary.restricted++
      if (r.overLimit) summary.overLimit++
    } else summary.ok++
  }
  summary.hasCritical = summary.banned > 0 || summary.overLimit > 0
  return summary
}
