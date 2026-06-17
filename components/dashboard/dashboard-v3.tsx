"use client"

import { useMemo, useState } from "react"
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { mockDeliveries } from "@/lib/delivery-mock-data"
import { mockStockCards } from "@/lib/stock-mock-data"
import { mockFdaList } from "@/lib/fda-mock-data"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts"
import {
  FlaskConical, Truck, Package, FileCheck, TrendingUp, TrendingDown,
  MoreHorizontal, Bell, Search, Plus, ArrowUpRight, Calendar,
  ChevronRight, Maximize2, Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

/* -------------------------------------------------------------------------- */
/*  Derived data                                                               */
/* -------------------------------------------------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

function getDerivedData() {
  const activeJOs = mockJobOrders.filter((j) => j.status === "in_progress").length
  const pendingJOs = mockJobOrders.filter((j) => j.status === "pending").length
  const completedJOs = mockJobOrders.filter((j) => j.status === "completed").length
  const totalJOs = mockJobOrders.length

  const totalRevenue = mockJobOrders.reduce((a, j) => a + (j.totalValue ?? 0), 0)
  const monthlyTarget = 3_200_000

  const inTransit = mockDeliveries.filter((d) => d.status === "shipped").length
  const delivered = mockDeliveries.filter((d) => d.status === "delivered").length

  const lowStock = mockStockCards.filter((s) => s.inventoryStatus === "low_stock").length
  const outOfStock = mockStockCards.filter((s) => s.inventoryStatus === "out_of_stock").length

  const pendingFDA = mockFdaList.filter((f) => f.status === "submitted" || f.status === "draft").length

  const barData = MONTHS.map((m, i) => ({
    month: m,
    revenue: Math.round(totalRevenue * (0.6 + Math.random() * 0.8) * (i + 1) / MONTHS.length),
    cost: Math.round(totalRevenue * (0.35 + Math.random() * 0.3) * (i + 1) / MONTHS.length),
  }))

  const donutData = [
    { name: "In Progress", value: activeJOs, color: "#2563eb" },
    { name: "Pending", value: pendingJOs, color: "#f97316" },
    { name: "Completed", value: completedJOs, color: "#10b981" },
    { name: "Others", value: Math.max(1, totalJOs - activeJOs - pendingJOs - completedJOs), color: "#e5e7eb" },
  ]

  const recentJOs = mockJobOrders.slice(0, 5)

  return {
    activeJOs, pendingJOs, completedJOs, totalJOs,
    totalRevenue, monthlyTarget, inTransit, delivered,
    lowStock, outOfStock, pendingFDA,
    barData, donutData, recentJOs,
  }
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function KpiCard({
  label, value, sub, delta, icon: Icon, color, bg,
}: {
  label: string; value: string; sub?: string; delta?: number; icon: React.ElementType;
  color: string; bg: string;
}) {
  const up = (delta ?? 0) >= 0
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {delta !== undefined && (
          <span className={cn(
            "flex items-center gap-0.5 text-[11px] font-semibold",
            up ? "text-emerald-600" : "text-red-500"
          )}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wider">{label}</p>
        <p className="mt-0.5 text-[26px] font-extrabold leading-none text-[#111827]">{value}</p>
        {sub && <p className="mt-1 text-[11px] text-[#9ca3af]">{sub}</p>}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  The 3D-ish orb blob -- pure CSS radial gradients                          */
/* -------------------------------------------------------------------------- */
function OrbBlob() {
  return (
    <div className="relative h-48 w-48 shrink-0">
      {/* outer glow */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle at 40% 40%, #c084fc, #f472b6, #fb923c, transparent 70%)", filter: "blur(18px)" }}
      />
      {/* main orb */}
      <div
        className="absolute inset-4 rounded-full"
        style={{
          background: "conic-gradient(from 200deg, #f472b6, #c084fc, #818cf8, #38bdf8, #34d399, #fbbf24, #f472b6)",
          filter: "blur(1px)",
          boxShadow: "0 0 40px 10px rgba(192,132,252,0.35), inset 0 0 30px rgba(255,255,255,0.15)",
        }}
      />
      {/* inner shine */}
      <div
        className="absolute left-1/3 top-1/4 h-8 w-8 rounded-full"
        style={{ background: "rgba(255,255,255,0.45)", filter: "blur(6px)" }}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Main v3 component                                                          */
/* -------------------------------------------------------------------------- */

const segmentTabs = ["General", "Monthly", "Annual"] as const
type Segment = (typeof segmentTabs)[number]

const expenseTabs = ["Day", "Week", "Month", "Year"] as const
type ExpenseTab = (typeof expenseTabs)[number]

export function DashboardV3() {
  const data = useMemo(getDerivedData, [])
  const [segment, setSegment] = useState<Segment>("General")
  const [expenseTab, setExpenseTab] = useState<ExpenseTab>("Month")
  const usedBudget = Math.min(data.totalRevenue / data.monthlyTarget, 1)

  const recentActivities = [
    { label: "JO Completed", detail: mockJobOrders[0]?.orderNumber ?? "JO-001", value: "+฿" + ((mockJobOrders[0]?.totalValue ?? 0) / 1000).toFixed(0) + "K", color: "#10b981", date: "Today" },
    { label: "Delivery Shipped", detail: mockDeliveries[0]?.deliveryNumber ?? "DO-001", value: mockDeliveries[0]?.customerName ?? "—", color: "#2563eb", date: "Today" },
    { label: "FDA Submitted", detail: mockFdaList[0]?.productName ?? "—", value: "Pending", color: "#f97316", date: "Yesterday" },
    { label: "Stock Alert", detail: `${data.lowStock} items low`, value: "Action needed", color: "#ef4444", date: "Yesterday" },
    { label: "New JO Created", detail: mockJobOrders[1]?.orderNumber ?? "JO-002", value: "+฿" + ((mockJobOrders[1]?.totalValue ?? 0) / 1000).toFixed(0) + "K", color: "#8b5cf6", date: "2d ago" },
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 font-sans">

      {/* ------------------------------------------------------------------ */}
      {/* Top bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#111827]">Dashboard</h1>
          <p className="text-[13px] text-[#9ca3af]">Hello, Manager!</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex h-9 w-52 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 text-[12px] text-[#9ca3af]">
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
          </div>
          {/* Add New */}
          <button className="flex h-9 items-center gap-1.5 rounded-xl bg-[#111827] px-4 text-[12px] font-semibold text-white">
            <Plus className="h-3.5 w-3.5" /> Add New
          </button>
          {/* Date pill */}
          <div className="flex h-9 items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3 text-[12px] text-[#374151]">
            <Calendar className="h-3.5 w-3.5 text-[#9ca3af]" />
            <span>Jun 2025</span>
          </div>
          {/* Bell */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white">
            <Bell className="h-4 w-4 text-[#374151]" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main grid: 3 columns                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-[1fr_1fr_320px] gap-5">

        {/* ============================================================== */}
        {/* Col 1: Balance card + KPI row                                   */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-5">

          {/* Balance (hero) card */}
          <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#111827]">Production Value</h2>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f5f5f7]">
                <MoreHorizontal className="h-4 w-4 text-[#9ca3af]" />
              </button>
            </div>

            {/* Orb + segment pills */}
            <div className="flex items-center gap-4">
              <OrbBlob />
              <div className="flex-1">
                <div className="mb-3 flex w-fit gap-1 rounded-xl bg-[#f5f5f7] p-1">
                  {segmentTabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSegment(t)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                        segment === t ? "bg-[#111827] text-white shadow-sm" : "text-[#6b7280] hover:text-[#111827]"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#9ca3af]">Revenue this period</p>
                <p className="text-[30px] font-extrabold leading-none text-[#111827]">
                  {(data.totalRevenue / 1_000_000).toFixed(2)}M
                  <span className="ml-1 text-[14px] font-medium text-[#9ca3af]">THB</span>
                </p>
                <div className="mt-2 flex gap-4">
                  <div>
                    <p className="text-[10px] text-[#9ca3af]">Total JOs</p>
                    <p className="text-[13px] font-bold text-[#111827]">{data.totalJOs}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9ca3af]">Completed</p>
                    <p className="text-[13px] font-bold text-emerald-600">{data.completedJOs}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="mt-4 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.barData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }} barGap={3}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(v: number) => [`฿${(v / 1e6).toFixed(2)}M`]}
                  />
                  <Bar dataKey="revenue" radius={[5, 5, 0, 0]} barSize={12}>
                    {data.barData.map((_, i) => (
                      <Cell key={i} fill={i === data.barData.length - 1 ? "#2563eb" : "#e0e7ff"} />
                    ))}
                  </Bar>
                  <Bar dataKey="cost" radius={[5, 5, 0, 0]} barSize={12}>
                    {data.barData.map((_, i) => (
                      <Cell key={i} fill={i === data.barData.length - 1 ? "#f97316" : "#fee2e2"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-2 flex gap-4">
              {[{ label: "Revenue", color: "#2563eb" }, { label: "Cost", color: "#f97316" }].map((l) => (
                <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                  <Circle className="h-2 w-2" fill={l.color} strokeWidth={0} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* KPI mini-cards */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Active JOs" value={String(data.activeJOs)} sub={`${data.pendingJOs} pending`} delta={18} icon={FlaskConical} color="text-violet-600" bg="bg-violet-50" />
            <KpiCard label="Deliveries" value={String(data.inTransit)} sub={`${data.delivered} delivered`} delta={6} icon={Truck} color="text-blue-600" bg="bg-blue-50" />
            <KpiCard label="Stock Alerts" value={String(data.lowStock + data.outOfStock)} sub={`${data.outOfStock} out of stock`} delta={-3} icon={Package} color="text-amber-600" bg="bg-amber-50" />
            <KpiCard label="FDA Pending" value={String(data.pendingFDA)} sub="awaiting review" delta={0} icon={FileCheck} color="text-emerald-600" bg="bg-emerald-50" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* Col 2: Monthly Budget + Expenses donut                         */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-5">

          {/* Monthly Budget */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-bold text-[#111827]">Monthly Budget</h2>
                <p className="text-[11px] text-[#9ca3af]">JO production target</p>
              </div>
              <div className="flex gap-1.5">
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f5f5f7]">
                  <MoreHorizontal className="h-4 w-4 text-[#9ca3af]" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f5f5f7]">
                  <Maximize2 className="h-3.5 w-3.5 text-[#9ca3af]" />
                </button>
              </div>
            </div>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-[#9ca3af]">Used</p>
                <p className="text-[20px] font-extrabold text-[#111827]">
                  {(data.totalRevenue / 1_000_000).toFixed(2)}M
                  <span className="text-[12px] font-medium text-[#9ca3af]"> / {(data.monthlyTarget / 1_000_000).toFixed(1)}M THB</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#9ca3af]">Available</p>
                <p className="text-[14px] font-bold text-emerald-600">
                  {Math.max(0, (data.monthlyTarget - data.totalRevenue) / 1_000_000).toFixed(2)}M
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(usedBudget * 100).toFixed(1)}%`,
                  background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
                }}
              />
            </div>
            <p className="mt-1.5 text-right text-[10px] text-[#9ca3af]">{(usedBudget * 100).toFixed(0)}% utilised</p>

            {/* Budget breakdown rows */}
            <div className="mt-4 space-y-2.5">
              {[
                { label: "Raw Materials", pct: 48, color: "#2563eb" },
                { label: "Manufacturing", pct: 22, color: "#7c3aed" },
                { label: "Packaging", pct: 18, color: "#f97316" },
                { label: "QA / QC", pct: 12, color: "#10b981" },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-28 text-[11px] text-[#6b7280]">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className="w-8 text-right text-[11px] font-semibold text-[#374151]">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses / JO Status donut */}
          <div className="flex-1 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-[#111827]">JO Status</h2>
              <div className="flex gap-0.5 rounded-lg bg-[#f5f5f7] p-0.5">
                {expenseTabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setExpenseTab(t)}
                    className={cn(
                      "rounded-md px-2 py-1 text-[10px] font-semibold transition-all",
                      expenseTab === t ? "bg-white text-[#111827] shadow-sm" : "text-[#9ca3af]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative h-[140px] w-[140px] shrink-0">
                <PieChart width={140} height={140}>
                  <Pie
                    data={data.donutData}
                    cx={65}
                    cy={65}
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] text-[#9ca3af]">Total</p>
                  <p className="text-[18px] font-extrabold text-[#111827]">{data.totalJOs}</p>
                </div>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-2">
                {data.donutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-6">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">
                      <Circle className="h-2.5 w-2.5" fill={d.color} strokeWidth={0} />
                      {d.name}
                    </span>
                    <span className="text-[11px] font-bold text-[#111827]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* Col 3: "Batch Card" + Quick Actions + Recent JOs               */}
        {/* ============================================================== */}
        <div className="flex flex-col gap-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#111827]">Active Batches</h2>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white">
              <MoreHorizontal className="h-4 w-4 text-[#9ca3af]" />
            </button>
          </div>

          {/* Gradient "credit card" style batch card */}
          <div
            className="relative h-44 w-full overflow-hidden rounded-3xl p-5 text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #c084fc 50%, #fb7185 100%)" }}
          >
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 right-12 h-40 w-40 rounded-full bg-white/10" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-white/70">Active JOs</p>
                  <p className="text-[32px] font-extrabold leading-none">{data.activeJOs}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-2">
                  <FlaskConical className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-white/70">In progress</p>
                  <p className="text-[13px] font-semibold">{data.activeJOs} batches running</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/70">Completed</p>
                  <p className="text-[13px] font-semibold">{data.completedJOs} this month</p>
                </div>
              </div>
            </div>
          </div>

          <button className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d1d5db] text-[12px] font-medium text-[#6b7280] hover:border-[#111827] hover:text-[#111827] transition-colors">
            <Plus className="h-3.5 w-3.5" /> New Job Order
          </button>

          {/* Quick Actions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#111827]">Quick Actions</h3>
            </div>
            <div className="flex gap-2">
              {[
                { label: "JO", href: "/job-orders", color: "#2563eb", bg: "#eff6ff" },
                { label: "DO", href: "/delivery", color: "#f97316", bg: "#fff7ed" },
                { label: "Stock", href: "/stock", color: "#10b981", bg: "#ecfdf5" },
                { label: "FDA", href: "/fda", color: "#8b5cf6", bg: "#f5f3ff" },
              ].map((q) => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="flex h-10 flex-1 items-center justify-center rounded-xl text-[11px] font-bold transition-all hover:scale-105"
                  style={{ color: q.color, background: q.bg }}
                >
                  {q.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Last Activities */}
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#111827]">Last Activities</h3>
              <button className="flex items-center gap-0.5 text-[11px] font-semibold text-[#2563eb] hover:underline">
                See All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-2">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-extrabold"
                    style={{ background: act.color }}
                  >
                    {act.label.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-[#111827]">{act.label}</p>
                    <p className="truncate text-[10px] text-[#9ca3af]">{act.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold" style={{ color: act.color }}>{act.value}</p>
                    <p className="text-[10px] text-[#9ca3af]">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom CTA banner                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="mt-5 flex items-center justify-between overflow-hidden rounded-3xl px-8 py-4"
        style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <ArrowUpRight className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">Explore Analytics</p>
            <p className="text-[11px] text-white/60">View full production report and cost breakdown</p>
          </div>
        </div>
        <button className="rounded-xl bg-white px-5 py-2 text-[12px] font-bold text-[#1e293b] hover:bg-white/90 transition-colors">
          View Report
        </button>
      </div>

    </div>
  )
}
