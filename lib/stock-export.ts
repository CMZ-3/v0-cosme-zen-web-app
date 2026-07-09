import { utils, writeFileXLSX, read } from "xlsx"
import type { StockCard, StockMovement } from "@/lib/stock-types"
import { movementTypeLabels } from "@/lib/stock-types"
import type { ImportStockRow } from "@/lib/db/stock-mutations"

// ------------------------------------------------------------
// Excel EXPORT — flattens live stock cards into a spreadsheet and triggers a
// browser download. Column order matches the import parser so an exported file
// can be edited and re-imported (round-trip).
// ------------------------------------------------------------

const EXPORT_HEADERS = [
  "item_code",
  "item_name",
  "item_name_en",
  "item_type",
  "category",
  "unit",
  "balance",
  "reserved",
  "incoming",
  "available",
  "min_stock",
  "max_stock",
  "reorder_point",
  "unit_cost",
  "supplier",
  "location",
  "barcode",
  "trade_name",
  "inci_name",
  "cas_no",
  "storage_temp",
  "expiry_date",
  "status",
  "inventory_status",
] as const

function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

export function exportStockToExcel(cards: StockCard[], filename?: string) {
  const rows = cards.map((c) => ({
    item_code: c.itemCode,
    item_name: c.itemName,
    item_name_en: c.itemNameEn ?? "",
    item_type: c.itemType,
    category: c.category,
    unit: c.unit,
    balance: c.balance,
    reserved: c.reservedStock,
    incoming: c.incomingStock,
    available: c.available,
    min_stock: c.minStock,
    max_stock: c.maxStock,
    reorder_point: c.reorderPoint,
    unit_cost: c.unitCost ?? "",
    supplier: c.supplier ?? "",
    location: c.location ?? "",
    barcode: c.barcode ?? "",
    trade_name: c.tradeName ?? "",
    inci_name: c.inciName ?? "",
    cas_no: c.casNo ?? "",
    storage_temp: c.storageTemp ?? "",
    expiry_date: c.expiryDate ?? "",
    status: c.status,
    inventory_status: c.inventoryStatus,
  }))

  const ws = utils.json_to_sheet(rows, { header: EXPORT_HEADERS as unknown as string[] })
  // Reasonable default column widths.
  ws["!cols"] = EXPORT_HEADERS.map((h) => ({ wch: h === "item_name" ? 34 : h.length < 8 ? 10 : 16 }))
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "StockCards")
  writeFileXLSX(wb, filename ?? `stock-export-${stamp()}.xlsx`)
}

// ------------------------------------------------------------
// Excel EXPORT — stock movements ledger.
// ------------------------------------------------------------
export function exportMovementsToExcel(movements: StockMovement[], filename?: string) {
  const rows = movements.map((m) => ({
    reference: m.referenceNumber,
    date: new Date(m.createdAt).toLocaleString("en-GB"),
    type: movementTypeLabels[m.movementType] ?? m.movementType,
    item_code: m.itemCode,
    item_name: m.itemName,
    quantity: m.quantity,
    unit_cost: m.unitCost ?? "",
    total_cost: m.totalCost ?? "",
    status: m.status,
    lot_number: m.lotNumber ?? "",
    created_by: m.createdBy,
    notes: m.notes ?? "",
  }))
  const headers = [
    "reference", "date", "type", "item_code", "item_name", "quantity",
    "unit_cost", "total_cost", "status", "lot_number", "created_by", "notes",
  ]
  const ws = utils.json_to_sheet(rows, { header: headers })
  ws["!cols"] = headers.map((h) => ({ wch: h === "item_name" ? 30 : h === "date" ? 20 : 14 }))
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Movements")
  writeFileXLSX(wb, filename ?? `stock-movements-${stamp()}.xlsx`)
}

