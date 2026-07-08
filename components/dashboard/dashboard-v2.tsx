"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { mockJobOrders } from "@/lib/job-order-mock-data"
import { mockStockCards } from "@/lib/stock-mock-data"
import { mockDeliveryOrders } from "@/lib/delivery-mock-data"
import { mockFdaList } from "@/lib/fda-mock-data"
import { mockFormulaList } from "@/lib/formula-mock-data"
import {
  ClipboardList, Package, Truck, FlaskConical,
  TrendingUp, TrendingDown, ChevronRight, Bell,
  ShieldCheck, Zap, AlertTriangle, ArrowRight,
  Star, BarChart3,
} from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

/* ─── colour palette ─── */
const P = {
  lavender: "#c4b5fd",
  lavenderbg: "#ede9fe",
  lavenderdark: "#7c3aed",
  pink: "#f9a8d4",
  pinkbg: "#fce7f3",
  pinkdark: "#be185d",
  peach: "#fdba74",
  peachbg: "#ffedd5",
  peachdark: "#c2410c",
  mint: "#6ee7b7",
  mintbg: "#d1fae5",
  mintdark: "#047857",
  sky: "#93c5fd",
  skybg: "#dbeafe",
  skydark: "#1d4ed8",
  cream: "#fef9f0",
  cardBg: "#ffffff",
  bgPage: "#f3efff",
  hero: "linear-gradient(135deg,#ddd6fe 0%,#ede9fe 50%,#fce7f3 100%)",
}

/* ─── hero blob ─── */
function Blob({ className, color }: { className?: string; color: string }) {
  return (
    <div
      className={cn("absolute rounded-full opacity-40 blur-3xl pointer-events-none", className)}
      style={{ background: color }}
    />
  )
}

/* ─── icon blob ─── */
function IconBlob({
  icon: Icon,
  color,
  bg,
  size = "md",
}: {
  icon: React.ElementType
  color: string
  bg: string
  size?: "sm" | "md" | "lg"
}) {
  const s = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-14 w-14" : "h-12 w-12"
  const i = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5"
  return (
    <div
      className={cn("flex items-center justify-center rounded-2xl shadow-sm shrink-0", s)}
      style={{ background: bg }}
    >
      <Icon className={i} style={{ color }} />
    </div>
  )
}

/* ─── KPI card ─── */
function KpiCard({
  label, value, sub, icon: Icon, iconColor, iconBg, accentColor, positive,
}: {
  label: string; value: string; sub: string; icon: React.ElementType
  iconColor: string; iconBg: string; accentColor: string; positive?: boolean
}) {
  return (
    <div
      className="relative rounded-3xl p-5 overflow-hidden"
      style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.08)" }}
    >
      <Blob className="w-32 h-32 -top-8 -right-8" color={iconBg} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-extrabold leading-none" style={{ color: "#1e1b4b" }}>{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {positive !== undefined && (
              <span style={{ color: positive ? P.mintdark : P.pinkdark }}>
                {positive
                  ? <TrendingUp className="h-3 w-3 inline" />
                  : <TrendingDown className="h-3 w-3 inline" />}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">{sub}</span>
          </div>
        </div>
        <IconBlob icon={Icon} color={iconColor} bg={iconBg} size="lg" />
      </div>
    </div>
  )
}

/* ─── section header ─── */
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[14px] font-extrabold" style={{ color: "#1e1b4b" }}>{title}</h3>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[11px] font-bold" style={{ color: P.lavenderdark }}>
          See All <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}

/* ─── production status bar chart data ─── */
const JO_STATUS_ORDER = ["new", "confirmed", "material_prep", "mixing", "filling", "labeling", "qc_check", "packing"]
const JO_STATUS_LABELS: Record<string, string> = {
  new: "New", confirmed: "Conf.", material_prep: "Mat. Prep",
  mixing: "Mixing", filling: "Filling", labeling: "Label",
  qc_check: "QC", packing: "Pack",
}
const JO_COLORS = [P.sky, P.lavender, P.peach, P.pink, "#f0abfc", P.mint, "#fde68a", "#a5f3fc"]

