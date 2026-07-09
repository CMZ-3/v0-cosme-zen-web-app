"use client"

import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link2, CheckCircle, AlertTriangle, ShoppingCart, Loader2, PackageX } from "lucide-react"
import type { JobOrder } from "@/lib/job-order-types"
import type { StockReservation } from "@/lib/stock-types"

interface Props {
  jobOrder: JobOrder
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function MaterialsTab({ jobOrder }: Props) {
  const { data, isLoading } = useSWR<{ reservations: StockReservation[] }>(
    `/api/stock/reservations?jobOrderId=${jobOrder.id}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const reservations = data?.reservations ?? []
  const activeRes = reservations.filter((r) => r.status === "active")
  const hasReservation = activeRes.length > 0

  // Build a lookup: stockCardId → reservedQuantity for enriching the table
  const reservedByCard = Object.fromEntries(
    activeRes.map((r) => [r.stockCardId, r.reservedQuantity]),
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Reservation Banner */}
      {isLoading ? (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-3.5">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">Loading reservation status...</span>
        </div>
      ) : hasReservation ? (
        <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-primary/15 bg-primary/5 p-3.5">
          <Link2 className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <div className="text-[13px] font-bold text-primary">
              {activeRes.length} Active Reservation{activeRes.length > 1 ? "s" : ""} &mdash;{" "}
              <span className="font-mono">{jobOrder.orderNumber}</span>
            </div>
            <div className="text-[11px] text-primary/80">
              Raw materials reserved &amp; lot-allocated (FEFO) &mdash;{" "}
              {activeRes.reduce((s, r) => s + r.reservedQuantity, 0).toLocaleString()} units total locked
            </div>
          </div>
          <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-bold text-[#15803d]">
            Locked
          </span>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-border bg-secondary/40 p-3.5">
          <PackageX className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-muted-foreground">No active reservations</div>
            <div className="text-[11px] text-muted-foreground/70">
              Materials have not been reserved for this job order yet
            </div>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">
            Stock Check &mdash; {jobOrder.quantity.toLocaleString()} units &times; {jobOrder.unitSize}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Raw Material</th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Required</th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Lot (FEFO)</th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Reserved</th>
                </tr>
              </thead>
              <tbody>
                {jobOrder.materials.map((mat) => {
                  // Enrich reservation qty from live data if available
                  const liveReserved = reservedByCard[mat.stockCardId ?? ""] ?? mat.reservedQty
                  return (
                    <tr key={mat.id} className="border-b border-border last:border-b-0 hover:bg-primary/[0.02]">
                      <td className="px-4 py-3 font-bold text-foreground">{mat.name}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {mat.requiredQty.toLocaleString()} {mat.requiredUnit}
                      </td>
                      <td className="px-4 py-3">
                        {mat.lot ? (
                          <span className="rounded bg-[#ecfdf5] px-1.5 py-0.5 font-mono text-[10px] text-[#10b981]">
                            {mat.lot}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {mat.stockQty.toLocaleString()} {mat.requiredUnit}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-bold",
                            mat.status === "sufficient" && "text-[#10b981]",
                            mat.status === "ordered" && "text-[#10b981]",
                            mat.status === "shortage" && "text-destructive",
                          )}
                        >
                          {mat.status === "shortage" ? (
                            <><AlertTriangle className="h-3 w-3" /> Shortage</>
                          ) : mat.status === "ordered" ? (
                            <><ShoppingCart className="h-3 w-3" /> Ordered</>
                          ) : (
                            <><CheckCircle className="h-3 w-3" /> Sufficient</>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {liveReserved > 0 ? (
                          <span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#10b981]">
                            Locked {liveReserved.toLocaleString()} {mat.requiredUnit}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {jobOrder.materials.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No materials data</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
