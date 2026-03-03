"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Check, Download, Plus, Zap, Target, CheckCircle, AlertTriangle, BarChart3, Percent, Package } from "lucide-react"
import type { JobOrder, ProductionStep, TrackingStats, DailyRecord } from "@/lib/job-order-types"

interface Props {
  jobOrder: JobOrder
  stats: TrackingStats
}

export function DailyTrackingTab({ jobOrder, stats }: Props) {
  const currentStep = jobOrder.productionSteps.find((s) => s.status === "active")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Summary Callout */}
      <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-[rgba(245,158,11,0.2)] bg-[#fef3c7] p-3.5">
        <Zap className="h-6 w-6 shrink-0 text-[#f59e0b]" />
        <div className="flex-1 text-xs leading-relaxed">
          <span className="font-extrabold">Today</span> &mdash; Working on{" "}
          <span className="font-extrabold">{currentStep ? `Step ${currentStep.stepNumber}: ${currentStep.name}` : "---"}</span>
          {" | "}Produced{" "}
          <span className="font-extrabold">{stats.totalDone.toLocaleString()}</span> / {stats.target.toLocaleString()} units
          {" | "}Remaining{" "}
          <span className="font-extrabold text-destructive">{stats.totalPending.toLocaleString()} units</span>
          {" | "}<span className="font-extrabold text-destructive">Due in {stats.daysRemaining} days</span>
        </div>
      </div>

      {/* KPI Row - 6 cards */}
      <div className="mb-5 grid grid-cols-6 gap-2.5">
        <KPIMini icon={<Target className="h-4 w-4" />} label="Target" value={stats.target.toLocaleString()} />
        <KPIMini icon={<BarChart3 className="h-4 w-4" />} label="Produced" value={stats.totalDone.toLocaleString()} valueColor="text-primary" />
        <KPIMini icon={<Package className="h-4 w-4" />} label="Remaining" value={stats.totalPending.toLocaleString()} valueColor="text-[#f59e0b]" />
        <KPIMini icon={<CheckCircle className="h-4 w-4" />} label="Good" value={stats.totalGood.toLocaleString()} valueColor="text-[#10b981]" />
        <KPIMini icon={<AlertTriangle className="h-4 w-4" />} label="Defect" value={stats.totalDefect.toLocaleString()} valueColor="text-destructive" />
        <KPIMini icon={<Percent className="h-4 w-4" />} label="Defect %" value={`${stats.defectRate.toFixed(2)}%`} />
      </div>

      {/* Step Tracker Accordion */}
      <div className="space-y-2.5">
        {jobOrder.productionSteps.map((step) => (
          <StepCard key={step.id} step={step} jobOrderId={jobOrder.id} batches={jobOrder.batches} />
        ))}
      </div>
    </div>
  )
}

function KPIMini({ icon, label, value, valueColor = "text-foreground" }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-3 text-center">
      <div className="mb-1 flex items-center justify-center text-muted-foreground">{icon}</div>
      <div className="text-[8px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-lg font-extrabold", valueColor)}>{value}</div>
    </div>
  )
}

interface StepCardProps {
  step: ProductionStep
  jobOrderId: string
  batches: JobOrder["batches"]
}