/** Download a blank template with just the importable headers + one example row. */
export function downloadImportTemplate() {
  const example = {
    item_code: "RAM9990101",
    item_name: "ตัวอย่างวัตถุดิบ",
    item_name_en: "Example Raw Material",
    item_type: "raw_material",
    category: "Surfactant",
    unit: "kg",
    balance: 100,
    min_stock: 20,
    max_stock: 500,
    reorder_point: 40,
    unit_cost: 55,
    supplier: "Example Co., Ltd.",
    location: "Rack A-01",
    barcode: "",
    trade_name: "",
    inci_name: "",
    cas_no: "",
    storage_temp: "Room temp",
    expiry_date: "",
  }
  const ws = utils.json_to_sheet([example])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, "Template")
  writeFileXLSX(wb, "stock-import-template.xlsx")
}

// ------------------------------------------------------------
// Excel IMPORT — parse an uploaded workbook into normalized ImportStockRow[].
// Header matching is tolerant: case-insensitive, spaces/dots/dashes collapse to
// underscores, and common synonyms are mapped.
// ------------------------------------------------------------

const HEADER_ALIASES: Record<string, keyof ImportStockRow> = {
  item_code: "itemCode",
  code: "itemCode",
  sku: "itemCode",
  item_name: "itemName",
  name: "itemName",
  name_th: "itemName",
  item_name_en: "itemNameEn",
  name_en: "itemNameEn",
  english_name: "itemNameEn",
  item_type: "itemType",
  type: "itemType",
  category: "category",
  cat: "category",
  unit: "unit",
  uom: "unit",
  balance: "balance",
  qty: "balance",
  quantity: "balance",
  initial_stock: "balance",
  opening_balance: "balance",
  min_stock: "minStock",
  min: "minStock",
  minimum: "minStock",
  max_stock: "maxStock",
  max: "maxStock",
  maximum: "maxStock",
  reorder_point: "reorderPoint",
  reorder: "reorderPoint",
  rop: "reorderPoint",
  unit_cost: "unitCost",
  cost: "unitCost",
  price: "unitCost",
  supplier: "supplier",
  vendor: "supplier",
  location: "location",
  loc: "location",
  barcode: "barcode",
  trade_name: "tradeName",
  tradename: "tradeName",
  inci_name: "inciName",
  inci: "inciName",
  cas_no: "casNo",
  cas: "casNo",
  storage_temp: "storageTemp",
  storage: "storageTemp",
  expiry_date: "expiryDate",
  expiry: "expiryDate",
  exp: "expiryDate",
}

const NUMERIC_KEYS: (keyof ImportStockRow)[] = [
  "balance",
  "minStock",
  "maxStock",
  "reorderPoint",
  "unitCost",
]

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .trim()
    .replace(/[\s.\-/]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

export interface ParseResult {
  rows: ImportStockRow[]
  totalRows: number
  unmappedHeaders: string[]
  sheetName: string
}

export async function parseStockWorkbook(file: File): Promise<ParseResult> {
  const buf = await file.arrayBuffer()
  const wb = read(buf, { cellDates: true })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const raw = utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null })

  const unmapped = new Set<string>()
  const rows: ImportStockRow[] = []

  for (const r of raw) {
    const mapped: Partial<Record<keyof ImportStockRow, unknown>> = {}
    for (const [key, value] of Object.entries(r)) {
      const norm = normalizeHeader(key)
      const target = HEADER_ALIASES[norm]
      if (!target) {
        if (value != null && String(value).trim() !== "") unmapped.add(key)
        continue
      }
      mapped[target] = value
    }

    // Coerce values.
    const row: ImportStockRow = {
      itemCode: cleanStr(mapped.itemCode),
      itemName: cleanStr(mapped.itemName),
    }
    for (const [k, v] of Object.entries(mapped)) {
      const key = k as keyof ImportStockRow
      if (key === "itemCode" || key === "itemName") continue
      if (NUMERIC_KEYS.includes(key)) {
        const n = toNumber(v)
        if (n != null) (row[key] as number) = n
      } else {
        const s = cleanStr(v)
        if (s) (row[key] as string) = s
      }
    }

    // Skip fully-empty rows.
    if (!row.itemCode && !row.itemName) continue
    rows.push(row)
  }

  return { rows, totalRows: rows.length, unmappedHeaders: [...unmapped], sheetName }
}

function cleanStr(v: unknown): string {
  if (v == null) return ""
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v).trim()
}

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim())
  return Number.isFinite(n) ? n : null
}
