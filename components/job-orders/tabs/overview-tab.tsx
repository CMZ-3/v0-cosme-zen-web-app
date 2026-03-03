"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import type { JobOrder, TrackingStats } from "@/lib/job-order-types"
import { JO_STATUS_MAP } from "@/lib/job-order-types"

interface Props {
  jobOrder: JobOrder
  stats: TrackingStats
}

export function OverviewTab({ jobOrder, stats }: Props) {
  const statusInfo = JO_STATUS_MAP[jobOrder.status]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* KPI Row */}
      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <KPICard
          icon={<Package className="h-[18px] w-[18px]" />}
          iconBg="bg-[#e0f7f5]"
          label="Produced"
          value={`${stats.totalDone.toLocaleString()}`}
          sub={`/ ${stats.target.toLocaleString()}`}
        />
        <KPICard
          icon={<CheckCircle className="h-[18px] w-[18px]" />}
          iconBg="bg-[#ecfdf5]"
          label="Good Units"
          value={stats.totalGood.toLocaleString()}
          valueColor="text-[#10b981]"
        />
        <KPICard
          icon={<AlertTriangle className="h-[18px] w-[18px]" />}
          iconBg="bg-[#fef2f2]"
          label="Defect"
          value={stats.totalDefect.toLocaleString()}
          sub={`(${stats.defectRate.toFixed(2)}%)`}
          valueColor="text-destructive"
        />
        <KPICard
          icon={<Clock className="h-[18px] w-[18px]" />}
          iconBg="bg-[#e8e0ff]"
          label="Days Left"
          value={`${stats.daysRemaining}`}
          sub="days"
          valueColor={stats.daysRemaining <= 7 ? "text-destructive" : "text-foreground"}
        />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Order Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-bold">Order Information</CardTitle>
              <span
                className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase"
                style={{ background: statusInfo.bg, color: statusInfo.color, borderColor: statusInfo.border }}
              >
                {statusInfo.label}
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <InfoItem label="Customer" value={jobOrder.customerName} />
                <InfoItem label="Brand" value={jobOrder.brandName} />
                <InfoItem label="Product" value={jobOrder.productName} />
                <InfoItem label="SKU" value={jobOrder.sku} mono />
                <InfoItem label="Quantity" value={`${jobOrder.quantity.toLocaleString()} units (${jobOrder.numberOfBatches} Batch x ${jobOrder.batchSize.toLocaleString()})`} />
                <InfoItem label="Formula" value={jobOrder.formulaCode} mono />
                <InfoItem label="Total Value" value={`\u0E3F${jobOrder.totalValue.toLocaleString()}`} valueColor="text-primary" large />
                <InfoItem label="Due Date" value={formatDate(jobOrder.dueDate)} valueColor="text-destructive" />
              </div>
            </CardContent>
          </Card>

          {/* Gantt Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Step Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {jobOrder.productionSteps.map((step) => {
                const pct = step.targetQty > 0
                  ? Math.round((step.completedQty / step.targetQty) * 100)
                  : 0
                return (
                  <div key={step.id} className="flex items-center gap-0 h-7">
                    <span className="w-24 truncate pr-2 text-right text-[10px] font-semibold text-muted-foreground">
                      {step.stepNumber}. {step.name}
                    </span>
                    <div className="relative flex-1 h-5 overflow-hidden rounded bg-secondary">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 flex items-center justify-center rounded text-[8px] font-bold text-white transition-all duration-500",
                          step.status === "done" && "bg-[#10b981]",
                          step.status === "active" && "bg-primary",
                          step.status === "pending" && "bg-border"
                        )}
                        style={{
                          width: `${pct}%`,
                          ...(step.status === "active" ? {
                            backgroundSize: "12px 12px",
                            backgroundImage: "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)",
                            animation: "barStripe .8s linear infinite",
                          } : {}),
                        }}
                      >
                        {pct > 15 && `${pct}%`}
                      </div>
                      {pct <= 15 && (
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Batches */}
          {jobOrder.batches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold">Batches</CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-0 pb-3">
                {jobOrder.batches.map((batch) => (
                  <div key={batch.id} className="flex items-center gap-3.5 border-b border-border py-3 last:border-b-0">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                      {batch.batchNumber}
                    </span>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold">{batch.quantity.toLocaleString()} units</div>
                      <div className="text-[11px] text-muted-foreground">
                        {batch.completedDate ? `Done ${formatShort(batch.completedDate)}` : "In progress"}
                        {batch.status === "waiting_qc" && " - Waiting QC"}
                        {batch.status === "qc_passed" && " - QC Passed"}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[9px] font-bold",
                        batch.status === "qc_passed" && "bg-[#ecfdf5] text-[#15803d]",
                        batch.status === "waiting_qc" && "bg-[#f3efff] text-[#7c3aed]",
                        batch.status === "producing" && "bg-[#eef4ff] text-[#0369a1]",
                        batch.status === "qc_failed" && "bg-[#fef2f2] text-[#b91c1c]"
                      )}
                    >
                      {batch.status === "qc_passed" ? "Passed" : batch.status === "waiting_qc" ? "QC" : batch.status === "producing" ? "Producing" : "Failed"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {jobOrder.notes && (
            <div className="rounded-2xl border border-[rgba(245,158,11,0.12)] bg-[#fef3c7] p-4">
              <div className="mb-1.5 text-[10px] font-bold uppercase text-[#92400e]">Notes</div>
              <div className="whitespace-pre-wrap text-xs leading-relaxed text-[#78350f]">{jobOrder.notes}</div>
            </div>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-0">
                {["Order", "RM", "Produce", "QC", "Deliver"].map((phase, i) => {
                  const colors = ["#ecfdf5", "#ecfdf5", "#eef4ff", "#f3efff", "#f7f8fc"]
                  return (
                    <div key={phase} className="flex-1 text-center px-1 py-2">
                      <div
                        className={cn("mx-auto mb-1 h-2 rounded", i === 0 && "rounded-l-full", i === 4 && "rounded-r-full")}
                        style={{ background: colors[i] }}
                      />
                      <div className="text-[9px] font-semibold text-muted-foreground">{phase}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function KPICard({
  icon,
  iconBg,
  label,
  value,
  sub,
  valueColor = "text-foreground",
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub?: string
  valueColor?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px]", iconBg)}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
        <div className={cn("mt-0.5 text-lg font-extrabold tracking-tight", valueColor)}>
          {value}
          {sub && <span className="ml-1 text-[11px] font-normal text-muted-foreground">{sub}</span>}
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  mono,
  valueColor,
  large,
}: {
  label: string
  value: string
  mono?: boolean
  valueColor?: string
  large?: boolean
}) {
  return (
    <div>
      <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn(
        "text-sm font-semibold",
        mono && "font-mono text-primary",
        valueColor,
        large && "text-base"
      )}>
        {value}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]}`
}
