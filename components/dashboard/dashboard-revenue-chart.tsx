"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useState } from "react"
import { cn } from "@/lib/utils"

const monthlyData = [
  { month: "Sep", revenue: 820000, cost: 510000, orders: 8 },
  { month: "Oct", revenue: 950000, cost: 590000, orders: 11 },
  { month: "Nov", revenue: 1120000, cost: 680000, orders: 14 },
  { month: "Dec", revenue: 780000, cost: 520000, orders: 7 },
  { month: "Jan", revenue: 1050000, cost: 640000, orders: 12 },
  { month: "Feb", revenue: 1310000, cost: 756000, orders: 15 },
]

type ViewMode = "revenue" | "orders"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DashboardRevenueChart({ liveData: _liveData }: { liveData?: any } = {}) {
  const [view, setView] = useState<ViewMode>("revenue")

  const BLUE = "#4c8bf5"
  const GREEN = "#10b981"
  const PURPLE = "#8b5cf6"

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-extrabold text-foreground">{"Revenue & Cost"}</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">{"Last 6 months performance"}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-0.5">
          {(["revenue", "orders"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 rounded-md text-[11px] font-bold transition-all",
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v === "revenue" ? "Revenue" : "Orders"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {view === "revenue" ? (
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: BLUE },
              cost: { label: "Cost", color: GREEN },
            }}
            className="h-[220px]"
          >
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GREEN} stopOpacity={0.10} />
                  <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${Number(v).toLocaleString()} THB`} />} />
              <Area type="monotone" dataKey="revenue" stroke={BLUE} strokeWidth={2.5} fill="url(#gRevenue)" />
              <Area type="monotone" dataKey="cost" stroke={GREEN} strokeWidth={2} fill="url(#gCost)" strokeDasharray="5 3" />
            </AreaChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={{ orders: { label: "Orders", color: PURPLE } }} className="h-[220px]">
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill={PURPLE} radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ChartContainer>
        )}
        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-2">
          {view === "revenue" ? (
            <>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: BLUE }} />{"Revenue"}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} />{"Cost"}</span>
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PURPLE }} />{"Job Orders"}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
