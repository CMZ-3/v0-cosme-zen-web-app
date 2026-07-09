/**
 * setup-sub-tables.mjs
 * Creates FDA sub-tables and Formula sub-tables, then seeds them
 * with realistic data derived from the existing fda_registrations and formulas rows.
 *
 * Run: node --env-file-if-exists=/vercel/share/.env.project scripts/setup-sub-tables.mjs
 */
import pg from "pg"

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ─── Helpers ────────────────────────────────────────────────────────────────
const uid = (prefix, ...parts) =>
  `${prefix}-${parts.join("-").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 20)}-${Math.random().toString(36).slice(2, 6)}`

async function q(sql, params = []) {
  return pool.query(sql, params)
}

// ─── CREATE TABLES ───────────────────────────────────────────────────────────
async function createTables() {
  await q(`
    CREATE TABLE IF NOT EXISTS fda_ingredients (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      "ingredientName" TEXT NOT NULL,
      "inciName" TEXT,
      "thaiName" TEXT,
      "casNumber" TEXT,
      percentage DOUBLE PRECISION,
      "percentageMin" DOUBLE PRECISION,
      "percentageMax" DOUBLE PRECISION,
      function TEXT,
      origin TEXT,
      supplier TEXT,
      "isRestricted" BOOLEAN NOT NULL DEFAULT false,
      "maxAllowedPercentage" DOUBLE PRECISION,
      restrictions TEXT,
      "restrictionNotes" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS fda_manufacturing_steps (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      "stepNumber" INTEGER NOT NULL,
      "stepName" TEXT NOT NULL,
      description TEXT,
      equipment TEXT,
      "temperatureRange" TEXT,
      "timeDuration" TEXT,
      "criticalParameters" TEXT,
      "qualityChecks" TEXT
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS fda_raw_material_specs (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      "materialName" TEXT NOT NULL,
      grade TEXT,
      supplier TEXT,
      "standardRef" TEXT,
      "appearanceSpec" TEXT,
      "phSpec" TEXT,
      "assaySpec" TEXT,
      "microSpec" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS fda_documents (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      "documentType" TEXT NOT NULL,
      "documentName" TEXT NOT NULL,
      "fileName" TEXT,
      "fileUrl" TEXT,
      "fileSize" INTEGER,
      "uploadedAt" TEXT,
      notes TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS fda_checklist (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      category TEXT NOT NULL,
      item TEXT NOT NULL,
      "isRequired" BOOLEAN NOT NULL DEFAULT true,
      "isCompleted" BOOLEAN NOT NULL DEFAULT false,
      notes TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS fda_audit_logs (
      id TEXT PRIMARY KEY,
      "registrationId" TEXT NOT NULL,
      action TEXT NOT NULL,
      "performedBy" TEXT NOT NULL DEFAULT 'system',
      note TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS formula_phases (
      id TEXT PRIMARY KEY,
      "formulaId" TEXT NOT NULL,
      "phaseKey" TEXT NOT NULL,
      "phaseName" TEXT NOT NULL,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS formula_processing_steps (
      id TEXT PRIMARY KEY,
      "formulaId" TEXT NOT NULL,
      phase TEXT NOT NULL,
      "stepNumber" INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      "temperatureMin" DOUBLE PRECISION,
      "temperatureMax" DOUBLE PRECISION,
      "durationMinutes" INTEGER,
      "speedRpm" INTEGER,
      equipment TEXT,
      notes TEXT
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS formula_qc_specs (
      id TEXT PRIMARY KEY,
      "formulaId" TEXT NOT NULL,
      "parameterName" TEXT NOT NULL,
      unit TEXT,
      "targetValue" TEXT,
      "minValue" DOUBLE PRECISION,
      "maxValue" DOUBLE PRECISION,
      "testMethod" TEXT,
      notes TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0
    )
  `)
  await q(`
    CREATE TABLE IF NOT EXISTS formula_versions (
      id TEXT PRIMARY KEY,
      "formulaId" TEXT NOT NULL,
      "versionNumber" INTEGER NOT NULL,
      "changeDescription" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "createdBy" TEXT
    )
  `)
  console.log("Tables created OK")
}

