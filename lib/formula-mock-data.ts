import type {
  Formula,
  FormulaKPISummary,
  FormulaIngredient,
  FormulaPhase,
  FormulaProcessingStep,
  FormulaQcSpec,
  FormulaVersion,
  FormulaCostHistory,
  FormulaDocument,
  FormulaTrialBatch,
  FormulaApprovalStep,
  FormulaStabilityTest,
} from "./formula-types"

export const mockFormulaKPI: FormulaKPISummary = {
  total: 42,
  draft: 12,
  approved: 8,
  active: 18,
  archived: 3,
  discontinued: 1,
}

export const mockFormulaList: Formula[] = [
  { id: "fml-1", formulaCode: "FML-260115-001", formulaName: "เซรั่มวิตามินซี 15% ไบร์ทเทนนิ่ง", formulaNameEn: "Vitamin C 15% Brightening Serum", formulaType: "master", status: "active", productType: "Skincare", cosmeticForm: "Serum", batchSize: 100, batchUnit: "kg", density: 1.02, shelfLifeMonths: 24, ingredientCount: 12, totalCost: 18500, costPerUnit: 185, estimatedCostPerKg: 185, version: 3, versionString: "v3.0", createdAt: "2026-01-15", notes: "Flagship serum formula" },
  { id: "fml-2", formulaCode: "FML-260120-002", formulaName: "ครีมกันแดด SPF50 PA+++", formulaNameEn: "UV Shield SPF50 PA+++ Cream", formulaType: "master", status: "active", productType: "Skincare", cosmeticForm: "Cream", batchSize: 200, batchUnit: "kg", density: 1.05, shelfLifeMonths: 18, ingredientCount: 18, totalCost: 52000, costPerUnit: 260, estimatedCostPerKg: 260, version: 2, versionString: "v2.1", createdAt: "2026-01-20" },
  { id: "fml-3", formulaCode: "FML-260201-003", formulaName: "ไฮยาลูรอนิค แอซิด โทนเนอร์", formulaNameEn: "Hyaluronic Acid Toner", formulaType: "master", status: "approved", productType: "Skincare", cosmeticForm: "Toner", batchSize: 150, batchUnit: "kg", ingredientCount: 8, version: 1, versionString: "v1.0", createdAt: "2026-02-01" },
  { id: "fml-4", formulaCode: "FML-260205-004", formulaName: "สลีปปิ้งมาส์ก โกลว์ โอเวอร์ไนท์", formulaNameEn: "K-Glow Sleeping Mask", formulaType: "master", status: "draft", productType: "Skincare", cosmeticForm: "Gel", batchSize: 100, batchUnit: "kg", ingredientCount: 10, version: 1, createdAt: "2026-02-05" },
  { id: "fml-5", formulaCode: "FML-260210-005", formulaName: "โลชั่นบำรุงผิว มอยส์เจอร์ พลัส", formulaNameEn: "Moisture Plus Body Lotion", formulaType: "master", status: "active", productType: "Body Care", cosmeticForm: "Lotion", batchSize: 500, batchUnit: "kg", density: 0.98, shelfLifeMonths: 30, ingredientCount: 14, totalCost: 85000, costPerUnit: 170, version: 4, versionString: "v4.0", createdAt: "2026-02-10" },
  { id: "fml-6", formulaCode: "FML-260215-006", formulaName: "อาย ครีม แอนตี้ริ้วรอย", formulaNameEn: "Anti-Wrinkle Eye Cream", formulaType: "variation", status: "draft", productType: "Skincare", cosmeticForm: "Cream", batchSize: 50, batchUnit: "kg", ingredientCount: 15, version: 1, parentFormulaId: "fml-2", createdAt: "2026-02-15" },
  { id: "fml-7", formulaCode: "FML-260220-007", formulaName: "เจลล้างหน้า Tea Tree", formulaNameEn: "Tea Tree Cleansing Gel", formulaType: "master", status: "active", productType: "Skincare", cosmeticForm: "Gel", batchSize: 200, batchUnit: "kg", density: 1.01, shelfLifeMonths: 24, ingredientCount: 11, totalCost: 32000, costPerUnit: 160, version: 2, versionString: "v2.0", createdAt: "2026-02-20" },
  { id: "fml-8", formulaCode: "FML-260225-008", formulaName: "แชมพูลดผมร่วง บิโอติน", formulaNameEn: "Biotin Anti Hair Loss Shampoo", formulaType: "master", status: "draft", productType: "Hair Care", cosmeticForm: "Liquid", batchSize: 300, batchUnit: "kg", ingredientCount: 13, version: 1, createdAt: "2026-02-25" },
  { id: "fml-9", formulaCode: "FML-260228-009", formulaName: "ลิปบาล์ม มอยส์เจอร์ SPF15", formulaNameEn: "Moisture Lip Balm SPF15", formulaType: "master", status: "approved", productType: "Lip Care", cosmeticForm: "Balm", batchSize: 20, batchUnit: "kg", ingredientCount: 9, version: 1, versionString: "v1.0", createdAt: "2026-02-28" },
  { id: "fml-10", formulaCode: "FML-260301-010", formulaName: "เซรั่มไนอาซินาไมด์ 10%", formulaNameEn: "Niacinamide 10% Serum", formulaType: "variation", status: "archived", productType: "Skincare", cosmeticForm: "Serum", batchSize: 100, batchUnit: "kg", ingredientCount: 7, version: 2, versionString: "v2.0", parentFormulaId: "fml-1", createdAt: "2024-03-01" },
]

