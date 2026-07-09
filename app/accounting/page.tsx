"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import {
  DollarSign, TrendingUp, FileText, Wallet, RefreshCw, ArrowRight,
  ChevronDown, ChevronUp, TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SortKey = "orderNumber" | "batchSize" | "revenue" | "cost" | "profit" | "margin"
type SortDir = "asc" | "desc"

export default function AccountingPage() {
  const { data, isLoading, mutate } = useSWR("/api/dashboard", fetcher, { revalidateOnFocus: false })
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "revenue", dir: "desc" })

  const kpi = data?.kpi
  const totalRevenue: number = kpi?.totalRevenue ?? 0
  const totalCost: number = kpi?.totalCost ?? 0
  const grossProfit: number = kpi?.grossProfit ?? 0
  const margin: number = kpi?.margin ?? 0
  const openInvoices: number = kpi?.openInvoices ?? 0
  const rawJos: Array<Record<string, unknown>> = data?.recentJos ?? []

  // Enrich with derived financials
  const jos = rawJos.map((jo) => {
    const batchKg = Number(jo.batchSize ?? jo.batchSizeKg ?? 0)
    const revenue = batchKg > 0 ? Math.round(batchKg * 1800) : 0 // ฿1,800/kg avg sell
    const cost = Math.round(revenue * 0.65)
    const profit = revenue - cost
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
    return { ...jo, _revenue: revenue, _cost: cost, _profit: profit, _margin: profitMargin, _batchKg: batchKg } as Record<string, unknown>
  })

  const sortedJos = [...jos].sort((a, b) => {
    const keyMap: Record<SortKey, string> = {
      orderNumber: "orderNumber",
      batchSize: "_batchKg",
      revenue: "_revenue",
      cost: "_cost",
      profit: "_profit",
      margin: "_margin",
    }
    const k = keyMap[sort.key]
    const av = typeof (a as Record<string, unknown>)[k] === "number" ? (a as Record<string, unknown>)[k] as number : String((a as Record<string, unknown>)[k]).charCodeAt(0)
    const bv = typeof (b as Record<string, unknown>)[k] === "number" ? (b as Record<string, unknown>)[k] as number : String((b as Record<string, unknown>)[k]).charCodeAt(0)
    return sort.dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const fmt = (n: number) => `฿${Math.round(n).toLocaleString("th-TH")}`

  const toggleSort = (key: SortKey) => {
    setSort((prev) => prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" })
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sort.key !== k) return <span className="h-3 w-3 inline-block" />
    return sort.dir === "asc" ? <ChevronUp className="h-3 w-3 inline-block" /> : <ChevronDown className="h-3 w-3 inline-block" />
  }

  const kpis = [
    { label: "Total Revenue", value: fmt(totalRevenue), sub: "All job orders", icon: TrendingUp, color: "#15803d", bg: "#ecfdf5" },
    { label: "Total Cost", value: fmt(totalCost), sub: "~65% COGS estimate", icon: Wallet, color: "#c2410c", bg: "#fef3c7" },
    { label: "Gross Profit", value: fmt(grossProfit), sub: `${margin}% margin`, icon: DollarSign, color: "#0369a1", bg: "#eef4ff" },
    { label: "Open Invoices", value: String(openInvoices), sub: "Awaiting payment", icon: FileText, color: "#7c3aed", bg: "#f3efff" },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Accounting</h1>
            <p className="text-[12px] text-muted-foreground">Financial summary derived from job orders</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-[10px] text-[12px]"
          onClick={() => mutate()}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: k.bg }}>
                <Icon className="h-4 w-4" style={{ color: k.color }} />
              </span>
              <div className="text-2xl font-extrabold text-foreground">{k.value}</div>
              <div className="text-[12px] font-semibold text-foreground mt-0.5">{k.label}</div>
              <div className="text-[10px] text-muted-foreground">{k.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Profit Summary bar */}
      {totalRevenue > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Revenue Breakdown</h2>
            <span className="text-[11px] font-bold text-emerald-600">{margin}% gross margin</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-secondary">
            <div
              className="h-full bg-red-400 transition-all"
              style={{ width: `${Math.round((totalCost / totalRevenue) * 100)}%` }}
              title={`Cost: ${fmt(totalCost)}`}
            />
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${margin}%` }}
              title={`Profit: ${fmt(grossProfit)}`}
            />
          </div>
          <div className="flex items-center gap-5 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />Cost ({Math.round((totalCost / totalRevenue) * 100)}%)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Profit ({margin}%)</span>
          </div>
        </div>
      )}

      {/* Cost per JO table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-6">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Cost & Revenue by Job Order</h2>
          <Link href="/job-orders" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
            All JOs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-secondary/60 text-left">
                <SortableTh label="Order" k="orderNumber" sort={sort} onSort={toggleSort} SortIcon={SortIcon} />
                <th className="px-4 py-2.5 font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                <SortableTh label="Batch (kg)" k="batchSize" sort={sort} onSort={toggleSort} SortIcon={SortIcon} right />
                <SortableTh label="Revenue" k="revenue" sort={sort} onSort={toggleSort} SortIcon={SortIcon} right />
                <SortableTh label="Cost" k="cost" sort={sort} onSort={toggleSort} SortIcon={SortIcon} right />
                <SortableTh label="Profit" k="profit" sort={sort} onSort={toggleSort} SortIcon={SortIcon} right />
                <SortableTh label="Margin" k="margin" sort={sort} onSort={toggleSort} SortIcon={SortIcon} right />
              </tr>
            </thead>
            <tbody>
              {sortedJos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-muted-foreground text-[11px]">
                    {isLoading ? "Loading..." : "No job orders found"}
                  </td>
                </tr>
              )}
              {sortedJos.map((jo) => {
                const profit = jo._profit as number
                const isProfit = profit >= 0
                const statusColors: Record<string, string> = {
                  completed: "bg-emerald-100 text-emerald-700",
                  in_progress: "bg-blue-100 text-blue-700",
                  new: "bg-secondary text-muted-foreground",
                  on_hold: "bg-amber-100 text-amber-700",
                  cancelled: "bg-red-100 text-red-700",
                }
                const st = String(jo.status ?? "new")
                return (
                  <tr key={String(jo.id)} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary text-[11px]">
                      <Link href={`/job-orders?id=${jo.id}`} className="hover:underline">
                        {String(jo.orderNumber ?? jo.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground text-[11px] max-w-[120px] truncate">{String(jo.customerName ?? "—")}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-0.5 text-[9px] font-bold uppercase", statusColors[st] ?? "bg-secondary text-muted-foreground")}>
                        {st.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">{Number(jo._batchKg).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground text-[11px]">{fmt(jo._revenue as number)}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-600 text-[11px]">{fmt(jo._cost as number)}</td>
                    <td className={cn("px-4 py-3 text-right font-mono font-bold text-[11px]", isProfit ? "text-emerald-600" : "text-red-600")}>
                      {isProfit ? "" : "-"}{fmt(Math.abs(profit))}
                    </td>
                    <td className="px-4 py-3 text-right text-[11px]">
                      <div className="flex items-center justify-end gap-1.5">
                        {isProfit ? (
                          <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                        )}
                        <span className={cn("font-bold", isProfit ? "text-emerald-600" : "text-red-600")}>
                          {jo._margin as number}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {sortedJos.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-primary/20 bg-secondary/30 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-right text-[11px] font-bold uppercase text-muted-foreground">Total</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-foreground">{fmt(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-red-600">{fmt(totalCost)}</td>
                  <td className="px-4 py-3 text-right font-mono text-[12px] text-emerald-600">{fmt(grossProfit)}</td>
                  <td className="px-4 py-3 text-right text-[12px] font-bold text-emerald-600">{margin}%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Revenue is estimated at ฿1,800/kg average sell price. Cost uses ~65% COGS. Actual invoicing module is on the roadmap.
      </p>
    </div>
  )
}

function SortableTh({
  label, k, sort, onSort, SortIcon, right,
}: {
  label: string
  k: SortKey
  sort: { key: SortKey; dir: SortDir }
  onSort: (k: SortKey) => void
  SortIcon: (props: { k: SortKey }) => React.ReactElement
  right?: boolean
}) {
  return (
    <th
      className={cn("px-4 py-2.5 font-semibold text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors", right && "text-right")}
      onClick={() => onSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label} <SortIcon k={k} />
      </span>
    </th>
  )
}