// ─── SEED FDA sub-tables ─────────────────────────────────────────────────────
const INGREDIENT_TEMPLATES = [
  { ingredientName: "Water (Aqua)", inciName: "Aqua", percentage: 70.0, function: "Solvent", origin: "Purified", isRestricted: false },
  { ingredientName: "Glycerin", inciName: "Glycerin", percentage: 5.0, function: "Humectant", origin: "Vegetable", isRestricted: false },
  { ingredientName: "Niacinamide", inciName: "Niacinamide", percentage: 5.0, function: "Skin Conditioning", origin: "Synthetic", isRestricted: false, casNumber: "98-92-0" },
  { ingredientName: "Hyaluronic Acid", inciName: "Sodium Hyaluronate", percentage: 2.0, function: "Humectant", origin: "Biotechnology", isRestricted: false },
  { ingredientName: "Vitamin C", inciName: "Ascorbic Acid", percentage: 15.0, function: "Antioxidant", origin: "Synthetic", isRestricted: false, casNumber: "50-81-7" },
  { ingredientName: "Carbomer", inciName: "Carbomer", percentage: 0.5, function: "Viscosity Agent", origin: "Synthetic", isRestricted: false },
  { ingredientName: "Phenoxyethanol", inciName: "Phenoxyethanol", percentage: 1.0, function: "Preservative", origin: "Synthetic", isRestricted: true, maxAllowedPercentage: 1.0, restrictions: "Max 1.0% (EU Annex V)" },
  { ingredientName: "Dimethicone", inciName: "Dimethicone", percentage: 3.0, function: "Emollient", origin: "Synthetic", isRestricted: false },
  { ingredientName: "Titanium Dioxide", inciName: "Titanium Dioxide", percentage: 8.0, function: "UV Filter", origin: "Mineral", isRestricted: false, casNumber: "13463-67-7" },
  { ingredientName: "Sodium Hydroxide", inciName: "Sodium Hydroxide", percentage: 0.1, function: "pH Adjuster", origin: "Synthetic", isRestricted: true, maxAllowedPercentage: null, restrictions: "pH adjustment only" },
  { ingredientName: "Tocopherol", inciName: "Tocopherol", percentage: 0.5, function: "Antioxidant", origin: "Vegetable", isRestricted: false },
  { ingredientName: "Fragrance", inciName: "Parfum", percentage: 0.3, function: "Fragrance", origin: "Synthetic/Natural", isRestricted: false },
]

const MANUFACTURING_STEPS_TEMPLATE = [
  { stepNumber: 1, stepName: "Phase A — Water Phase Preparation", description: "Weigh purified water into main vessel. Heat to 75–80°C with stirring.", equipment: "Stainless steel kettle 200L", temperatureRange: "75–80°C", timeDuration: "30 min", criticalParameters: "Temperature ±2°C", qualityChecks: "Confirm temp with calibrated thermometer" },
  { stepNumber: 2, stepName: "Phase A — Water-Soluble Addition", description: "Dissolve water-soluble actives (glycerin, hyaluronic acid) in heated water phase. Mix until clear.", equipment: "Overhead stirrer 300 RPM", timeDuration: "20 min", qualityChecks: "Visual check for clarity" },
  { stepNumber: 3, stepName: "Phase B — Oil Phase Preparation", description: "Melt waxes and oils in separate vessel at 75–80°C.", equipment: "Heating vessel 50L", temperatureRange: "75–80°C", timeDuration: "20 min", criticalParameters: "All waxes must be fully melted" },
  { stepNumber: 4, stepName: "Emulsification", description: "Add Phase B to Phase A slowly with high-shear mixing.", equipment: "Homogenizer 3000 RPM", temperatureRange: "70–75°C", timeDuration: "15 min", criticalParameters: "Maintain temperature during addition" },
  { stepNumber: 5, stepName: "Cooling Phase", description: "Cool batch to 40°C under slow stirring (300 RPM).", equipment: "Cooling jacket + paddle mixer", temperatureRange: "40°C", timeDuration: "45 min", qualityChecks: "pH check at 40°C" },
  { stepNumber: 6, stepName: "Phase C — Cold Additives", description: "Add heat-sensitive ingredients (preservatives, actives, fragrance) below 40°C.", equipment: "Paddle mixer", temperatureRange: "<40°C", timeDuration: "10 min" },
  { stepNumber: 7, stepName: "Final QC & pH Adjustment", description: "Check pH, viscosity, appearance. Adjust with citric acid or sodium hydroxide as required.", equipment: "pH meter, viscometer", qualityChecks: "pH 5.5–6.5, viscosity per specification, appearance clear/homogenous" },
]

