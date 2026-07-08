"use client"

import Link from "next/link"
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { DollarSign, TrendingUp, FileText, Wallet, ArrowRight, Construction } from "lucide-react"

export default function AccountingPage() {
  // Lightweight financial roll-up derived from existing job order data
  const totalRevenue = mockJobOrders.reduce((s, jo) => s + (jo.totalValue ?? 0), 0)
  const totalCost = mockJobOrders.reduce((s, jo) => s + (jo.costPerUnit ?? 0) * (jo.quantity ?? 0), 0)
  const grossProfit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0

  const fmt = (n: number) => `฿${n.toLocaleString()}`

  const kpis = [
    { label: "Total Revenue", value: fmt(totalRevenue), sub: "All job orders", icon: TrendingUp, color: "#15803d", bg: "#ecfdf5" },
    { label: "Total Cost", value: fmt(totalCost), sub: "Materials + production", icon: Wallet, color: "#c2410c", bg: "#fef3c7" },
    { label: "Gross Profit", value: fmt(grossProfit), sub: `${margin}% margin`, icon: DollarSign, color: "#0369a1", bg: "#eef4ff" },
    { label: "Open Invoices", value: String(mockJobOrders.filter((j) => j.status === "delivered").length), sub: "Awaiting payment", icon: FileText, color: "#7c3aed", bg: "#f3efff" },
  ]

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Accounting</h1>
          <p className="text-[12px] text-muted-foreground">Financial overview derived from job orders</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl mb-3" style={{ background: k.bg }}>
                <Icon className="h-4.5 w-4.5" style={{ color: k.color }} />
              </span>
              <div className="text-2xl font-extrabold text-foreground">{k.value}</div>
              <div className="text-[12px] font-semibold text-foreground mt-0.5">{k.label}</div>
              <div className="text-[10px] text-muted-foreground">{k.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Revenue by JO */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden mb-6">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-bold text-foreground">Revenue by Job Order</h2>
        </div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-secondary/60 text-left">
              <th className="px-5 py-2.5 font-semibold text-muted-foreground">Order</th>
              <th className="px-5 py-2.5 font-semibold text-muted-foreground">Customer</th>
              <th className="px-5 py-2.5 font-semibold text-muted-foreground text-right">Qty</th>
              <th className="px-5 py-2.5 font-semibold text-muted-foreground text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {mockJobOrders.slice(0, 8).map((jo) => (
              <tr key={jo.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-5 py-3 font-mono font-bold text-primary">{jo.orderNumber}</td>
                <td className="px-5 py-3 text-foreground">{jo.customerName}</td>
                <td className="px-5 py-3 text-right text-muted-foreground">{jo.quantity.toLocaleString()}</td>
                <td className="px-5 py-3 text-right font-bold text-foreground">{fmt(jo.totalValue ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roadmap note */}
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-4">
        <Construction className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="flex-1">
          <p className="text-[13px] font-bold text-foreground">Full accounting module coming soon</p>
          <p className="text-[11px] text-muted-foreground">Invoicing, payments, and ledger integration are on the roadmap. This view is a summary derived from job order data.</p>
        </div>
        <Link href="/job-orders" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0">
          View Job Orders <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
