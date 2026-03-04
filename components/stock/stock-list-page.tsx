"use client"

import { useState } from "react"
import { Package, Download, RotateCcw, BarChart3, FlaskConical, Lock, Truck, ClipboardList, AlertTriangle, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StockKpiCards } from "./stock-kpi-cards"
import { StockOverviewTable } from "./stock-overview-table"
import { StockMovementsTab } from "./stock-movements-tab"
import { StockAlertsTab } from "./stock-alerts-tab"
import { StockReservationsTab } from "./stock-reservations-tab"
import {
  mockStockDashboard,
  mockStockCards,
  mockStockMovements,
  mockAlerts,
  mockReservations,
} from "@/lib/stock-mock-data"
import { cn } from "@/lib/utils"

type StockTab = "overview" | "simulator" | "reserved" | "incoming" | "movements" | "alerts" | "guide"

const tabs: { key: StockTab; label: string; icon: typeof BarChart3; badge?: number; badgeColor?: string }[] = [
  { key: "overview", label: "Overview", icon: Package },
  { key: "simulator", label: "Simulator", icon: FlaskConical },
  { key: "reserved", label: "Reserved", icon: Lock, badge: mockReservations.filter((r) => r.status === "active").length, badgeColor: "bg-amber-500" },
  { key: "incoming", label: "Incoming", icon: Truck, badge: 3, badgeColor: "bg-blue-500" },
  { key: "movements", label: "Movements", icon: ClipboardList },
  { key: "alerts", label: "Alerts", icon: AlertTriangle, badge: mockAlerts.filter((a) => !a.isResolved).length, badgeColor: "bg-destructive" },
  { key: "guide", label: "Guide", icon: BookOpen },
]

export function StockListPage() {
  const [activeTab, setActiveTab] = useState<StockTab>("overview")

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Inventory Hub</h1>
            <p className="text-[11px] text-muted-foreground">Unified Stock Management &bull; Overview &bull; Simulator &bull; Reserve &bull; Movements</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          {/* KPI Cards */}
          <StockKpiCards data={mockStockDashboard} />

          {/* Tab Bar */}
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(76,139,245,0.3)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`ml-1 rounded-full px-1.5 py-px text-[10px] font-bold text-white ${activeTab === tab.key ? "bg-white/30 text-primary-foreground" : tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-[#e0f2fe] p-4 text-[12px] text-blue-800">
                <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" />
                <div><strong className="font-semibold">Available = Physical - Reserved + Incoming</strong> &mdash; The actual quantity ready for use / sales commitment</div>
              </div>
              <StockOverviewTable data={mockStockCards} />
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-16 text-center">
                <FlaskConical className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-3 text-sm font-bold text-foreground">Stock Simulator</h3>
                <p className="mt-1 text-xs text-muted-foreground">Select formulas, set batch sizes, and simulate stock consumption to check material sufficiency before production.</p>
              </div>
            </div>
          )}

          {activeTab === "reserved" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <StockReservationsTab data={mockReservations} />
            </div>
          )}

          {activeTab === "incoming" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-16 text-center">
                <Truck className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <h3 className="mt-3 text-sm font-bold text-foreground">Incoming Stock</h3>
                <p className="mt-1 text-xs text-muted-foreground">Track purchase orders and materials in transit. Partial receive and document trail.</p>
              </div>
            </div>
          )}

          {activeTab === "movements" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <StockMovementsTab data={mockStockMovements} />
            </div>
          )}

          {activeTab === "alerts" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <StockAlertsTab data={mockAlerts} />
            </div>
          )}

          {activeTab === "guide" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h3 className="text-base font-bold text-foreground">Stock Module Guide</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <GuideCard
                    title="Stock Balance Formula"
                    content="Available = Physical Balance - Reserved + Incoming. This is the true quantity ready for production commitment."
                    color="bg-[#e0f7f5]"
                  />
                  <GuideCard
                    title="FEFO Principle"
                    content="First Expired, First Out. Opened lots are consumed before sealed lots. Within each category, oldest expiry goes first."
                    color="bg-[#fef3c7]"
                  />
                  <GuideCard
                    title="Movement Workflow"
                    content="Draft -> Pending -> Approved/Rejected. Only draft movements can be edited or deleted. Approved movements update stock balance."
                    color="bg-[#e8e0ff]"
                  />
                  <GuideCard
                    title="Lot Categories"
                    content="Sealed = unopened original lot. Opened = transferred from a sealed lot. Opening a lot creates a parent-child relationship."
                    color="bg-[#e0f2fe]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GuideCard({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <h4 className="text-[13px] font-bold text-foreground">{title}</h4>
      <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{content}</p>
    </div>
  )
}
