"use client"

import { FlaskConical, CheckCircle, Zap, Archive, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FormulaKPISummary } from "@/lib/formula-types"

const cards: { key: keyof FormulaKPISummary; label: string; icon: typeof FlaskConical; bg: string; text: string; iconBg: string }[] = [
  { key: "active", label: "Active", icon: Zap, bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
  { key: "approved", label: "Approved", icon: CheckCircle, bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
  { key: "draft", label: "Draft", icon: FlaskConical, bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
  { key: "archived", label: "Archived", icon: Archive, bg: "bg-secondary", text: "text-muted-foreground", iconBg: "bg-muted" },
  { key: "discontinued", label: "Discontinued", icon: Ban, bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100" },
]

export function FormulaKpiCards({ kpi }: { kpi: FormulaKPISummary }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.key} className={cn("flex items-center gap-3 rounded-xl border border-border/50 px-4 py-3.5", c.bg)}>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", c.iconBg)}>
            <c.icon className={cn("h-4.5 w-4.5", c.text)} />
          </div>
          <div>
            <p className={cn("text-2xl font-extrabold leading-none tracking-tight", c.text)}>{kpi[c.key]}</p>
            <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
