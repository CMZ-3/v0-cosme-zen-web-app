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

export type QualityStatus = "pending" | "approved" | "rejected"

export interface ProductLot {
  id: string
  productId: string
  lotNumber: string
  fdaLotReference?: string
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
  qualityStatus: QualityStatus
  storageLocation?: string
  reservedQuantity: number
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

export interface ProductSpecification {
  id: string
  productId: string
  specType: "general" | "regulatory" | "stability" | "packaging" | "micro"
  title: string
  content: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProductAttribute {
  id: string
  productId: string
  scope: "product" | "packaging" | "marketing"
  attributeKey: string
  attributeLabel: string
  attributeValue: string
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type MovementType = "production_in" | "delivery_out" | "adjust" | "return" | "damage" | "loss"

export interface LotMovement {
  id: string
  productLotId: string
  productId: string
  movementType: MovementType
  quantityChange: number
  balanceBefore: number
  balanceAfter: number
  sourceType?: string
  sourceId?: string
  referenceNumber?: string
  notes?: string
  createdBy: string
  createdAt: string
}

export interface LotMovementSummary {
  totalIn: number
  totalOut: number
  netChange: number
  byType: Record<MovementType, number>
}

export interface TraceNode {
  type: "product_lot" | "job_order" | "material" | "stock_lot" | "stock_card" | "supplier"
  id: string
  label: string
  code?: string
  children?: TraceNode[]
}

export interface InventoryReport {
  totalProducts: number
  totalLots: number
  totalQuantity: number
  activeLots: number
  expiredLots: number
  expiringSoon: number
  byQualityStatus: {
    approved: number
    pending: number
    rejected: number
  }
}

export interface ProductInventorySummary {
  productId: string
  productCode: string
  totalLots: number
  totalRemainingQuantity: number
  expiringWithin90Days: number
}

export interface AuditEntry {
  id: string
  action: string
  description: string
  userName: string
  timestamp: string
  color: string
}
