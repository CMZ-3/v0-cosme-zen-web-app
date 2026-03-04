"use client"

import { AlertTriangle, TrendingDown, XCircle, ArrowUpCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { StockAlert } from "@/lib/stock-types"
import { alertTypeLabels, alertTypeColors } from "@/lib/stock-types"

const alertIcons: Record<string, typeof AlertTriangle> = {
  low_stock: TrendingDown,
  out_of_stock: XCircle,
  over_stock: ArrowUpCircle,
  reorder: AlertTriangle,
  expiry_warning: Clock,
}

interface StockAlertsTabProps {
  data: StockAlert[]
}

export function StockAlertsTab({ data }: StockAlertsTabProps) {
  const unresolved = data.filter((a) => !a.isResolved)

  const summary = {
    total: unresolved.length,
    lowStock: unresolved.filter((a) => a.alertType === "low_stock").length,
    outOfStock: unresolved.filter((a) => a.alertType === "out_of_stock").length,
    overStock: unresolved.filter((a) => a.alertType === "over_stock").length,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl bg-[#fde0e6] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Total Alerts</span>
          <div className="mt-1 text-2xl font-extrabold text-foreground">{summary.total}</div>
        </div>
        <div className="rounded-2xl bg-[#fef3c7] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Low Stock</span>
          <div className="mt-1 text-2xl font-extrabold text-amber-700">{summary.lowStock}</div>
        </div>
        <div className="rounded-2xl bg-[#fef2f2] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Out of Stock</span>
          <div className="mt-1 text-2xl font-extrabold text-red-600">{summary.outOfStock}</div>
        </div>
        <div className="rounded-2xl bg-[#e0f2fe] p-4">
          <span className="text-[11px] font-medium text-muted-foreground">Over Stock</span>
          <div className="mt-1 text-2xl font-extrabold text-blue-600">{summary.overStock}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-secondary">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Alert Type</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Threshold</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((alert) => {
                const Icon = alertIcons[alert.alertType] ?? AlertTriangle
                return (
                  <tr key={alert.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] text-primary">{alert.itemCode}</span>
                          <span className="text-xs text-muted-foreground">{alert.itemName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold ${alertTypeColors[alert.alertType]}`}>
                        {alertTypeLabels[alert.alertType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{alert.thresholdValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-xs font-bold ${alert.currentValue <= 0 ? "text-red-600" : "text-amber-600"}`}>
                        {alert.currentValue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold ${alert.isResolved ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {alert.isResolved ? "Resolved" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
