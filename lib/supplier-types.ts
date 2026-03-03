// Supplier Module Types

export type SupplierType = "raw_material" | "packaging" | "service" | "equipment" | "other"
export type SupplierStatus = "active" | "pending" | "issue" | "inactive"
export type CertificateStatus = "active" | "expired" | "pending"
export type GradeLevel = "A+" | "A" | "B+" | "B" | "C+" | "C"

export const SUPPLIER_TYPE_MAP: Record<SupplierType, { label: string; color: string; bg: string }> = {
  raw_material: { label: "Raw Material", color: "text-[#4c8bf5]", bg: "bg-[#eef4ff]" },
  packaging: { label: "Packaging", color: "text-[#8b5cf6]", bg: "bg-[#f3efff]" },
  service: { label: "Service", color: "text-[#14b8a6]", bg: "bg-[#ccfbf1]" },
  equipment: { label: "Equipment", color: "text-[#f59e0b]", bg: "bg-[#fef3c7]" },
  other: { label: "Other", color: "text-muted-foreground", bg: "bg-secondary" },
}

export const GRADE_MAP: Record<GradeLevel, string> = {
  "A+": "from-[#10b981] to-[#059669]",
  "A": "from-[#10b981] to-[#059669]",
  "B+": "from-[#f59e0b] to-[#d97706]",
  "B": "from-[#f59e0b] to-[#d97706]",
  "C+": "from-[#ef4444] to-[#dc2626]",
  "C": "from-[#ef4444] to-[#dc2626]",
}

export const CERT_STATUS_MAP: Record<CertificateStatus, { label: string; color: string; bg: string; border: string }> = {
  active: { label: "Active", color: "text-[#15803d]", bg: "bg-[#ecfdf5]", border: "border-[#bbf7d0]" },
  expired: { label: "Expired", color: "text-[#b91c1c]", bg: "bg-[#fef2f2]", border: "border-[#fecaca]" },
  pending: { label: "Pending", color: "text-[#c2410c]", bg: "bg-[#fef3c7]", border: "border-[#fed7aa]" },
}

export interface SupplierListItem {
  id: string
  supplierCode: string
  supplierName: string
  supplierNameEn?: string
  supplierType: SupplierType
  country: string
  city?: string
  contactPerson?: string
  email?: string
  phone?: string
  isActive: boolean
  isApproved: boolean
  grade: GradeLevel
  qualityRating?: number
  deliveryRating?: number
  priceRating?: number
  materialTags: { label: string; color: string; bg: string }[]
  status: SupplierStatus
}

export interface SupplierContact {
  id: string
  contactName: string
  position?: string
  email?: string
  phone?: string
  lineId?: string
  isPrimary: boolean
}

export interface SupplierAddress {
  id: string
  addressType: string
  addressName: string
  addressLine1: string
  province?: string
  postalCode?: string
  isDefault: boolean
}

export interface SupplierCertificate {
  id: string
  certificateType: string
  certificateName: string
  certificateNumber?: string
  issuingBody?: string
  issueDate?: string
  expiryDate?: string
  status: CertificateStatus
  daysRemaining?: number
}

export interface SupplierCatalogItem {
  id: string
  stockItemName: string
  inci?: string
  unitPrice?: number
  currency: string
  leadTimeDays?: number
  minOrderQty?: number
  unit?: string
  coaStatus?: "valid" | "expiring" | "expired" | "none"
  purity?: string
}

export interface SupplierDocument {
  id: string
  documentType: string
  title: string
  fileName: string
  fileSize?: number
  createdAt: string
}

export interface SupplierDetail extends SupplierListItem {
  description?: string
  address?: string
  taxId?: string
  branchCode?: string
  paymentTerms?: string
  paymentDays: number
  website?: string
  fax?: string
  notes?: string
  logoUrl?: string
  avgLeadTimeDays?: number
  ytdOrderValue?: number
  moq?: string
  onTimeDeliveryPct?: number
  contacts: SupplierContact[]
  addresses: SupplierAddress[]
  certificates: SupplierCertificate[]
  catalogItems: SupplierCatalogItem[]
  documents: SupplierDocument[]
  createdAt: string
  updatedAt: string
}

export interface SupplierKPI {
  totalSuppliers: number
  activeSuppliers: number
  approvedSuppliers: number
  pendingApproval: number
  avgRating: number
}