const CHECKLIST_TEMPLATE = [
  { category: "Product Information", item: "ชื่อผลิตภัณฑ์ภาษาไทย (Thai product name)", isRequired: true },
  { category: "Product Information", item: "ชื่อผลิตภัณฑ์ภาษาอังกฤษ (English product name)", isRequired: true },
  { category: "Product Information", item: "ประเภทเครื่องสำอาง (Cosmetic type)", isRequired: true },
  { category: "Product Information", item: "รูปแบบผลิตภัณฑ์ (Product form)", isRequired: true },
  { category: "Manufacturer Info", item: "ใบอนุญาตผลิต (Manufacturing license)", isRequired: true },
  { category: "Manufacturer Info", item: "ที่อยู่โรงงาน (Factory address)", isRequired: true },
  { category: "Formula", item: "รายการส่วนผสม INCI (INCI ingredient list)", isRequired: true },
  { category: "Formula", item: "เปอร์เซ็นต์ส่วนผสม (Ingredient percentages)", isRequired: true },
  { category: "Formula", item: "ขั้นตอนการผลิต (Manufacturing steps)", isRequired: true },
  { category: "Safety", item: "Safety Assessment Report", isRequired: true },
  { category: "Safety", item: "Challenge test / Preservative efficacy test", isRequired: false },
  { category: "Documents", item: "COA วัตถุดิบหลัก (COA for key raw materials)", isRequired: true },
  { category: "Documents", item: "ตัวอย่างฉลาก (Label artwork)", isRequired: true },
  { category: "Documents", item: "รูปผลิตภัณฑ์ (Product image)", isRequired: true },
]

