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
    const DONE_STATUSES = ["completed", "cancelled"]
    const ACTIVE_JO = joRows.filter((j) => !DONE_STATUSES.includes(j.status ?? ""))
    const inProduction = joRows.filter((j) =>
      ["in_progress", "qc"].includes(j.status ?? "")
    ).length

    // costBreakdown.total used for revenue proxy (no separate totalValue column)
    const totalRevenue = joRows.reduce((s, j) => {
      const cb = j.costBreakdown as Record<string, number> | null
      return s + (cb?.total ?? 0)
    }, 0)
    const totalCost = totalRevenue * 0.7 // estimated 70% COGS — no dedicated cost column yet
    const grossProfit = totalRevenue - totalCost
    const margin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0

    // Pipeline counts per status (using schema status values)
    const JO_STATUSES = ["pending", "in_progress", "qc", "completed", "cancelled"]
    const joPipeline: Record<string, number> = {}
    for (const st of JO_STATUSES) {
      joPipeline[st] = joRows.filter((j) => j.status === st).length
    }

    // Recent active JOs (latest first)
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
        orderNumber: j.jobNo,                // jobNo = order number
        productName: j.formulaName,          // formulaName = product being made
        customerName: j.customer ?? "—",     // customer column
        brandName: "",                       // no brand column in schema
        status: j.status,
        priority: j.priority,
        dueDate: j.plannedEnd ?? null,       // plannedEnd = due date
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
            label: j.jobNo,
            detail: `${j.customer ?? ""} - ${j.formulaName}`.trim(),
            date: j.plannedEnd!,
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
      activityItems.push({
        id: `jo-${j.id}`,
        module: "Job Orders",
        title: `${j.jobNo} ${j.status}`,
        description: `${j.customer ?? ""} - ${j.formulaName} (${j.batchSizeKg} kg)`,
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
