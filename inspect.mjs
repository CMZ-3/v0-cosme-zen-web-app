import { read, utils } from "xlsx"
import { readFileSync } from "node:fs"
const buf = readFileSync("data/StockCards_import_clean3-f8099a.xlsx")
const wb = read(buf, { cellDates: true })
const rows = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null })
const types = {}
for (const r of rows) types[r.item_type] = (types[r.item_type] ?? 0) + 1
console.log("ITEM_TYPE:", JSON.stringify(types, null, 2))
console.log("\n=== RM samples (with INCI) ===")
console.log(JSON.stringify(rows.filter((r) => r.inci_name).slice(0, 3), null, 2))
console.log("\n=== FG samples ===")
console.log(JSON.stringify(rows.filter((r) => r.item_type === "FG").slice(0, 2), null, 2))
console.log("\nbalance>0:", rows.filter((r) => r.balance > 0).length)
console.log("unit_cost>0:", rows.filter((r) => r.unit_cost > 0).length)
console.log("has supplier:", rows.filter((r) => r.supplier).length)
console.log("has location:", rows.filter((r) => r.location).length)
