"use client"

import { Lock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { StockReservation } from "@/lib/stock-types"

const statusConfig: Record<string, { color: string; icon: typeof Lock }> = {
  active: { color: "bg-amber-100 text-amber-700", icon: Lock },
  released: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  consumed: { color: "bg-zinc-100 text-zinc-600", icon: XCircle },
}

interface StockReservationsTabProps {
  data: StockReservation[]
}

export function StockReservationsTab({ data }: StockReservationsTabProps) {
  const activeCount = data.filter((r) => r.status === "active").length
  const totalReserved = data.filter((r) => r.status === "active").reduce((s, r) => s + r.reservedQuantity, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#fce7d6] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Active Reservations</span>
          <div className="mt-1 text-2xl font-extrabold text-orange-700">{activeCount}</div>
        </div>
        <div className="rounded-2xl bg-[#fef3c7] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Total Reserved Qty</span>
          <div className="mt-1 text-2xl font-extrabold text-foreground">{totalReserved.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-[#e0f7f5] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Total Entries</span>
          <div className="mt-1 text-2xl font-extrabold text-foreground">{data.length}</div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {data.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-10 text-center text-sm text-muted-foreground">
            No reservations found
          </div>
        ) : (
          data.map((res) => {
            const cfg = statusConfig[res.status] ?? statusConfig.active
            const Icon = cfg.icon
            const isActive = res.status === "active"
            return (
              <div
                key={res.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md ${isActive ? "border-l-4 border-l-amber-500" : res.status === "consumed" ? "border-l-4 border-l-zinc-300 opacity-70" : "border-l-4 border-l-emerald-500"}`}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-secondary px-2 py-0.5 rounded-md">{res.jobNo}</span>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold capitalize ${cfg.color}`}>
                      {res.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Reserved: <span className="font-mono font-bold text-foreground">{res.reservedQuantity.toLocaleString()}</span>
                    {" "}on {new Date(res.reservedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    {res.releasedAt && (
                      <span> / Released: {new Date(res.releasedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
