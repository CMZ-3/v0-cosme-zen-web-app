export type JOStatus =
  | "new"
  | "preparing_rm"
  | "in_production"
  | "qc"
  | "packing"
  | "delivered"
  | "cancelled"

export type Priority = "high" | "medium" | "low"
export type StepStatus = "done" | "active" | "pending"
export type BatchStatus = "producing" | "waiting_qc" | "qc_passed" | "qc_failed"

export interface ProductionStep {
  id: string
  stepNumber: number
  name: string
  description: string
  status: StepStatus
  targetQty: number
  completedQty: number
  goodQty: number
  defectQty: number
  unit: string
  startDate: string | null
  endDate: string | null
  dailyRecords: DailyRecord[]
}

export interface DailyRecord {
  id: string
  date: string
  stepId: string
  batchId: string
  goodQty: number
  defectQty: number
  operatorName: string
  note: string
  cumulativeTotal: number
  createdAt: string
}

export interface Batch {
  id: string
  batchNumber: string
  quantity: number
  status: BatchStatus
  completedDate: string | null
}

export interface MaterialCheck {
  id: string
  stockCardId?: string
  name: string
  requiredQty: number
  requiredUnit: string
  lot: string
  stockQty: number
  status: "sufficient" | "ordered" | "shortage"
  reservedQty: number
}

export interface QCResult {
  id: string
  parameter: string
  specification: string
  result: string
  status: "pass" | "fail" | "pending"
  tester: string
}

export interface CostBreakdown {
  rawMaterial: number
  packaging: number
  labor: number
  qcOverhead: number
  total: number
}

export interface YieldAnalysis {
  totalInput: number
  totalOutput: number
  yieldLoss: number
  yieldLossPercent: number
  unit: string
}

export interface JobOrder {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  brandName: string
  productName: string
  sku: string
  formulaCode: string
  fdaRegNumber: string
  fdaStatus: "active" | "expiring" | "expired"
  quantity: number
  unitSize: string
  batchSize: number
  numberOfBatches: number
  status: JOStatus
  priority: Priority
  totalValue: number
  costPerUnit: number
  sellingPricePerUnit: number
  paymentTerms: string
  dueDate: string
  startDate: string
  productionSteps: ProductionStep[]
  batches: Batch[]
  materials: MaterialCheck[]
  qcResults: QCResult[]
  costBreakdown: CostBreakdown
  yieldAnalysis: YieldAnalysis
  notes: string
  createdAt: string
  updatedAt: string
}

export interface TrackingStats {
  target: number
  totalDone: number
  totalPending: number
  totalGood: number
  totalDefect: number
  defectRate: number
  progressPercent: number
  daysRemaining: number
  avgPerDay: number
  currentStepName: string
}

export const JO_STATUS_MAP: Record<JOStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: "New", color: "#0d9488", bg: "#ccfbf1", border: "#99f6e4" },
  preparing_rm: { label: "Preparing RM", color: "#c2410c", bg: "#fef3c7", border: "#fed7aa" },
  in_production: { label: "In Production", color: "#0369a1", bg: "#eef4ff", border: "#bae6fd" },
  qc: { label: "QC Check", color: "#7c3aed", bg: "#f3efff", border: "#ddd6fe" },
  packing: { label: "Packing", color: "#0369a1", bg: "#eef4ff", border: "#bae6fd" },
  delivered: { label: "Delivered", color: "#15803d", bg: "#ecfdf5", border: "#bbf7d0" },
  cancelled: { label: "Cancelled", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
}

export const PRIORITY_MAP: Record<Priority, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "#ef4444", bg: "#fef2f2" },
  medium: { label: "Medium", color: "#c2410c", bg: "#fef3c7" },
  low: { label: "Low", color: "#10b981", bg: "#ecfdf5" },
}
