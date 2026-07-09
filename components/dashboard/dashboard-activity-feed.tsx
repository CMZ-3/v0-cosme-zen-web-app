"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Package,
  FlaskConical,
  Truck,
  ShieldCheck,
  ClipboardList,
  ArrowLeftRight,
} from "lucide-react"
import { useMemo } from "react"


const statusLabelMap: Record<string, string> = {
  new: "Created", confirmed: "Confirmed", material_prep: "Material Prep",
  mixing: "Mixing", filling: "Filling", labeling: "Labeling",
  qc_check: "QC Check", qc_passed: "QC Passed", packing: "Packing",
  delivered: "Delivered", cancelled: "Cancelled",
  draft: "Draft", reserved: "Reserved", picking: "Picking",
  shipped: "Shipped", completed: "Completed",
  submitted: "Submitted", approved: "Approved", rejected: "Rejected",
  active: "Active", expired: "Expired", pending_review: "Pending Review",
  buy_in: "Stock In", issue: "Stock Out", transfer: "Transfer",
  adjustment: "Adjustment", return: "Return",
}

interface Activity {
  id: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  time: string
  module: string
  sortDate: string
}

const MODULE_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Job Orders": { icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
  "Delivery": { icon: Truck, color: "text-violet-600", bg: "bg-violet-50" },
  "Stock": { icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
  "Formulas": { icon: FlaskConical, color: "text-cyan-600", bg: "bg-cyan-50" },
  "FDA": { icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DashboardActivityFeed({ liveData }: { liveData?: any }) {
  const activities = useMemo<Activity[]>(() => {
    const raw: Array<{ id: string; module: string; title: string; description: string; sortDate: string }> =
      liveData?.recentActivity ?? []

    return raw.slice(0, 8).map((item) => {
      const cfg = MODULE_ICONS[item.module] ?? { icon: Package, color: "text-muted-foreground", bg: "bg-secondary" }
      return {
        id: item.id,
        icon: cfg.icon,
        iconColor: cfg.color,
        iconBg: cfg.bg,
        title: item.title,
        description: item.description,
        time: item.sortDate,
        module: item.module,
        sortDate: item.sortDate,
      }
    })
  }, [liveData])

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays < 1) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
  }

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3 space-y-0">
        <CardTitle className="text-sm font-extrabold text-foreground">{"Recent Activity"}</CardTitle>
        <p className="text-[11px] text-muted-foreground mt-0.5">{"Latest updates across all modules"}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col">
          {activities.map((a, i) => (
            <div key={a.id} className={cn("flex items-start gap-3 py-2.5", i > 0 && "border-t border-border")}>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", a.iconBg)}>
                <a.icon className={cn("h-4 w-4", a.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-foreground leading-snug">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{a.description}</p>
              </div>
              <div className="shrink-0 text-right flex flex-col items-end gap-0.5">
                <span className="text-[10px] text-muted-foreground">{formatTime(a.time)}</span>
                <span className="text-[9px] text-muted-foreground/60 font-medium">{a.module}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
