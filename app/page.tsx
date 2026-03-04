import { DashboardKpiRow } from "@/components/dashboard/dashboard-kpi-row"
import { DashboardRevenueChart } from "@/components/dashboard/dashboard-revenue-chart"
import { DashboardProductionPipeline } from "@/components/dashboard/dashboard-production-pipeline"
import { DashboardStockHealth } from "@/components/dashboard/dashboard-stock-health"
import { DashboardFdaWarnings } from "@/components/dashboard/dashboard-fda-warnings"
import { DashboardActivityFeed } from "@/components/dashboard/dashboard-activity-feed"
import { DashboardUpcomingDeadlines } from "@/components/dashboard/dashboard-upcoming-deadlines"
import { DashboardQuickLinks } from "@/components/dashboard/dashboard-quick-links"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">
      {/* Header */}
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

      {/* KPI Row */}
      <DashboardKpiRow />

      {/* Row 2: Revenue Chart + Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DashboardRevenueChart />
        </div>
        <div className="lg:col-span-2">
          <DashboardStockHealth />
        </div>
      </div>

      {/* Row 3: Production Pipeline + FDA Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DashboardProductionPipeline />
        </div>
        <div className="lg:col-span-2">
          <DashboardFdaWarnings />
        </div>
      </div>

      {/* Row 4: Activity Feed + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <DashboardActivityFeed />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <DashboardUpcomingDeadlines />
          <DashboardQuickLinks />
        </div>
      </div>
    </div>
  )
}
