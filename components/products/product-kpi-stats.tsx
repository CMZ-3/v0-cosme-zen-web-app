"use client"

import { Package, CheckCircle2, FlaskConical, AlertTriangle, XCircle } from "lucide-react"
import type { ProductKPISummary } from "@/lib/product-types"

const kpiCards = [
  { key: "total" as const, label: "Total Products", icon: Package, bg: "bg-[#e0f7f5]", iconColor: "text-[#06b6d4]" },
  { key: "active" as const, label: "Active", icon: CheckCircle2, bg: "bg-[#fde0e6]", iconColor: "text-[#e11d48]" },
  { key: "inDevelopment" as const, label: "In Development", icon: FlaskConical, bg: "bg-[#e8e0ff]", iconColor: "text-[#8b5cf6]" },
  { key: "fdaWarning" as const, label: "FDA Warning", icon: AlertTriangle, bg: "bg-[#fef3c7]", iconColor: "text-[#f59e0b]" },
  { key: "discontinued" as const, label: "Discontinued", icon: XCircle, bg: "bg-[#e0f2fe]", iconColor: "text-[#3b82f6]" },
]

export function ProductKPIStats({ data }: { data: ProductKPISummary }) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {kpiCards.map((card) => (
        <div
          key={card.key}
          className={`${card.bg} flex items-center gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/70 ${card.iconColor}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-foreground">
              {data[card.key].toLocaleString()}
            </div>
            <div className="text-[11px] font-medium text-muted-foreground">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