/* ─── MAIN ─── */
export function DashboardV2() {
  const [view, setView] = useState<"week" | "month">("week")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  const { kpis, joStatusData, formulaTypeData, recentJO, alerts } = useMemo(() => {
    /* KPIs */
    const activeJO = mockJobOrders.filter(jo => !["delivered", "cancelled"].includes(jo.status))
    const inProd = mockJobOrders.filter(jo => ["filling", "labeling", "qc_check"].includes(jo.status)).length
    const totalRev = mockJobOrders.reduce((s, j) => s + j.totalValue, 0)
    const revFmt = totalRev >= 1_000_000 ? `${(totalRev / 1_000_000).toFixed(1)}M` : `${(totalRev / 1_000).toFixed(0)}K`
    const outStock = mockStockCards.filter(s => s.inventoryStatus === "out_of_stock").length
    const lowStock = mockStockCards.filter(s => s.inventoryStatus === "low").length
    const pipeline = mockDeliveryOrders.filter(d => !["delivered", "completed", "cancelled"].includes(d.status))

    /* JO status bar chart */
    const statusCounts: Record<string, number> = {}
    mockJobOrders.forEach(jo => { statusCounts[jo.status] = (statusCounts[jo.status] || 0) + 1 })
    const joStatusData = JO_STATUS_ORDER.map((s, i) => ({
      name: JO_STATUS_LABELS[s],
      count: statusCounts[s] || 0,
      fill: JO_COLORS[i % JO_COLORS.length],
    }))

    /* Formula type donut */
    const typeCounts: Record<string, number> = {}
    mockFormulaList.forEach(f => { typeCounts[f.formulaType] = (typeCounts[f.formulaType] || 0) + 1 })
    const typeColors: Record<string, string> = {
      emulsion: P.lavender, serum: P.pink, powder: P.peach,
      gel: P.mint, oil: P.sky, cleanser: "#f0abfc", mist: "#a5f3fc",
    }
    const formulaTypeData = Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      fill: typeColors[type] || "#e2e8f0",
    }))

    /* Recent JOs */
    const recentJO = [...mockJobOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    /* Alerts */
    const alerts = [
      ...mockFdaList.filter(f => f.status === "expired").slice(0, 2).map(f => ({
        id: f.id, type: "fda" as const, label: f.productNameEn ?? f.productNameTh, sub: "FDA Expired",
        color: P.pinkdark, bg: P.pinkbg,
      })),
      ...mockStockCards.filter(s => s.inventoryStatus === "out_of_stock").slice(0, 2).map(s => ({
        id: s.id, type: "stock" as const, label: s.itemName, sub: "Out of Stock",
        color: P.peachdark, bg: P.peachbg,
      })),
    ]

    return {
      kpis: [
        { label: "Active Job Orders", value: String(activeJO.length), sub: `${inProd} in production`, icon: ClipboardList, iconColor: P.skydark, iconBg: P.skybg, accentColor: P.skydark, positive: true },
        { label: "Revenue (THB)", value: revFmt, sub: `${mockJobOrders.length} total orders`, icon: BarChart3, iconColor: P.lavenderdark, iconBg: P.lavenderbg, accentColor: P.lavenderdark, positive: true },
        { label: "Stock Items", value: String(mockStockCards.length), sub: outStock > 0 ? `${outStock} out • ${lowStock} low` : "All healthy", icon: Package, iconColor: P.peachdark, iconBg: P.peachbg, accentColor: P.peachdark, positive: outStock === 0 },
        { label: "Delivery Pipeline", value: String(pipeline.length), sub: `${mockDeliveryOrders.filter(d => d.status === "shipped").length} shipped`, icon: Truck, iconColor: P.mintdark, iconBg: P.mintbg, accentColor: P.mintdark, positive: true },
      ],
      joStatusData, formulaTypeData, recentJO, alerts,
    }
  }, [])

  const joStatusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: "#dbeafe", text: "#1d4ed8" },
    confirmed: { bg: "#ede9fe", text: "#7c3aed" },
    material_prep: { bg: "#ffedd5", text: "#c2410c" },
    mixing: { bg: "#fce7f3", text: "#be185d" },
    filling: { bg: "#f0fdf4", text: "#15803d" },
    labeling: { bg: "#f5f3ff", text: "#6d28d9" },
    qc_check: { bg: "#fef3c7", text: "#b45309" },
    qc_passed: { bg: "#d1fae5", text: "#047857" },
    packing: { bg: "#e0e7ff", text: "#3730a3" },
    delivered: { bg: "#dcfce7", text: "#166534" },
    cancelled: { bg: "#fee2e2", text: "#dc2626" },
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: P.bgPage }}
    >
      {/* ── decorative page blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <Blob className="w-[600px] h-[600px] -top-40 -right-40" color="#ddd6fe" />
        <Blob className="w-[400px] h-[400px] bottom-0 -left-20" color="#fce7f3" />
        <Blob className="w-[300px] h-[300px] top-1/2 left-1/3" color="#d1fae5" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto p-6 flex flex-col gap-6">

        {/* ── Top Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1e1b4b" }}>
              Dashboard <span className="text-[13px] font-semibold ml-2 rounded-full px-3 py-0.5" style={{ background: P.lavenderbg, color: P.lavenderdark }}>v2 Preview</span>
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">CosmeZen Factory Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl cursor-pointer"
              style={{ background: P.cardBg, boxShadow: "0 2px 12px rgba(139,92,246,0.10)" }}
            >
              <Bell className="h-4.5 w-4.5" style={{ color: P.lavenderdark }} />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ background: P.pinkdark }}>
                  {alerts.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Hero Banner ── */}
        <div
          className="relative rounded-3xl overflow-hidden px-8 py-6"
          style={{
            background: P.hero,
            boxShadow: "0 8px 40px rgba(139,92,246,0.15)",
          }}
        >
          <Blob className="w-48 h-48 -top-12 -right-12" color={P.pink} />
          <Blob className="w-32 h-32 bottom-0 right-1/3" color={P.lavenderbg} />
          <div className="relative flex items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✨</span>
                <p className="text-[15px] font-black" style={{ color: P.lavenderdark }}>{greeting}, Factory Manager!</p>
              </div>
              <p className="text-[28px] font-extrabold leading-tight" style={{ color: "#1e1b4b" }}>
                {"Today's Production"}<br />
                <span style={{ color: P.lavenderdark }}>is on track</span>
              </p>
              <p className="text-[13px] mt-2" style={{ color: "#4c1d95" }}>
                {mockJobOrders.filter(jo => ["filling", "labeling", "qc_check"].includes(jo.status)).length} batches in production right now
              </p>
            </div>
            {/* Hero stat pills */}
            <div className="hidden md:flex flex-col gap-2 shrink-0">
              {[
                { label: "Formulas Active", value: String(mockFormulaList.filter(f => f.status === "active").length), icon: FlaskConical, color: P.lavenderdark, bg: P.cardBg },
                { label: "FDA Approvals", value: String(mockFdaList.filter(f => f.status === "approved").length), icon: ShieldCheck, color: P.mintdark, bg: P.cardBg },
                { label: "Ready to Ship", value: String(mockDeliveryOrders.filter(d => d.status === "picking" || d.status === "reserved").length), icon: Zap, color: P.peachdark, bg: P.cardBg },
              ].map(pill => (
                <div key={pill.label} className="flex items-center gap-3 rounded-2xl px-4 py-2.5" style={{ background: pill.bg, boxShadow: "0 2px 12px rgba(139,92,246,0.08)" }}>
                  <pill.icon className="h-4 w-4 shrink-0" style={{ color: pill.color }} />
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-none">{pill.label}</p>
                    <p className="text-[18px] font-extrabold leading-tight" style={{ color: "#1e1b4b" }}>{pill.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Production overview bar chart */}
          <div
            className="lg:col-span-3 rounded-3xl p-5"
            style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <SectionHeader title="Production Pipeline" />
              <div className="flex gap-1 rounded-xl p-1" style={{ background: P.lavenderbg }}>
                {(["week", "month"] as const).map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    className="rounded-lg px-3 py-1 text-[11px] font-bold transition-all"
                    style={view === v
                      ? { background: P.lavenderdark, color: "#fff" }
                      : { color: P.lavenderdark, background: "transparent" }}
                  >
                    {v === "week" ? "This Week" : "This Month"}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={joStatusData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(139,92,246,0.06)", radius: 8 }}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {joStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Formula type donut */}
          <div
            className="lg:col-span-2 rounded-3xl p-5"
            style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}
          >
            <SectionHeader title="Formula Types" />
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie data={formulaTypeData} cx={65} cy={65} innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {formulaTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 11 }}
                />
              </PieChart>
              <div className="flex-1 space-y-1.5">
                {formulaTypeData.map(item => {
                  const total = formulaTypeData.reduce((s, i) => s + i.value, 0)
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.fill }} />
                        <span className="text-[11px] text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: "#1e1b4b" }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Recent JOs + Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Recent Job Orders */}
          <div
            className="lg:col-span-3 rounded-3xl p-5"
            style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}
          >
            <SectionHeader title="Recent Job Orders" href="/job-orders" />
            <div className="space-y-2">
              {recentJO.map(jo => {
                const sc = joStatusColors[jo.status] ?? { bg: "#f1f5f9", text: "#475569" }
                return (
                  <Link
                    key={jo.id}
                    href={`/job-orders/${jo.id}`}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all group"
                    style={{ background: P.bgPage }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: P.lavenderbg }}>
                      <ClipboardList className="h-4 w-4" style={{ color: P.lavenderdark }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: "#1e1b4b" }}>{jo.productName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{jo.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: sc.bg, color: sc.text }}>
                        {jo.status.replace(/_/g, " ")}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: P.lavenderdark }} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Alerts + Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Alerts */}
            <div
              className="rounded-3xl p-5 flex-1"
              style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}
            >
              <SectionHeader title="Alerts" />
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Star className="h-8 w-8" style={{ color: P.lavender }} />
                  <p className="text-[12px] text-muted-foreground">All clear!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(a => (
                    <div key={a.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5" style={{ background: a.bg }}>
                      <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: a.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold truncate" style={{ color: "#1e1b4b" }}>{a.label}</p>
                        <p className="text-[10px] font-semibold" style={{ color: a.color }}>{a.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div
              className="rounded-3xl p-5"
              style={{ background: P.cardBg, boxShadow: "0 4px 24px rgba(139,92,246,0.07)" }}
            >
              <SectionHeader title="Quick Access" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "New JO", href: "/job-orders", icon: ClipboardList, color: P.skydark, bg: P.skybg },
                  { label: "Formulas", href: "/formulas", icon: FlaskConical, color: P.lavenderdark, bg: P.lavenderbg },
                  { label: "Delivery", href: "/delivery", icon: Truck, color: P.mintdark, bg: P.mintbg },
                  { label: "FDA", href: "/fda", icon: ShieldCheck, color: P.pinkdark, bg: P.pinkbg },
                ].map(q => (
                  <Link
                    key={q.label}
                    href={q.href}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 transition-all hover:scale-[1.02]"
                    style={{ background: q.bg }}
                  >
                    <q.icon className="h-4 w-4 shrink-0" style={{ color: q.color }} />
                    <span className="text-[12px] font-bold" style={{ color: q.color }}>{q.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA Banner ── */}
        <div
          className="relative rounded-3xl px-8 py-5 overflow-hidden flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)", boxShadow: "0 8px 32px rgba(124,58,237,0.30)" }}
        >
          <Blob className="w-48 h-24 -right-10 -top-6" color="rgba(255,255,255,0.15)" />
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.2)" }}>
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[16px] font-extrabold text-white">Ready to scale production?</p>
              <p className="text-[12px] text-white/80">Create a new Job Order and track it from formula to delivery</p>
            </div>
          </div>
          <Link
            href="/job-orders"
            className="shrink-0 flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-black transition-all hover:scale-105"
            style={{ background: "#ffffff", color: P.lavenderdark }}
          >
            Create JO <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
