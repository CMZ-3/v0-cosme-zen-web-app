"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import {
  PackageCheck,
  Plus,
  Download,
  FileText,
  BarChart3,
  CalendarDays,
  Clock,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeliveryKpiCards } from "@/components/delivery/delivery-kpi-cards"
import { DeliveryTable } from "@/components/delivery/delivery-table"
import { CreateDeliveryDialog } from "@/components/delivery/create-delivery-dialog"
import type { DeliveryKPISummary } from "@/lib/delivery-types"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type PageTab = "list" | "board" | "calendar" | "pending" | "analytics"

const pageTabs: { value: PageTab; label: string; icon: typeof FileText; count?: number; countColor?: string }[] = [
  { value: "list", label: "DO List", icon: FileText, count: 47 },
  { value: "board", label: "Board View", icon: BarChart3 },
  { value: "calendar", label: "Delivery Calendar", icon: CalendarDays },
  { value: "pending", label: "Pending Close", icon: Clock, count: 2, countColor: "bg-amber-100 text-amber-700" },
  { value: "analytics", label: "Analytics", icon: TrendingUp },
]

const EMPTY_KPI: DeliveryKPISummary = { total: 0, preparing: 0, picking: 0, shipped: 0, delivered: 0, completed: 0, pendingClose: 0 }

export default function DeliveryPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<PageTab>("list")
  const [kpiFilter, setKpiFilter] = useState<string>("total")

  const { data, mutate, isLoading } = useSWR("/api/delivery-orders", fetcher, { refreshInterval: 30000 })
  const orders = data?.orders ?? []
  const kpi: DeliveryKPISummary = data?.kpi ?? EMPTY_KPI

  return (
    <div className="flex flex-col gap-0 overflow-y-auto h-screen">
      {/* Module Header */}
      <div className="px-8 pt-5 pb-0 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-teal-500 to-teal-600 shadow-[0_4px_12px_rgba(20,184,166,0.25)]">
              <PackageCheck className="h-[22px] w-[22px] text-white" />
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Delivery Order</h1>
              <p className="text-[12px] text-muted-foreground">
                {"Manage shipments \u2022 Track Lot/Batch \u2022 Close Job \u2022 Print DO"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-[10px] text-[12px] font-semibold border-border"
            onClick={() => mutate()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="gap-1.5 rounded-[10px] bg-teal-500 hover:bg-teal-600 text-white text-[12px] font-bold shadow-[0_2px_8px_rgba(20,184,166,0.25)]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {"Create DO"}
          </Button>
          </div>
        </div>

        {/* Module Nav Bar */}
        <div className="flex items-center gap-1 rounded-[14px] border border-border bg-card p-1 shadow-sm">
          {pageTabs.map((tab, i) => {
            const isActive = activeTab === tab.value
            return (
              <div key={tab.value} className="flex items-center">
                {i === 3 && <div className="mx-1 h-6 w-px bg-border" />}
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-4 py-2 text-[13px] font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(76,139,245,0.25)]"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.count != null && (
                    <span className={cn(
                      "rounded-lg px-1.5 py-px text-[10px] font-bold",
                      isActive ? "bg-white/25" : tab.countColor || "bg-black/[0.06]"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div className="flex flex-col gap-3 px-8 pt-4 pb-8">
          <DeliveryKpiCards kpi={kpi} activeFilter={kpiFilter} onFilterClick={setKpiFilter} />
          <DeliveryTable
            data={orders}
            onRowClick={(id) => router.push(`/delivery/${id}`)}
            onStatusChange={() => mutate()}
          />
        </div>
      )}

      {activeTab === "board" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 mx-8 mt-4">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">Kanban Board View</p>
          <p className="text-[11px] text-muted-foreground">Drag-and-drop delivery status management coming soon</p>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 mx-8 mt-4">
          <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">Delivery Calendar</p>
          <p className="text-[11px] text-muted-foreground">Calendar view of scheduled deliveries coming soon</p>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 mx-8 mt-4">
          <Clock className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">Pending Job Close</p>
          <p className="text-[11px] text-muted-foreground">Orders delivered but awaiting job closure</p>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 mx-8 mt-4">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">Delivery Analytics</p>
          <p className="text-[11px] text-muted-foreground">Performance metrics, on-time rates & monthly trends coming soon</p>
        </div>
      )}

      <CreateDeliveryDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => mutate()} />
    </div>
  )
}
