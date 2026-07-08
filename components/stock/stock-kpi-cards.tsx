"use client"

import { Package, DollarSign, TrendingUp, TrendingDown, AlertTriangle, ArrowDownToLine, Lock } from "lucide-react"
import type { StockDashboard } from "@/lib/stock-types"

const kpiConfig = [
  { key: "totalItems", label: "Total Items", icon: Package, bg: "bg-[#e0f7f5]", iconColor: "text-teal-600", format: (v: number) => v.toLocaleString() },
  { key: "totalInventoryValue", label: "Total Value", icon: DollarSign, bg: "bg-[#e8e0ff]", iconColor: "text-violet-600", format: (v: number) => `${(v / 1000).toLocaleString()}K`, adminOnly: true },
  { key: "healthy", label: "Healthy", icon: TrendingUp, bg: "bg-[#e0f7f5]", iconColor: "text-emerald-600", format: (v: number) => v.toLocaleString() },
  { key: "low", label: "Low Stock", icon: TrendingDown, bg: "bg-[#fef3c7]", iconColor: "text-amber-600", format: (v: number) => v.toLocaleString() },
  { key: "outOfStock", label: "Out of Stock", icon: AlertTriangle, bg: "bg-[#fde0e6]", iconColor: "text-red-500", format: (v: number) => v.toLocaleString() },
  { key: "totalIncoming", label: "Incoming", icon: ArrowDownToLine, bg: "bg-[#e0f2fe]", iconColor: "text-blue-600", format: (v: number) => v.toLocaleString() },
  { key: "totalReserved", label: "Reserved", icon: Lock, bg: "bg-[#fce7d6]", iconColor: "text-orange-600", format: (v: number) => v.toLocaleString() },
] as const

interface StockKpiCardsProps {
  data: StockDashboard
}

export function StockKpiCards({ data }: StockKpiCardsProps) {
  function getValue(key: string): number {
    if (key === "healthy") return data.statusBreakdown.healthy
    if (key === "low") return data.statusBreakdown.low
    if (key === "outOfStock") return data.statusBreakdown.outOfStock
    return (data as unknown as Record<string, number>)[key] ?? 0
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {kpiConfig.map((kpi) => {
        const value = getValue(kpi.key)
        return (
          <div
            key={kpi.key}
            className={`${kpi.bg} rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center gap-2">
              <kpi.icon className={`h-4 w-4 ${kpi.iconColor}`} />
              <span className="text-[11px] font-medium text-muted-foreground">{kpi.label}</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
              {kpi.format(value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
