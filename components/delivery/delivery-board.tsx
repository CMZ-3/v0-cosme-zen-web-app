"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Truck, CheckCircle2, Archive, ClipboardList, AlertCircle } from "lucide-react"

export type DeliveryOrder = {
  id: string
  deliveryNumber: string
  customerName: string
  status: string
  totalQuantity: number
  scheduledDate?: string
  jobOrderNumber?: string
}

const COLUMNS: {
  status: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof Package
}[] = [
  { status: "draft", label: "Draft", color: "text-slate-600", bgColor: "bg-slate-50", borderColor: "border-slate-200", icon: ClipboardList },
  { status: "reserved", label: "Reserved", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: AlertCircle },
  { status: "picking", label: "Picking", color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200", icon: Package },
  { status: "shipped", label: "Shipped", color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", icon: Truck },
  { status: "delivered", label: "Delivered", color: "text-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200", icon: CheckCircle2 },
  { status: "completed", label: "Completed", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: Archive },
]

// Next valid transitions per status
const NEXT_STATUS: Record<string, string> = {
  draft: "reserved",
  reserved: "picking",
  picking: "shipped",
  shipped: "delivered",
  delivered: "completed",
}

interface Props {
  orders: DeliveryOrder[]
  onStatusChange?: () => void
}

export function DeliveryBoard({ orders, onStatusChange }: Props) {
  const [loading, setLoading] = useState<string | null>(null)

  async function moveNext(order: DeliveryOrder) {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    setLoading(order.id)
    try {
      const res = await fetch(`/api/delivery-orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      toast.success(`${order.deliveryNumber} → ${next}`)
      onStatusChange?.()
    } catch {
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-3 px-8 pt-4 pb-8 overflow-x-auto min-h-[calc(100vh-220px)]">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status)
        const Icon = col.icon
        return (
          <div key={col.status} className="flex flex-col gap-2 min-w-[220px] flex-shrink-0">
            {/* Column Header */}
            <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 border", col.bgColor, col.borderColor)}>
              <Icon className={cn("h-4 w-4", col.color)} />
              <span className={cn("text-[12px] font-bold", col.color)}>{col.label}</span>
              <span className={cn("ml-auto rounded-lg px-1.5 py-0.5 text-[10px] font-bold", col.bgColor, col.color, "border", col.borderColor)}>
                {colOrders.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {colOrders.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border py-8 text-center text-[11px] text-muted-foreground">
                  ไม่มีรายการ
                </div>
              ) : (
                colOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border bg-card p-3 shadow-sm space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-[11px] font-mono font-bold text-primary">{order.deliveryNumber}</span>
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5", col.bgColor, col.color, col.borderColor)}>
                        {col.label}
                      </Badge>
                    </div>
                    <div className="text-[12px] font-semibold text-foreground leading-tight">{order.customerName}</div>
                    {order.jobOrderNumber && (
                      <div className="text-[10px] text-muted-foreground">JO: {order.jobOrderNumber}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{order.totalQuantity?.toLocaleString()} pcs</span>
                      {order.scheduledDate && (
                        <span className="text-[10px] text-muted-foreground">{new Date(order.scheduledDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</span>
                      )}
                    </div>
                    {NEXT_STATUS[order.status] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("w-full h-6 rounded-lg text-[10px] font-bold", col.color, col.borderColor, "border hover:opacity-80")}
                        disabled={loading === order.id}
                        onClick={() => moveNext(order)}
                      >
                        {loading === order.id ? "..." : `Move to ${NEXT_STATUS[order.status]}`}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
