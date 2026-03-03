// ========== Enums ==========
export type FormulaStatus = "draft" | "approved" | "active" | "archived" | "discontinued"
export type FormulaType = "master" | "variation"

export const formulaStatusLabel: Record<FormulaStatus, string> = {
  draft: "Draft",
  approved: "Approved",
  active: "Active",
  archived: "Archived",
  discontinued: "Discontinued",
}

export const formulaStatusColor: Record<FormulaStatus, string> = {
  draft: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  archived: "bg-secondary text-muted-foreground border-border",
  discontinued: "bg-red-100 text-red-700 border-red-200",
}

export const formulaTypeLabel: Record<FormulaType, string> = {
  master: "Master",
  variation: "Variation",
}

// Phase badge colors
export const phaseBadgeColor: Record<string, string> = {
  A: "bg-sky-100 text-sky-700",
  B: "bg-amber-100 text-amber-700",
  C: "bg-emerald-100 text-emerald-700",
  D: "bg-purple-100 text-purple-700",
}

// ========== Main Formula ==========
export interface Formula {
  id: string
  formulaCode: string
  formulaName: string
  formulaNameEn?: string | null
  formulaType: FormulaType
  status: FormulaStatus
  productType?: string | null
  cosmeticForm?: string | null
  batchSize: number
  batchUnit: string
  density?: number | null
  unitWeightG?: number | null
  shelfLifeMonths?: number | null
  storageConditions?: string | null
  pkgCompatNotes?: string | null
  targetPhMin?: number | null
  targetPhMax?: number | null
  targetViscosityMin?: number | null
  targetViscosityMax?: number | null
  viscosityUnit?: string | null
  version: number
  versionString?: string | null
  parentFormulaId?: string | null
  fdaRegistrationId?: string | null
  ownerCustomerId?: string | null
  ownerCustomerName?: string | null
  totalCost?: number | null
  costPerUnit?: number | null
  estimatedCostPerKg?: number | null
  ingredientCount: number
  notes?: string | null
  createdBy?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt?: string | null
}

// ========== Ingredient ==========
export interface FormulaIngredient {
  id: string
  formulaId: string
  ingredientName: string
  inciName?: string | null
  phase?: string | null
  percentage: number
  percentageMin?: number | null
  percentageMax?: number | null
  function?: string | null
  stockCardId?: string | null
  itemCode?: string | null
  preferredSupplierId?: string | null
  unitCost?: number | null
  notes?: string | null
  sortOrder?: number | null
}

// ========== Phase ==========
export interface FormulaPhase {
  id: string
  formulaId: string
  phaseKey: string
  phaseName: string
  sortOrder: number
  stepsCount?: number
}

// ========== Processing Step ==========
export interface FormulaProcessingStep {
  id: string
  formulaId: string
  phase: string
  stepNumber: number
  instruction: string
  temperatureMin?: number | null
  temperatureMax?: number | null
  durationMinutes?: number | null
  speedRpm?: number | null
  equipment?: string | null
  notes?: string | null
}

// ========== QC Spec ==========
export interface FormulaQcSpec {
  id: string
  formulaId: string
  parameterName: string
  unit?: string | null
  targetValue?: string | null
  minValue?: number | null
  maxValue?: number | null
  testMethod?: string | null
  notes?: string | null
  sortOrder?: number | null
}

// ========== Version ==========
export interface FormulaVersion {
  id: string
  formulaId: string
  versionNumber: number
  changeDescription?: string | null
  createdAt: string
  createdBy?: string | null
}

// ========== Cost History ==========
export interface FormulaCostHistory {
  id: string
  formulaId: string
  totalCost: number
  costPerUnit: number
  batchSize: number
  ingredientCount: number
  recordedAt: string
  triggeredBy?: string | null
}

// ========== Document ==========
export interface FormulaDocument {
  id: string
  formulaId: string
  documentType?: string | null
  fileName: string
  filePath?: string | null
  fileSize?: number | null
  mimeType?: string | null
  title?: string | null
  description?: string | null
  createdAt: string
  createdBy?: string | null
}

// ========== Extended: Trial Batch ==========
export interface FormulaTrialBatch {
  id: string
  formulaId: string
  trialCode: string
  batchSize?: number | null
  productionDate?: string | null
  operator?: string | null
  results?: string | null
  feedbackStatus?: string | null
  customerFeedback?: string | null
  sortOrder?: number | null
}

// ========== Extended: Approval Step ==========
export interface FormulaApprovalStep {
  id: string
  formulaId: string
  stepNumber: number
  stepName: string
  stepSubtitle?: string | null
  approver?: string | null
  approvalDate?: string | null
  status?: string | null
  comment?: string | null
}

// ========== Extended: Stability Test ==========
export interface FormulaStabilityTest {
  id: string
  formulaId: string
  testType: string
  parameter?: string | null
  method?: string | null
  duration?: string | null
  result?: string | null
  notes?: string | null
  sortOrder?: number | null
}

// ========== KPI Summary ==========
export interface FormulaKPISummary {
  total: number
  draft: number
  approved: number
  active: number
  archived: number
  discontinued: number
}
