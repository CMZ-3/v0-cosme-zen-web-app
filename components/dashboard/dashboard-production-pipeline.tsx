"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ArrowRight, Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  confirmed: { label: "Confirmed", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
  preparing_rm: { label: "Preparing RM", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  in_production: { label: "In Production", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  qc: { label: "QC", color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  packing: { label: "Packing", color: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
  ready_to_ship: { label: "Ready to Ship", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-50 border-green-200" },
}

const PRIORITY_ICON: Record<string, React.ReactNode> = {
  high: <AlertTriangle className="h-3 w-3 text-red-500" />,
  medium: <Clock className="h-3 w-3 text-amber-500" />,
  low: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DashboardProductionPipeline({ liveData }: { liveData?: any }) {
  const pipeline: Record<string, number> = liveData?.joPipeline ?? {}
  const recentJos: Array<Record<string, unknown>> = liveData?.recentJos ?? []
  const totalRevenue: number = liveData?.kpi?.totalRevenue ?? 0

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex-row items-center justify-between pb-3 space-y-0">
        <div>
          <CardTitle className="text-sm font-extrabold text-foreground">{"Production Pipeline"}</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {`${recentJos.length} active jobs | Total value ${(totalRevenue / 1e6).toFixed(2)}M THB`}
          </p>
        </div>
        <Link href="/job-orders" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
          {"View all"}<ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Pipeline funnel visualization */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {["new", "preparing_rm", "in_production", "qc", "packing", "delivered"].map((status, i) => {
            const count = pipeline[status] ?? 0
            const cfg = STATUS_CONFIG[status] || { label: status, color: "text-foreground", bg: "bg-secondary" }
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[72px]", cfg.bg)}>
                  <span className={cn("text-lg font-extrabold leading-none", cfg.color)}>{count}</span>
                  <span className="text-[9px] font-semibold text-muted-foreground whitespace-nowrap">{cfg.label}</span>
                </div>
                {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            )
          })}
        </div>

        {/* Job list */}
        <div className="flex flex-col gap-2">
          {recentJos.slice(0, 4).map((jo) => {
            const status = String(jo.status ?? "new")
            const priority = String(jo.priority ?? "medium")
            const cfg = STATUS_CONFIG[status] || { label: status, color: "", bg: "" }
            const dueDate = jo.dueDate ? new Date(String(jo.dueDate)) : null
            const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / 86400000) : null

            return (
              <Link key={String(jo.id)} href="/job-orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-extrabold text-foreground">{String(jo.orderNumber ?? jo.id)}</span>
                    {PRIORITY_ICON[priority]}
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 font-bold border", cfg.bg, cfg.color)}>
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {String(jo.brandName ?? "")} {jo.brandName && jo.productName ? "-" : ""} {String(jo.productName ?? "")}
                  </p>
                </div>
                {daysLeft !== null && (
                  <div className="shrink-0 text-right">
                    <span className={cn("text-[10px] font-bold", daysLeft <= 3 ? "text-red-500" : daysLeft <= 7 ? "text-amber-600" : "text-muted-foreground")}>
                      {daysLeft > 0 ? `${daysLeft}d left` : status === "delivered" ? "Done" : "Overdue"}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
          {recentJos.length === 0 && (
            <p className="text-center text-[11px] text-muted-foreground py-4">No active job orders</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
