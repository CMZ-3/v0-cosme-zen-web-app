"use client"

import { useMemo } from "react"
import Link from "next/link"
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { JO_STATUS_MAP, PRIORITY_MAP } from "@/lib/job-order-types"
import type { JobOrder } from "@/lib/job-order-types"
import { cn } from "@/lib/utils"
import {
  Factory, ClipboardList, Layers, TrendingUp, Package, ChevronRight,
  Clock, CheckCircle2, AlertTriangle, Gauge,
} from "lucide-react"

// Production floor = JOs actively being made or in QC/packing
const ACTIVE_STATUSES = ["preparing_rm", "in_production", "qc", "packing"] as const

interface ProdRow {
  jo: JobOrder
  produced: number
  target: number
  progress: number
  defect: number
  currentStep: string
  activeBatches: number
}

function computeRow(jo: JobOrder): ProdRow {
  const target = jo.quantity
  const produced = jo.productionSteps.reduce((sum, s) => sum + s.goodQty, 0)
  const defect = jo.productionSteps.reduce((sum, s) => sum + s.defectQty, 0)
  const progress = target > 0 ? Math.min(Math.round((produced / target) * 100), 100) : 0
  const currentStep = jo.productionSteps.find((s) => s.status === "active")?.name
    ?? jo.productionSteps.filter((s) => s.status === "done").slice(-1)[0]?.name
    ?? "Not started"
  const activeBatches = jo.batches.filter((b) => b.status === "producing" || b.status === "waiting_qc").length
  return { jo, produced, target, progress, defect, currentStep, activeBatches }
}

export default function ProductionPage() {
  const rows = useMemo(
    () =>
      mockJobOrders
        .filter((jo) => (ACTIVE_STATUSES as readonly string[]).includes(jo.status))
        .map(computeRow)
        .sort((a, b) => b.progress - a.progress),
    []
  )

  const totalActive = rows.length
  const totalBatches = rows.reduce((s, r) => s + r.activeBatches, 0)
  const avgProgress = totalActive > 0 ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / totalActive) : 0
  const producedToday = rows.reduce((s, r) => s + r.produced, 0)

  const kpis = [
    { label: "Active Job Orders", value: String(totalActive), sub: "On the floor", icon: ClipboardList, color: "#0369a1", bg: "#eef4ff" },
    { label: "Batches In Progress", value: String(totalBatches), sub: "Producing / awaiting QC", icon: Layers, color: "#7c3aed", bg: "#f3efff" },
    { label: "Avg Progress", value: `${avgProgress}%`, sub: "Across active orders", icon: TrendingUp, color: "#15803d", bg: "#ecfdf5" },
    { label: "Units Produced", value: producedToday.toLocaleString(), sub: "Good units, active JOs", icon: Package, color: "#c2410c", bg: "#fef3c7" },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <Factory className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Production Floor</h1>
          <p className="text-[12px] text-muted-foreground">Live tracking of job orders currently in production, QC, and packing</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: k.bg }}>
                  <Icon className="h-4.5 w-4.5" style={{ color: k.color }} />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{k.value}</div>
              <div className="text-[12px] font-semibold text-foreground mt-0.5">{k.label}</div>
              <div className="text-[10px] text-muted-foreground">{k.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Active JO list */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Active Job Orders</h2>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">{rows.length} on floor</span>
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Factory className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No job orders currently in production
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(({ jo, produced, target, progress, defect, currentStep, activeBatches }) => {
              const statusInfo = JO_STATUS_MAP[jo.status]
              const priorityInfo = PRIORITY_MAP[jo.priority]
              return (
                <Link
                  key={jo.id}
                  href={`/job-orders?id=${jo.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
                >
                  {/* Left: identity */}
                  <div className="w-[220px] shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">{jo.orderNumber}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: priorityInfo.bg, color: priorityInfo.color }}
                      >
                        {priorityInfo.label}
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-foreground truncate mt-0.5">{jo.productName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{jo.customerName}</div>
                  </div>

                  {/* Middle: current step + status */}
                  <div className="w-[160px] shrink-0">
                    <span
                      className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold"
                      style={{ color: statusInfo.color, background: statusInfo.bg, borderColor: statusInfo.border }}
                    >
                      {statusInfo.label}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Gauge className="h-3 w-3" /> {currentStep}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">{produced.toLocaleString()} / {target.toLocaleString()} pcs</span>
                      <span className="font-bold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-primary" : "bg-amber-400"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{activeBatches} active batch{activeBatches !== 1 ? "es" : ""}</span>
                      {defect > 0 && (
                        <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="h-3 w-3" />{defect} defect</span>
                      )}
                      {progress >= 100 && (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" />Target met</span>
                      )}
                    </div>
                  </div>

                  {/* Due date */}
                  <div className="w-[110px] shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Due
                    </div>
                    <div className="text-[11px] font-bold text-foreground">
                      {new Date(jo.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