// ---- Detail mock data for FML-260115-001 ----
export const mockFormulaIngredients: FormulaIngredient[] = [
  { id: "ing-1", formulaId: "fml-1", ingredientName: "Purified Water", inciName: "Aqua", phase: "A", percentage: 65.5, function: "Solvent", sortOrder: 1 },
  { id: "ing-2", formulaId: "fml-1", ingredientName: "Glycerin", inciName: "Glycerin", phase: "A", percentage: 5.0, function: "Humectant", sortOrder: 2 },
  { id: "ing-3", formulaId: "fml-1", ingredientName: "Butylene Glycol", inciName: "Butylene Glycol", phase: "A", percentage: 3.0, function: "Humectant / Solvent", sortOrder: 3 },
  { id: "ing-4", formulaId: "fml-1", ingredientName: "Ascorbic Acid", inciName: "Ascorbic Acid", phase: "C", percentage: 15.0, function: "Active - Antioxidant", sortOrder: 4, unitCost: 850 },
  { id: "ing-5", formulaId: "fml-1", ingredientName: "Cetearyl Olivate", inciName: "Cetearyl Olivate", phase: "B", percentage: 3.5, function: "Emulsifier", sortOrder: 5 },
  { id: "ing-6", formulaId: "fml-1", ingredientName: "Sorbitan Olivate", inciName: "Sorbitan Olivate", phase: "B", percentage: 2.0, function: "Co-Emulsifier", sortOrder: 6 },
  { id: "ing-7", formulaId: "fml-1", ingredientName: "Niacinamide", inciName: "Niacinamide", phase: "C", percentage: 2.0, function: "Active - Brightening", sortOrder: 7, unitCost: 420 },
  { id: "ing-8", formulaId: "fml-1", ingredientName: "Tocopheryl Acetate", inciName: "Tocopheryl Acetate", phase: "B", percentage: 1.0, function: "Antioxidant", sortOrder: 8 },
  { id: "ing-9", formulaId: "fml-1", ingredientName: "Xanthan Gum", inciName: "Xanthan Gum", phase: "A", percentage: 0.3, function: "Thickener", sortOrder: 9 },
  { id: "ing-10", formulaId: "fml-1", ingredientName: "Phenoxyethanol", inciName: "Phenoxyethanol", phase: "D", percentage: 0.8, function: "Preservative", sortOrder: 10 },
  { id: "ing-11", formulaId: "fml-1", ingredientName: "Ethylhexylglycerin", inciName: "Ethylhexylglycerin", phase: "D", percentage: 0.5, function: "Preservative Booster", sortOrder: 11 },
  { id: "ing-12", formulaId: "fml-1", ingredientName: "Citric Acid", inciName: "Citric Acid", phase: "A", percentage: 1.4, function: "pH Adjuster", sortOrder: 12 },
]

export const mockFormulaPhases: FormulaPhase[] = [
  { id: "phase-1", formulaId: "fml-1", phaseKey: "A", phaseName: "Water Phase", sortOrder: 1, stepsCount: 3 },
  { id: "phase-2", formulaId: "fml-1", phaseKey: "B", phaseName: "Oil Phase", sortOrder: 2, stepsCount: 2 },
  { id: "phase-3", formulaId: "fml-1", phaseKey: "C", phaseName: "Active Phase", sortOrder: 3, stepsCount: 2 },
  { id: "phase-4", formulaId: "fml-1", phaseKey: "D", phaseName: "Preservation & Adjust", sortOrder: 4, stepsCount: 2 },
]

