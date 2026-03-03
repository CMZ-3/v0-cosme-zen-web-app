// Delivery Order Types

export type DeliveryStatus =
  | "draft"
  | "reserved"
  | "picking"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"

export interface DeliveryOrder {
  id: string
  deliveryNumber: string
  customerId?: string
  customerName: string
  customerBrand?: string
  salesOrderRef?: string
  orderDate: string
  deliveryDate?: string
  actualDeliveryDate?: string
  deliveryAddress?: string
  deliveryCity?: string
  deliveryProvince?: string
  deliveryPostalCode?: string
  contactName?: string
  contactPhone?: string
  status: DeliveryStatus
  totalQuantity?: number
  totalAmount?: number
  shippingMethod?: string
  trackingNumber?: string
  shippingCost?: number
  pickedBy?: string
  pickedAt?: string
  shippedBy?: string
  shippedAt?: string
  completedBy?: string
  completedAt?: string
  cancelledBy?: string
  cancelledAt?: string
  cancelReason?: string
  weightKg?: number
  boxesCount?: number
  reservedBy?: string
  reservedAt?: string
  receiverName?: string
  podNotes?: string
  podSignedAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  createdBy?: string
  // Denormalized fields for table view
  productSummary?: string
  jobStatus?: "pending_close" | "closed" | null
}

export interface DeliveryOrderLine {
  id: string
  deliveryOrderId: string
  lineNumber: number
  productId?: string
  productCode?: string
  productName: string
  productLotId?: string
  lotNumber?: string
  quantity: number
  deliveredQuantity?: number
  unit?: string
  unitPrice?: number
  amount?: number
  status: string
  pickedLotId?: string
  pickedLotNumber?: string
  pickedQuantity?: number
  qualityStatus?: string
  reservedLotId?: string
  reservedLotNumber?: string
  reservedQuantity?: number
  packPerCarton?: number
  cartonCount?: number
  notes?: string
}

export interface DeliveryPodAttachment {
  id: string
  deliveryOrderId: string
  attachmentType: "photo" | "signature" | "document"
  fileName: string
  filePath: string
  fileSize?: number
  mimeType?: string
  uploadedBy?: string
  uploadedAt: string
}

export interface DeliveryAuditLog {
  id: string
  deliveryOrderId: string
  action: string
  oldStatus?: string
  newStatus?: string
  userName?: string
  notes?: string
  createdAt: string
}

export interface DeliveryKPISummary {
  total: number
  preparing: number
  picking: number
  shipped: number
  delivered: number
  completed: number
  pendingClose: number
}

export const deliveryStatusMap: Record<DeliveryStatus, { label: string; labelTh: string; color: string; bgColor: string; dotColor: string }> = {
  draft: { label: "Draft", labelTh: "แบบร่าง", color: "text-muted-foreground", bgColor: "bg-secondary", dotColor: "bg-muted-foreground" },
  reserved: { label: "Reserved", labelTh: "จองแล้ว", color: "text-blue-700", bgColor: "bg-blue-50", dotColor: "bg-blue-500" },
  picking: { label: "Picking", labelTh: "Picking", color: "text-purple-700", bgColor: "bg-purple-50", dotColor: "bg-purple-500" },
  shipped: { label: "Shipped", labelTh: "กำลังจัดส่ง", color: "text-teal-700", bgColor: "bg-teal-50", dotColor: "bg-teal-500" },
  delivered: { label: "Delivered", labelTh: "ส่งถึงแล้ว", color: "text-emerald-700", bgColor: "bg-emerald-50", dotColor: "bg-emerald-500" },
  completed: { label: "Completed", labelTh: "Job Finished", color: "text-teal-700", bgColor: "bg-teal-50/60", dotColor: "bg-teal-500" },
  cancelled: { label: "Cancelled", labelTh: "ยกเลิก", color: "text-destructive", bgColor: "bg-destructive/10", dotColor: "bg-destructive" },
}

export const deliveryWorkflowSteps: DeliveryStatus[] = [
  "draft", "reserved", "picking", "shipped", "delivered", "completed"
]
