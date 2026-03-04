"use client"

import { ClipboardList, Info, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useStockSimulation } from "@/lib/stock-simulation-context"
import { getStockItem } from "@/lib/stock-simulation-store"

export function StockReceiveTab() {
  const { state } = useStockSimulation()

  return (
    <div className="flex flex-col gap-4">
      {/* Hint */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#e0f7f5] p-4 text-[12px] text-teal-800">
        <ClipboardList className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong className="font-semibold">Stock Receive Records (SRR)</strong> -- Records of actual stock received into warehouse from the Incoming tab.<br />
          Each SRR references back to the SIN (Incoming) document.
        </div>
      </div>

      {/* Main Panel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-foreground">Receive Records</h3>
          <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            {state.receiveRecords.length} records
          </Badge>
        </div>

        {state.receiveRecords.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">No receive records yet -- go to Incoming tab to receive stock</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {state.receiveRecords.map((rec) => (
              <div
                key={rec.srrNo}
                className={`overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${rec.hasExcess ? "border-l-4 border-l-teal-500" : ""}`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">{rec.srrNo}</span>
                      {rec.isPartial ? (
                        <Badge variant="outline" className="rounded-lg border-0 bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">Partial</Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">Complete</Badge>
                      )}
                      {rec.hasExcess && (
                        <Badge variant="outline" className="rounded-lg border-0 bg-teal-100 px-2 py-0.5 text-[9px] font-semibold text-teal-700">
                          Excess +{rec.totalExcess}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>From:</span>
                      <span className="rounded-md bg-violet-100 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700">{rec.sinRef}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{rec.supplier}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[11px] text-muted-foreground">{rec.receivedAt}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{rec.items.length} item{rec.items.length > 1 ? "s" : ""}</div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 px-5 pb-4">
                  {rec.items.map((it, ii) => {
                    const si = getStockItem(state.stock, it.itemId)
                    const hasEx = it.excessQty > 0
                    return (
                      <div
                        key={ii}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-[12px] ${hasEx ? "border border-teal-200 bg-teal-50" : "bg-secondary"}`}
                      >
                        <span className="font-medium">{it.name}</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-600">+{it.qty} {si?.unit || ""}</span>
                          {hasEx && (
                            <div className="text-[9px] font-semibold text-teal-600">excess +{it.excessQty}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
