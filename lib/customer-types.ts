// Customer Module Types

export type CustomerType = "individual" | "juristic"
export type CustomerTier = "standard" | "silver" | "gold" | "platinum"
export type BusinessType = "brand_owner" | "distributor" | "retailer" | "oem" | "other"
export type ContractStatus = "draft" | "active" | "expired" | "terminated" | "renewed"
export type BriefStatus = "received" | "reviewing" | "sampling" | "approved" | "rejected" | "cancelled"
export type ComplaintSeverity = "low" | "medium" | "high" | "critical"
export type ComplaintStatus = "open" | "investigating" | "resolved" | "closed"
export type ContactLogChannel = "phone" | "email" | "line" | "meeting" | "video_call" | "site_visit" | "other"

export const CUSTOMER_TYPE_MAP: Record<CustomerType, { label: string; color: string; bg: string }> = {
  individual: { label: "Individual", color: "text-[#7c3aed]", bg: "bg-[#f3efff]" },
  juristic: { label: "Juristic", color: "text-[#0369a1]", bg: "bg-[#eef4ff]" },
}

export const TIER_MAP: Record<CustomerTier, { label: string; color: string; bg: string; border: string }> = {
  standard: { label: "Standard", color: "text-muted-foreground", bg: "bg-secondary", border: "border-border" },
  silver: { label: "Silver", color: "text-[#475569]", bg: "bg-[#f1f5f9]", border: "border-[#cbd5e1]" },
  gold: { label: "Gold", color: "text-[#b45309]", bg: "bg-[#fef3c7]", border: "border-[#fcd34d]" },
  platinum: { label: "Platinum", color: "text-[#6d28d9]", bg: "bg-[#f5f3ff]", border: "border-[#c4b5fd]" },
}

export const BUSINESS_TYPE_MAP: Record<BusinessType, string> = {
  brand_owner: "Brand Owner",
  distributor: "Distributor",
  retailer: "Retailer",
  oem: "OEM",
  other: "Other",
}

export const BRIEF_STATUS_MAP: Record<BriefStatus, { label: string; color: string; bg: string }> = {
  received: { label: "Received", color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
  reviewing: { label: "Reviewing", color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
  sampling: { label: "Sampling", color: "text-[#7c3aed]", bg: "bg-[#f5f3ff]" },
  approved: { label: "Approved", color: "text-[#15803d]", bg: "bg-[#ecfdf5]" },
  rejected: { label: "Rejected", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
  cancelled: { label: "Cancelled", color: "text-muted-foreground", bg: "bg-secondary" },
}

export const COMPLAINT_SEVERITY_MAP: Record<ComplaintSeverity, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
  medium: { label: "Medium", color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
  high: { label: "High", color: "text-[#ea580c]", bg: "bg-[#fff7ed]" },
  critical: { label: "Critical", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
}

export const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
  investigating: { label: "Investigating", color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
  resolved: { label: "Resolved", color: "text-[#15803d]", bg: "bg-[#ecfdf5]" },
  closed: { label: "Closed", color: "text-muted-foreground", bg: "bg-secondary" },
}

export const CONTRACT_STATUS_MAP: Record<ContractStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-secondary" },
  active: { label: "Active", color: "text-[#15803d]", bg: "bg-[#ecfdf5]" },
  expired: { label: "Expired", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
  terminated: { label: "Terminated", color: "text-[#b91c1c]", bg: "bg-[#fef2f2]" },
  renewed: { label: "Renewed", color: "text-[#0369a1]", bg: "bg-[#eef4ff]" },
}

// --- List item ---
export interface CustomerListItem {
  id: string
  customerCode: string
  customerName: string
  customerNameEn?: string
  customerType: CustomerType
  customerTier: CustomerTier
  businessType: BusinessType
  contactPerson?: string
  email?: string
  phone?: string
  creditLimit?: number
  creditUsed?: number
  isActive: boolean
  totalOrders: number
  totalRevenue: number
  productCount: number
  brandCount: number
  leadSource?: string
  province?: string
  country: string
}

// --- Sub-entities for detail ---
export interface CustomerContact {
  id: string
  contactName: string
  position?: string
  email?: string
  phone?: string
  lineId?: string
  department?: string
  isPrimary: boolean
}

export interface CustomerAddress {
  id: string
  addressType: "registered" | "shipping" | "billing" | "branch" | "warehouse" | "factory"
  addressName: string
  addressLine1: string
  addressLine2?: string
  province?: string
  postalCode?: string
  country: string
  isDefault: boolean
  isFdaApproved?: boolean
}

export interface CustomerBrand {
  id: string
  brandName: string
  brandNameEn?: string
  brandColor?: string
  brandCategory?: string
  brandDescription?: string
  isActive: boolean
}

export interface CustomerContract {
  id: string
  contractNumber: string
  contractName: string
  contractType: string
  status: ContractStatus
  startDate: string
  endDate: string
  autoRenew: boolean
  currency: string
  totalValue?: number
}

export interface CustomerBrief {
  id: string
  briefNumber: string
  title: string
  productType?: string
  cosmeticForm?: string
  status: BriefStatus
  assignedTo?: string
  createdAt: string
}

export interface CustomerComplaint {
  id: string
  complaintNumber: string
  title?: string
  category: string
  severity: ComplaintSeverity
  status: ComplaintStatus
  productName?: string
  assignedTo?: string
  reportedDate?: string
}

export interface CustomerContactLog {
  id: string
  channel: ContactLogChannel
  contactDate: string
  subject: string
  summary?: string
  contactName?: string
  internalUser?: string
  followUpDate?: string
  isFollowUpDone: boolean
}

export interface CustomerDocument {
  id: string
  documentType: string
  title: string
  fileName: string
  fileSize?: number
  createdAt: string
}

// --- Full detail ---
export interface CustomerDetail extends CustomerListItem {
  address?: string
  city?: string
  postalCode?: string
  taxId?: string
  branchCode?: string
  creditDays: number
  salesRepresentative?: string
  website?: string
  fax?: string
  lineId?: string
  logoUrl?: string
  notes?: string
  contacts: CustomerContact[]
  addresses: CustomerAddress[]
  brands: CustomerBrand[]
  contracts: CustomerContract[]
  briefs: CustomerBrief[]
  complaints: CustomerComplaint[]
  contactLogs: CustomerContactLog[]
  documents: CustomerDocument[]
  createdAt: string
  updatedAt: string
}

export interface CustomerKPI {
  totalCustomers: number
  activeCustomers: number
  totalRevenue: number
  avgOrderValue: number
  totalBrands: number
}
