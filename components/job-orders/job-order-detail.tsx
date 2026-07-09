"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Printer, Download, Pencil, FlaskConical, User, Package, DollarSign, Clock, Check, MoreHorizontal, Copy, Ban, PlayCircle, PauseCircle, CheckCircle2, ShieldCheck, PackageCheck, Truck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { JobOrder, JOStatus, TrackingStats } from "@/lib/job-order-types"
import { JO_STATUS_MAP } from "@/lib/job-order-types"

// ─── ACTION_RULES ────────────────────────────────────────────────────────────
// Mirrors spec 6.4: status × action → allowed
type JOAction = "start_production" | "submit_qc" | "pass_qc" | "start_packing" | "mark_delivered" | "cancel"

interface ActionDef {
  action: JOAction
  label: string
  icon: React.ElementType
  variant: "default" | "outline" | "destructive"
  color?: string
  allowedFrom: JOStatus[]
  transitionsTo: JOStatus
}

const ACTION_RULES: ActionDef[] = [
  {
    action: "start_production",
    label: "Start Production",
    icon: PlayCircle,
    variant: "default",
    color: "bg-primary",
    allowedFrom: ["new", "preparing_rm"],
    transitionsTo: "in_production",
  },
  {
    action: "submit_qc",
    label: "Submit for QC",
    icon: ShieldCheck,
    variant: "outline",
    allowedFrom: ["in_production"],
    transitionsTo: "qc",
  },
  {
    action: "pass_qc",
    label: "QC Passed -- Pack",
    icon: CheckCircle2,
    variant: "default",
    color: "bg-[#7c3aed]",
    allowedFrom: ["qc"],
    transitionsTo: "packing",
  },
  {
    action: "start_packing",
    label: "Start Packing",
    icon: PackageCheck,
    variant: "outline",
    allowedFrom: ["packing"],
    transitionsTo: "packing",
  },
  {
    action: "mark_delivered",
    label: "Mark Delivered",
    icon: Truck,
    variant: "default",
    color: "bg-[#15803d]",
    allowedFrom: ["packing"],
    transitionsTo: "delivered",
  },
  {
    action: "cancel",
    label: "Cancel JO",
    icon: Ban,
    variant: "destructive",
    allowedFrom: ["new", "preparing_rm", "in_production"],
    transitionsTo: "cancelled",
  },
]
import { OverviewTab } from "./tabs/overview-tab"
import { DailyTrackingTab } from "./tabs/daily-tracking-tab"
import { MaterialsTab } from "./tabs/materials-tab"
import { QCTab } from "./tabs/qc-tab"
import { CostingTab } from "./tabs/costing-tab"

type DetailTab = "overview" | "tracking" | "materials" | "qc" | "costing"

const TABS: { value: DetailTab; label: string; icon: React.ReactNode }[] = [
  { value: "overview", label: "Overview", icon: <Package className="h-3.5 w-3.5" /> },
  { value: "tracking", label: "Daily Tracking", icon: <Clock className="h-3.5 w-3.5" /> },
  { value: "materials", label: "Materials", icon: <FlaskConical className="h-3.5 w-3.5" /> },
  { value: "qc", label: "QC", icon: <Check className="h-3.5 w-3.5" /> },
  { value: "costing", label: "Costing", icon: <DollarSign className="h-3.5 w-3.5" /> },
]

interface Props {
  jobOrder: JobOrder
  onStatusChange?: () => void
}

