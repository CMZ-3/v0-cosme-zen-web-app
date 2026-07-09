"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type DeliveryOrder = {
  id: string
  deliveryNumber: string
  customerName: string
  status: string
  totalQuantity?: number
  scheduledDate?: string | null
  jobOrderNumber?: string
  jobOrderId?: string
}

interface Props {
  orders: DeliveryOrder[]
  onRefresh?: () => void
}

export function DeliveryPendingClose({ orders, onRefresh }: Props) {
  const [closing, setClosing] = useState<string | null>(null)

  // Pending close = delivered but not yet completed
  const pending = orders.filter((o) => o.status === "delivered")

  async function closeOrder(order: DeliveryOrder) {
    setClosing(order.id)
    try {
      const res = await fetch(`/api/delivery-orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      })
      if (!res.ok) throw new Error("Failed to close")
      toast.success(`ปิด ${order.deliveryNumber} แล้ว`)
      onRefresh?.()
    } catch {
      toast.error("เกิดข้อผิดพลาด")
    } finally {
      setClosing(null)
    }
  }

  return (
    <div className="px-8 pt-4 pb-8 space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-amber-800">
            {pending.length} รายการรอปิด Job Order
          </p>
          <p className="text-[11px] text-amber-600">
            รายการที่ส่งมอบแล้ว (Delivered) แต่ยังไม่ได้ปิด — กด Close เพื่อเปลี่ยนเป็น Completed
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-400 mb-3" />
          <p className="text-sm font-bold text-foreground">ไม่มีรายการค้างปิด</p>
          <p className="text-[11px] text-muted-foreground mt-1">ทุก DO ที่ส่งมอบแล้วได้รับการปิดเรียบร้อย</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-primary font-mono">{order.deliveryNumber}</span>
                  <Badge variant="outline" className="text-[9px] font-bold bg-teal-50 text-teal-700 border-teal-200">
                    Delivered
                  </Badge>
                </div>
                <p className="text-[12px] font-semibold text-foreground mt-0.5">{order.customerName}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {order.totalQuantity && (
                    <span className="text-[10px] text-muted-foreground">{order.totalQuantity.toLocaleString()} pcs</span>
                  )}
                  {order.jobOrderNumber && (
                    <span className="text-[10px] text-muted-foreground">JO: {order.jobOrderNumber}</span>
                  )}
                  {order.scheduledDate && (
                    <span className="text-[10px] text-muted-foreground">
                      วันที่ {new Date(order.scheduledDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className={cn(
                  "rounded-xl text-[11px] font-bold gap-1.5 bg-green-500 hover:bg-green-600 text-white border-0"
                )}
                disabled={closing === order.id}
                onClick={() => closeOrder(order)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {closing === order.id ? "กำลังปิด..." : "Close DO"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
