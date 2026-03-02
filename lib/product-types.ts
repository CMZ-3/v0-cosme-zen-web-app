export type ProductStatus = "active" | "in_development" | "draft" | "discontinued"
export type ProductCategory = "skincare" | "bodycare" | "haircare" | "suncare" | "makeup" | "cleanser" | "supplement" | "fragrance" | "other"
export type FDAStatus = "approved" | "pending" | "expired" | "not_registered"
export type LotStatus = "released" | "qc_hold" | "sold_out" | "rejected"
export type QCResult = "pass" | "fail" | "pending"
export type ContainerType = "dropper" | "airless_pump" | "tube" | "jar" | "spray" | "sachet" | "pump_bottle" | "bottle"
export type BOMComponentType = "bottle" | "pump" | "cap" | "sticker" | "box" | "shrink_wrap" | "other"

export interface Product {
  id: string
  sku: string
  barcode?: string
  nameInternal: string
  nameTH?: string
  nameEN?: string
  tradeName_TH?: string
  tradeName_EN?: string
  description?: string
  category: ProductCategory
  subCategory?: string
  customerId: string
  customerName: string
  brandId?: string
  brandName?: string
  formulaId?: string
  formulaCode?: string
  formulaName?: string
  fdaLicenseId?: string
  fdaLicenseNumber?: string
  fillWeight: number
  fillWeightUnit: "ml" | "g"
  shelfLifeMonths: number
  paoMonths?: number
  storageCondition: string
  containerType: ContainerType
  containerMaterial?: string
  containerShape?: string
  capType?: string
  packageSize: string
  qcSpec: {
    appearance?: string
    color?: string
    scent?: string
    texture?: string
    phMin?: number
    phMax?: number
    viscosityMin?: number
    viscosityMax?: number
    specificGravityMin?: number
    specificGravityMax?: number
  }
  bulkCostPerUnit: number
  packagingCostPerUnit: number
  laborCostPerUnit: number
  overheadCostPerUnit: number
  totalCostPerUnit: number
  sellingPrice?: number
  moq: number
  leadTimeDays: number
  status: ProductStatus
  fdaStatus: FDAStatus
  bomItems: BOMItem[]
  pricingTiers: PricingTier[]
  images: ProductImage[]
  attachments: ProductAttachment[]
  totalProduced: number
  inStockQty: number
  lotCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface BOMItem {
  id: string
  type: BOMComponentType
  stockItemId?: string
  stockItemName: string
  stockItemCode: string
  quantity: number
  conversionQty?: number
  conversionUnit?: string
  wastePercent: number
  unitCost: number
  effectiveCost: number
}

export interface PricingTier {
  id: string
  minQty: number
  maxQty?: number
  pricePerUnit: number
  grossMarginPercent: number
  profitPerUnit: number
}

export interface ProductLot {
  id: string
  productId: string
  lotNumber: string
  jobOrderId?: string
  jobOrderNumber?: string
  mfgDate: string
  expDate: string
  daysUntilExpiry?: number
  quantity: number
  yieldPercent?: number
  qcResult: QCResult
  qcData: {
    appearance?: string
    odor?: string
    phValue?: number
    viscosity?: number
    specificGravity?: number
    microTest?: string
  }
  inStockQty: number
  deliveredQty: number
  costPerUnit: number
  status: LotStatus
  coaUrl?: string
  deliveries: LotDelivery[]
  remark?: string
  createdAt: string
  createdBy: string
}

export interface LotDelivery {
  id: string
  date: string
  customerName: string
  invoiceNumber: string
  quantity: number
  courier?: string
}

export interface ProductImage {
  id: string
  url: string
  thumbnailUrl: string
  label: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: string
  fileType: string
  uploadedAt: string
}

export interface ProductListItem {
  id: string
  sku: string
  nameInternal: string
  thumbnailUrl?: string
  customerName: string
  brandName?: string
  category: ProductCategory
  sellingPrice?: number
  totalCostPerUnit: number
  marginPercent: number
  fdaStatus: FDAStatus
  status: ProductStatus
  packageSize: string
  containerType: ContainerType
}

export interface ProductKPISummary {
  total: number
  active: number
  inDevelopment: number
  fdaWarning: number
  discontinued: number
}

export interface ProductFilters {
  category?: ProductCategory
  status?: ProductStatus
  search?: string
  customerId?: string
}

export interface AuditEntry {
  id: string
  action: string
  description: string
  userName: string
  timestamp: string
  color: string
}
