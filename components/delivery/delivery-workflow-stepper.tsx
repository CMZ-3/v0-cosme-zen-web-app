"use client"

import { Package, ClipboardCheck, Truck, CheckCircle, Flag, FileText } from "lucide-react"
import type { DeliveryStatus } from "@/lib/delivery-types"
import { deliveryWorkflowSteps } from "@/lib/delivery-types"
import { cn } from "@/lib/utils"

const stepMeta: Record<string, { icon: typeof Package; label: string }> = {
  draft: { icon: FileText, label: "Draft" },
  reserved: { icon: Package, label: "Reserved" },
  picking: { icon: ClipboardCheck, label: "Picking" },
  shipped: { icon: Truck, label: "Shipped" },
  delivered: { icon: CheckCircle, label: "Delivered" },
  completed: { icon: Flag, label: "Completed" },
}

interface DeliveryWorkflowStepperProps {
  currentStatus: DeliveryStatus
  timestamps?: Record<string, string | undefined>
}

export function DeliveryWorkflowStepper({ currentStatus, timestamps }: DeliveryWorkflowStepperProps) {
  const currentIdx = deliveryWorkflowSteps.indexOf(currentStatus)
  const isCancelled = currentStatus === "cancelled"

  const formatTs = (ts?: string) => {
    if (!ts) return null
    const d = new Date(ts)
    return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  return (
    <div className="flex items-center justify-center gap-0 py-3">
      {deliveryWorkflowSteps.map((step, i) => {
        const meta = stepMeta[step]
        const isDone = !isCancelled && i < currentIdx
        const isActive = !isCancelled && i === currentIdx
        const isWait = isCancelled || i > currentIdx
        const ts = timestamps?.[step]

        return (
          <div key={step} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center text-center" style={{ minWidth: 70 }}>
              <div className={cn(
                "flex h-[34px] w-[34px] items-center justify-center rounded-[10px] transition-all",
                isDone && "bg-emerald-500 text-white shadow-[0_3px_10px_rgba(16,185,129,0.25)]",
                isActive && "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(76,139,245,0.15)] animate-pulse",
                isWait && "border-2 border-border bg-secondary text-muted-foreground"
              )}>
                <meta.icon className="h-[15px] w-[15px]" />
              </div>
              <span className={cn(
                "mt-1.5 text-[10px] font-semibold",
                isDone ? "text-emerald-600" : isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {meta.label}
              </span>
              {ts && (
                <span className="text-[9px] text-muted-foreground">{formatTs(ts)}</span>
              )}
            </div>

            {/* Connector line (not after last) */}
            {i < deliveryWorkflowSteps.length - 1 && (
              <div className={cn(
                "h-[3px] w-[30px] rounded-full mb-6",
                isDone ? "bg-emerald-500" : isActive ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