export const mockFormulaSteps: FormulaProcessingStep[] = [
  { id: "step-1", formulaId: "fml-1", phase: "A", stepNumber: 1, instruction: "Weigh purified water into main vessel", durationMinutes: 5, equipment: "Main Vessel 500L" },
  { id: "step-2", formulaId: "fml-1", phase: "A", stepNumber: 2, instruction: "Add Glycerin and Butylene Glycol to water, stir at low speed", temperatureMin: 25, temperatureMax: 30, durationMinutes: 10, speedRpm: 200, equipment: "Anchor Stirrer" },
  { id: "step-3", formulaId: "fml-1", phase: "A", stepNumber: 3, instruction: "Dissolve Xanthan Gum and Citric Acid slowly while stirring", durationMinutes: 15, speedRpm: 400, equipment: "High-Shear Mixer" },
  { id: "step-4", formulaId: "fml-1", phase: "B", stepNumber: 1, instruction: "Melt Cetearyl Olivate and Sorbitan Olivate at 70-75\u00b0C", temperatureMin: 70, temperatureMax: 75, durationMinutes: 20, equipment: "Oil Melting Vessel" },
  { id: "step-5", formulaId: "fml-1", phase: "B", stepNumber: 2, instruction: "Add Tocopheryl Acetate to oil phase, stir gently", durationMinutes: 5, speedRpm: 150 },
  { id: "step-6", formulaId: "fml-1", phase: "C", stepNumber: 1, instruction: "Cool batch to 40\u00b0C, add Ascorbic Acid slowly under nitrogen blanket", temperatureMin: 38, temperatureMax: 42, durationMinutes: 15, speedRpm: 300, notes: "Critical: maintain nitrogen atmosphere to prevent oxidation" },
  { id: "step-7", formulaId: "fml-1", phase: "C", stepNumber: 2, instruction: "Add Niacinamide, mix until fully dissolved", durationMinutes: 10, speedRpm: 300 },
  { id: "step-8", formulaId: "fml-1", phase: "D", stepNumber: 1, instruction: "Add Phenoxyethanol and Ethylhexylglycerin at 35\u00b0C", temperatureMin: 33, temperatureMax: 37, durationMinutes: 10, speedRpm: 200 },
  { id: "step-9", formulaId: "fml-1", phase: "D", stepNumber: 2, instruction: "Adjust pH to 3.0-3.5 with Citric Acid if needed, final QC check", durationMinutes: 15, notes: "Target pH: 3.0-3.5" },
]

export const mockFormulaQcSpecs: FormulaQcSpec[] = [
  { id: "qc-1", formulaId: "fml-1", parameterName: "pH", unit: "-", targetValue: "3.2", minValue: 3.0, maxValue: 3.5, testMethod: "pH Meter", sortOrder: 1 },
  { id: "qc-2", formulaId: "fml-1", parameterName: "Viscosity", unit: "cps", targetValue: "8000", minValue: 6000, maxValue: 10000, testMethod: "Brookfield RV", sortOrder: 2 },
  { id: "qc-3", formulaId: "fml-1", parameterName: "Specific Gravity", unit: "g/mL", targetValue: "1.02", minValue: 1.00, maxValue: 1.04, testMethod: "Pycnometer", sortOrder: 3 },
  { id: "qc-4", formulaId: "fml-1", parameterName: "Appearance", targetValue: "Clear to slightly opalescent liquid", testMethod: "Visual", sortOrder: 4 },
  { id: "qc-5", formulaId: "fml-1", parameterName: "Color", targetValue: "Light yellow", testMethod: "Visual / Lovibond", sortOrder: 5 },
  { id: "qc-6", formulaId: "fml-1", parameterName: "Microbial Count", unit: "CFU/g", maxValue: 100, testMethod: "USP <61>", sortOrder: 6 },
]

export const mockFormulaVersions: FormulaVersion[] = [
  { id: "ver-3", formulaId: "fml-1", versionNumber: 3, changeDescription: "Adjusted pH range to 3.0-3.5, increased Vit C to 15%", createdAt: "2026-01-15", createdBy: "Admin" },
  { id: "ver-2", formulaId: "fml-1", versionNumber: 2, changeDescription: "Added Niacinamide 2%, reduced water phase", createdAt: "2025-11-20", createdBy: "R&D Lead" },
  { id: "ver-1", formulaId: "fml-1", versionNumber: 1, changeDescription: "Initial formulation", createdAt: "2025-09-01", createdBy: "R&D Lead" },
]