function StepCard({ step, jobOrderId, batches }: StepCardProps) {
  const [expanded, setExpanded] = useState(step.status === "active")
  const [records, setRecords] = useState<DailyRecord[]>(step.dailyRecords)
  const [formDate, setFormDate] = useState("2026-02-21")
  const [formGood, setFormGood] = useState("")
  const [formDefect, setFormDefect] = useState("")
  const [formOperator, setFormOperator] = useState("K. Somsri")
  const [formNote, setFormNote] = useState("")

  const pct = step.targetQty > 0 ? Math.round((step.completedQty / step.targetQty) * 100) : 0
  const remaining = Math.max(step.targetQty - step.completedQty, 0)

  const handleAddRecord = () => {
    const good = parseInt(formGood) || 0
    const defect = parseInt(formDefect) || 0
    if (good === 0 && defect === 0) return
    const cumTotal = step.completedQty + good + defect
    const newRecord: DailyRecord = {
      id: `r-new-${Date.now()}`,
      date: formDate,
      stepId: step.id,
      batchId: batches[batches.length - 1]?.id ?? "",
      goodQty: good,
      defectQty: defect,
      operatorName: formOperator,
      note: formNote,
      cumulativeTotal: cumTotal,
      createdAt: new Date().toISOString(),
    }
    setRecords([newRecord, ...records])
    setFormGood("")
    setFormDefect("")
    setFormNote("")
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        step.status === "done" && "border-l-4 border-l-[#10b981] opacity-85 hover:opacity-100",
        step.status === "active" && "border-l-4 border-l-primary",
        step.status === "pending" && "opacity-55",
        expanded && "shadow-md"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50"
      >
        {/* Step circle */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold transition-all",
            step.status === "done" && "bg-[#10b981] text-white",
            step.status === "active" && "bg-primary text-white shadow-[0_0_0_4px_rgba(76,139,245,0.15)]",
            step.status === "pending" && "border-2 border-border bg-secondary text-muted-foreground"
          )}
        >
          {step.status === "done" ? <Check className="h-4 w-4" /> : step.stepNumber}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground">
            Step {step.stepNumber} &mdash; {step.name}
            {step.status === "active" && (
              <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                Active
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{step.description}</p>
        </div>

        {/* Stats */}
        <div className="flex shrink-0 items-center gap-4">
          {(step.status === "done" || step.status === "active") && (
            <>
              <div className="text-center">
                <div className="text-[8px] font-bold uppercase text-muted-foreground">Done</div>
                <div className="font-mono text-base font-extrabold text-primary">{step.completedQty.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] font-bold uppercase text-muted-foreground">Remaining</div>
                <div className="font-mono text-base font-extrabold text-[#f59e0b]">{remaining.toLocaleString()}</div>
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    step.status === "done" ? "bg-[#10b981]" : "bg-primary"
                  )}
                  style={{
                    width: `${pct}%`,
                    ...(step.status === "active" ? {
                      backgroundSize: "12px 12px",
                      backgroundImage: "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)",
                    } : {}),
                  }}
                />
              </div>
              <span className="font-mono text-sm font-extrabold">{pct}%</span>
            </>
          )}
          {step.status === "pending" && (
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
              Pending
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-border">
          {/* Add record form (only for active step) */}
          {step.status === "active" && (
            <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <span className="whitespace-nowrap text-[11px] font-bold text-primary">
                <Plus className="mr-0.5 inline h-3 w-3" />Record:
              </span>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-7 w-[130px] text-[11px]"
              />
              <Input
                type="number"
                placeholder="Good qty"
                value={formGood}
                onChange={(e) => setFormGood(e.target.value)}
                className="h-7 w-[85px] text-[11px]"
              />
              <Input
                type="number"
                placeholder="Defect"
                value={formDefect}
                onChange={(e) => setFormDefect(e.target.value)}
                className="h-7 w-[70px] text-[11px]"
              />
              <select
                value={formOperator}
                onChange={(e) => setFormOperator(e.target.value)}
                className="h-7 rounded-md border border-input bg-card px-2 text-[11px] outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option>K. Somsri</option>
                <option>K. Wichai</option>
                <option>K. Somchai</option>
              </select>
              <Input
                placeholder="Notes..."
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                className="h-7 flex-1 min-w-[100px] text-[11px]"
              />
              <Button size="sm" className="h-7 gap-1 text-[11px]" onClick={handleAddRecord}>
                Save
              </Button>
            </div>
          )}

          {/* Daily log table */}
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Batch</th>
                    <th className="px-4 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Good</th>
                    <th className="px-4 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Defect</th>
                    <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Operator</th>
                    <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Cumulative</th>
                    <th className="px-4 py-2 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const batch = batches.find((b) => b.id === r.batchId)
                    const isToday = i === 0 && step.status === "active"
                    return (
                      <tr key={r.id} className={cn("border-b border-border hover:bg-primary/[0.02]", isToday && "bg-primary/[0.04]")}>
                        <td className={cn("px-4 py-2.5 font-semibold", isToday && "font-bold text-primary")}>
                          {formatShort(r.date)}
                          {isToday && (
                            <span className="ml-1 rounded bg-primary/10 px-1 py-px text-[9px] text-primary">Today</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {batch ? (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                              {batch.batchNumber}
                            </span>
                          ) : "---"}
                        </td>
                        <td className="px-4 py-2.5 text-center font-extrabold text-[14px] text-[#10b981]">
                          +{r.goodQty.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {r.defectQty > 0 ? (
                            <span className="font-bold text-destructive">{r.defectQty}</span>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.operatorName}</td>
                        <td className="px-4 py-2.5 font-mono font-bold">{r.cumulativeTotal.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.note || "---"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-[13px] text-muted-foreground">
              {step.status === "pending"
                ? "Waiting for previous step to complete"
                : "No records yet"}
            </div>
          )}

          {/* Footer */}
          {records.length > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-2.5">
              <div className="text-[11px] text-muted-foreground">
                {records.length} records &bull; Avg/day:{" "}
                <span className="font-bold text-foreground">{calcAvg(records)} units</span>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-7 text-[10px]">
                  <Download className="mr-1 h-3 w-3" /> Export
                </Button>
                {step.status === "active" && (
                  <Button size="sm" className="h-7 bg-[#10b981] text-[10px] text-white hover:bg-[#059669]">
                    <Check className="mr-1 h-3 w-3" /> Complete Step
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function calcAvg(records: DailyRecord[]): number {
  if (records.length === 0) return 0
  const total = records.reduce((sum, r) => sum + r.goodQty + r.defectQty, 0)
  const days = new Set(records.map((r) => r.date)).size
  return days > 0 ? Math.round(total / days) : 0
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]}`
}
