import pkg from "pg"
const { Pool } = pkg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const JO = "JO-003"
const TARGET = 200
const UNIT = "units"

// Wipe any existing tracking for this JO so the seed is idempotent.
await pool.query(`DELETE FROM daily_production_records WHERE "jobOrderId" = $1`, [JO])
await pool.query(`DELETE FROM production_steps WHERE "jobOrderId" = $1`, [JO])

const template = [
  { name: "รับออเดอร์", description: "Receive & confirm job order", status: "done", completed: TARGET },
  { name: "เตรียมวัตถุดิบ", description: "Weigh & prepare raw materials", status: "done", completed: TARGET },
  { name: "ผสม", description: "Mixing / compounding", status: "active", completed: 0 }, // filled from records
  { name: "บรรจุ", description: "Filling into containers", status: "pending", completed: 0 },
  { name: "QC ระหว่างผลิต", description: "In-process quality control", status: "pending", completed: 0 },
  { name: "ติดฉลาก", description: "Labeling & coding", status: "pending", completed: 0 },
  { name: "แพ็ค", description: "Secondary packing", status: "pending", completed: 0 },
  { name: "จัดส่ง", description: "Finishing & hand-off to delivery", status: "pending", completed: 0 },
]

const now = new Date()
const stepIds = []
for (let i = 0; i < template.length; i++) {
  const t = template[i]
  const id = `step-jo003-${i + 1}`
  stepIds.push(id)
  const startDate =
    t.status === "done" ? `2025-07-0${i + 1}` : t.status === "active" ? "2025-07-03" : null
  const endDate = t.status === "done" ? `2025-07-0${i + 1}` : null
  await pool.query(
    `INSERT INTO production_steps
      (id,"jobOrderId","stepNumber",name,description,status,"targetQty","completedQty","goodQty","defectQty",unit,"startDate","endDate","sortOrder","createdAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),now())`,
    [id, JO, i + 1, t.name, t.description, t.status, TARGET, t.completed, t.completed, 0, UNIT, startDate, endDate, i],
  )
}

// ── Daily records for the active step (ผสม, step 3) ─────────────────────────
// A few days of realistic mixing output building toward the 200-unit target.
const activeStepId = stepIds[2]
const records = [
  { date: "2025-07-03", good: 42, defect: 3, op: "K. Somsri", note: "เริ่มผสม batch แรก" },
  { date: "2025-07-04", good: 48, defect: 2, op: "K. Wichai", note: "" },
  { date: "2025-07-05", good: 38, defect: 5, op: "K. Somsri", note: "ปรับความหนืด" },
  { date: "2025-07-07", good: 45, defect: 1, op: "K. Malee", note: "ผสมได้ตามแผน" },
]

let cum = 0
let good = 0
let defect = 0
for (let i = 0; i < records.length; i++) {
  const r = records[i]
  cum += r.good + r.defect
  good += r.good
  defect += r.defect
  await pool.query(
    `INSERT INTO daily_production_records
      (id,"stepId","jobOrderId",date,"batchId","goodQty","defectQty","operatorName",note,"cumulativeTotal","createdAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())`,
    [`rec-jo003-${i + 1}`, activeStepId, JO, r.date, "", r.good, r.defect, r.op, r.note, cum],
  )
}

// Roll the totals back into the active step.
await pool.query(
  `UPDATE production_steps SET "goodQty"=$1,"defectQty"=$2,"completedQty"=$3,"updatedAt"=now() WHERE id=$4`,
  [good, defect, good + defect, activeStepId],
)

console.log(`Seeded ${template.length} steps and ${records.length} daily records for ${JO}`)
console.log(`Active step (ผสม): good=${good} defect=${defect} completed=${good + defect}/${TARGET}`)
await pool.end()