async function seedFdaSubTables() {
  const fdasRes = await q(`SELECT id, "registrationCode", status, "productNameTh" FROM fda_registrations`)
  const fdas = fdasRes.rows
  console.log(`Seeding FDA sub-tables for ${fdas.length} registrations...`)

  // Clear existing
  await q(`DELETE FROM fda_ingredients`)
  await q(`DELETE FROM fda_manufacturing_steps`)
  await q(`DELETE FROM fda_raw_material_specs`)
  await q(`DELETE FROM fda_documents`)
  await q(`DELETE FROM fda_checklist`)
  await q(`DELETE FROM fda_audit_logs`)

  for (const fda of fdas) {
    const rid = fda.id

    // ingredients (pick subset based on id hash for variety)
    const hash = rid.charCodeAt(rid.length - 1)
    const ingredientCount = 6 + (hash % 6)
    for (let i = 0; i < ingredientCount; i++) {
      const tmpl = INGREDIENT_TEMPLATES[i % INGREDIENT_TEMPLATES.length]
      await q(
        `INSERT INTO fda_ingredients (id,"registrationId","ingredientName","inciName","thaiName","casNumber",percentage,"percentageMin","percentageMax",function,origin,supplier,"isRestricted","maxAllowedPercentage",restrictions,"restrictionNotes","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          `fi-${rid}-${i}`, rid, tmpl.ingredientName, tmpl.inciName ?? null, null, tmpl.casNumber ?? null,
          tmpl.percentage, null, null, tmpl.function ?? null, tmpl.origin ?? null, "CosmeZen Supplier",
          tmpl.isRestricted, tmpl.maxAllowedPercentage ?? null, tmpl.restrictions ?? null, null, i,
        ]
      )
    }

    // manufacturing steps
    const stepCount = 4 + (hash % 4)
    for (let i = 0; i < stepCount; i++) {
      const tmpl = MANUFACTURING_STEPS_TEMPLATE[i % MANUFACTURING_STEPS_TEMPLATE.length]
      await q(
        `INSERT INTO fda_manufacturing_steps (id,"registrationId","stepNumber","stepName",description,equipment,"temperatureRange","timeDuration","criticalParameters","qualityChecks")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          `fms-${rid}-${i}`, rid, i + 1, tmpl.stepName, tmpl.description ?? null, tmpl.equipment ?? null,
          tmpl.temperatureRange ?? null, tmpl.timeDuration ?? null, tmpl.criticalParameters ?? null, tmpl.qualityChecks ?? null,
        ]
      )
    }

    // raw material specs (3 per FDA)
    const rawMats = [
      { materialName: "Purified Water", grade: "Purified (USP)", standardRef: "USP <1231>", appearanceSpec: "Clear, colorless", phSpec: "5.0–7.0", microSpec: "<100 CFU/mL" },
      { materialName: "Glycerin 99.5%", grade: "Cosmetic grade", standardRef: "BP/EP", appearanceSpec: "Clear viscous liquid", assaySpec: "≥99.5%" },
      { materialName: "Phenoxyethanol", grade: "Cosmetic grade", standardRef: "In-house", appearanceSpec: "Colorless liquid", assaySpec: "99.0–101.0%", microSpec: "Passes" },
    ]
    for (let i = 0; i < rawMats.length; i++) {
      const m = rawMats[i]
      await q(
        `INSERT INTO fda_raw_material_specs (id,"registrationId","materialName",grade,supplier,"standardRef","appearanceSpec","phSpec","assaySpec","microSpec","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [`frs-${rid}-${i}`, rid, m.materialName, m.grade ?? null, "CosmeZen Approved Supplier",
          m.standardRef ?? null, m.appearanceSpec ?? null, m.phSpec ?? null, m.assaySpec ?? null, m.microSpec ?? null, i]
      )
    }

    // documents
    const docTypes = fda.status === "approved"
      ? ["formula_sheet", "coa", "label_artwork", "test_report", "factory_license"]
      : ["formula_sheet", "label_artwork"]
    for (let i = 0; i < docTypes.length; i++) {
      const docType = docTypes[i]
      const names = {
        formula_sheet: "Formula Sheet (PIF Section 3)",
        coa: "Certificate of Analysis",
        label_artwork: "Label Artwork (Approved)",
        test_report: "Safety Assessment Report",
        factory_license: "GMP Manufacturing License",
      }
      await q(
        `INSERT INTO fda_documents (id,"registrationId","documentType","documentName","fileName","uploadedAt","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [`fd-${rid}-${i}`, rid, docType, names[docType] ?? docType, `${docType}_${fda.registrationCode}.pdf`,
          new Date(Date.now() - i * 86400000 * 3).toISOString().slice(0, 10), i]
      )
    }

    // checklist
    for (let i = 0; i < CHECKLIST_TEMPLATE.length; i++) {
      const c = CHECKLIST_TEMPLATE[i]
      const isCompleted = fda.status === "approved" || (fda.status === "submitted" && i < 8)
      await q(
        `INSERT INTO fda_checklist (id,"registrationId",category,item,"isRequired","isCompleted","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [`fc-${rid}-${i}`, rid, c.category, c.item, c.isRequired, isCompleted, i]
      )
    }

    // audit log
    const auditEvents = [
      { action: "created", performedBy: "admin", note: `สร้าง registration ${fda.registrationCode}` },
    ]
    if (fda.status !== "draft") auditEvents.push({ action: "submitted", performedBy: "admin", note: "ส่งเอกสารให้ อย." })
    if (fda.status === "approved") auditEvents.push({ action: "approved", performedBy: "system", note: "ได้รับเลขที่อนุญาต" })
    if (fda.status === "rejected") auditEvents.push({ action: "rejected", performedBy: "system", note: "เอกสารไม่ครบ" })
    for (let i = 0; i < auditEvents.length; i++) {
      const ev = auditEvents[i]
      await q(
        `INSERT INTO fda_audit_logs (id,"registrationId",action,"performedBy",note,"createdAt")
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [`fal-${rid}-${i}`, rid, ev.action, ev.performedBy, ev.note,
          new Date(Date.now() - (auditEvents.length - i) * 86400000 * 7).toISOString()]
      )
    }
  }

  const counts = await Promise.all([
    q(`SELECT count(*) FROM fda_ingredients`),
    q(`SELECT count(*) FROM fda_manufacturing_steps`),
    q(`SELECT count(*) FROM fda_documents`),
    q(`SELECT count(*) FROM fda_checklist`),
    q(`SELECT count(*) FROM fda_audit_logs`),
  ])
  console.log(`FDA sub-tables seeded: ingredients=${counts[0].rows[0].count} steps=${counts[1].rows[0].count} docs=${counts[2].rows[0].count} checklist=${counts[3].rows[0].count} audit=${counts[4].rows[0].count}`)
}

