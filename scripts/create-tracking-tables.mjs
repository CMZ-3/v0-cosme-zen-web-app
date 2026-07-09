import pkg from "pg"
const { Pool } = pkg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

await pool.query(`
  CREATE TABLE IF NOT EXISTS production_steps (
    id text PRIMARY KEY,
    "jobOrderId" text NOT NULL,
    "stepNumber" integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'pending',
    "targetQty" integer NOT NULL DEFAULT 0,
    "completedQty" integer NOT NULL DEFAULT 0,
    "goodQty" integer NOT NULL DEFAULT 0,
    "defectQty" integer NOT NULL DEFAULT 0,
    unit text NOT NULL DEFAULT 'units',
    "startDate" text,
    "endDate" text,
    "sortOrder" integer NOT NULL DEFAULT 0,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    "updatedAt" timestamptz NOT NULL DEFAULT now()
  )
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS daily_production_records (
    id text PRIMARY KEY,
    "stepId" text NOT NULL,
    "jobOrderId" text NOT NULL,
    date text NOT NULL,
    "batchId" text NOT NULL DEFAULT '',
    "goodQty" integer NOT NULL DEFAULT 0,
    "defectQty" integer NOT NULL DEFAULT 0,
    "operatorName" text NOT NULL DEFAULT '',
    note text NOT NULL DEFAULT '',
    "cumulativeTotal" integer NOT NULL DEFAULT 0,
    "createdAt" timestamptz NOT NULL DEFAULT now()
  )
`)

await pool.query(`CREATE INDEX IF NOT EXISTS idx_prod_steps_jo ON production_steps ("jobOrderId")`)
await pool.query(`CREATE INDEX IF NOT EXISTS idx_daily_recs_step ON daily_production_records ("stepId")`)
await pool.query(`CREATE INDEX IF NOT EXISTS idx_daily_recs_jo ON daily_production_records ("jobOrderId")`)

console.log("tables created")
await pool.end()
