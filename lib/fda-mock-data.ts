import type {
  FdaListItem, FdaKPISummary, FdaRegistration,
  FdaIngredient, FdaManufacturingStep, FdaRawMaterialSpec,
  FdaDocument, FdaChecklistItem, FdaAuditLog,
} from "./fda-types"

// KPI Summary
export const mockFdaKPI: FdaKPISummary = {
  total: 155,
  totalJk: 120,
  totalJr: 35,
  approved: 124,
  draft: 15,
  submitted: 8,
  rejected: 2,
  expired: 3,
  expiring30: 2,
  expiring60: 5,
  expiring90: 9,
}

// List Items -- matching screenshot design
export const mockFdaList: FdaListItem[] = [
  { id: "fda-1", registrationCode: "FDA-260115-001", registrationType: "jk", registrationNumber: "10-1-67-00234", productNameTh: "เซรั่มวิตามินซี ไบร์ทเทนนิ่ง 15%", productNameEn: "GlowUp Vitamin C Serum", tradeName: "GlowUp", cosmeticType: "Serum", status: "approved", expiryDate: "2028-01-20", daysUntilExpiry: 698, customerName: "Glow Lab Co., Ltd.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 12, serviceFee: 3500, createdAt: "2026-01-15" },
  { id: "fda-2", registrationCode: "FDA-260120-002", registrationType: "jk", registrationNumber: "10-1-65-00087", productNameTh: "ครีมกันแดด UV Shield SPF50 PA+++", productNameEn: "SoftTouch UV Shield", tradeName: "SoftTouch", cosmeticType: "Sunscreen", status: "approved", expiryDate: "2026-03-07", daysUntilExpiry: 15, customerName: "SkinSoft Co., Ltd.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 18, serviceFee: 5000, createdAt: "2026-01-20" },
  { id: "fda-3", registrationCode: "FDA-260201-003", registrationType: "jk", productNameTh: "ไฮยาลูรอนิค แอซิด โทนเนอร์", productNameEn: "NatuGlow HA Toner", tradeName: "NatuGlow", cosmeticType: "Toner", status: "submitted", submittedDate: "2026-02-20", customerName: "NatuBeauty", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 8, serviceFee: 3500, createdAt: "2026-02-01" },
  { id: "fda-4", registrationCode: "FDA-260205-004", registrationType: "jk", productNameTh: "สลีปปิ้งมาส์ก โกลว์ โอเวอร์ไนท์", productNameEn: "K-Glow Sleeping Mask", tradeName: "K-Glow", cosmeticType: "Mask", status: "draft", customerName: "BeautyKing Trading", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 10, serviceFee: 3500, createdAt: "2026-02-05" },
  { id: "fda-5", registrationCode: "FDA-260210-005", registrationType: "jr", registrationNumber: "76-2-63-00012", productNameTh: "โลชั่นบำรุงผิว มอยส์เจอร์ พลัส", productNameEn: "ClearSkin Moisture Lotion", tradeName: "ClearSkin", cosmeticType: "Lotion", status: "expired", expiryDate: "2026-01-15", customerName: "PureMind Co., Ltd.", manufacturerName: "CosmeZen Factory", renewalCount: 1, ingredientCount: 14, serviceFee: 2000, createdAt: "2023-02-10" },
  { id: "fda-6", registrationCode: "FDA-260215-006", registrationType: "jk", productNameTh: "อาย ครีม แอนตี้ริ้วรอย", productNameEn: "LuxeGlow Eye Cream", tradeName: "LuxeGlow", cosmeticType: "Eye Cream", status: "rejected", customerName: "LuxeSkin Intl.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 9, serviceFee: 3500, createdAt: "2026-02-15" },
  { id: "fda-7", registrationCode: "FDA-260220-007", registrationType: "jk", registrationNumber: "10-1-66-00456", productNameTh: "เจลล้างหน้า Tea Tree", productNameEn: "PureSkin Cleansing Gel", tradeName: "PureSkin", cosmeticType: "Cleanser", status: "approved", expiryDate: "2029-03-20", daysUntilExpiry: 1113, customerName: "PureSkin Brand", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 11, serviceFee: 3500, createdAt: "2026-02-20" },
  { id: "fda-8", registrationCode: "FDA-260225-008", registrationType: "jk", productNameTh: "แชมพูลดผมร่วง บิโอติน", productNameEn: "Biotin Anti Hair Loss Shampoo", tradeName: "HairPro", cosmeticType: "Shampoo", status: "draft", customerName: "HairPro Inc.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 13, serviceFee: 3500, createdAt: "2026-02-25" },
  { id: "fda-9", registrationCode: "FDA-260228-009", registrationType: "jr", productNameTh: "เซรั่มไนอาซินาไมด์ 10%", productNameEn: "Niacinamide 10% Serum", tradeName: "GlowLab", cosmeticType: "Serum", status: "submitted", submittedDate: "2026-03-01", customerName: "Glow Lab Co., Ltd.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 7, serviceFee: 5000, createdAt: "2026-02-28" },
  { id: "fda-10", registrationCode: "FDA-260301-010", registrationType: "jk", productNameTh: "มาส์กหน้า คอลลาเจนทอง", productNameEn: "Gold Collagen Sheet Mask", tradeName: "LuxSkin", cosmeticType: "Mask", status: "draft", customerName: "LuxSkin Co.", manufacturerName: "CosmeZen Factory", renewalCount: 0, ingredientCount: 6, serviceFee: 3500, createdAt: "2026-03-01" },
]

// Detail registration (full)
export const mockFdaDetail: FdaRegistration = {
  id: "fda-1",
  registrationCode: "FDA-260115-001",
  registrationType: "jk",
  registrationNumber: "10-1-6800012345",
  licenseNumber: "ผ.12345/2569",
  productNameTh: "เซรั่มวิตามินซี 15% ไบร์ทเทนนิ่ง",
  productNameEn: "Vitamin C 15% Brightening Serum",
  fdaProductName: "เซรั่มบำรุงผิวหน้า (วิตามินซี)",
  tradeName: "GlowLab",
  tradeNameEn: "GlowLab",
  cosmeticType: "Serum",
  cosmeticForm: "Liquid",
  usageFormat: "Leave-on",
  applicationArea: "Face",
  productPurpose: "Brightening, Anti-oxidant, Dark spot reduction",
  containerType: "Glass dropper bottle",
  productForm: "Clear yellow liquid",
  usageInstructions: "Apply 3-4 drops to clean face morning and evening. Follow with moisturizer.",
  warnings: "For external use only. Avoid contact with eyes. Use sunscreen during daytime.",
  registrationDate: "2026-01-15",
  submittedDate: "2026-01-10",
  expiryDate: "2029-01-15",
  renewalCount: 0,
  manufacturerName: "CosmeZen Factory Co., Ltd.",
  manufacturerAddress: "99/1 Moo 5, Bangplee Industrial Estate, Samut Prakan 10540",
  manufacturerLicense: "ส.12345/2568",
  importerName: "Glow Lab Co., Ltd.",
  importerAddress: "123 Sukhumvit Rd., Klongtoey, Bangkok 10110",
  formulaId: "formula-vc15",
  customerId: "cust-glowlab",
  customerName: "Glow Lab Co., Ltd.",
  status: "approved",
  approvalComment: "Approved without conditions",
  serviceFee: 15000,
  feeNotes: "Standard JK notification fee",
  notes: "Priority customer - expedited processing",
  createdAt: "2026-01-08",
  updatedAt: "2026-01-15",
}

// PIF Ingredients
export const mockFdaIngredients: FdaIngredient[] = [
  { id: "ing-1", registrationId: "fda-1", ingredientName: "Aqua (Water)", inciName: "Aqua", percentage: 65.5, function: "Solvent", sortOrder: 1, isRestricted: false },
  { id: "ing-2", registrationId: "fda-1", ingredientName: "L-Ascorbic Acid", inciName: "Ascorbic Acid", casNumber: "50-81-7", percentage: 15, function: "Antioxidant / Brightening", supplier: "BASF", sortOrder: 2, isRestricted: false },
  { id: "ing-3", registrationId: "fda-1", ingredientName: "Propylene Glycol", inciName: "Propylene Glycol", casNumber: "57-55-6", percentage: 5, function: "Humectant", supplier: "Dow Chemical", sortOrder: 3, isRestricted: false },
  { id: "ing-4", registrationId: "fda-1", ingredientName: "Niacinamide", inciName: "Niacinamide", casNumber: "98-92-0", percentage: 2, function: "Skin conditioning", supplier: "Lonza", sortOrder: 4, isRestricted: false },
  { id: "ing-5", registrationId: "fda-1", ingredientName: "Sodium Hyaluronate", inciName: "Sodium Hyaluronate", casNumber: "9067-32-7", percentage: 1, function: "Moisturizing", supplier: "Bloomage", sortOrder: 5, isRestricted: false },
  { id: "ing-6", registrationId: "fda-1", ingredientName: "Phenoxyethanol", inciName: "Phenoxyethanol", casNumber: "122-99-6", percentage: 0.8, function: "Preservative", supplier: "Ashland", sortOrder: 6, isRestricted: true, maxAllowedPercentage: 1.0, restrictions: "Max 1% in finished product" },
  { id: "ing-7", registrationId: "fda-1", ingredientName: "Ethylhexylglycerin", inciName: "Ethylhexylglycerin", casNumber: "70445-33-9", percentage: 0.5, function: "Preservative booster", sortOrder: 7, isRestricted: false },
  { id: "ing-8", registrationId: "fda-1", ingredientName: "Citric Acid", inciName: "Citric Acid", casNumber: "77-92-9", percentageMin: 0.01, percentageMax: 0.1, function: "pH adjuster", sortOrder: 8, isRestricted: false },
]

// Manufacturing Steps
export const mockFdaManufacturingSteps: FdaManufacturingStep[] = [
  { id: "step-1", registrationId: "fda-1", stepNumber: 1, stepName: "Water Phase Preparation", description: "Heat purified water to 70-75C. Add water-soluble ingredients.", equipment: "Jacketed Vessel 500L", temperatureRange: "70-75C", timeDuration: "20 min", criticalParameters: "Temperature must reach 70C before adding ingredients" },
  { id: "step-2", registrationId: "fda-1", stepNumber: 2, stepName: "Active Ingredient Addition", description: "Cool to 40C. Add Vitamin C (L-Ascorbic Acid) and Niacinamide slowly with stirring.", equipment: "Homogenizer", temperatureRange: "38-42C", rpmRange: "1500-2000", timeDuration: "15 min", criticalParameters: "Vitamin C degrades above 45C" },
  { id: "step-3", registrationId: "fda-1", stepNumber: 3, stepName: "pH Adjustment", description: "Adjust pH to 3.2-3.8 using citric acid solution.", equipment: "pH Meter + Stirrer", temperatureRange: "35-40C", timeDuration: "10 min", qualityChecks: "pH reading 3.2-3.8" },
  { id: "step-4", registrationId: "fda-1", stepNumber: 4, stepName: "Final Mixing & Cooling", description: "Mix at low speed to room temperature. Add preservative system.", equipment: "Mixing Tank", temperatureRange: "25-30C", rpmRange: "500-800", timeDuration: "30 min" },
  { id: "step-5", registrationId: "fda-1", stepNumber: 5, stepName: "QC Sampling & Filling", description: "Take QC sample. Transfer to filling machine. Fill into 30ml dropper bottles.", equipment: "Filling Machine FM-200", timeDuration: "Varies", qualityChecks: "Appearance, pH, viscosity, fill volume check" },
]

// Raw Material Specs
export const mockFdaRawMaterialSpecs: FdaRawMaterialSpec[] = [
  { id: "rms-1", registrationId: "fda-1", materialName: "L-Ascorbic Acid (Vitamin C)", specification: "USP Grade, Purity >= 99.5%", testMethod: "HPLC", acceptanceCriteria: "Assay 99.5-101.0%", supplier: "BASF" },
  { id: "rms-2", registrationId: "fda-1", materialName: "Niacinamide", specification: "USP Grade, Purity >= 99%", testMethod: "HPLC", acceptanceCriteria: "Assay 99.0-101.0%", supplier: "Lonza" },
  { id: "rms-3", registrationId: "fda-1", materialName: "Sodium Hyaluronate", specification: "Food Grade, MW 800-1200 kDa", testMethod: "SEC-MALS", acceptanceCriteria: "MW within range", supplier: "Bloomage" },
  { id: "rms-4", registrationId: "fda-1", materialName: "Phenoxyethanol", specification: "Cosmetic Grade, Purity >= 99%", testMethod: "GC", acceptanceCriteria: "Assay >= 99%", supplier: "Ashland" },
]

// Documents
export const mockFdaDocuments: FdaDocument[] = [
  { id: "doc-1", registrationId: "fda-1", documentType: "formula_sheet", fileName: "VC15_formula_v3.pdf", fileSize: 245000, title: "Formula Sheet v3", createdAt: "2026-01-08" },
  { id: "doc-2", registrationId: "fda-1", documentType: "coa", fileName: "VC15_COA_lot260201.pdf", fileSize: 180000, title: "COA - Lot PLT-260201-001", createdAt: "2026-02-05" },
  { id: "doc-3", registrationId: "fda-1", documentType: "msds", fileName: "Ascorbic_Acid_MSDS.pdf", fileSize: 420000, title: "MSDS - L-Ascorbic Acid", createdAt: "2026-01-08" },
  { id: "doc-4", registrationId: "fda-1", documentType: "label_artwork", fileName: "GlowLab_VC15_label_final.ai", fileSize: 3200000, title: "Label Artwork - Final", createdAt: "2026-01-12" },
  { id: "doc-5", registrationId: "fda-1", documentType: "factory_license", fileName: "CosmeZen_factory_license.pdf", fileSize: 560000, title: "Factory License", createdAt: "2025-06-15" },
  { id: "doc-6", registrationId: "fda-1", documentType: "test_report", fileName: "stability_test_6month.pdf", fileSize: 890000, title: "Stability Test Report (6 months)", createdAt: "2025-12-20" },
]

// Checklist
export const mockFdaChecklist: FdaChecklistItem[] = [
  { id: "cl-1", registrationId: "fda-1", checklistKey: "product_name_confirmed", isCompleted: true, completedAt: "2026-01-09", completedBy: "Admin" },
  { id: "cl-2", registrationId: "fda-1", checklistKey: "formula_linked", isCompleted: true, completedAt: "2026-01-09", completedBy: "Admin" },
  { id: "cl-3", registrationId: "fda-1", checklistKey: "ingredient_list_complete", isCompleted: true, completedAt: "2026-01-10", completedBy: "Regulatory Staff" },
  { id: "cl-4", registrationId: "fda-1", checklistKey: "manufacturing_steps_documented", isCompleted: true, completedAt: "2026-01-10", completedBy: "Production Manager" },
  { id: "cl-5", registrationId: "fda-1", checklistKey: "raw_material_specs_attached", isCompleted: true, completedAt: "2026-01-10", completedBy: "QC Staff" },
  { id: "cl-6", registrationId: "fda-1", checklistKey: "msds_uploaded", isCompleted: true, completedAt: "2026-01-08", completedBy: "Admin" },
  { id: "cl-7", registrationId: "fda-1", checklistKey: "coa_uploaded", isCompleted: true, completedAt: "2026-02-05", completedBy: "QC Staff" },
  { id: "cl-8", registrationId: "fda-1", checklistKey: "label_artwork_uploaded", isCompleted: true, completedAt: "2026-01-12", completedBy: "Design" },
  { id: "cl-9", registrationId: "fda-1", checklistKey: "manufacturer_license_valid", isCompleted: true, completedAt: "2026-01-09", completedBy: "Admin" },
  { id: "cl-10", registrationId: "fda-1", checklistKey: "fee_paid", isCompleted: true, completedAt: "2026-01-11", completedBy: "Accounting" },
  { id: "cl-11", registrationId: "fda-1", checklistKey: "internal_review_done", isCompleted: true, completedAt: "2026-01-12", completedBy: "Leader" },
  { id: "cl-12", registrationId: "fda-1", checklistKey: "ready_for_submission", isCompleted: true, completedAt: "2026-01-12", completedBy: "Leader" },
]

// Audit Log
export const mockFdaAudit: FdaAuditLog[] = [
  { id: "al-1", registrationId: "fda-1", action: "created", fieldName: "registration", newValue: "FDA-260115-001", userName: "Admin", createdAt: "2026-01-08 09:00" },
  { id: "al-2", registrationId: "fda-1", action: "updated", fieldName: "product_name_th", oldValue: "เซรั่มวิตามินซี ไบร์ทเทนนิ่ง", newValue: "เซรั่มวิตามินซี 15% ไบร์ทเทนนิ่ง", userName: "Regulatory Staff", createdAt: "2026-01-09 10:30" },
  { id: "al-3", registrationId: "fda-1", action: "updated", fieldName: "manufacturer_name", oldValue: "CosmeZen Co., Ltd.", newValue: "CosmeZen Factory Co., Ltd.", userName: "Admin", createdAt: "2026-01-09 11:00" },
  { id: "al-4", registrationId: "fda-1", action: "status_changed", fieldName: "status", oldValue: "draft", newValue: "submitted", userName: "Admin", comment: "All checklist items complete", createdAt: "2026-01-10 14:00" },
  { id: "al-5", registrationId: "fda-1", action: "status_changed", fieldName: "status", oldValue: "submitted", newValue: "approved", userName: "Leader", comment: "Approved without conditions", createdAt: "2026-01-15 09:00" },
  { id: "al-6", registrationId: "fda-1", action: "ingredient_added", fieldName: "ingredients", newValue: "Added 8 ingredients from formula", userName: "Admin", createdAt: "2026-01-09 14:30" },
  { id: "al-7", registrationId: "fda-1", action: "document_uploaded", fieldName: "documents", newValue: "VC15_formula_v3.pdf", userName: "Admin", createdAt: "2026-01-08 10:00" },
]
