"use client"

import { ShieldCheck, ShieldAlert, Clock, FileCheck, FilePlus, AlertTriangle, XCircle } from "lucide-react"
import { FdaKPISummary } from "@/lib/fda-types"

interface FdaKpiCardsProps {
  kpi: FdaKPISummary
}

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  sub,
}: {
  label: string
  value: number | string
  icon: typeof ShieldCheck
  iconBg: string
  iconColor: string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xl font-extrabold text-foreground leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
    </div>
  )
}

export function FdaKpiCards({ kpi }: FdaKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <KpiCard
        label="Total"
        value={kpi.total}
        icon={ShieldCheck}
        iconBg="bg-primary/10"
        iconColor="text-primary"
        sub={`JK ${kpi.totalJk} / JR ${kpi.totalJr}`}
      />
      <KpiCard
        label="Approved"
        value={kpi.approved}
        icon={FileCheck}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KpiCard
        label="Draft"
        value={kpi.draft}
        icon={FilePlus}
        iconBg="bg-slate-100"
        iconColor="text-slate-500"
      />
      <KpiCard
        label="Submitted"
        value={kpi.submitted}
        icon={Clock}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
      />
      <KpiCard
        label="Rejected"
        value={kpi.rejected}
        icon={XCircle}
        iconBg="bg-red-50"
        iconColor="text-red-500"
      />
      <KpiCard
        label="Expired"
        value={kpi.expired}
        icon={ShieldAlert}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
      />
      <KpiCard
        label="Expiring Soon"
        value={kpi.expiring30}
        icon={AlertTriangle}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        sub={`60d: ${kpi.expiring60} / 90d: ${kpi.expiring90}`}
      />
    </div>
  )
}
