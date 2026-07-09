"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import useSWR from "swr"
import { JO_STATUS_MAP, PRIORITY_MAP } from "@/lib/job-order-types"
import type { JobOrder, JOStatus } from "@/lib/job-order-types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Factory, ClipboardList, Layers, TrendingUp, Package,
  ChevronRight, Clock, CheckCircle2, AlertTriangle,
  Gauge, Play, ChevronDown, RefreshCw, Loader2,
  Beaker, ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Statuses shown on the Production floor
const FLOOR_STATUSES: JOStatus[] = ["preparing_rm", "in_production", "qc", "packing"]

// Next-status transitions a floor manager can trigger inline
const NEXT_STATUS: Partial<Record<JOStatus, { to: JOStatus; label: string; icon: React.ElementType }>> = {
  new:          { to: "preparing_rm",  label: "Start Prep",     icon: Play },
  preparing_rm: { to: "in_production", label: "Start Production", icon: Factory },
  in_production:{ to: "qc",           label: "Send to QC",     icon: Beaker },
  qc:           { to: "packing",      label: "Start Packing",  icon: Package },
  packing:      { to: "delivered",    label: "Mark Delivered", icon: CheckCircle2 },
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ProdRow {
  jo: JobOrder
  progress: number
  currentStep: string
  activeBatches: number
  defect: number
}

function computeRow(jo: JobOrder): ProdRow {
  const steps = jo.productionSteps ?? []
  const produced = steps.reduce((s, st) => s + (st.goodQty ?? 0), 0)
  const defect = steps.reduce((s, st) => s + (st.defectQty ?? 0), 0)
  const target = jo.quantity > 0 ? jo.quantity : jo.batchSize
  const progress = target > 0 ? Math.min(Math.round((produced / target) * 100), 100) : 0
  const currentStep =
    steps.find((s) => s.status === "active")?.name ??
    steps.filter((s) => s.status === "done").slice(-1)[0]?.name ??
    JO_STATUS_MAP[jo.status]?.label ??
    "—"
  const activeBatches = (jo.batches ?? []).filter(
    (b) => b.status === "producing" || b.status === "waiting_qc",
  ).length

  return { jo, progress, currentStep, activeBatches, defect }
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export default function ProductionPage() {
  const { data, mutate, isLoading } = useSWR("/api/job-orders", fetcher, {
    refreshInterval: 30000,
  })

  const [advancingId, setAdvancingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"floor" | "all">("floor")

  const allJOs: JobOrder[] = useMemo(() => data?.jobOrders ?? [], [data])

  const rows = useMemo(() => {
    const source =
      filter === "floor"
        ? allJOs.filter((jo) => (FLOOR_STATUSES as string[]).includes(jo.status))
        : allJOs.filter((jo) => jo.status !== "cancelled" && jo.status !== "delivered")
    return source.map(computeRow).sort((a, b) => {
      // Sort: higher priority first, then by due date
      const pOrder = { high: 0, medium: 1, low: 2 }
      const pDiff = pOrder[a.jo.priority] - pOrder[b.jo.priority]
      if (pDiff !== 0) return pDiff
      return new Date(a.jo.dueDate).getTime() - new Date(b.jo.dueDate).getTime()
    })
  }, [allJOs, filter])

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const floorRows = useMemo(
    () => allJOs.filter((jo) => (FLOOR_STATUSES as string[]).includes(jo.status)),
    [allJOs],
  )
  const totalActive = floorRows.length
  const totalBatches = floorRows.reduce(
    (s, jo) =>
      s + (jo.batches ?? []).filter(
        (b) => b.status === "producing" || b.status === "waiting_qc",
      ).length,
    0,
  )
  const avgProgress =
    totalActive > 0
      ? Math.round(
          floorRows
            .map(computeRow)
            .reduce((s, r) => s + r.progress, 0) / totalActive,
        )
      : 0
  const totalKg = floorRows.reduce((s, jo) => s + (jo.batchSize ?? 0), 0)

  // ── Advance status ──────────────────────────────────────────────────────────
  async function handleAdvance(jo: JobOrder) {
    const next = NEXT_STATUS[jo.status]
    if (!next) return
    setAdvancingId(jo.id)
    try {
      const res = await fetch(`/api/job-orders/${jo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next.to }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      await mutate()
      toast.success(`${jo.orderNumber} → ${JO_STATUS_MAP[next.to].label}`, {
        description: `${jo.productName}`,
      })
    } catch {
      toast.error("Failed to advance status")
    } finally {
      setAdvancingId(null)
    }
  }

  const kpis = [
    {
      label: "Active Job Orders", value: String(totalActive),
      sub: "On the floor", icon: ClipboardList, color: "#0369a1", bg: "#eef4ff",
    },
    {
      label: "Batches In Progress", value: String(totalBatches),
      sub: "Producing / awaiting QC", icon: Layers, color: "#7c3aed", bg: "#f3efff",
    },
    {
      label: "Avg Progress", value: `${avgProgress}%`,
      sub: "Across active orders", icon: TrendingUp, color: "#15803d", bg: "#ecfdf5",
    },
    {
      label: "Total Batch Size", value: `${totalKg.toLocaleString()} kg`,
      sub: "On floor right now", icon: Package, color: "#c2410c", bg: "#fef3c7",
    },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <Factory className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">
              Production Floor
            </h1>
            <p className="text-[12px] text-muted-foreground">
              Live tracking — Job Orders in production, QC, and packing
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl text-[12px] gap-1.5"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: k.bg }}
                >
                  <Icon className="h-4 w-4" style={{ color: k.color }} />
                </span>
              </div>
              <div className="text-2xl font-extrabold text-foreground">{k.value}</div>
              <div className="text-[12px] font-semibold text-foreground mt-0.5">
                {k.label}
              </div>
              <div className="text-[10px] text-muted-foreground">{k.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(["floor", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold transition-colors border",
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-secondary",
            )}
          >
            {f === "floor" ? "On Floor" : "All Active"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {rows.length} job order{rows.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Job Order List */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-sm">Loading production data…</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <Factory className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {filter === "floor"
              ? "No job orders currently on the production floor."
              : "No active job orders."}
            <p className="text-xs mt-1">
              Create a new Job Order and advance its status to{" "}
              <strong>Preparing RM</strong> to see it here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(({ jo, progress, currentStep, activeBatches, defect }) => {
              const statusInfo = JO_STATUS_MAP[jo.status]
              const priorityInfo = PRIORITY_MAP[jo.priority]
              const nextAction = NEXT_STATUS[jo.status]
              const days = daysUntil(jo.dueDate)
              const isOverdue = days < 0
              const isAdvancing = advancingId === jo.id

              return (
                <div key={jo.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  {/* Identity */}
                  <div className="w-[220px] shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-primary">
                        {jo.orderNumber}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{
                          background: priorityInfo.bg,
                          color: priorityInfo.color,
                        }}
                      >
                        {priorityInfo.label}
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-foreground truncate mt-0.5">
                      {jo.productName}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {jo.customerName !== "—" ? jo.customerName : jo.formulaCode}
                    </div>
                  </div>

                  {/* Status + Step */}
                  <div className="w-[160px] shrink-0">
                    <span
                      className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        color: statusInfo.color,
                        background: statusInfo.bg,
                        borderColor: statusInfo.border,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                      <Gauge className="h-3 w-3 shrink-0" />
                      <span className="truncate">{currentStep}</span>
                    </div>
                  </div>

                  {/* Progress bar — batch kg based */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">
                        {jo.batchSize} kg batch
                        {jo.quantity ? ` · ${jo.quantity.toLocaleString()} ${jo.unitSize}` : ""}
                      </span>
                      <span className="font-bold text-foreground">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          progress >= 100
                            ? "bg-emerald-500"
                            : progress >= 60
                              ? "bg-primary"
                              : "bg-amber-400",
                        )}
                        style={{ width: `${Math.max(progress, 2)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      {activeBatches > 0 && (
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {activeBatches} active batch{activeBatches !== 1 ? "es" : ""}
                        </span>
                      )}
                      {defect > 0 && (
                        <span className="flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {defect} defect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Due date */}
                  <div className="w-[90px] shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> Due
                    </div>
                    <div
                      className={cn(
                        "text-[11px] font-bold",
                        isOverdue ? "text-red-500" : "text-foreground",
                      )}
                    >
                      {new Date(jo.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                    {isOverdue && (
                      <div className="text-[9px] text-red-500 font-semibold">
                        {Math.abs(days)}d overdue
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {nextAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-lg text-[10px] font-bold gap-1 border-primary/30 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleAdvance(jo)}
                        disabled={isAdvancing}
                      >
                        {isAdvancing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <nextAction.icon className="h-3 w-3" />
                        )}
                        {nextAction.label}
                      </Button>
                    )}
                    <Link href={`/job-orders?id=${jo.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 rounded-lg"
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Status pipeline guide */}
      <div className="mt-4 rounded-2xl border border-border bg-card px-5 py-3">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">
          Production Pipeline
        </p>
        <div className="flex items-center gap-1 flex-wrap">
          {(["new", "preparing_rm", "in_production", "qc", "packing", "delivered"] as JOStatus[]).map(
            (s, i, arr) => (
              <div key={s} className="flex items-center gap-1">
                <span
                  className="rounded-full border px-2 py-0.5 text-[9px] font-bold"
                  style={{
                    color: JO_STATUS_MAP[s].color,
                    background: JO_STATUS_MAP[s].bg,
                    borderColor: JO_STATUS_MAP[s].border,
                  }}
                >
                  {JO_STATUS_MAP[s].label}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/50" />
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
