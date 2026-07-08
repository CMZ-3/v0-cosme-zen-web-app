import type { StockCard } from "@/lib/stock-types"

// ============================
// Barcode utilities (Code 128)
// ============================
// Strategy: each stock item is identified by a Code 128 barcode. If the stock
// card has an explicit `barcode` (e.g. a supplier EAN/GTIN), we prefer it.
// Otherwise we deterministically derive a scannable value from `itemCode`.
// Code 128 encodes the full ASCII set, so alphanumeric item codes like
// "RM-001" scan reliably on any 1D hardware scanner.

/** Characters that are safe & reliable across Code 128 hardware scanners. */
const SAFE_CODE128 = /^[\x20-\x7E]+$/ // printable ASCII

/**
 * The value that should be *encoded* into the barcode for a given stock card.
 * Prefers an explicit stored barcode, else falls back to the item code.
 */
export function resolveBarcodeValue(card: Pick<StockCard, "barcode" | "itemCode">): string {
  const raw = (card.barcode?.trim() || card.itemCode?.trim() || "").toUpperCase()
  return raw
}

/** Whether a value can be safely encoded as Code 128. */
export function isValidCode128(value: string): boolean {
  return value.length > 0 && value.length <= 48 && SAFE_CODE128.test(value)
}

/**
 * Normalize a scanned string. Hardware scanners may append CR/LF or stray
 * whitespace; we trim and upper-case so lookups are case-insensitive.
 */
export function normalizeScan(raw: string): string {
  return raw.replace(/[\r\n\t]+/g, "").trim().toUpperCase()
}

/**
 * Find the stock card that matches a scanned code. Matches against the
 * resolved barcode value AND the raw item code, so scanning either works.
 */
export function findCardByScan<T extends Pick<StockCard, "barcode" | "itemCode">>(
  cards: T[],
  scan: string,
): T | undefined {
  const needle = normalizeScan(scan)
  if (!needle) return undefined
  return cards.find((c) => {
    const barcode = resolveBarcodeValue(c)
    const code = (c.itemCode || "").toUpperCase()
    return barcode === needle || code === needle
  })
}

/** Human label for whether a barcode is stored vs auto-derived. */
export function barcodeSource(card: Pick<StockCard, "barcode">): "stored" | "generated" {
  return card.barcode?.trim() ? "stored" : "generated"
}
