import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jobOrders, deliveryOrders, stockCards } from "@/lib/db/schema"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Parallel queries — no filtering at DB level to keep queries simple
    const [joRows, doRows, scRows] = await Promise.all([
      db.select().from(jobOrders),
      db.select().from(deliveryOrders),
      db.select().from(stockCards),
    ])

    // ── Job Order KPIs ──────────────────────────────────────────
    // DB status values: pending | in_progress | qc | completed | cancelled
    const DONE_STATUSES = ["completed", "cancelled"]
    const ACTIVE_JO = joRows.filter((j) => !DONE_STATUSES.includes(j.status ?? ""))
    const inProduction = joRows.filter((j) =>
      ["in_progress", "qc"].includes(j.status ?? "")
    ).length

    // Revenue = costBreakdown.total (now seeded with real values).
    // Fall back to batchSizeKg * 500 estimate if breakdown is missing.
    const totalRevenue = joRows.reduce((s, j) => {
      const cb = j.costBreakdown as Record<string, number> | null
      const fromBreakdown = cb?.total ?? 0
      return s + (fromBreakdown > 0 ? fromBreakdown : (Number(j.batchSizeKg) || 0) * 500)
    }, 0)
    const totalCost = totalRevenue * 0.65   // ~65% COGS estimate
    const grossProfit = totalRevenue - totalCost
    const margin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0

    // Pipeline counts — use DB status values
    // Map to the display statuses the production-pipeline component expects
    const STATUS_MAP: Record<string, string> = {
      pending: "new",
      in_progress: "in_production",
      qc: "qc",
      completed: "delivered",
      cancelled: "cancelled",
    }
    const joPipeline: Record<string, number> = {
      new: 0, preparing_rm: 0, in_production: 0, qc: 0, packing: 0, delivered: 0,
    }
    for (const j of joRows) {
      const mapped = STATUS_MAP[j.status ?? ""] ?? "new"
      if (mapped in joPipeline) joPipeline[mapped]++
    }

    // Recent active JOs (latest first) — use correct DB column names
    const recentJos = [...joRows]
      .filter((j) => !DONE_STATUSES.includes(j.status ?? ""))
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta
      })
      .slice(0, 4)
      .map((j) => ({
        id: j.id,
        orderNumber: j.jobNo,              // DB col: jobNo
        productName: j.formulaName,        // DB col: formulaName
        customerName: j.customer ?? "—",   // DB col: customer
        brandName: "",
        status: STATUS_MAP[j.status ?? ""] ?? j.status,
        priority: j.priority === "normal" ? "medium" : (j.priority ?? "medium"),
        dueDate: j.plannedEnd ?? null,     // DB col: plannedEnd
        batchSize: j.batchSizeKg,
      }))

    // ── Delivery KPIs ───────────────────────────────────────────
    const DELIVERY_DONE = ["delivered", "completed", "cancelled"]
    const pendingDelivery = doRows.filter((d) => !DELIVERY_DONE.includes(d.status ?? ""))
    const shippedCount = doRows.filter((d) => d.status === "shipped").length
    const pickingCount = doRows.filter((d) => d.status === "picking").length

    // ── Stock KPIs ──────────────────────────────────────────────
    const totalStock = scRows.length
    const outOfStock = scRows.filter((s) => s.inventoryStatus === "out_of_stock").length
    const lowStock = scRows.filter((s) => s.inventoryStatus === "low").length
    const overStock = scRows.filter((s) => s.inventoryStatus === "over_stock").length
    const healthy = scRows.filter((s) => s.inventoryStatus === "healthy").length
    // balance * unitCost for inventory value
    const totalInventoryValue = scRows.reduce((s, c) => {
      const qty = Number(c.balance ?? 0)
      const cost = Number(c.unitCost ?? 0)
      return s + qty * cost
    }, 0)

    // ── Accounting rollup ───────────────────────────────────────
    const openInvoices = doRows.filter((d) => d.status === "delivered").length

    // ── Upcoming deadlines (JO plannedEnd + delivery dates) ─────
    const today = new Date()
    const deadlines: Array<{
      id: string; type: string; label: string; detail: string
      date: string; daysLeft: number
    }> = []

    joRows
      .filter((j) => j.plannedEnd && !DONE_STATUSES.includes(j.status ?? ""))
      .forEach((j) => {
        const dl = Math.ceil((new Date(j.plannedEnd!).getTime() - today.getTime()) / 86400000)
        if (dl > -30) {
          deadlines.push({
            id: `jo-${j.id}`,
            type: "job",
            label: j.jobNo,                            // DB col: jobNo
            detail: `${j.customer ?? ""} - ${j.formulaName}`.trim(),
            date: j.plannedEnd!,                       // DB col: plannedEnd
            daysLeft: dl,
          })
        }
      })

    doRows
      .filter((d) => d.deliveryDate && !DELIVERY_DONE.includes(d.status ?? ""))
      .forEach((d) => {
        const dl = Math.ceil((new Date(d.deliveryDate!).getTime() - today.getTime()) / 86400000)
        if (dl > -30) {
          deadlines.push({
            id: `del-${d.id}`,
            type: "delivery",
            label: d.deliveryNumber,
            detail: `${d.customerName}${d.productSummary ? ` - ${d.productSummary}` : ""}`,
            date: d.deliveryDate!,
            daysLeft: dl,
          })
        }
      })

    deadlines.sort((a, b) => a.daysLeft - b.daysLeft)

    // ── Activity feed ───────────────────────────────────────────
    const activityItems: Array<{
      id: string; module: string; title: string
      description: string; sortDate: string
    }> = []

    joRows.forEach((j) => {
      const statusLabel = STATUS_MAP[j.status ?? ""] ?? j.status ?? ""
      activityItems.push({
        id: `jo-${j.id}`,
        module: "Job Orders",
        title: `${j.jobNo} — ${statusLabel}`,
        description: `${j.customer ?? ""} — ${j.formulaName} (${j.batchSizeKg} kg)`.replace(/^— /, ""),
        sortDate: j.updatedAt ? String(j.updatedAt) : String(j.createdAt ?? ""),
      })
    })

    doRows.forEach((d) => {
      activityItems.push({
        id: `del-${d.id}`,
        module: "Delivery",
        title: `${d.deliveryNumber} ${d.status}`,
        description: `${d.customerName}${d.trackingNumber ? ` - ${d.trackingNumber}` : ""}`,
        sortDate: d.updatedAt ? String(d.updatedAt) : String(d.createdAt ?? ""),
      })
    })

    activityItems.sort((a, b) => b.sortDate.localeCompare(a.sortDate))

    return NextResponse.json({
      ok: true,
      kpi: {
        activeJo: ACTIVE_JO.length,
        inProduction,
        totalRevenue,
        totalCost,
        grossProfit,
        margin,
        openInvoices,
        totalStock,
        outOfStock,
        lowStock,
        overStock,
        healthy,
        totalInventoryValue,
        pendingDelivery: pendingDelivery.length,
        shippedCount,
        pickingCount,
      },
      joPipeline,
      recentJos,
      deadlines: deadlines.slice(0, 10),
      recentActivity: activityItems.slice(0, 10),
      joCount: joRows.length,
      doCount: doRows.length,
    })
  } catch (err) {
    console.error("[v0] /api/dashboard error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
