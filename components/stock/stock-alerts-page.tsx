"use client"

import { useMemo } from "react"
import Link from "next/link"
import { BellRing, TrendingDown, XCircle, ArrowUpCircle, AlertTriangle, Clock, PackageX, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockAlerts, mockStockCards, mockStockLots } from "@/lib/stock-mock-data"
import { alertTypeLabels, alertTypeColors } from "@/lib/stock-types"
import { daysUntilExpiry, expiryLevel, type ExpiryLevel } from "@/lib/barcode-utils"

const alertIcons: Record<string, typeof AlertTriangle> = {
  low_stock: TrendingDown,
  out_of_stock: XCircle,
  over_stock: ArrowUpCircle,
  reorder: AlertTriangle,
  expiry_warning: Clock,
}

const expiryStyle: Record<ExpiryLevel, { badge: string; row: string; label: string }> = {
  expired: { badge: "bg-red-100 text-red-700", row: "bg-red-50/50", label: "Expired" },
  critical: { badge: "bg-orange-100 text-orange-700", row: "bg-orange-50/40", label: "≤ 30 days" },
  warning: { badge: "bg-amber-100 text-amber-700", row: "bg-amber-50/30", label: "≤ 90 days" },
  ok: { badge: "bg-emerald-100 text-emerald-700", row: "", label: "OK" },
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export function StockAlertsPage() {
  const unresolved = mockAlerts.filter((a) => !a.isResolved)

  // Expiry watchlist: active lots that are expiring or expired.
  const expiryLots = useMemo(() => {
    return mockStockLots
      .filter((l) => l.status !== "exhausted" && l.quantity > 0)
      .map((l) => {
        const card = mockStockCards.find((c) => c.id === l.stockCardId)
        return {
          lot: l,
          level: expiryLevel(l.expireDate),
          days: daysUntilExpiry(l.expireDate),
          itemCode: card?.itemCode ?? "—",
          itemName: card?.itemName ?? "Unknown",
          unit: card?.unit ?? "",
        }
      })
      .filter((x) => x.level !== "ok")
      .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
  }, [])

  const summary = {
    total: unresolved.length + expiryLots.length,
    lowStock: unresolved.filter((a) => a.alertType === "low_stock").length,
    outOfStock: unresolved.filter((a) => a.alertType === "out_of_stock").length,
    expiring: expiryLots.length,
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-rose-200">
            <BellRing className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Stock Alerts &amp; Expiry</h1>
            <p className="text-[11px] text-muted-foreground">
              Reorder, low/out-of-stock warnings and FEFO expiry watchlist across all lots
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          {/* Summary */}
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
            <div className="rounded-2xl bg-[#ffedd5] p-4">
              <span className="text-[11px] font-medium text-muted-foreground">Expiring / Expired</span>
              <div className="mt-1 text-2xl font-extrabold text-orange-600">{summary.expiring}</div>
            </div>
          </div>

          {/* Stock-level alerts */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <PackageX className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Stock-level Alerts</h2>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{unresolved.length}</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Alert</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Threshold</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unresolved.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">No active stock-level alerts</td>
                      </tr>
                    ) : (
                      unresolved.map((alert) => {
                        const Icon = alertIcons[alert.alertType] ?? AlertTriangle
                        return (
                          <tr key={alert.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <Link href={`/stock/${alert.stockCardId}`} className="font-mono text-[11px] text-primary hover:underline">{alert.itemCode}</Link>
                                  <span className="text-xs text-muted-foreground">{alert.itemName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold", alertTypeColors[alert.alertType])}>
                                {alertTypeLabels[alert.alertType]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">{alert.thresholdValue.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={cn("font-mono text-xs font-bold", alert.currentValue <= 0 ? "text-red-600" : "text-amber-600")}>
                                {alert.currentValue.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(alert.createdAt)}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Expiry watchlist */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold text-foreground">Expiry Watchlist (FEFO)</h2>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{expiryLots.length}</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lot</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expiry</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiryLots.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">No lots expiring within 90 days</td>
                      </tr>
                    ) : (
                      expiryLots.map(({ lot, level, days, itemCode, itemName, unit }) => {
                        const style = expiryStyle[level]
                        return (
                          <tr key={lot.id} className={cn("border-b border-border transition-colors", style.row)}>
                            <td className="px-4 py-3 font-mono text-[11px] text-primary">{lot.lotNumber}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-mono text-[11px] text-muted-foreground">{itemCode}</span>
                                <span className="text-xs text-foreground">{itemName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">{lot.quantity.toLocaleString()} {unit}</td>
                            <td className="px-4 py-3 text-xs">
                              <div className="flex flex-col">
                                <span className="text-foreground">{fmtDate(lot.expireDate)}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {days !== null && days < 0 ? `${Math.abs(days)}d overdue` : days !== null ? `in ${days}d` : "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold", style.badge)}>
                                <Clock className="h-3 w-3" /> {style.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
