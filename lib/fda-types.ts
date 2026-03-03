//
// FDA Module Types -- CosmeZen
//

export type RegistrationType = "jk" | "jr"
export type FdaStatus = "draft" | "submitted" | "approved" | "rejected" | "expired" | "inactive"
export type FdaDocumentType = "msds" | "coa" | "specification" | "test_report" | "label_artwork" | "formula_sheet" | "factory_license" | "certificate" | "other"

export const REGISTRATION_TYPE_MAP: Record<RegistrationType, { label: string; labelTh: string; color: string; bg: string }> = {
  jk: { label: "JK", labelTh: "จ.ค.", color: "text-blue-700", bg: "bg-blue-100" },
  jr: { label: "JR", labelTh: "จ.ร.", color: "text-amber-700", bg: "bg-amber-100" },
}

export const FDA_STATUS_MAP: Record<FdaStatus, { label: string; color: string; bg: string; dot: string }> = {
  draft: { label: "Draft", color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  expired: { label: "Expired", color: "text-orange-600", bg: "bg-orange-50", dot: "bg-orange-400" },
  inactive: { label: "Inactive", color: "text-gray-400", bg: "bg-gray-100", dot: "bg-gray-300" },
}

export interface FdaRegistration {
  id: string
  registrationCode: string
  registrationType: RegistrationType
  registrationNumber?: string
  licenseNumber?: string
  productNameTh: string
  productNameEn?: string
  fdaProductName?: string
  tradeName?: string
  tradeNameEn?: string
  productNameSuffix?: string
  cosmeticType?: string
  cosmeticForm?: string
  usageFormat?: string
  applicationArea?: string
  productPurpose?: string
  containerType?: string
  productForm?: string
  usageInstructions?: string
  warnings?: string
  combinedRegistrationNos?: string
  registrationDate?: string
  submittedDate?: string
  expiryDate?: string
  renewalCount: number
  manufacturerName?: string
  manufacturerAddress?: string
  manufacturerLicense?: string
  manufacturerStorageAddress?: string
  importerName?: string
  importerAddress?: string
  formulaId?: string
  customerId?: string
  customerName?: string
  status: FdaStatus
  approvalComment?: string
  rejectionReason?: string
  serviceFee: number
  feeNotes?: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
}

export interface FdaListItem {
  id: string
  registrationCode: string
  registrationType: RegistrationType
  registrationNumber?: string
  productNameTh: string
  productNameEn?: string
  tradeName?: string
  cosmeticType?: string
  status: FdaStatus
  expiryDate?: string
  daysUntilExpiry?: number
  customerName?: string
  manufacturerName?: string
  renewalCount: number
  createdAt: string
}

export interface FdaKPISummary {
  total: number
  totalJk: number
  totalJr: number
  approved: number
  draft: number
  submitted: number
  rejected: number
  expired: number
  expiring30: number
  expiring60: number
  expiring90: number
}

// PIF
export interface FdaIngredient {
  id: string
  registrationId: string
  ingredientName: string
  inciName?: string
  thaiName?: string
  casNumber?: string
  percentage?: number
  percentageMin?: number
  percentageMax?: number
  function?: string
  origin?: string
  supplier?: string
  isRestricted: boolean
  maxAllowedPercentage?: number
  restrictions?: string
  restrictionNotes?: string
  sortOrder?: number
}

export interface FdaManufacturingStep {
  id: string
  registrationId: string
  stepNumber: number
  stepName: string
  description?: string
  equipment?: string
  temperatureRange?: string
  pressureRange?: string
  timeDuration?: string
  rpmRange?: string
  criticalParameters?: string
  qualityChecks?: string
}

export interface FdaRawMaterialSpec {
  id: string
  registrationId: string
  materialName: string
  specification?: string
  testMethod?: string
  acceptanceCriteria?: string
  supplier?: string
}

// Documents
export interface FdaDocument {
  id: string
  registrationId: string
  documentType: FdaDocumentType
  fileName: string
  fileSize?: number
  title?: string
  description?: string
  createdAt: string
}

// Checklist
export interface FdaChecklistItem {
  id: string
  registrationId: string
  checklistKey: string
  isCompleted: boolean
  completedAt?: string
  completedBy?: string
  notes?: string
}

// Audit
export interface FdaAuditLog {
  id: string
  registrationId: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  userName?: string
  comment?: string
  createdAt: string
}

// Status Transitions
export const FDA_TRANSITIONS: Record<FdaStatus, { targets: FdaStatus[]; adminOnly?: FdaStatus[] }> = {
  draft: { targets: ["submitted", "inactive"] },
  submitted: { targets: ["approved", "rejected", "inactive"] },
  approved: { targets: [], adminOnly: ["draft"] },
  rejected: { targets: ["draft"] },
  expired: { targets: [], adminOnly: ["draft"] },
  inactive: { targets: [] },
}

// Default Checklist Keys
export const DEFAULT_CHECKLIST_KEYS = [
  { key: "product_name_confirmed", label: "Product Name (TH/EN) Confirmed" },
  { key: "formula_linked", label: "Formula Linked" },
  { key: "ingredient_list_complete", label: "Ingredient List Complete (INCI)" },
  { key: "manufacturing_steps_documented", label: "Manufacturing Steps Documented" },
  { key: "raw_material_specs_attached", label: "Raw Material Specs Attached" },
  { key: "msds_uploaded", label: "MSDS Files Uploaded" },
  { key: "coa_uploaded", label: "COA Uploaded" },
  { key: "label_artwork_uploaded", label: "Label Artwork Uploaded" },
  { key: "manufacturer_license_valid", label: "Manufacturer License Valid" },
  { key: "fee_paid", label: "Service Fee Paid" },
  { key: "internal_review_done", label: "Internal Review Done" },
  { key: "ready_for_submission", label: "Ready for Submission" },
]
