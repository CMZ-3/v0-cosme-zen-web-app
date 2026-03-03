"use client"

import { Package, Truck, CheckCircle, Clock, Flag } from "lucide-react"
import type { DeliveryKPISummary } from "@/lib/delivery-types"
import { cn } from "@/lib/utils"

interface KpiCardDef {
  key: string
  label: string
  getValue: (k: DeliveryKPISummary) => number
  color: string
  bg: string
  icon: typeof Package
}

const kpiCards: KpiCardDef[] = [
  { key: "total", label: "All Orders", getValue: (k) => k.total, color: "text-foreground", bg: "bg-secondary", icon: Package },
  { key: "preparing", label: "Preparing", getValue: (k) => k.preparing, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  { key: "shipped", label: "In Transit", getValue: (k) => k.shipped, color: "text-teal-600", bg: "bg-teal-50", icon: Truck },
  { key: "delivered", label: "Delivered", getValue: (k) => k.delivered, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
  { key: "completed", label: "Job Finished", getValue: (k) => k.completed, color: "text-teal-600", bg: "bg-[#e0f7f5]", icon: Flag },
]

interface DeliveryKpiCardsProps {
  kpi: DeliveryKPISummary
  activeFilter?: string
  onFilterClick?: (key: string) => void
}

export function DeliveryKpiCards({ kpi, activeFilter, onFilterClick }: DeliveryKpiCardsProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpiCards.map((card) => {
        const val = card.getValue(kpi)
        const isActive = activeFilter === card.key
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onFilterClick?.(card.key)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
              isActive ? "border-primary shadow-[0_0_0_2px_rgba(76,139,245,0.15)]" : "border-border"
            )}
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]", card.bg)}>
              <card.icon className={cn("h-[18px] w-[18px]", card.color)} />
            </div>
            <div>
              <div className={cn("font-mono text-[22px] font-extrabold leading-none tracking-tight", card.color)}>
                {val}
              </div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {card.label}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
