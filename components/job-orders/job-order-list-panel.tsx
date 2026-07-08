"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { JobOrder, JOStatus } from "@/lib/job-order-types"
import { JO_STATUS_MAP, PRIORITY_MAP } from "@/lib/job-order-types"
import { CreateJobOrderDialog } from "./create-job-order-dialog"

type FilterTab = "all" | "in_production" | "qc" | "delivered"
const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_production", label: "Producing" },
  { value: "qc", label: "QC" },
  { value: "delivered", label: "Done" },
]

interface JobOrderListPanelProps {
  jobOrders: JobOrder[]
  selectedId: string
  onSelect: (id: string) => void
  onCreated?: () => void
}

export function JobOrderListPanel({ jobOrders, selectedId, onSelect, onCreated }: JobOrderListPanelProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    let list = jobOrders
    if (filter !== "all") {
      list = list.filter((jo) => jo.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (jo) =>
          jo.orderNumber.toLowerCase().includes(q) ||
          jo.customerName.toLowerCase().includes(q) ||
          jo.productName.toLowerCase().includes(q)
      )
    }
    return list
  }, [jobOrders, filter, search])

  return (
    <div className="flex w-[340px] min-w-[340px] flex-col border-r border-border bg-secondary/50 h-screen">
      <CreateJobOrderDialog open={showCreate} onOpenChange={setShowCreate} onCreated={onCreated} />
      {/* Header */}
      <div className="border-b border-border bg-card/60 px-5 py-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-foreground">Job Orders</h2>
          <Button size="sm" className="h-7 gap-1 rounded-lg text-[11px]" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> New
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search Order ID, customer, product..."
            className="h-9 rounded-full border-border bg-card pl-9 text-[13px] focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 rounded-[10px] border border-border bg-secondary/50 p-0.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all",
                filter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List body */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filtered.map((jo) => {
          const statusInfo = JO_STATUS_MAP[jo.status]
          const prioInfo = PRIORITY_MAP[jo.priority]
          const progress = getProgress(jo)
          const isActive = jo.id === selectedId

          return (
            <button
              key={jo.id}
              onClick={() => onSelect(jo.id)}
              className={cn(
                "relative mb-1 w-full rounded-xl border border-transparent p-3.5 text-left transition-all",
                isActive
                  ? "border-primary bg-card shadow-sm border-l-4 border-l-primary"
                  : "hover:border-border hover:bg-card"
              )}
            >
              {/* Priority badge */}
              {jo.priority !== "low" && (
                <span
                  className="absolute top-3.5 right-4 rounded-md px-1.5 py-px text-[9px] font-bold"
                  style={{ background: prioInfo.bg, color: prioInfo.color }}
                >
                  {prioInfo.label}
                </span>
              )}

              <div className="font-mono text-xs font-bold text-primary">#{jo.orderNumber}</div>
              <div className="mt-0.5 text-sm font-bold text-foreground">{jo.productName}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {jo.customerName} &mdash; {jo.brandName} &bull; {jo.quantity.toLocaleString()} units
              </div>

              {/* Meta row */}
              <div className="mt-2 flex items-center justify-between">
                <span
                  className="rounded-full border px-2 py-px text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: statusInfo.bg, color: statusInfo.color, borderColor: statusInfo.border }}
                >
                  {statusInfo.label}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Due: {formatShortDate(jo.dueDate)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-secondary">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: statusInfo.color,
                  }}
                />
              </div>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-xs text-muted-foreground">
            No job orders found
          </div>
        )}
      </div>
    </div>
  )
}

function getProgress(jo: JobOrder): number {
  const doneSteps = jo.productionSteps.filter((s) => s.status === "done").length
  const total = jo.productionSteps.length
  if (total === 0) return 0
  // For the active step, add partial progress
  const activeStep = jo.productionSteps.find((s) => s.status === "active")
  let partial = 0
  if (activeStep && activeStep.targetQty > 0) {
    partial = (activeStep.completedQty / activeStep.targetQty) / total
  }
  return Math.min(Math.round(((doneSteps / total) + partial) * 100), 100)
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]}`
}
