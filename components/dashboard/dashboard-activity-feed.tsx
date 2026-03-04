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
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { mockDeliveryOrders } from "@/lib/delivery-mock-data"
import { mockFdaList } from "@/lib/fda-mock-data"
import { mockStockMovements } from "@/lib/stock-mock-data"
import { mockFormulaList } from "@/lib/formula-mock-data"
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

export function DashboardActivityFeed() {
  const activities = useMemo<Activity[]>(() => {
    const items: Activity[] = []

    // Job Orders
    mockJobOrders.forEach(jo => {
      items.push({
        id: `jo-${jo.id}`,
        icon: ClipboardList,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
        title: `${jo.orderNumber} ${statusLabelMap[jo.status] || jo.status}`,
        description: `${jo.customerName} - ${jo.productName} (${jo.quantity.toLocaleString()} pcs)`,
        time: jo.createdDate || "",
        module: "Job Orders",
        sortDate: jo.createdDate || "",
      })
    })

    // Delivery
    mockDeliveryOrders.forEach(d => {
      items.push({
        id: `del-${d.id}`,
        icon: Truck,
        iconColor: "text-violet-600",
        iconBg: "bg-violet-50",
        title: `${d.deliveryNumber} ${statusLabelMap[d.status] || d.status}`,
        description: `${d.customerName}${d.trackingNumber ? ` - ${d.trackingNumber}` : ""}`,
        time: d.createdDate || "",
        module: "Delivery",
        sortDate: d.createdDate || "",
      })
    })

    // FDA
    mockFdaList.forEach(f => {
      items.push({
        id: `fda-${f.id}`,
        icon: ShieldCheck,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
        title: `${f.registrationCode} ${statusLabelMap[f.status] || f.status}`,
        description: `${f.productNameTh || f.productNameEn}`,
        time: f.submittedDate || "",
        module: "FDA",
        sortDate: f.submittedDate || "",
      })
    })

    // Stock Movements
    mockStockMovements.forEach(m => {
      items.push({
        id: `stk-${m.id}`,
        icon: m.movementType === "transfer" ? ArrowLeftRight : Package,
        iconColor: m.movementType === "buy_in" ? "text-emerald-600" : m.movementType === "issue" ? "text-red-500" : "text-amber-600",
        iconBg: m.movementType === "buy_in" ? "bg-emerald-50" : m.movementType === "issue" ? "bg-red-50" : "bg-amber-50",
        title: `${m.referenceNo} ${statusLabelMap[m.movementType] || m.movementType}`,
        description: `${m.itemName} ${m.qty > 0 ? "+" : ""}${m.qty} ${m.unit}`,
        time: m.date || "",
        module: "Stock",
        sortDate: m.date || "",
      })
    })

    // Formulas
    mockFormulaList.slice(0, 3).forEach(f => {
      items.push({
        id: `fml-${f.id}`,
        icon: FlaskConical,
        iconColor: "text-cyan-600",
        iconBg: "bg-cyan-50",
        title: `${f.formulaCode} ${f.status}`,
        description: `${f.formulaName}`,
        time: f.updatedDate || f.createdDate || "",
        module: "Formulas",
        sortDate: f.updatedDate || f.createdDate || "",
      })
    })

    // Sort by date descending, take top 8
    return items
      .sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || ""))
      .slice(0, 8)
  }, [])

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
