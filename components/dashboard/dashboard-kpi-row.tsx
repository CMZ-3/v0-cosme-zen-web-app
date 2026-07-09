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
import { useMemo } from "react"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DashboardKpiRow({ liveData }: { liveData?: any }) {
  const kpis = useMemo<KpiCardProps[]>(() => {
    const k = liveData?.kpi
    const activeJo = k?.activeJo ?? 0
    const inProduction = k?.inProduction ?? 0
    const totalRevenue = k?.totalRevenue ?? 0
    const joCount = liveData?.joCount ?? 0
    const totalStock = k?.totalStock ?? 0
    const outOfStock = k?.outOfStock ?? 0
    const lowStock = k?.lowStock ?? 0
    const pendingDelivery = k?.pendingDelivery ?? 0
    const shippedCount = k?.shippedCount ?? 0
    const pickingCount = k?.pickingCount ?? 0

    const revFormatted = totalRevenue >= 1_000_000
      ? `${(totalRevenue / 1_000_000).toFixed(2)}M`
      : totalRevenue >= 1_000
        ? `${(totalRevenue / 1_000).toFixed(0)}K`
        : String(totalRevenue.toFixed(0))

    return [
      {
        label: "Active Job Orders",
        value: String(activeJo),
        sub: `${inProduction} in production`,
        icon: ClipboardList,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        trend: { value: `${activeJo} open`, positive: activeJo > 0 },
      },
      {
        label: "Total Revenue",
        value: revFormatted,
        sub: "THB all orders",
        icon: DollarSign,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        trend: { value: `${joCount} orders`, positive: true },
      },
      {
        label: "Stock Items",
        value: String(totalStock),
        sub: outOfStock > 0 ? `${outOfStock} out of stock` : "All stocked",
        icon: Package,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        trend: lowStock > 0 ? { value: `${lowStock} low`, positive: false } : undefined,
      },
      {
        label: "Delivery Pipeline",
        value: String(pendingDelivery),
        sub: [shippedCount > 0 && `${shippedCount} shipped`, pickingCount > 0 && `${pickingCount} picking`].filter(Boolean).join(", ") || "None pending",
        icon: Truck,
        color: "text-violet-600",
        bgColor: "bg-violet-50",
        trend: { value: `${pendingDelivery} preparing`, positive: pendingDelivery > 0 },
      },
    ]
  }, [liveData])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </div>
  )
}
