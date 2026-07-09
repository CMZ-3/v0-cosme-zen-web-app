"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type DeliveryOrder = {
  id: string
  status: string
  scheduledDate?: string | null
  customerName?: string
  totalQuantity?: number
  createdAt?: string
}

interface Props {
  orders: DeliveryOrder[]
}

// Simple inline bar chart — no external lib needed
function BarChart({ data }: { data: { label: string; value: number; max: number; color: string }[] }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-20 text-right text-[10px] font-semibold text-muted-foreground flex-shrink-0">{d.label}</span>
          <div className="flex-1 h-5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", d.color)}
              style={{ width: `${d.max > 0 ? Math.round((d.value / d.max) * 100) : 0}%` }}
            />
          </div>
          <span className="w-6 text-[11px] font-bold text-foreground text-right">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

function KpiCard({
  label, value, sub, color, icon: Icon, trend,
}: {
  label: string; value: string | number; sub?: string; color: string; icon: typeof TrendingUp; trend?: "up" | "down" | "flat"
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className={cn("text-2xl font-extrabold", color)}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      {trend && (
        <div className="flex items-center gap-1 text-[10px]">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
          {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
          {trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
        </div>
      )}
    </div>
  )
}

export function DeliveryAnalytics({ orders }: Props) {
  const stats = useMemo(() => {
    const total = orders.length
    const completed = orders.filter((o) => o.status === "completed").length
    const delivered = orders.filter((o) => o.status === "delivered").length
    const inProgress = orders.filter((o) => ["draft", "reserved", "picking", "shipped"].includes(o.status)).length
    const onTimeRate = total > 0 ? Math.round(((completed + delivered) / total) * 100) : 0

    // Status breakdown
    const statusCounts: Record<string, number> = {}
    for (const o of orders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1
    }

    // Customer breakdown (top 5)
    const customerCounts: Record<string, number> = {}
    for (const o of orders) {
      if (o.customerName) customerCounts[o.customerName] = (customerCounts[o.customerName] ?? 0) + 1
    }
    const topCustomers = Object.entries(customerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Monthly breakdown by createdAt
    const monthlyCounts: Record<string, number> = {}
    for (const o of orders) {
      const date = o.scheduledDate ?? o.createdAt
      if (date) {
        const key = date.slice(0, 7) // YYYY-MM
        monthlyCounts[key] = (monthlyCounts[key] ?? 0) + 1
      }
    }
    const months = Object.entries(monthlyCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6)

    return { total, completed, delivered, inProgress, onTimeRate, statusCounts, topCustomers, months }
  }, [orders])

  const maxStatus = Math.max(...Object.values(stats.statusCounts), 1)
  const maxCustomer = Math.max(...stats.topCustomers.map((c) => c[1]), 1)
  const maxMonth = Math.max(...stats.months.map((m) => m[1]), 1)

  const statusColors: Record<string, string> = {
    draft: "bg-slate-400",
    reserved: "bg-blue-400",
    picking: "bg-amber-400",
    shipped: "bg-indigo-400",
    delivered: "bg-teal-400",
    completed: "bg-green-500",
  }

  const MONTH_SHORT_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
  function monthLabel(key: string) {
    const [, m] = key.split("-")
    return MONTH_SHORT_TH[parseInt(m) - 1] ?? key
  }

  return (
    <div className="px-8 pt-4 pb-8 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total DO" value={stats.total} sub="ทั้งหมด" color="text-foreground" icon={TrendingUp} />
        <KpiCard label="Completed" value={stats.completed} sub="ปิดแล้ว" color="text-green-600" icon={CheckCircle2} trend="up" />
        <KpiCard label="In Progress" value={stats.inProgress} sub="กำลังดำเนินการ" color="text-blue-600" icon={Clock} />
        <KpiCard
          label="On-Time Rate"
          value={`${stats.onTimeRate}%`}
          sub="ส่งตรงเวลา"
          color={stats.onTimeRate >= 80 ? "text-green-600" : "text-amber-600"}
          icon={stats.onTimeRate >= 80 ? TrendingUp : XCircle}
          trend={stats.onTimeRate >= 80 ? "up" : "flat"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Status breakdown */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-[12px] font-bold text-foreground">Status Breakdown</h3>
          <BarChart data={Object.entries(stats.statusCounts).map(([s, v]) => ({
            label: s,
            value: v,
            max: maxStatus,
            color: statusColors[s] ?? "bg-primary",
          }))} />
        </div>

        {/* Top customers */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-[12px] font-bold text-foreground">Top Customers</h3>
          <BarChart data={stats.topCustomers.map(([name, v]) => ({
            label: name.length > 10 ? name.slice(0, 10) + "…" : name,
            value: v,
            max: maxCustomer,
            color: "bg-primary",
          }))} />
        </div>

        {/* Monthly trend */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-[12px] font-bold text-foreground">Monthly Trend</h3>
          {stats.months.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <BarChart data={stats.months.map(([key, v]) => ({
              label: monthLabel(key),
              value: v,
              max: maxMonth,
              color: "bg-teal-500",
            }))} />
          )}
        </div>
      </div>
    </div>
  )
}
