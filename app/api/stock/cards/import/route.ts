import { NextResponse } from "next/server"
import { bulkImportStockCards, type ImportStockRow } from "@/lib/db/stock-mutations"

/**
 * Bulk import stock cards from parsed spreadsheet rows.
 * Body: { rows: ImportStockRow[] }
 * The client parses the .xlsx (SheetJS) and posts normalized JSON rows here.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { rows?: ImportStockRow[] }
    const rows = body.rows ?? []
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ ok: false, error: "No rows to import" }, { status: 400 })
    }
    if (rows.length > 5000) {
      return NextResponse.json({ ok: false, error: "Too many rows (max 5000)" }, { status: 400 })
    }
    const result = await bulkImportStockCards(rows)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error("[v0] POST /api/stock/cards/import error:", err)
    const message = err instanceof Error ? err.message : "Import failed"
    return NextResponse.json({ ok: false, error: message }, { status: 400 })
  }
}