export const mockFormulaCostHistory: FormulaCostHistory[] = [
  { id: "ch-1", formulaId: "fml-1", totalCost: 18500, costPerUnit: 185, batchSize: 100, ingredientCount: 12, recordedAt: "2026-01-15", triggeredBy: "manual" },
  { id: "ch-2", formulaId: "fml-1", totalCost: 17200, costPerUnit: 172, batchSize: 100, ingredientCount: 11, recordedAt: "2025-11-20", triggeredBy: "manual" },
  { id: "ch-3", formulaId: "fml-1", totalCost: 15800, costPerUnit: 158, batchSize: 100, ingredientCount: 10, recordedAt: "2025-09-01", triggeredBy: "auto" },
]

export const mockFormulaDocuments: FormulaDocument[] = [
  { id: "doc-1", formulaId: "fml-1", documentType: "SDS", fileName: "VitaminC_SDS_2026.pdf", fileSize: 245000, mimeType: "application/pdf", title: "Ascorbic Acid SDS", createdAt: "2026-01-10", createdBy: "Admin" },
  { id: "doc-2", formulaId: "fml-1", documentType: "COA", fileName: "VitC_Serum_COA_Batch001.pdf", fileSize: 180000, mimeType: "application/pdf", title: "COA - Batch 001", createdAt: "2026-01-18", createdBy: "QC Lead" },
  { id: "doc-3", formulaId: "fml-1", documentType: "Stability", fileName: "stability_report_6months.xlsx", fileSize: 520000, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", title: "6-Month Stability Report", createdAt: "2025-12-01", createdBy: "R&D Lead" },
]

export const mockTrialBatches: FormulaTrialBatch[] = [
  { id: "tb-1", formulaId: "fml-1", trialCode: "TB-001", batchSize: 5, productionDate: "2025-08-15", operator: "Somchai P.", results: "pH 3.1, viscosity OK, stable at RT", feedbackStatus: "approved", customerFeedback: "Customer approved texture and efficacy", sortOrder: 1 },
  { id: "tb-2", formulaId: "fml-1", trialCode: "TB-002", batchSize: 10, productionDate: "2025-09-20", operator: "Nattaya S.", results: "pH 3.3, slight separation at 45C cycling", feedbackStatus: "revision", customerFeedback: "Requested better stability at high temp", sortOrder: 2 },
  { id: "tb-3", formulaId: "fml-1", trialCode: "TB-003", batchSize: 10, productionDate: "2025-10-10", operator: "Somchai P.", results: "All parameters passed, stable 3 months accelerated", feedbackStatus: "approved", sortOrder: 3 },
]

export const mockApprovalSteps: FormulaApprovalStep[] = [
  { id: "as-1", formulaId: "fml-1", stepNumber: 1, stepName: "R&D Review", stepSubtitle: "Formula composition check", approver: "Nattaya S.", approvalDate: "2025-10-15", status: "approved", comment: "All ingredients verified" },
  { id: "as-2", formulaId: "fml-1", stepNumber: 2, stepName: "QC Review", stepSubtitle: "QC specs validation", approver: "Wichai K.", approvalDate: "2025-10-20", status: "approved", comment: "QC specs complete" },
  { id: "as-3", formulaId: "fml-1", stepNumber: 3, stepName: "Regulatory Review", stepSubtitle: "Ingredient compliance", approver: "Pranee L.", approvalDate: "2025-11-01", status: "approved" },
  { id: "as-4", formulaId: "fml-1", stepNumber: 4, stepName: "Management Approval", stepSubtitle: "Final sign-off", approver: "Admin", approvalDate: "2025-11-05", status: "approved" },
]

export const mockStabilityTests: FormulaStabilityTest[] = [
  { id: "st-1", formulaId: "fml-1", testType: "Accelerated (45C)", parameter: "Appearance, pH, Viscosity", method: "ICH Q1A", duration: "3 months", result: "Pass", sortOrder: 1 },
  { id: "st-2", formulaId: "fml-1", testType: "Long-term (25C/60%RH)", parameter: "Appearance, pH, Viscosity, Micro", method: "ICH Q1A", duration: "12 months", result: "Pass", sortOrder: 2 },
  { id: "st-3", formulaId: "fml-1", testType: "Freeze-Thaw Cycling", parameter: "Phase separation, pH", method: "Internal SOP", duration: "6 cycles", result: "Pass", notes: "No separation observed", sortOrder: 3 },
]
