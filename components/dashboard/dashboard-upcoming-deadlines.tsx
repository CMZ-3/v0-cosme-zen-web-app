"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, AlertTriangle } from "lucide-react"
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { mockDeliveryOrders } from "@/lib/delivery-mock-data"
import { mockFdaList } from "@/lib/fda-mock-data"

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

export function DashboardUpcomingDeadlines() {
  // Collect all upcoming deadlines
  const deadlines: Deadline[] = []

  // Job order due dates
  mockJobOrders
    .filter(jo => jo.status !== "delivered" && jo.status !== "cancelled")
    .forEach(jo => {
      const dl = calcDaysLeft(jo.dueDate)
      if (dl > -30) {
        deadlines.push({
          id: `jo-${jo.id}`,
          label: jo.orderNumber,
          detail: `${jo.brandName} - ${jo.productName}`,
          date: jo.dueDate,
          daysLeft: dl,
          type: "job",
        })
      }
    })

  // Delivery dates
  mockDeliveryOrders
    .filter(d => d.status !== "delivered" && d.status !== "completed" && d.deliveryDate)
    .forEach(d => {
      const dl = calcDaysLeft(d.deliveryDate!)
      if (dl > -30) {
        deadlines.push({
          id: `del-${d.id}`,
          label: d.deliveryNumber,
          detail: `${d.customerName} - ${d.productSummary || ""}`,
          date: d.deliveryDate!,
          daysLeft: dl,
          type: "delivery",
        })
      }
    })

  // FDA expiry
  mockFdaList
    .filter(f => f.daysUntilExpiry !== undefined && f.daysUntilExpiry <= 90 && f.daysUntilExpiry > 0)
    .forEach(f => {
      deadlines.push({
        id: `fda-${f.id}`,
        label: f.registrationCode,
        detail: f.productNameEn || f.productNameTh,
        date: f.expiryDate || "",
        daysLeft: f.daysUntilExpiry!,
        type: "fda",
      })
    })

  // Sort by days left ascending
  deadlines.sort((a, b) => a.daysLeft - b.daysLeft)

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
