import pkg from "pg"
const { Pool } = pkg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ---------------------------------------------------------------------------
// Seeds realistic opening balances + lots + movements + reservations for a
// subset of consumable stock cards so the whole Stock Hub (Overview, Movements,
// Alerts, Lots, Reservations, Stock Check) shows meaningful live data.
// Idempotent: clears everything it previously created (id prefix "seed-") and
// resets balances on the cards it manages before re-seeding.
// ---------------------------------------------------------------------------

function daysFromNow(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function ref(prefix, i) {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `${prefix}-${stamp}-${String(1000 + i)}`
}

// Clean previous seed artifacts.
await pool.query(`DELETE FROM stock_reservations WHERE id LIKE 'seed-%'`)
await pool.query(`DELETE FROM stock_lots WHERE id LIKE 'seed-%'`)
await pool.query(`DELETE FROM stock_movements WHERE id LIKE 'seed-%'`)

// Pick consumable items (raw materials + packaging) to manage.
const { rows: cards } = await pool.query(
  `SELECT id, "itemCode", "itemName", unit, "unitCost"
     FROM stock_cards
    WHERE status = 'active' AND "itemType" IN ('raw_material','packaging','packaging_aux')
    ORDER BY "itemCode"
    LIMIT 40`,
)

// Reset the managed cards before recomputing.
const managedIds = cards.map((c) => c.id)
if (managedIds.length > 0) {
  await pool.query(
    `UPDATE stock_cards SET balance = 0, "reservedStock" = 0, "incomingStock" = 0, available = 0 WHERE id = ANY($1)`,
    [managedIds],
  )
}

const expiryPlan = [-20, 15, 45, 80, 200, 400, 600]
let lotCount = 0
let mvCount = 0

for (let i = 0; i < cards.length; i++) {
  const c = cards[i]
  const unitCost = c.unitCost && c.unitCost > 0 ? c.unitCost : 25 + (i % 10) * 12

  // Threshold profile.
  const minStock = 50
  const reorderPoint = 80
  const maxStock = 1000 + (i % 5) * 200

  // Balance pattern → spread of statuses.
  const mode = i % 12
  let balance
  if (mode === 0) balance = 0 // out of stock
  else if (mode === 1) balance = 30 // low (< min)
  else if (mode === 2) balance = 70 // reorder (< reorder, > min)
  else if (mode === 3) balance = maxStock + 150 // over stock
  else balance = 200 + (i % 7) * 90 // healthy

  await pool.query(
    `UPDATE stock_cards
        SET balance = $1, "initialStock" = $1, "minStock" = $2, "maxStock" = $3,
            "reorderPoint" = $4, "unitCost" = $5
      WHERE id = $6`,
    [balance, minStock, maxStock, reorderPoint, unitCost, c.id],
  )

  if (balance <= 0) continue

  // Split balance across up to two lots with different expiry buckets.
  const lot1Qty = balance > 1 ? Math.round(balance * 0.6) : balance
  const lot2Qty = balance - lot1Qty
  const lots = [
    { suffix: "A", qty: lot1Qty, exp: expiryPlan[i % expiryPlan.length] },
    ...(lot2Qty > 0 ? [{ suffix: "B", qty: lot2Qty, exp: expiryPlan[(i + 3) % expiryPlan.length] }] : []),
  ]

  for (const [j, lot] of lots.entries()) {
    const lotId = `seed-lot-${c.id}-${lot.suffix}`
    const lotNumber = `LOT-${c.itemCode}-${lot.suffix}`
    await pool.query(
      `INSERT INTO stock_lots
         (id,"stockCardId","lotNumber",quantity,"reservedQty","expireDate","manufacturedDate","supplierLotNo","unitCost","sourceType",status,"lotCategory","createdAt")
       VALUES ($1,$2,$3,$4,0,$5,$6,$7,$8,'buy_in','available','sealed',now())`,
      [lotId, c.id, lotNumber, lot.qty, daysFromNow(lot.exp), daysFromNow(lot.exp - 365), `SUP-${1000 + i}`, unitCost],
    )
    lotCount++

    // Matching buy_in movement for the opening receipt.
    const mvId = `seed-mv-${c.id}-${lot.suffix}`
    await pool.query(
      `INSERT INTO stock_movements
         (id,"referenceNumber","movementType","stockCardId","itemCode","itemName",quantity,"unitCost","totalCost",status,"lotNumber","expireDate","supplierLotNo",notes,"createdBy","createdAt")
       VALUES ($1,$2,'buy_in',$3,$4,$5,$6,$7,$8,'approved',$9,$10,$11,$12,'system',now())`,
      [
        mvId, ref("RCV", mvCount), c.id, c.itemCode, c.itemName, lot.qty, unitCost, unitCost * lot.qty,
        lotNumber, daysFromNow(lot.exp), `SUP-${1000 + i}`, "Opening balance receipt",
      ],
    )
    mvCount++
  }

  // A representative use_out movement for a few healthy items (audit trail).
  if (mode >= 4 && i % 3 === 0) {
    const useQty = Math.max(1, Math.round(balance * 0.1))
    const mvId = `seed-mv-${c.id}-USE`
    await pool.query(
      `INSERT INTO stock_movements
         (id,"referenceNumber","movementType","stockCardId","itemCode","itemName",quantity,"unitCost","totalCost",status,notes,"createdBy","createdAt")
       VALUES ($1,$2,'use_out',$3,$4,$5,$6,$7,$8,'approved',$9,'system',now())`,
      [mvId, ref("ISS", mvCount), c.id, c.itemCode, c.itemName, useQty, unitCost, unitCost * useQty, "Issued to production"],
    )
    mvCount++
  }
}

// Reservations against real job orders on a few managed cards with stock.
const { rows: jobs } = await pool.query(`SELECT id, "jobNo" FROM job_orders ORDER BY "jobNo" LIMIT 3`)
let rsvCount = 0
if (jobs.length > 0) {
  const targets = cards.filter((_, i) => i % 12 >= 4).slice(0, 5)
  for (let i = 0; i < targets.length; i++) {
    const c = targets[i]
    const { rows } = await pool.query(`SELECT balance FROM stock_cards WHERE id = $1`, [c.id])
    const bal = rows[0]?.balance ?? 0
    if (bal <= 0) continue
    const qty = Math.max(1, Math.round(bal * 0.2))
    const job = jobs[i % jobs.length]
    await pool.query(
      `INSERT INTO stock_reservations
         (id,"stockCardId","jobOrderId","jobNo","reservedQuantity",status,"reservedAt")
       VALUES ($1,$2,$3,$4,$5,'active',now())`,
      [`seed-rsv-${c.id}`, c.id, job.id, job.jobNo, qty],
    )
    await pool.query(`UPDATE stock_cards SET "reservedStock" = "reservedStock" + $1 WHERE id = $2`, [qty, c.id])
    rsvCount++
  }
}

// Recompute available + inventoryStatus for the managed cards.
if (managedIds.length > 0) {
  await pool.query(
    `UPDATE stock_cards
        SET available = balance - "reservedStock" + "incomingStock",
            "inventoryStatus" = CASE
              WHEN balance <= 0 THEN 'out_of_stock'
              WHEN "minStock" > 0 AND balance < "minStock" THEN 'low'
              WHEN "maxStock" > 0 AND balance > "maxStock" THEN 'over_stock'
              ELSE 'healthy' END
      WHERE id = ANY($1)`,
    [managedIds],
  )
}

console.log(`Seeded balances on ${cards.length} cards · ${lotCount} lots · ${mvCount} movements · ${rsvCount} reservations.`)
await pool.end()