export function JobOrderDetail({ jobOrder, onStatusChange }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<DetailTab>("overview")
  const [currentStatus, setCurrentStatus] = useState<JOStatus>(jobOrder.status)
  const [cloneBusy, setCloneBusy] = useState(false)

  // Sync status when a different JO is selected in the list panel
  useEffect(() => {
    setCurrentStatus(jobOrder.status)
  }, [jobOrder.id, jobOrder.status])

  const statusInfo = JO_STATUS_MAP[currentStatus]

  const stats = useMemo<TrackingStats>(() => computeStats(jobOrder), [jobOrder])

  const availableActions = ACTION_RULES.filter((a) => a.allowedFrom.includes(currentStatus))

  const handlePrint = () => {
    window.open(`/job-orders/${jobOrder.id}/print`, "_blank")
  }

  const handleDuplicate = async () => {
    setCloneBusy(true)
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clone" }),
      })
      if (res.ok) {
        const { id: newId } = await res.json()
        toast.success(`Duplicate JO #${jobOrder.orderNumber} สำเร็จ`)
        router.push(`/job-orders?id=${newId}`)
        onStatusChange?.()
      } else {
        toast.error("เกิดข้อผิดพลาด")
      }
    } finally {
      setCloneBusy(false)
    }
  }

  async function handleAction(rule: ActionDef) {
    if (rule.action === "cancel") {
      if (!confirm(`Cancel JO #${jobOrder.orderNumber}? This cannot be undone.`)) return
    }
    const newStatus = rule.transitionsTo
    setCurrentStatus(newStatus)
    try {
      await fetch(`/api/job-orders/${jobOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      onStatusChange?.()
    } catch {
      // status already updated optimistically in UI; silently ignore network errors
    }
    toast.success(`JO #${jobOrder.orderNumber}: ${rule.label}`, {
      description: `Status changed to ${JO_STATUS_MAP[newStatus].label}`,
    })
  }

  return (
    <>
      {/* Detail Header */}
      <div className="shrink-0 px-8 pt-5 z-[1]">
        {/* Header row */}
        <div className="mb-4 flex items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-primary/5">
              <FlaskConical className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-mono text-[13px] font-bold text-primary">#{jobOrder.orderNumber}</div>
              <div className="text-xl font-extrabold tracking-tight text-foreground">{jobOrder.productName}</div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {jobOrder.customerName} ({jobOrder.brandName})</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {jobOrder.quantity.toLocaleString()} units x {jobOrder.unitSize}</span>
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {"\u0E3F"}{jobOrder.totalValue.toLocaleString()}</span>
                <span className="font-semibold text-destructive"><Clock className="inline h-3 w-3 mr-0.5" />Due: {formatDate(jobOrder.dueDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            {/* Status Badge */}
            <span className={cn(
              "self-center rounded-full border px-3 py-1 text-[11px] font-bold",
              statusInfo.border, statusInfo.bg
            )} style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </span>

            {/* Dynamic status-gated action buttons */}
            {availableActions.filter(a => a.action !== "cancel").map((rule) => {
              const Icon = rule.icon
              return (
                <Button
                  key={rule.action}
                  size="sm"
                  variant={rule.variant}
                  className={cn("h-8 gap-1.5 text-[11px]", rule.color && `${rule.color} text-white hover:opacity-90`)}
                  onClick={() => handleAction(rule)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {rule.label}
                </Button>
              )
            })}

            {/* Secondary actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-3.5 w-3.5" /> Print JO
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Download className="mr-2 h-3.5 w-3.5" /> Export PDF
                </DropdownMenuItem>
                {(currentStatus === "new" || currentStatus === "preparing_rm") && (
                  <DropdownMenuItem onClick={() => router.push(`/job-orders/${jobOrder.id}?edit=1`)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem disabled={cloneBusy} onClick={handleDuplicate}>
                  <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                </DropdownMenuItem>
                {availableActions.some(a => a.action === "cancel") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleAction(ACTION_RULES.find(a => a.action === "cancel")!)}
                    >
                      <Ban className="mr-2 h-3.5 w-3.5" /> Cancel JO
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-1 flex items-center gap-5 rounded-2xl border border-border bg-card p-3.5 px-5 shadow-sm">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Production Progress</span>
              <span className="text-[11px] text-muted-foreground">
                Produced <span className="font-semibold text-foreground">{stats.totalDone.toLocaleString()}</span> / {stats.target.toLocaleString()} units
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#7c3aed] transition-all duration-700"
                style={{
                  width: `${stats.progressPercent}%`,
                  backgroundSize: "20px 20px",
                  backgroundImage: "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)",
                  animation: "barStripe 1s linear infinite",
                }}
              />
            </div>
            {/* Progress steps */}
            <div className="mt-2.5 flex items-center px-2">
              {jobOrder.productionSteps.slice(0, 6).map((step, i) => (
                <div key={step.id} className="relative flex-1 text-center">
                  {i > 0 && (
                    <div className={cn(
                      "absolute top-[11px] -left-1/2 right-1/2 h-0.5 z-0",
                      step.status === "done" ? "bg-[#10b981]" : step.status === "active" ? "bg-primary" : "bg-secondary"
                    )} />
                  )}
                  <div className={cn(
                    "relative z-[1] mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
                    step.status === "done" && "border-[#10b981] bg-[#10b981] text-white",
                    step.status === "active" && "border-primary bg-primary text-white shadow-[0_0_0_4px_rgba(76,139,245,0.15)]",
                    step.status === "pending" && "border-border bg-card text-muted-foreground"
                  )}>
                    {step.status === "done" ? <Check className="h-3 w-3" /> : step.stepNumber}
                  </div>
                  <div className={cn(
                    "text-[9px] font-semibold",
                    step.status === "done" && "text-[#10b981]",
                    step.status === "active" && "text-primary font-bold",
                    step.status === "pending" && "text-muted-foreground"
                  )}>
                    {step.name.length > 10 ? step.name.slice(0, 10) + "..." : step.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-[70px] text-center">
            <div className="font-mono text-xl font-extrabold text-primary">{stats.progressPercent}%</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase">Progress</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="z-[1] mt-2 flex border-b border-border px-8">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13px] font-semibold transition-all whitespace-nowrap",
              tab === t.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}
            {t.label}
            {t.value === "tracking" && (
              <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-bold text-primary">LIVE</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-8">
        {tab === "overview" && <OverviewTab jobOrder={jobOrder} stats={stats} />}
        {tab === "tracking" && <DailyTrackingTab jobOrder={jobOrder} stats={stats} onRefresh={onStatusChange} />}
        {tab === "materials" && <MaterialsTab jobOrder={jobOrder} />}
        {tab === "qc" && <QCTab jobOrder={jobOrder} onRefresh={onStatusChange} />}
        {tab === "costing" && <CostingTab jobOrder={jobOrder} />}
      </div>

      <style jsx global>{`
        @keyframes barStripe {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
      `}</style>
    </>
  )
}

function computeStats(jo: JobOrder): TrackingStats {
  const steps = jo.productionSteps
  const allRecords = steps.flatMap((s) => s.dailyRecords)

  // Use step-1 completedQty as the "produced" reference — summing all steps
  // double-counts the same units flowing through each stage.
  const firstStep = steps[0]
  const totalGood = firstStep ? firstStep.goodQty : 0
  const totalDefect = firstStep ? firstStep.defectQty : 0
  const totalDone = firstStep ? firstStep.completedQty : 0
  const target = jo.quantity
  const currentStep = steps.find((s) => s.status === "active")
  const uniqueDays = new Set(allRecords.map((r) => r.date)).size
  const avgPerDay = uniqueDays > 0 ? Math.round(totalDone / uniqueDays) : 0
  const doneSteps = steps.filter((s) => s.status === "done").length
  const activeStep = steps.find((s) => s.status === "active")
  let progressPct = 0
  if (steps.length > 0) {
    const activePart = activeStep && activeStep.targetQty > 0
      ? (activeStep.completedQty / activeStep.targetQty) / steps.length
      : 0
    progressPct = Math.min(Math.round(((doneSteps / steps.length) + activePart) * 100), 100)
  }
  const now = new Date()
  const due = new Date(jo.dueDate)
  const daysRemaining = Math.max(Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0)

  return {
    target,
    totalDone,
    totalPending: Math.max(target - totalDone, 0),
    totalGood,
    totalDefect,
    defectRate: totalDone > 0 ? (totalDefect / totalDone) * 100 : 0,
    progressPercent: progressPct,
    daysRemaining,
    avgPerDay,
    currentStepName: currentStep?.name ?? "---",
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
