import type { StockCard, StockDashboard, StockMovement, StockLot, StockReservation, LinkedProduct, StockAlert, StmDocument } from "./stock-types"

export const mockStockDashboard: StockDashboard = {
  totalItems: 248,
  totalInventoryValue: 4825000,
  statusBreakdown: { healthy: 198, low: 28, outOfStock: 12, overStock: 10 },
  totalIncoming: 85000,
  totalReserved: 42000,
  totalAvailable: 291000,
}

export const mockStockCards: StockCard[] = [
  { id: "sc-1", itemCode: "RM-001", itemName: "Vitamin C (Ascorbic Acid)", itemNameEn: "Vitamin C", itemType: "raw_material", category: "Active Ingredient", unit: "kg", balance: 120, reservedStock: 30, incomingStock: 50, available: 140, initialStock: 100, minStock: 20, maxStock: 200, reorderPoint: 40, unitCost: 2800, supplier: "BASF Thailand", location: "Zone A-1", barcode: "8851234000011", tradeName: "ASCORBIC ACID", inciName: "Ascorbic Acid", casNo: "50-81-7", storageTemp: "15-25C", status: "active", inventoryStatus: "healthy", createdAt: "2024-01-15", updatedAt: "2026-03-01" },
  { id: "sc-2", itemCode: "RM-002", itemName: "Hyaluronic Acid", itemNameEn: "Hyaluronic Acid", itemType: "raw_material", category: "Active Ingredient", unit: "kg", balance: 8, reservedStock: 5, incomingStock: 10, available: 13, initialStock: 20, minStock: 10, maxStock: 50, reorderPoint: 15, unitCost: 12500, supplier: "Contipro", location: "Zone A-2", inciName: "Sodium Hyaluronate", casNo: "9067-32-7", storageTemp: "2-8C", status: "active", inventoryStatus: "low", createdAt: "2024-01-15", updatedAt: "2026-03-01" },
  { id: "sc-3", itemCode: "RM-003", itemName: "Niacinamide (Vitamin B3)", itemNameEn: "Niacinamide", itemType: "raw_material", category: "Active Ingredient", unit: "kg", balance: 85, reservedStock: 10, incomingStock: 0, available: 75, initialStock: 100, minStock: 15, maxStock: 120, reorderPoint: 30, unitCost: 1800, supplier: "Lonza", location: "Zone A-1", inciName: "Niacinamide", casNo: "98-92-0", storageTemp: "15-25C", status: "active", inventoryStatus: "healthy", createdAt: "2024-02-10", updatedAt: "2026-03-01" },
  { id: "sc-4", itemCode: "RM-004", itemName: "Titanium Dioxide", itemNameEn: "Titanium Dioxide", itemType: "raw_material", category: "UV Filter", unit: "kg", balance: 0, reservedStock: 0, incomingStock: 25, available: 25, initialStock: 50, minStock: 10, maxStock: 80, reorderPoint: 20, unitCost: 950, supplier: "Merck", location: "Zone B-1", inciName: "Titanium Dioxide", casNo: "13463-67-7", storageTemp: "15-25C", status: "active", inventoryStatus: "out_of_stock", createdAt: "2024-03-01", updatedAt: "2026-02-28" },
  { id: "sc-5", itemCode: "RM-005", itemName: "Glycerin", itemNameEn: "Glycerin", itemType: "raw_material", category: "Humectant", unit: "kg", balance: 450, reservedStock: 20, incomingStock: 0, available: 430, initialStock: 200, minStock: 50, maxStock: 300, reorderPoint: 80, unitCost: 180, supplier: "P&G Chemicals", location: "Zone C-1", inciName: "Glycerin", casNo: "56-81-5", storageTemp: "15-25C", status: "active", inventoryStatus: "over_stock", createdAt: "2024-01-20", updatedAt: "2026-03-01" },
  { id: "sc-6", itemCode: "PK-001", itemName: "ขวดแก้ว Serum 30ml Dropper", itemNameEn: "Glass Serum Bottle 30ml", itemType: "packaging", category: "Primary Packaging", unit: "pcs", balance: 5200, reservedStock: 1000, incomingStock: 2000, available: 6200, initialStock: 3000, minStock: 500, maxStock: 8000, reorderPoint: 1000, unitCost: 18, supplier: "Thai Glass", location: "Zone D-1", status: "active", inventoryStatus: "healthy", createdAt: "2024-02-01", updatedAt: "2026-03-01" },
  { id: "sc-7", itemCode: "PK-002", itemName: "หลอด Tube 50ml", itemNameEn: "Tube 50ml", itemType: "packaging", category: "Primary Packaging", unit: "pcs", balance: 3800, reservedStock: 800, incomingStock: 0, available: 3000, initialStock: 5000, minStock: 1000, maxStock: 10000, reorderPoint: 2000, unitCost: 12, supplier: "Thai Tube", location: "Zone D-2", status: "active", inventoryStatus: "healthy", createdAt: "2024-02-15", updatedAt: "2026-03-01" },
  { id: "sc-8", itemCode: "RM-006", itemName: "Retinol 0.5%", itemNameEn: "Retinol", itemType: "raw_material", category: "Active Ingredient", unit: "kg", balance: 3.5, reservedStock: 2, incomingStock: 0, available: 1.5, initialStock: 10, minStock: 5, maxStock: 20, reorderPoint: 8, unitCost: 25000, supplier: "DSM", location: "Zone A-3", inciName: "Retinol", casNo: "68-26-8", storageTemp: "2-8C", status: "active", inventoryStatus: "low", createdAt: "2024-04-01", updatedAt: "2026-03-01" },
  { id: "sc-9", itemCode: "RM-007", itemName: "Salicylic Acid", itemNameEn: "Salicylic Acid", itemType: "raw_material", category: "BHA", unit: "kg", balance: 42, reservedStock: 5, incomingStock: 0, available: 37, initialStock: 50, minStock: 10, maxStock: 60, reorderPoint: 15, unitCost: 3200, supplier: "Salicylates & Chemicals", location: "Zone A-1", inciName: "Salicylic Acid", casNo: "69-72-7", storageTemp: "15-25C", status: "active", inventoryStatus: "healthy", createdAt: "2024-05-01", updatedAt: "2026-03-01" },
  { id: "sc-10", itemCode: "FG-001", itemName: "GlowUp Vitamin C Serum 30ml", itemNameEn: "GlowUp Vitamin C Serum", itemType: "finished_good", category: "Finished Product", unit: "pcs", balance: 1200, reservedStock: 300, incomingStock: 500, available: 1400, initialStock: 0, minStock: 200, maxStock: 3000, reorderPoint: 500, unitCost: 85, supplier: "Internal", location: "Zone E-1", status: "active", inventoryStatus: "healthy", createdAt: "2024-06-01", updatedAt: "2026-03-01" },
]

