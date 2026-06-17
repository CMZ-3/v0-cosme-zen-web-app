"use client"

import { useState } from "react"
import { DashboardKpiRow } from "@/components/dashboard/dashboard-kpi-row"
import { DashboardRevenueChart } from "@/components/dashboard/dashboard-revenue-chart"
import { DashboardProductionPipeline } from "@/components/dashboard/dashboard-production-pipeline"
import { DashboardStockHealth } from "@/components/dashboard/dashboard-stock-health"
import { DashboardFdaWarnings } from "@/components/dashboard/dashboard-fda-warnings"
import { DashboardActivityFeed } from "@/components/dashboard/dashboard-activity-feed"
import { DashboardUpcomingDeadlines } from "@/components/dashboard/dashboard-upcoming-deadlines"
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links"
import { DashboardV2 } from "@/components/dashboard/dashboard-v2"
import { LayoutDashboard, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [tab, setTab] = useState<"v1" | "v2">("v1")

  return (
    <div>
      {/* Tab switcher -- always visible at the top */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-1 px-6 py-2">
          <button
            type="button"
            onClick={() => setTab("v1")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-all",
              tab === "v1"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Classic
          </button>
          <button
            type="button"
            onClick={() => setTab("v2")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-all",
              tab === "v2"
                ? "bg-violet-100 text-violet-700"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            v2 Preview
          </button>
        </div>
      </div>

      {/* V1 -- Classic Dashboard */}
      {tab === "v1" && (
        <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-foreground text-balance">Dashboard</h1>
              <p className="text-[12px] text-muted-foreground mt-0.5">{"CosmeZen Factory Overview"}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium">
                {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>

          <DashboardKpiRow />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><DashboardRevenueChart /></div>
            <div className="lg:col-span-2"><DashboardStockHealth /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><DashboardProductionPipeline /></div>
            <div className="lg:col-span-2"><DashboardFdaWarnings /></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3"><DashboardActivityFeed /></div>
            <div className="lg:col-span-2 flex flex-col gap-6">
              <DashboardUpcomingDeadlines />
              <DashboardQuickLinks />
            </div>
          </div>
        </div>
      )}

      {/* V2 -- New design */}
      {tab === "v2" && <DashboardV2 />}
    </div>
  )
}