// ─── SEED Formula sub-tables ─────────────────────────────────────────────────
async function seedFormulaSubTables() {
  const formulasRes = await q(`SELECT id, code, name, version FROM formulas`)
  const fs = formulasRes.rows
  console.log(`Seeding Formula sub-tables for ${fs.length} formulas...`)

  await q(`DELETE FROM formula_phases`)
  await q(`DELETE FROM formula_processing_steps`)
  await q(`DELETE FROM formula_qc_specs`)
  await q(`DELETE FROM formula_versions`)

  const PHASES = [
    { phaseKey: "A", phaseName: "Phase A — Water Phase" },
    { phaseKey: "B", phaseName: "Phase B — Oil Phase" },
    { phaseKey: "C", phaseName: "Phase C — Cold Actives" },
  ]

  const STEPS_BY_PHASE = {
    A: [
      { stepNumber: 1, instruction: "ตวงน้ำบริสุทธิ์ใส่ภาชนะหลัก อุ่นที่ 75–80°C", temperatureMin: 75, temperatureMax: 80, durationMinutes: 15, equipment: "Heating vessel" },
      { stepNumber: 2, instruction: "ละลาย Glycerin, HA และ Humectants ลงในเฟส A คนจนใส", durationMinutes: 10, speedRpm: 300, equipment: "Overhead stirrer" },
      { stepNumber: 3, instruction: "ละลาย Carbomer / Thickener ในเฟส A ค่อยๆ โรยลง คนต่อเนื่อง", durationMinutes: 15, speedRpm: 400 },
    ],
    B: [
      { stepNumber: 1, instruction: "หลอม Emulsifier, Wax, Fatty Alcohols ที่ 75–80°C", temperatureMin: 75, temperatureMax: 80, durationMinutes: 20, equipment: "Heating vessel" },
      { stepNumber: 2, instruction: "เพิ่มน้ำมัน Emollient ลงใน Phase B ที่ละลายแล้ว คนผสมให้เป็นเนื้อเดียว", durationMinutes: 10 },
    ],
    C: [
      { stepNumber: 1, instruction: "ลดอุณหภูมิ batch ให้ต่ำกว่า 40°C ก่อนเพิ่ม Phase C", temperatureMax: 40, durationMinutes: 30, equipment: "Cooling jacket" },
      { stepNumber: 2, instruction: "เพิ่ม Preservative, Active Ingredients และ Fragrance คนช้าๆ", durationMinutes: 10, speedRpm: 150 },
      { stepNumber: 3, instruction: "ปรับ pH ด้วย Citric Acid หรือ NaOH ให้อยู่ในช่วง 5.0–6.5", equipment: "pH meter" },
    ],
  }

  const QC_PARAMS = [
    { parameterName: "pH", unit: "", minValue: 5.0, maxValue: 6.5, testMethod: "pH meter at 25°C" },
    { parameterName: "Viscosity", unit: "cPs", minValue: 5000, maxValue: 30000, testMethod: "Brookfield RVT Spindle 5, 10 RPM" },
    { parameterName: "Appearance", targetValue: "Homogenous cream/gel, no visible particles", testMethod: "Visual inspection" },
    { parameterName: "Microbial Total Count", unit: "CFU/g", maxValue: 1000, testMethod: "ISO 21149" },
    { parameterName: "Yeast & Mould", unit: "CFU/g", maxValue: 100, testMethod: "ISO 16212" },
  ]

  const CHANGE_DESCRIPTIONS = [
    "Initial formula creation",
    "Adjusted preservative level, added fragrance",
    "Reformulated emulsifier system for stability",
    "Updated active ingredient percentage per customer request",
    "Replaced colorant component — regulatory update",
  ]

  for (const formula of fs) {
    const fid = formula.id
    const hash = fid.charCodeAt(fid.length - 1)
    const numPhases = 2 + (hash % 2) // 2 or 3 phases

    // phases
    for (let pi = 0; pi < numPhases; pi++) {
      const ph = PHASES[pi]
      await q(
        `INSERT INTO formula_phases (id,"formulaId","phaseKey","phaseName","sortOrder") VALUES ($1,$2,$3,$4,$5)`,
        [`fp-${fid}-${pi}`, fid, ph.phaseKey, ph.phaseName, pi]
      )
      // steps for phase
      const steps = STEPS_BY_PHASE[ph.phaseKey] ?? []
      for (let si = 0; si < steps.length; si++) {
        const s = steps[si]
        await q(
          `INSERT INTO formula_processing_steps (id,"formulaId",phase,"stepNumber",instruction,"temperatureMin","temperatureMax","durationMinutes","speedRpm",equipment,notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [`fps-${fid}-${ph.phaseKey}-${si}`, fid, ph.phaseKey, s.stepNumber, s.instruction,
            s.temperatureMin ?? null, s.temperatureMax ?? null, s.durationMinutes ?? null,
            s.speedRpm ?? null, s.equipment ?? null, null]
        )
      }
    }

    // qc specs
    const numQc = 3 + (hash % 3)
    for (let qi = 0; qi < numQc; qi++) {
      const qp = QC_PARAMS[qi % QC_PARAMS.length]
      await q(
        `INSERT INTO formula_qc_specs (id,"formulaId","parameterName",unit,"targetValue","minValue","maxValue","testMethod","sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [`fqs-${fid}-${qi}`, fid, qp.parameterName, qp.unit ?? null, qp.targetValue ?? null,
          qp.minValue ?? null, qp.maxValue ?? null, qp.testMethod ?? null, qi]
      )
    }

    // versions
    const versionNum = parseInt(formula.version?.split(".")[0] ?? "1") || 1
    for (let vi = 1; vi <= versionNum; vi++) {
      await q(
        `INSERT INTO formula_versions (id,"formulaId","versionNumber","changeDescription","createdAt","createdBy")
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          `fv-${fid}-${vi}`, fid, vi,
          CHANGE_DESCRIPTIONS[(vi - 1) % CHANGE_DESCRIPTIONS.length],
          new Date(Date.now() - (versionNum - vi + 1) * 86400000 * 30).toISOString(),
          "admin",
        ]
      )
    }
  }

  const counts = await Promise.all([
    q(`SELECT count(*) FROM formula_phases`),
    q(`SELECT count(*) FROM formula_processing_steps`),
    q(`SELECT count(*) FROM formula_qc_specs`),
    q(`SELECT count(*) FROM formula_versions`),
  ])
  console.log(`Formula sub-tables seeded: phases=${counts[0].rows[0].count} steps=${counts[1].rows[0].count} qcSpecs=${counts[2].rows[0].count} versions=${counts[3].rows[0].count}`)
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await createTables()
    await seedFdaSubTables()
    await seedFormulaSubTables()
    console.log("All done.")
  } catch (e) {
    console.error("Error:", e.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
