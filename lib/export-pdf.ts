import type { CustomerDetail } from "@/lib/customer-types"
import type { SupplierDetail } from "@/lib/supplier-types"

function openPrintWindow(title: string, bodyHtml: string) {
  if (typeof window === "undefined") return
  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { font-family: -apple-system, "Segoe UI", "Noto Sans Thai", sans-serif; }
  body { margin: 40px; color: #1a1a1a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .code { color: #6b7280; font-family: monospace; margin-bottom: 24px; }
  h2 { font-size: 14px; border-bottom: 2px solid #4c8bf5; padding-bottom: 4px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  td { padding: 6px 8px; font-size: 13px; border-bottom: 1px dashed #e5e7eb; vertical-align: top; }
  td.label { color: #6b7280; width: 200px; font-weight: 600; }
  .kpis { display: flex; gap: 16px; margin: 16px 0; }
  .kpi { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; flex: 1; }
  .kpi .n { font-size: 20px; font-weight: 800; }
  .kpi .l { font-size: 10px; text-transform: uppercase; color: #6b7280; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  ${bodyHtml}
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`
  const win = window.open("", "_blank", "width=800,height=1000")
  if (!win) return
  win.document.write(html)
  win.document.close()
}

const pdfRow = (label: string, value?: string | number | null) =>
  `<tr><td class="label">${label}</td><td class="value">${value ?? "—"}</td></tr>`

/** Opens a print-ready window for a supplier that the browser can save as PDF. */
export function exportSupplierToPdf(detail: SupplierDetail) {
  const body = `
  <h1>${detail.supplierName}</h1>
  <div class="code">${detail.supplierCode}${detail.supplierNameEn ? " · " + detail.supplierNameEn : ""}</div>

  <div class="kpis">
    <div class="kpi"><div class="n">${detail.grade}</div><div class="l">Grade</div></div>
    <div class="kpi"><div class="n">${detail.qualityRating ?? "—"}</div><div class="l">Quality</div></div>
    <div class="kpi"><div class="n">${detail.onTimeDeliveryPct ?? 0}%</div><div class="l">On-Time</div></div>
    <div class="kpi"><div class="n">${detail.avgLeadTimeDays ?? "—"}</div><div class="l">Lead Days</div></div>
  </div>

  <h2>ข้อมูลบริษัท</h2>
  <table>
    ${pdfRow("ประเภท", detail.supplierType)}
    ${pdfRow("สถานะ", detail.isApproved ? "อนุมัติแล้ว" : "ยังไม่อนุมัติ")}
    ${pdfRow("รายละเอียด", detail.description)}
  </table>

  <h2>ข้อมูลติดต่อ</h2>
  <table>
    ${pdfRow("ผู้ติดต่อ", detail.contactPerson)}
    ${pdfRow("Email", detail.email)}
    ${pdfRow("โทรศัพท์", detail.phone)}
    ${pdfRow("Fax", detail.fax)}
    ${pdfRow("Website", detail.website)}
  </table>

  <h2>ที่อยู่</h2>
  <table>
    ${pdfRow("ที่อยู่", detail.address)}
    ${pdfRow("เขต/อำเภอ", detail.city)}
    ${pdfRow("ประเทศ", detail.country)}
    ${pdfRow("เลขผู้เสียภาษี", detail.taxId)}
  </table>

  <h2>เงื่อนไขการค้า</h2>
  <table>
    ${pdfRow("เงื่อนไขชำระเงิน", detail.paymentTerms)}
    ${pdfRow("เครดิต (วัน)", detail.paymentDays != null ? detail.paymentDays + " วัน" : null)}
    ${pdfRow("MOQ", detail.moq)}
    ${pdfRow("มูลค่าสั่งซื้อ YTD", detail.ytdOrderValue != null ? "฿" + detail.ytdOrderValue.toLocaleString() : null)}
  </table>

  ${detail.notes ? `<h2>หมายเหตุ</h2><p style="font-size:13px;">${detail.notes}</p>` : ""}`

  openPrintWindow(`${detail.supplierCode} — ${detail.supplierName}`, body)
}

/**
 * Opens a print-ready window for a customer that the browser can save as PDF.
 * Uses the native print dialog so no extra dependency is required.
 */
export function exportCustomerToPdf(detail: CustomerDetail) {
  if (typeof window === "undefined") return

  const row = (label: string, value?: string | number | null) =>
    `<tr><td class="label">${label}</td><td class="value">${value ?? "—"}</td></tr>`

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<title>${detail.customerCode} — ${detail.customerName}</title>
<style>
  * { font-family: -apple-system, "Segoe UI", "Noto Sans Thai", sans-serif; }
  body { margin: 40px; color: #1a1a1a; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .code { color: #6b7280; font-family: monospace; margin-bottom: 24px; }
  h2 { font-size: 14px; border-bottom: 2px solid #4c8bf5; padding-bottom: 4px; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  td { padding: 6px 8px; font-size: 13px; border-bottom: 1px dashed #e5e7eb; vertical-align: top; }
  td.label { color: #6b7280; width: 200px; font-weight: 600; }
  .kpis { display: flex; gap: 16px; margin: 16px 0; }
  .kpi { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; flex: 1; }
  .kpi .n { font-size: 20px; font-weight: 800; }
  .kpi .l { font-size: 10px; text-transform: uppercase; color: #6b7280; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
  <h1>${detail.customerName}</h1>
  <div class="code">${detail.customerCode}${detail.customerNameEn ? " · " + detail.customerNameEn : ""}</div>

  <div class="kpis">
    <div class="kpi"><div class="n">${detail.totalOrders}</div><div class="l">Orders</div></div>
    <div class="kpi"><div class="n">฿${(detail.totalRevenue / 1_000_000).toFixed(1)}M</div><div class="l">Revenue</div></div>
    <div class="kpi"><div class="n">${detail.productCount}</div><div class="l">Products</div></div>
    <div class="kpi"><div class="n">${detail.brandCount}</div><div class="l">Brands</div></div>
  </div>

  <h2>ข้อมูลบริษัท</h2>
  <table>
    ${row("ประเภท", detail.customerType)}
    ${row("Tier", detail.customerTier)}
    ${row("ประเภทธุรกิจ", detail.businessType)}
    ${row("Lead Source", detail.leadSource)}
    ${row("Sales Rep", detail.salesRepresentative)}
  </table>

  <h2>ข้อมูลติดต่อ</h2>
  <table>
    ${row("ผู้ติดต่อ", detail.contactPerson)}
    ${row("Email", detail.email)}
    ${row("โทรศัพท์", detail.phone)}
    ${row("Website", detail.website)}
  </table>

  <h2>ที่อยู่</h2>
  <table>
    ${row("ที่อยู่", detail.address)}
    ${row("เขต/อำเภอ", detail.city)}
    ${row("จังหวัด", detail.province)}
    ${row("รหัสไปรษณีย์", detail.postalCode)}
    ${row("ประเทศ", detail.country)}
  </table>

  <h2>ภาษี & เครดิต</h2>
  <table>
    ${row("เลขผู้เสียภาษี", detail.taxId)}
    ${row("วงเงินเครดิต", detail.creditLimit != null ? "฿" + detail.creditLimit.toLocaleString() : null)}
    ${row("เครดิต (วัน)", detail.creditDays != null ? detail.creditDays + " วัน" : null)}
  </table>

  ${detail.notes ? `<h2>หมายเหตุ</h2><p style="font-size:13px;">${detail.notes}</p>` : ""}

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`

  const win = window.open("", "_blank", "width=800,height=1000")
  if (!win) return
  win.document.write(html)
  win.document.close()
}
