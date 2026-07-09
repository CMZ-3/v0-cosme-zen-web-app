"use client"

import { useState } from "react"
import {
  Package,
  Download,
  BarChart3,
  FlaskConical,
  Lock,
  Truck,
  ClipboardList,
  AlertTriangle,
  BookOpen,
  PackageOpen,
  Plus,
  Upload,
  Printer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AddStockDialog } from "./add-stock-dialog"
import { ImportStockDialog } from "./import-stock-dialog"
import { exportStockToExcel } from "@/lib/stock-export"
import { StockKpiCards } from "./stock-kpi-cards"
import { StockOverviewTable } from "./stock-overview-table"
import { StockMovementsTab } from "./stock-movements-tab"
import { StockAlertsTab } from "./stock-alerts-tab"
import { StockSimulatorTab } from "./stock-simulator-tab"
import { StockIncomingTab } from "./stock-incoming-tab"
import { StockReceiveTab } from "./stock-receive-tab"
import { StockReservedTab } from "./stock-reserved-tab"
import { StockGuideTab } from "./stock-guide-tab"
import { StockSimulationProvider } from "@/lib/stock-simulation-context"
import {
  mockStockCards,
  mockStockMovements,
  mockAlerts,
} from "@/lib/stock-mock-data"
import { useStockCards, useStockMovements } from "@/lib/hooks/use-stock"
import { cn } from "@/lib/utils"

type StockTab = "overview" | "simulator" | "reserved" | "incoming" | "receive" | "movements" | "alerts" | "guide"

export function StockListPage() {
  const [activeTab, setActiveTab] = useState<StockTab>("overview")
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Live data from the database (Neon). Fall back to mock while loading or on
  // error so the UI never blanks out during fetch.
  const { cards, isLoading: cardsLoading, mutate: mutateCards } = useStockCards()
  const { movements, isLoading: movementsLoading } = useStockMovements()
  const liveCards = cards.length > 0 ? cards : mockStockCards
  const liveMovements = movements.length > 0 ? movements : mockStockMovements

  // Compute dashboard KPIs directly from live stock cards so stats always
  // reflect the real database instead of the static mock dashboard object.
  const liveDashboard = {
    totalItems: liveCards.length,
    totalInventoryValue: liveCards.reduce((s, c) => s + c.balance * 10, 0), // rough estimate
    statusBreakdown: {
      healthy: liveCards.filter((c) => c.inventoryStatus === "healthy").length,
      low: liveCards.filter((c) => c.inventoryStatus === "low").length,
      outOfStock: liveCards.filter((c) => c.inventoryStatus === "out_of_stock").length,
      overStock: liveCards.filter((c) => c.inventoryStatus === "over_stock").length,
    },
    totalIncoming: liveCards.reduce((s, c) => s + c.incomingStock, 0),
    totalReserved: liveCards.reduce((s, c) => s + c.reservedStock, 0),
    totalAvailable: liveCards.reduce((s, c) => s + c.available, 0),
  }

  // Export the current live catalog to a formatted .xlsx workbook.
  const handleExport = () => {
    if (liveCards.length === 0) {
      toast.error("ไม่มีข้อมูลให้ส่งออก")
      return
    }
    try {
      exportStockToExcel(liveCards)
      toast.success(`ส่งออก ${liveCards.length} รายการเป็น Excel แล้ว`)
    } catch {
      toast.error("ส่งออกไม่สำเร็จ")
    }
  }

  // Open the print-ready stock report in a new tab (print / save as PDF there).
  const handlePrintReport = () => {
    window.open("/stock/report/print", "_blank", "noopener,noreferrer")
  }

  // Tab definitions with live badge counts.
  const tabs: { key: StockTab; label: string; icon: typeof BarChart3; badge?: number; badgeColor?: string }[] = [
    { key: "overview", label: "Overview", icon: Package },
    { key: "simulator", label: "Simulator", icon: FlaskConical },
    {
      key: "reserved",
      label: "Reserved",
      icon: Lock,
      badge: liveDashboard.totalReserved > 0 ? undefined : undefined, // driven by workflow context badge below
      badgeColor: "bg-amber-500",
    },
    { key: "incoming", label: "Incoming", icon: Truck, badge: liveCards.filter((c) => c.incomingStock > 0).length, badgeColor: "bg-blue-500" },
    { key: "receive", label: "Receive", icon: PackageOpen, badgeColor: "bg-emerald-500" },
    { key: "movements", label: "Movements", icon: ClipboardList },
    {
      key: "alerts",
      label: "Alerts",
      icon: AlertTriangle,
      badge: liveDashboard.statusBreakdown.low + liveDashboard.statusBreakdown.outOfStock,
      badgeColor: "bg-destructive",
    },
    { key: "guide", label: "Guide", icon: BookOpen },
  ]

  return (
    <StockSimulationProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">Inventory Hub</h1>
              <p className="text-[11px] text-muted-foreground">
                Unified Stock Management &bull; Overview &bull; Simulator &bull; Reserve &bull; Movements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-[12px]"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" /> Import Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-[12px]"
              onClick={handleExport}
            >
              <Download className="h-3.5 w-3.5" /> Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-[12px]"
              onClick={handlePrintReport}
            >
              <Printer className="h-3.5 w-3.5" /> Print Report
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-[12px]"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add New Stock
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-5">
            {/* KPI Cards */}
            <StockKpiCards data={liveDashboard} />

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
                    <span
                      className={`ml-1 rounded-full px-1.5 py-px text-[10px] font-bold text-white ${
                        activeTab === tab.key ? "bg-white/30 text-primary-foreground" : tab.badgeColor
                      }`}
                    >
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
                  <div>
                    <strong className="font-semibold">Available = Physical - Reserved + Incoming</strong> &mdash; The
                    actual quantity ready for use / sales commitment
                  </div>
                </div>
                <StockOverviewTable data={liveCards} />
                {cardsLoading && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">Syncing with database…</p>
                )}
              </div>
            )}

            {activeTab === "simulator" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockSimulatorTab />
              </div>
            )}

            {activeTab === "reserved" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockReservedTab />
              </div>
            )}

            {activeTab === "incoming" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockIncomingTab />
              </div>
            )}

            {activeTab === "receive" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockReceiveTab />
              </div>
            )}

            {activeTab === "movements" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockMovementsTab data={liveMovements} />
                {movementsLoading && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">Syncing with database…</p>
                )}
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockAlertsTab data={mockAlerts} />
              </div>
            )}

            {activeTab === "guide" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                <StockGuideTab />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddStockDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categories={Array.from(new Set(liveCards.map((c) => c.category).filter(Boolean)))}
        units={Array.from(new Set(liveCards.map((c) => c.unit).filter(Boolean)))}
        onCreated={() => mutateCards()}
      />
      <ImportStockDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() => mutateCards()}
      />
    </StockSimulationProvider>
  )
}