export const mockStockMovements: StockMovement[] = [
  { id: "mv-1", referenceNumber: "BI-260301-001", movementType: "buy_in", stockCardId: "sc-1", itemCode: "RM-001", itemName: "Vitamin C (Ascorbic Acid)", quantity: 50, unitCost: 2800, totalCost: 140000, status: "approved", lotNumber: "LOT-260301-001", expireDate: "2027-03-01", notes: "PO-2603-015", createdBy: "Admin", createdAt: "2026-03-01" },
  { id: "mv-2", referenceNumber: "UO-260228-001", movementType: "use_out", stockCardId: "sc-2", itemCode: "RM-002", itemName: "Hyaluronic Acid", quantity: 5, status: "approved", lotNumber: "LOT-260115-003", notes: "JO-2602-008 production", createdBy: "Staff A", createdAt: "2026-02-28" },
  { id: "mv-3", referenceNumber: "AI-260228-001", movementType: "adjust_in", stockCardId: "sc-5", itemCode: "RM-005", itemName: "Glycerin", quantity: 100, unitCost: 180, totalCost: 18000, status: "approved", notes: "Stock count correction", createdBy: "Admin", createdAt: "2026-02-28" },
  { id: "mv-4", referenceNumber: "TR-260227-001", movementType: "transfer", stockCardId: "sc-3", itemCode: "RM-003", itemName: "Niacinamide", quantity: 10, status: "approved", notes: "Zone A-1 to Zone B-2", createdBy: "Staff B", createdAt: "2026-02-27" },
  { id: "mv-5", referenceNumber: "BI-260226-001", movementType: "buy_in", stockCardId: "sc-6", itemCode: "PK-001", itemName: "ขวดแก้ว Serum 30ml Dropper", quantity: 2000, unitCost: 18, totalCost: 36000, status: "pending", notes: "PO-2602-042", createdBy: "Staff A", createdAt: "2026-02-26" },
  { id: "mv-6", referenceNumber: "DM-260225-001", movementType: "damage", stockCardId: "sc-7", itemCode: "PK-002", itemName: "หลอด Tube 50ml", quantity: 50, status: "draft", notes: "Damaged in transit", createdBy: "Staff C", createdAt: "2026-02-25" },
  { id: "mv-7", referenceNumber: "PR-260224-001", movementType: "production", stockCardId: "sc-1", itemCode: "RM-001", itemName: "Vitamin C (Ascorbic Acid)", quantity: 15, status: "approved", notes: "JO-2602-012", createdBy: "Staff A", createdAt: "2026-02-24" },
  { id: "mv-8", referenceNumber: "RT-260223-001", movementType: "return", stockCardId: "sc-8", itemCode: "RM-006", itemName: "Retinol 0.5%", quantity: 2, status: "approved", lotNumber: "LOT-260115-008", notes: "Production surplus", createdBy: "Staff B", createdAt: "2026-02-23" },
]

