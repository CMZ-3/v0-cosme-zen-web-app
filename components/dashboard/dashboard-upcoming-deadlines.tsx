"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, AlertTriangle } from "lucide-react"


interface Deadline {
  id: string
  label: string
  detail: string
  date: string
  daysLeft: number
  type: "job" | "delivery" | "fda"
}

function calcDaysLeft(dateStr: string): number {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.ceil((d.getTime() - now.getTime()) / 86400000)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DashboardUpcomingDeadlines({ liveData }: { liveData?: any }) {
  const deadlines: Deadline[] = (liveData?.deadlines ?? []).map((d: Record<string, unknown>) => ({
    id: String(d.id),
    label: String(d.label),
    detail: String(d.detail ?? ""),
    date: String(d.date ?? ""),
    daysLeft: Number(d.daysLeft ?? 0),
    type: String(d.type ?? "job") as Deadline["type"],
  }))

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    job: { label: "JO", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
    delivery: { label: "DEL", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
    fda: { label: "FDA", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  }

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex-row items-center gap-2 pb-3 space-y-0">
        <Calendar className="h-4 w-4 text-primary" />
        <div>
          <CardTitle className="text-sm font-extrabold text-foreground">{"Upcoming Deadlines"}</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">{`${deadlines.length} items in the next 90 days`}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-1.5">
          {deadlines.slice(0, 6).map((d) => {
            const tc = typeConfig[d.type]
            return (
              <div key={d.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <Badge variant="outline" className={cn("text-[8px] px-1.5 py-0 h-4 font-bold border shrink-0", tc.bg, tc.color)}>
                  {tc.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-foreground">{d.label}</span>
                    {d.daysLeft <= 3 && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{d.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(
                    "text-[11px] font-extrabold",
                    d.daysLeft <= 0 ? "text-red-500" : d.daysLeft <= 7 ? "text-amber-600" : "text-foreground"
                  )}>
                    {d.daysLeft <= 0 ? "Overdue" : `${d.daysLeft}d`}
                  </span>
                  <p className="text-[9px] text-muted-foreground">{d.date}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
