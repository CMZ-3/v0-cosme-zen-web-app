"use client"

import { useState } from "react"
import { ArrowLeftRight, Plus, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StockMovementsTab } from "./stock-movements-tab"
import { CreateMovementDialog } from "./create-movement-dialog"
import { useStockMovements, useStockCards } from "@/lib/hooks/use-stock"
import { exportMovementsToExcel } from "@/lib/stock-export"
import { toast } from "sonner"

export function StockMovementsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { movements, isLoading, mutate } = useStockMovements()
  const { cards, mutate: mutateCards } = useStockCards()

  // Quick stats derived from live movements.
  const total = movements.length
  const approved = movements.filter((m) => m.status === "approved").length
  const pending = movements.filter((m) => m.status === "pending").length
  const draft = movements.filter((m) => m.status === "draft").length

  function handleExport() {
    if (movements.length === 0) {
      toast.error("No movements to export")
      return
    }
    exportMovementsToExcel(movements)
    toast.success(`Exported ${movements.length} movements to Excel`)
  }

  function handleCreated() {
    // Refresh both the ledger and card balances (movements mutate stock).
    mutate()
    mutateCards()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-200">
            <ArrowLeftRight className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Stock Movements</h1>
            <p className="text-[11px] text-muted-foreground">Track all inventory transactions &bull; Buy In &bull; Use Out &bull; Adjust &bull; Transfer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="h-9 gap-1.5 rounded-xl text-[12px] bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Movement
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          {/* Mini KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#e0f7f5] p-4">
              <span className="text-[11px] font-medium text-muted-foreground">Total</span>
              <div className="mt-1 text-2xl font-extrabold text-foreground">{total}</div>
            </div>
            <div className="rounded-2xl bg-[#e0f2fe] p-4">
              <span className="text-[11px] font-medium text-muted-foreground">Approved</span>
              <div className="mt-1 text-2xl font-extrabold text-emerald-700">{approved}</div>
            </div>
            <div className="rounded-2xl bg-[#fef3c7] p-4">
              <span className="text-[11px] font-medium text-muted-foreground">Pending</span>
              <div className="mt-1 text-2xl font-extrabold text-amber-700">{pending}</div>
            </div>
            <div className="rounded-2xl bg-[#e8e0ff] p-4">
              <span className="text-[11px] font-medium text-muted-foreground">Draft</span>
              <div className="mt-1 text-2xl font-extrabold text-violet-700">{draft}</div>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading movements...
            </div>
          ) : (
            <StockMovementsTab data={movements} />
          )}
        </div>
      </div>

      <CreateMovementDialog open={showCreate} onOpenChange={setShowCreate} cards={cards} onCreated={handleCreated} />
    </div>
  )
}
