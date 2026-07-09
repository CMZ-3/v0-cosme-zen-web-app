"use client"

import { useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import type { StockCard } from "@/lib/stock-types"
import { itemTypeLabels } from "@/lib/stock-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StockReportPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#525659" }}>
          <p style={{ color: "white", fontSize: 16, fontWeight: 700 }}>กำลังโหลดรายงาน...</p>
        </div>
      }
    >
      <StockReport />
    </Suspense>
  )
}

const money = (n: number | null | undefined) =>
  n == null ? "-" : `฿${Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const num = (n: number | null | undefined) =>
  n == null ? "-" : Number(n).toLocaleString("th-TH")

function statusLabel(s: string): { label: string; color: string } {
  switch (s) {
    case "out_of_stock":
      return { label: "หมด", color: "#dc2626" }
    case "low":
      return { label: "ต่ำ", color: "#d97706" }
    case "over_stock":
      return { label: "เกิน", color: "#7c3aed" }
    default:
      return { label: "ปกติ", color: "#059669" }
  }
}

function StockReport() {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") ?? "all"
  const category = searchParams.get("category") ?? "all"
  const search = searchParams.get("search") ?? ""

  const { data, isLoading } = useSWR<{ cards: StockCard[] }>("/api/stock/cards", fetcher)

  const cards = useMemo(() => {
    let list = data?.cards ?? []
    if (type !== "all") list = list.filter((c) => c.itemType === type)
    if (category !== "all") list = list.filter((c) => c.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.itemName.toLowerCase().includes(q) ||
          c.itemCode.toLowerCase().includes(q) ||
          (c.itemNameEn ?? "").toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => a.itemCode.localeCompare(b.itemCode))
  }, [data, type, category, search])

  const totals = useMemo(() => {
    const totalValue = cards.reduce((s, c) => s + (c.unitCost ?? 0) * c.balance, 0)
    const lowCount = cards.filter((c) => c.inventoryStatus === "low").length
    const outCount = cards.filter((c) => c.inventoryStatus === "out_of_stock").length
    return { totalValue, lowCount, outCount, count: cards.length }
  }, [cards])

  const printedAt = new Date().toLocaleString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const filterSummary = [
    type !== "all" ? `ประเภท: ${itemTypeLabels[type as keyof typeof itemTypeLabels] ?? type}` : null,
    category !== "all" ? `หมวด: ${category}` : null,
    search.trim() ? `ค้นหา: "${search}"` : null,
  ].filter(Boolean)

  if (isLoading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#525659" }}>
        <p style={{ color: "white", fontSize: 16, fontWeight: 700 }}>กำลังโหลดรายงาน...</p>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 12mm; }
        @media print {
          body { background: none !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .report-sheet { box-shadow: none !important; margin: 0 !important; width: 100% !important; padding: 0 !important; }
        }
        .report-sheet { font-family: var(--font-sans), system-ui, sans-serif; }
        .rpt-table { width: 100%; border-collapse: collapse; }
        .rpt-table th, .rpt-table td { border: 1px solid #cbd5e1; padding: 5px 7px; font-size: 11px; }
        .rpt-table th { background: #f1f5f9; font-weight: 700; text-align: left; }
        .rpt-table tbody tr:nth-child(even) { background: #f8fafc; }
      `}</style>

      {/* Toolbar (hidden on print) */}
      <div
        className="no-print"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#1e293b", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          รายงานสต๊อก · {totals.count} รายการ
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.close()}
            style={{ background: "#334155", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            ปิด
          </button>
          <button
            onClick={() => window.print()}
            style={{ background: "#0f766e", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Report sheet */}
      <div style={{ background: "#525659", minHeight: "100vh", padding: "70px 20px 40px" }}>
        <div
          className="report-sheet"
          style={{ background: "white", maxWidth: 1100, margin: "0 auto", padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", color: "#0f172a" }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #0f172a", paddingBottom: 14, marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>รายงานสต๊อกสินค้า</h1>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>COSMEZEN SAAS CONTROL V7.0 · Stock Report</p>
            </div>
            <div style={{ textAlign: "right", fontSize: 11, color: "#64748b" }}>
              <p style={{ margin: 0 }}>พิมพ์เมื่อ: {printedAt}</p>
              {filterSummary.length > 0 && (
                <p style={{ margin: "4px 0 0", maxWidth: 320 }}>{filterSummary.join(" · ")}</p>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <SummaryBox label="รายการทั้งหมด" value={`${totals.count}`} />
            <SummaryBox label="มูลค่ารวม" value={money(totals.totalValue)} accent="#0f766e" />
            <SummaryBox label="สต๊อกต่ำ" value={`${totals.lowCount}`} accent="#d97706" />
            <SummaryBox label="สินค้าหมด" value={`${totals.outCount}`} accent="#dc2626" />
          </div>

          {/* Table */}
          <table className="rpt-table">
            <thead>
              <tr>
                <th style={{ width: 28, textAlign: "center" }}>#</th>
                <th style={{ width: 90 }}>รหัส</th>
                <th>ชื่อสินค้า</th>
                <th style={{ width: 70 }}>ประเภท</th>
                <th style={{ width: 90 }}>หมวด</th>
                <th style={{ width: 55, textAlign: "right" }}>คงเหลือ</th>
                <th style={{ width: 40 }}>หน่วย</th>
                <th style={{ width: 50, textAlign: "right" }}>ขั้นต่ำ</th>
                <th style={{ width: 70, textAlign: "right" }}>ต้นทุน/หน่วย</th>
                <th style={{ width: 85, textAlign: "right" }}>มูลค่ารวม</th>
                <th style={{ width: 45, textAlign: "center" }}>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c, i) => {
                const st = statusLabel(c.inventoryStatus)
                return (
                  <tr key={c.id}>
                    <td style={{ textAlign: "center", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.itemCode}</td>
                    <td>{c.itemName}</td>
                    <td style={{ fontSize: 10 }}>{itemTypeLabels[c.itemType as keyof typeof itemTypeLabels] ?? c.itemType}</td>
                    <td style={{ fontSize: 10 }}>{c.category}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{num(c.balance)}</td>
                    <td>{c.unit}</td>
                    <td style={{ textAlign: "right", color: "#64748b" }}>{num(c.minStock)}</td>
                    <td style={{ textAlign: "right" }}>{money(c.unitCost)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{money((c.unitCost ?? 0) * c.balance)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span style={{ color: st.color, fontWeight: 700, fontSize: 10 }}>{st.label}</span>
                    </td>
                  </tr>
                )
              })}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                    ไม่พบข้อมูลตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
            <span>รายงานนี้สร้างโดยระบบอัตโนมัติ · COSMEZEN SAAS CONTROL V7.0</span>
            <span>รวม {totals.count} รายการ · มูลค่า {money(totals.totalValue)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function SummaryBox({ label, value, accent = "#0f172a" }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", background: "#f8fafc" }}>
      <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  )
}