export const mockStockLots: StockLot[] = [
  { id: "lot-1", stockCardId: "sc-1", lotNumber: "LOT-260301-001", quantity: 50, reservedQty: 10, expireDate: "2027-03-01", manufacturedDate: "2026-01-15", supplierLotNo: "BASF-VC-26001", unitCost: 2800, sourceType: "buy_in", status: "available", lotCategory: "sealed", createdAt: "2026-03-01" },
  { id: "lot-2", stockCardId: "sc-1", lotNumber: "LOT-260115-001", quantity: 35, reservedQty: 20, expireDate: "2027-01-15", manufacturedDate: "2025-07-01", supplierLotNo: "BASF-VC-25042", unitCost: 2750, sourceType: "buy_in", status: "available", lotCategory: "opened", parentLotId: "lot-orig-1", createdAt: "2026-01-15" },
  { id: "lot-3", stockCardId: "sc-1", lotNumber: "LOT-251201-001", quantity: 0, reservedQty: 0, expireDate: "2026-06-01", manufacturedDate: "2025-06-01", supplierLotNo: "BASF-VC-25030", unitCost: 2700, sourceType: "buy_in", status: "exhausted", lotCategory: "opened", createdAt: "2025-12-01" },
  { id: "lot-4", stockCardId: "sc-2", lotNumber: "LOT-260115-003", quantity: 3, reservedQty: 2, expireDate: "2026-04-15", manufacturedDate: "2025-10-01", supplierLotNo: "CONT-HA-25018", unitCost: 12500, sourceType: "buy_in", status: "available", lotCategory: "opened", notes: "Expiring soon", createdAt: "2026-01-15" },
  { id: "lot-5", stockCardId: "sc-2", lotNumber: "LOT-260220-001", quantity: 5, reservedQty: 3, expireDate: "2027-02-20", manufacturedDate: "2026-02-01", supplierLotNo: "CONT-HA-26003", unitCost: 12500, sourceType: "buy_in", status: "available", lotCategory: "sealed", createdAt: "2026-02-20" },
]

export const mockReservations: StockReservation[] = [
  { id: "res-1", stockCardId: "sc-1", jobOrderId: "jo-1", jobNo: "JO-2603-001", reservedQuantity: 15, status: "active", reservedAt: "2026-03-01" },
  { id: "res-2", stockCardId: "sc-1", jobOrderId: "jo-2", jobNo: "JO-2603-002", reservedQuantity: 15, status: "active", reservedAt: "2026-03-02" },
  { id: "res-3", stockCardId: "sc-2", jobOrderId: "jo-1", jobNo: "JO-2603-001", reservedQuantity: 3, status: "active", reservedAt: "2026-03-01" },
  { id: "res-4", stockCardId: "sc-2", jobOrderId: "jo-3", jobNo: "JO-2602-008", reservedQuantity: 2, status: "consumed", reservedAt: "2026-02-15", releasedAt: "2026-02-28" },
]

export const mockLinkedProducts: LinkedProduct[] = [
  { entityType: "formula", entityId: "fml-1", code: "FML-260115-001", name: "GlowUp Vitamin C Serum", componentType: "Active", quantity: 15, unit: "%" },
  { entityType: "formula", entityId: "fml-2", code: "FML-260120-002", name: "BrightSkin Tone-Up Cream", componentType: "Active", quantity: 5, unit: "%" },
  { entityType: "product", entityId: "prod-1", code: "PRD-001", name: "GlowUp Vitamin C Serum 30ml", componentType: "BOM", quantity: 4.5, unit: "g" },
]

export const mockAlerts: StockAlert[] = [
  { id: "alert-1", stockCardId: "sc-4", itemCode: "RM-004", itemName: "Titanium Dioxide", alertType: "out_of_stock", thresholdValue: 10, currentValue: 0, isResolved: false, createdAt: "2026-02-28" },
  { id: "alert-2", stockCardId: "sc-2", itemCode: "RM-002", itemName: "Hyaluronic Acid", alertType: "low_stock", thresholdValue: 10, currentValue: 8, isResolved: false, createdAt: "2026-02-27" },
  { id: "alert-3", stockCardId: "sc-8", itemCode: "RM-006", itemName: "Retinol 0.5%", alertType: "reorder", thresholdValue: 8, currentValue: 3.5, isResolved: false, createdAt: "2026-02-26" },
  { id: "alert-4", stockCardId: "sc-5", itemCode: "RM-005", itemName: "Glycerin", alertType: "over_stock", thresholdValue: 300, currentValue: 450, isResolved: false, createdAt: "2026-02-25" },
]

export const mockStmDocuments: StmDocument[] = [
  { id: "stm-1", docNumber: "STM-260301-001", docType: "requisition", sourceType: "job_order", jobOrderId: "jo-1", status: "approved", itemCount: 8, createdBy: "Admin", createdAt: "2026-03-01" },
  { id: "stm-2", docNumber: "STM-260228-001", docType: "receive", sourceType: "manual", status: "pending", notes: "PO-2602-042 partial receive", itemCount: 3, createdBy: "Staff A", createdAt: "2026-02-28" },
  { id: "stm-3", docNumber: "STM-260227-001", docType: "requisition", sourceType: "job_order", jobOrderId: "jo-2", status: "draft", itemCount: 12, createdBy: "Staff B", createdAt: "2026-02-27" },
]
