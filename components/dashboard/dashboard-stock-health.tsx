"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"
import { mockStockDashboard, mockAlerts } from "@/lib/stock-mock-data"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight, AlertTriangle } from "lucide-react"

const GREEN = "#10b981"
const AMBER = "#f59e0b"
const RED = "#ef4444"
const BLUE = "#4c8bf5"

export function DashboardStockHealth() {
  const { statusBreakdown: sb, totalInventoryValue } = mockStockDashboard
  const donutData = [
    { name: "Healthy", value: sb.healthy, fill: GREEN },
    { name: "Low Stock", value: sb.low, fill: AMBER },
    { name: "Out of Stock", value: sb.outOfStock, fill: RED },
    { name: "Over Stock", value: sb.overStock, fill: BLUE },
  ]
  const total = sb.healthy + sb.low + sb.outOfStock + sb.overStock
  const unresolvedAlerts = mockAlerts.filter(a => !a.isResolved)

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-extrabold text-foreground">{"Stock Health"}</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">{`${((totalInventoryValue ?? 0) / 1e6).toFixed(1)}M THB inventory`}</p>
        </div>
        <Link href="/stock" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
          {"View all"}<ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4">
          {/* Donut chart */}
          <ChartContainer
            config={{
              healthy: { label: "Healthy", color: GREEN },
              low: { label: "Low Stock", color: AMBER },
              out: { label: "Out of Stock", color: RED },
              over: { label: "Over Stock", color: BLUE },
            }}
            className="h-[140px] w-[140px] shrink-0"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <text x="50%" y="48%" textAnchor="middle" className="fill-foreground text-xl font-extrabold">{total}</text>
              <text x="50%" y="62%" textAnchor="middle" className="fill-muted-foreground text-[10px]">{"items"}</text>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex-1 flex flex-col gap-2">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
                  <span className="text-[11px] text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-[12px] font-extrabold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {unresolvedAlerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] font-bold text-foreground">{`${unresolvedAlerts.length} Active Alerts`}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {unresolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px]",
                  alert.alertType === "out_of_stock" ? "bg-red-50 text-red-700" :
                  alert.alertType === "low_stock" ? "bg-amber-50 text-amber-700" :
                  "bg-orange-50 text-orange-700"
                )}>
                  <span className="font-semibold truncate">{alert.itemName}</span>
                  <span className="font-bold shrink-0 ml-2">{alert.alertType.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
