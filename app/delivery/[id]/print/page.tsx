"use client"

import { use, useMemo } from "react"
import { mockDeliveryOrders, mockDeliveryLines } from "@/lib/delivery-mock-data"
import type { DeliveryOrderLine } from "@/lib/delivery-types"

export default function PrintDeliveryOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const order = useMemo(() => mockDeliveryOrders.find((o) => o.id === id), [id])
  const lines: DeliveryOrderLine[] = mockDeliveryLines.filter((l) => l.deliveryOrderId === id)

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#525659]">
        <p className="text-white text-lg font-bold">Delivery order not found</p>
      </div>
    )
  }

  const formatDateTh = (dateStr?: string) => {
    if (!dateStr) return "--"
    return new Date(dateStr).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
  }

  const totalPcs = lines.reduce((s, l) => s + l.quantity, 0)
  const totalCartons = lines.reduce((s, l) => s + (l.cartonCount || 0), 0)
  const totalAmount = lines.reduce((s, l) => s + (l.amount || 0), 0)

  const fullAddress = [order.deliveryAddress, order.deliveryCity, order.deliveryProvince, order.deliveryPostalCode]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body { background: none !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page { border: 2px solid #000 !important; box-shadow: none !important; margin: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print button (top bar) */}
      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#1e293b", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
          Print Preview - {order.deliveryNumber}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{ background: "#0f766e", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
          >
            Print
          </button>
          <button
            onClick={() => window.history.back()}
            style={{ background: "#334155", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={{
        fontFamily: "'Plus Jakarta Sans', 'Sarabun', sans-serif",
        color: "#1e293b",
        margin: 0,
        background: "#525659",
        display: "flex",
        justifyContent: "center",
        padding: "70px 20px 20px",
        minHeight: "100vh",
      }}>
        <div className="print-page" style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "15mm",
          background: "white",
          boxSizing: "border-box",
          position: "relative",
          border: "2px solid #cbd5e1",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}>
          {/* Watermark */}
          <div style={{
            position: "absolute", top: "40%", left: "50%",
            transform: "translate(-50%, -50%) rotate(-45deg)",
            fontSize: 120, fontWeight: "bold", color: "rgba(0,0,0,0.03)",
            pointerEvents: "none", whiteSpace: "nowrap",
          }}>
            ORIGINAL
          </div>

          {/* === HEADER === */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 25 }}>
            <div style={{ display: "flex", gap: 15 }}>
              {/* Logo */}
              <div style={{
                width: 60, height: 60, background: "#0f766e", color: "white",
                fontWeight: "bold", fontSize: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 12,
              }}>
                C
              </div>
              {/* Company */}
              <div>
                <h1 style={{ margin: "0 0 5px 0", fontSize: 20, color: "#0f766e", fontWeight: 800 }}>
                  {"บริษัท คอสเม่เซน จำกัด"}
                </h1>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>
                  {"89/1 ต.ลำโพ อ.บางบัวทอง จ.นนทบุรี 11110"}
                </p>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>
                  {"เลขประจำตัวผู้เสียภาษี: 0125558009999 (สำนักงานใหญ่)"}
                </p>
                <p style={{ margin: "2px 0", fontSize: 13, color: "#64748b", lineHeight: 1.4 }}>
                  {"โทร: 02-126-0345 | Email: support@cosmezen.com"}
                </p>
              </div>
            </div>
            {/* Doc meta */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#0f172a", textTransform: "uppercase", marginBottom: 5 }}>
                {"ใบส่งของ"}
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 5 }}>
                DELIVERY ORDER
              </div>
              <div style={{
                fontSize: 16, fontWeight: "bold", color: "#0f766e",
                border: "2px solid #0f766e", padding: "4px 12px",
                borderRadius: 6, display: "inline-block",
              }}>
                {order.deliveryNumber}
              </div>
            </div>
          </div>

          {/* === INFO GRID === */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 25 }}>
            {/* Ship To */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 15, backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
                {"Ship To (สถานที่ส่งสินค้า)"}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: 15, color: "#0f172a", marginBottom: 4 }}>
                  {order.customerName} {order.customerBrand ? `(${order.customerBrand})` : ""}
                </strong>
                <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                  {fullAddress || "--"}
                </p>
                {order.contactName && (
                  <p style={{ marginTop: 5, fontSize: 13, color: "#0f766e" }}>
                    {"☎ ผู้ติดต่อ: "}{order.contactName} ({order.contactPhone || "--"})
                  </p>
                )}
              </div>
            </div>
            {/* Reference */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 15, backgroundColor: "#f8fafc" }}>
              <div style={{ fontSize: 11, fontWeight: "bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
                {"Reference (อ้างอิง)"}
              </div>
              <div style={{ fontSize: 14, color: "#1e293b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#64748b" }}>{"วันที่ส่ง:"}</span>
                  <span style={{ fontWeight: 600 }}>{formatDateTh(order.deliveryDate)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#64748b" }}>{"อ้างอิงใบสั่งขาย:"}</span>
                  <span style={{ fontWeight: 600 }}>{order.salesOrderRef || "--"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: "#64748b" }}>{"วันที่ออกเอกสาร:"}</span>
                  <span style={{ fontWeight: 600 }}>{formatDateTh(order.orderDate)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b" }}>{"พนักงาน:"}</span>
                  <span style={{ fontWeight: 600 }}>{order.createdBy || "Admin"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* === LOGISTICS BAR === */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: "2px dashed #cbd5e1", paddingBottom: 15, marginBottom: 20,
          }}>
            <div>
              <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{"ขนส่งโดย (Carrier)"}</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 2 }}>
                {order.shippingMethod || "--"}
              </span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{"เลขพัสดุ (Tracking No.)"}</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 2 }}>
                {order.trackingNumber || "-"}
              </span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>{"น้ำหนักรวม (Weight)"}</span>
              <span style={{ display: "block", fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 2 }}>
                {order.weightKg ? `${order.weightKg} kg` : "-"}
              </span>
            </div>
            <div style={{
              background: "#0f172a", color: "white", padding: "8px 16px",
              borderRadius: 8, textAlign: "center",
            }}>
              <span style={{ fontSize: 10, opacity: 0.8, display: "block" }}>{"จำนวนลังรวม"}</span>
              <span style={{ fontSize: 20, fontWeight: "bold" }}>{totalCartons || order.boxesCount || "-"}</span>
              <span style={{ fontSize: 12, marginLeft: 2 }}>{"ลัง"}</span>
            </div>
          </div>

          {/* === PRODUCT TABLE === */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "5%" }}>#</th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "left", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "35%" }}>{"รายการสินค้า (Description)"}</th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "left", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "18%" }}>Lot / Exp</th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "right", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "10%" }}>
                  {"บรรจุ"}<br /><span style={{ fontWeight: "normal", fontSize: 9 }}>({"ชิ้น/ลัง"})</span>
                </th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "right", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "10%" }}>
                  {"จำนวนลัง"}<br /><span style={{ fontWeight: "normal", fontSize: 9 }}>(CTNS)</span>
                </th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "right", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "12%" }}>
                  {"รวมจำนวน"}<br /><span style={{ fontWeight: "normal", fontSize: 9 }}>({"ชิ้น"})</span>
                </th>
                <th style={{ background: "#f1f5f9", color: "#475569", padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", borderBottom: "2px solid #cbd5e1", width: "8%" }}>{"ตรวจ"}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, idx) => (
                <tr key={line.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center", verticalAlign: "top" }}>{idx + 1}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" }}>
                    <span style={{ fontWeight: "bold", fontSize: 13, color: "#1e293b", display: "block" }}>{line.productName}</span>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      {"รหัส: "}{line.productCode || "--"} | {"หน่วย: "}{line.unit || "pcs"}
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" }}>
                    {line.lotNumber ? (
                      <span style={{
                        display: "inline-block", background: "#fff", border: "1px solid #cbd5e1",
                        padding: "1px 4px", borderRadius: 4, fontSize: 10, color: "#475569",
                        fontFamily: "monospace",
                      }}>
                        {line.lotNumber}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>--</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right", verticalAlign: "top" }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>{line.packPerCarton ?? "--"}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right", verticalAlign: "top" }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: "#0f766e" }}>{line.cartonCount ?? "--"}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right", verticalAlign: "top" }}>
                    <span style={{ fontSize: 14, fontWeight: "bold", color: "#1e293b" }}>{line.quantity.toLocaleString()}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center", verticalAlign: "top" }}>
                    <div style={{ width: 14, height: 14, border: "1.5px solid #cbd5e1", display: "inline-block", borderRadius: 2 }} />
                  </td>
                </tr>
              ))}
              {/* If no lines (fallback from order summary) */}
              {lines.length === 0 && (
                <tr>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>1</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0" }}>
                    <span style={{ fontWeight: "bold", fontSize: 13 }}>{order.productSummary || "--"}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", color: "#94a3b8" }}>--</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right" }}>--</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold", color: "#0f766e" }}>{order.boxesCount ?? "--"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold" }}>{order.totalQuantity?.toLocaleString() ?? "--"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #e2e8f0", textAlign: "center" }}>
                    <div style={{ width: 14, height: 14, border: "1.5px solid #cbd5e1", display: "inline-block", borderRadius: 2 }} />
                  </td>
                </tr>
              )}
              {/* Total Row */}
              <tr style={{ background: "#f8fafc" }}>
                <td colSpan={3} style={{ padding: "10px 8px", textAlign: "right", fontWeight: "bold", fontSize: 12, color: "#475569", borderBottom: "2px solid #cbd5e1" }}>
                  {"รวมทั้งหมด (TOTAL)"}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right", borderBottom: "2px solid #cbd5e1" }} />
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "bold", fontSize: 14, color: "#0f766e", borderBottom: "2px solid #cbd5e1" }}>
                  {totalCartons || order.boxesCount || "--"}
                </td>
                <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "bold", fontSize: 14, color: "#0f172a", borderBottom: "2px solid #cbd5e1" }}>
                  {(totalPcs || order.totalQuantity || 0).toLocaleString()}
                </td>
                <td style={{ padding: "10px 8px", borderBottom: "2px solid #cbd5e1" }} />
              </tr>
            </tbody>
          </table>

          {/* === AMOUNT SUMMARY (if has prices) === */}
          {(totalAmount > 0 || (order.totalAmount && order.totalAmount > 0)) && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <div style={{ width: 280, border: "1px solid #e2e8f0", borderRadius: 12, padding: 15, background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>{"มูลค่าสินค้า"}</span>
                  <span style={{ fontWeight: 600 }}>{"\u0e3f"}{(totalAmount || order.totalAmount || 0).toLocaleString()}</span>
                </div>
                {order.shippingCost && order.shippingCost > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "#64748b" }}>{"ค่าขนส่ง"}</span>
                    <span style={{ fontWeight: 600 }}>{"\u0e3f"}{order.shippingCost.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "2px solid #0f766e", marginTop: 6, fontSize: 15 }}>
                  <span style={{ fontWeight: "bold", color: "#0f172a" }}>{"รวมสุทธิ"}</span>
                  <span style={{ fontWeight: 800, color: "#0f766e" }}>
                    {"\u0e3f"}{((totalAmount || order.totalAmount || 0) + (order.shippingCost || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* === TERMS & CONDITIONS === */}
          <div style={{
            marginBottom: 20, padding: 15,
            border: "1px solid #fed7aa", backgroundColor: "#fff7ed",
            borderRadius: 12, fontSize: 12, color: "#9a3412",
          }}>
            <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
              {"ข้อกำหนดและเงื่อนไขการรับประกันสินค้า (Terms & Conditions)"}
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
              <li><strong>{"กรุณาตรวจสอบความถูกต้องและสภาพสินค้าทันทีที่ได้รับ:"}</strong> {"โปรดตรวจสอบจำนวนและสภาพกล่องภายนอกต่อหน้าพนักงานขนส่ง"}</li>
              <li><strong>{"การแจ้งเคลม:"}</strong> {"หากพบสินค้าชำรุดเสียหาย ไม่ครบ หรือไม่ถูกต้อง กรุณาแจ้งกลับบริษัทฯ ภายใน"} <strong>7 {"วัน"}</strong> {"นับจากวันที่ในใบส่งของ"}</li>
              <li><strong>{"เงื่อนไขการคืน:"}</strong> {"สินค้าต้องอยู่ในสภาพเดิม บรรจุภัณฑ์ไม่ฉีกขาด และยังไม่ผ่านการใช้งาน"}</li>
              <li><strong>{"ข้อยกเว้น:"}</strong> {"บริษัทฯ ขอสงวนสิทธิ์ไม่รับเปลี่ยนหรือคืนสินค้า หากเกินกำหนดระยะเวลาดังกล่าว หรือสินค้าเสียหายจากการจัดเก็บที่ไม่ถูกต้องของลูกค้า"}</li>
            </ul>
          </div>

          {/* === FOOTER: SIGNATURES === */}
          <div style={{ display: "flex", gap: 20 }}>
            {/* QR Area */}
            <div style={{ width: 90, textAlign: "center", flexShrink: 0 }}>
              <div style={{
                width: 70, height: 70, background: "#0f172a", margin: "0 auto 5px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: 10, borderRadius: 6,
              }}>
                QR
              </div>
              <span style={{ fontSize: 9, fontWeight: "bold", color: "#64748b" }}>{"สแกนเพื่อรับสินค้า"}</span>
            </div>

            {/* Driver Signature */}
            <div style={{
              flex: 1, border: "1px solid #e2e8f0", borderRadius: 10,
              height: 110, position: "relative", padding: 15,
            }}>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#0f172a" }}>{"ผู้ส่งสินค้า (Driver)"}</div>
              <div style={{
                position: "absolute", bottom: 35, left: 15, right: 15,
                borderBottom: "1px dotted #94a3b8",
              }} />
              <div style={{ position: "absolute", bottom: 10, left: 15, fontSize: 11, color: "#64748b" }}>
                {"วันที่: _____/_____/_____"}
              </div>
            </div>

            {/* Receiver Signature */}
            <div style={{
              flex: 1, border: "1px solid #e2e8f0", borderRadius: 10,
              height: 110, position: "relative", padding: 15,
            }}>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#0f172a" }}>{"ผู้รับสินค้า (Receiver)"}</div>
              <div style={{
                position: "absolute", bottom: 35, left: 15, right: 15,
                borderBottom: "1px dotted #94a3b8",
              }} />
              <div style={{ position: "absolute", bottom: 10, left: 15, fontSize: 11, color: "#64748b" }}>
                {"วันที่: _____/_____/_____"}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
