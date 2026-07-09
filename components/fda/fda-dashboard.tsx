"use client"

import { cn } from "@/lib/utils"
import type { FdaKPISummary, FdaListItem } from "@/lib/fda-types"
import {
  AlertTriangle, CheckCircle2, Clock, TrendingUp, CalendarClock,
} from "lucide-react"

interface Props {
  kpi: FdaKPISummary
  registrations: FdaListItem[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  approved:  { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  submitted: { bg: "bg-blue-50",    text: "text-blue-700",    bar: "bg-blue-500" },
  draft:     { bg: "bg-secondary",  text: "text-muted-foreground", bar: "bg-border" },
  rejected:  { bg: "bg-red-50",     text: "text-red-700",     bar: "bg-red-500" },
  expired:   { bg: "bg-amber-50",   text: "text-amber-700",   bar: "bg-amber-500" },
  inactive:  { bg: "bg-secondary",  text: "text-muted-foreground", bar: "bg-muted-foreground" },
}

export function FdaDashboard({ kpi, registrations }: Props) {
  const total = kpi.total || 1 // avoid div-by-zero

  const statusBars = [
    { label: "Approved", value: kpi.approved, key: "approved" },
    { label: "Submitted", value: kpi.submitted, key: "submitted" },
    { label: "Draft", value: kpi.draft, key: "draft" },
    { label: "Rejected", value: kpi.rejected, key: "rejected" },
    { label: "Expired", value: kpi.expired, key: "expired" },
  ]

  // Upcoming expirations — registrations with expiryDate within 90 days
  const now = new Date()
  const upcoming = registrations
    .filter((r) => {
      if (!r.expiryDate) return false
      const d = new Date(r.expiryDate)
      const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
      return days >= 0 && days <= 90
    })
    .sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""))

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={CheckCircle2}
          label="Approved"
          value={kpi.approved}
          total={kpi.total}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <SummaryCard
          icon={Clock}
          label="Pending / Draft"
          value={kpi.submitted + kpi.draft}
          total={kpi.total}
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Expiring ≤30 days"
          value={kpi.expiring30}
          total={kpi.total}
          colorClass="text-red-600"
          bgClass="bg-red-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Expiring ≤90 days"
          value={kpi.expiring90}
          total={kpi.total}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Status breakdown bar chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-4">Status Breakdown</h3>
          <div className="space-y-3">
            {statusBars.map((bar) => {
              const pct = Math.round((bar.value / total) * 100)
              const c = STATUS_COLORS[bar.key] ?? STATUS_COLORS.draft
              return (
                <div key={bar.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-foreground">{bar.label}</span>
                    <span className={cn("text-[11px] font-bold", c.text)}>{bar.value} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", c.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* JK vs JR breakdown */}
          <div className="mt-5 flex gap-3 border-t border-border pt-4">
            <div className="flex-1 rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
              <div className="text-xl font-extrabold text-blue-700">{kpi.totalJk}</div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">จ.ค. (JK)</div>
            </div>
            <div className="flex-1 rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
              <div className="text-xl font-extrabold text-amber-700">{kpi.totalJr}</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">จ.ร. (JR)</div>
            </div>
          </div>
        </div>

        {/* Expiry timeline */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Expiry Timeline (next 90 days)</h3>
            {kpi.expiring30 > 0 && (
              <span className="ml-auto rounded-full bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 border border-red-200">
                {kpi.expiring30} urgent
              </span>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-foreground">No licenses expiring in 90 days</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">All registrations are up to date</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-64">
              {upcoming.map((r) => {
                const d = new Date(r.expiryDate!)
                const days = Math.ceil((d.getTime() - now.getTime()) / 86_400_000)
                const urgent = days <= 30
                const warning = days <= 60
                return (
                  <div
                    key={r.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                      urgent ? "border-red-200 bg-red-50" : warning ? "border-amber-200 bg-amber-50" : "border-border bg-secondary/30",
                    )}
                  >
                    <div className={cn("w-8 shrink-0 text-center rounded-lg py-1", urgent ? "bg-red-100" : warning ? "bg-amber-100" : "bg-secondary")}>
                      <div className={cn("text-[16px] font-extrabold leading-none", urgent ? "text-red-700" : warning ? "text-amber-700" : "text-foreground")}>{days}</div>
                      <div className="text-[8px] font-bold text-muted-foreground uppercase">days</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate">{r.productNameTh || r.registrationCode}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{r.registrationCode}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-[11px] font-bold", urgent ? "text-red-700" : warning ? "text-amber-700" : "text-muted-foreground")}>
                        {d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                      </p>
                      <span className={cn(
                        "inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase mt-0.5",
                        r.registrationType === "jk" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700",
                      )}>
                        {r.registrationType?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  total,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType
  label: string
  value: number
  total: number
  colorClass: string
  bgClass: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl mb-3", bgClass)}>
        <Icon className={cn("h-4 w-4", colorClass)} />
      </span>
      <div className={cn("text-2xl font-extrabold", colorClass)}>{value}</div>
      <div className="text-[11px] font-semibold text-foreground mt-0.5">{label}</div>
      <div className="text-[10px] text-muted-foreground">{pct}% of {total}</div>
    </div>
  )
}
