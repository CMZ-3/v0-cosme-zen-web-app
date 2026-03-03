"use client"

import { CheckCircle2, Clock, FileText, AlertTriangle, XCircle } from "lucide-react"
import type { FdaKPISummary } from "@/lib/fda-types"

const kpiDefs = [
  {
    key: "active" as const,
    label: "Active",
    sub: "อายุ > 60 วัน",
    icon: CheckCircle2,
    bg: "bg-[#e0f7f5]",
    iconBg: "bg-[#10b981]",
    valueColor: "text-[#10b981]",
  },
  {
    key: "pending" as const,
    label: "Pending",
    sub: "status = submitted",
    icon: Clock,
    bg: "bg-[#fef3c7]",
    iconBg: "bg-[#f59e0b]",
    valueColor: "text-[#f59e0b]",
  },
  {
    key: "draft" as const,
    label: "Draft",
    sub: "ยังไม่ submit",
    icon: FileText,
    bg: "bg-[#f1f5f9]",
    iconBg: "bg-[#94a3b8]",
    valueColor: "text-[#475569]",
  },
  {
    key: "expiring" as const,
    label: "Expiring \u226460d",
    sub: "ต้อต่ออายุ",
    icon: AlertTriangle,
    bg: "bg-[#fff7ed]",
    iconBg: "bg-[#f97316]",
    valueColor: "text-[#f97316]",
  },
  {
    key: "expired" as const,
    label: "Expired",
    sub: "หมดอายุแล้ว",
    icon: XCircle,
    bg: "bg-[#fef2f2]",
    iconBg: "bg-[#ef4444]",
    valueColor: "text-[#ef4444]",
  },
]

function getValue(kpi: FdaKPISummary, key: string): number {
  switch (key) {
    case "active": return kpi.approved
    case "pending": return kpi.submitted
    case "draft": return kpi.draft
    case "expiring": return kpi.expiring60
    case "expired": return kpi.expired
    default: return 0
  }
}

export function FdaKpiCards({ kpi }: { kpi: FdaKPISummary }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpiDefs.map((card) => (
        <div
          key={card.key}
          className={`${card.bg} relative flex flex-col gap-2 rounded-2xl p-4`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold text-foreground/80">{card.label}</p>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${card.iconBg}/15`}>
              <card.icon className={`h-4 w-4 ${card.valueColor}`} />
            </div>
          </div>
          <p className={`text-3xl font-extrabold leading-none tracking-tight ${card.valueColor}`}>
            {getValue(kpi, card.key).toLocaleString()}
          </p>
          <p className="text-[10px] font-medium text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
