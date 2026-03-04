"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  ClipboardList,
  Package,
  DollarSign,
  Truck,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: React.ElementType
  color: string
  bgColor: string
  trend?: { value: string; positive: boolean }
}

function KpiCard({ label, value, sub, icon: Icon, color, bgColor, trend }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-4 px-5 py-4 border border-border shadow-none hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bgColor)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-muted-foreground truncate">{label}</p>
        <p className="text-xl font-extrabold text-foreground leading-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{sub}</span>
          {trend && (
            <span className={cn("flex items-center gap-0.5 text-[10px] font-bold", trend.positive ? "text-emerald-600" : "text-red-500")}>
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export function DashboardKpiRow() {
  const kpis: KpiCardProps[] = [
    {
      label: "Active Job Orders",
      value: "5",
      sub: "3 in production",
      icon: ClipboardList,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: { value: "+2 this week", positive: true },
    },
    {
      label: "Total Revenue (MTD)",
      value: "1.31M",
      sub: "THB Feb 2026",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: { value: "+18%", positive: true },
    },
    {
      label: "Stock Items",
      value: "248",
      sub: "12 out of stock",
      icon: Package,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: { value: "28 low", positive: false },
    },
    {
      label: "Delivery Pipeline",
      value: "8",
      sub: "3 shipped, 1 picking",
      icon: Truck,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      trend: { value: "4 preparing", positive: true },
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </div>
  )
}
