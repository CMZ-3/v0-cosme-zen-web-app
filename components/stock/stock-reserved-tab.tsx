"use client"

import { useState, useMemo } from "react"
import { AlertTriangle, Info, ChevronDown, CheckCircle2, XCircle, ClipboardList, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useStockSimulation } from "@/lib/stock-simulation-context"
import { getStockItem, getPendingPOQty } from "@/lib/stock-simulation-store"

export function StockReservedTab() {
  const { state, generatePOForItem } = useStockSimulation()
  const [expandedRes, setExpandedRes] = useState<Set<string>>(new Set())
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderItem, setOrderItem] = useState<{ itemId: string; shortageQty: number } | null>(null)
  const [orderQty, setOrderQty] = useState(0)

  const allRes = state.savedReservations

  const counts = useMemo(() => {
    const drafts = allRes.filter((r) => r.status === "DRAFT").length
    const linked = allRes.filter((r) => r.status === "LINKED").length
    const readyRes = allRes.filter((r) => {
      if (r.status !== "LINKED") return false
      return r.batchData.requirements.every((req) => {
        const si = getStockItem(state.stock, req.id)
        return si ? si.balance >= req.qty : false
      })
    }).length
    return { drafts, linked, readyRes }
  }, [allRes, state.stock])

  // Shortage action center data
  const shortageEntries = useMemo(() => {
    const shortageMap: Record<string, { itemId: string; totalReserved: number; jobs: string[] }> = {}

    allRes.forEach((r) => {
      r.batchData.requirements.forEach((req) => {
        if (!shortageMap[req.id]) shortageMap[req.id] = { itemId: req.id, totalReserved: 0, jobs: [] }
        shortageMap[req.id].totalReserved += req.qty
        if (r.linkedJo) shortageMap[req.id].jobs.push(r.linkedJo)
        else shortageMap[req.id].jobs.push("(Draft)")
      })
    })

    return Object.values(shortageMap)
      .map((data) => {
        const si = getStockItem(state.stock, data.itemId)
        if (!si || si.balance >= data.totalReserved) return null
        const shortage = data.totalReserved - si.balance
        const pendingPO = getPendingPOQty(state.purchaseOrders, data.itemId)
        const netAfterPO = si.balance + pendingPO - data.totalReserved
        return { ...data, si, shortage, pendingPO, netAfterPO }
      })
      .filter(Boolean) as Array<{
        itemId: string
        totalReserved: number
        jobs: string[]
        si: NonNullable<ReturnType<typeof getStockItem>>
        shortage: number
        pendingPO: number
        netAfterPO: number
      }>
  }, [allRes, state.stock, state.purchaseOrders])

  // Job reservation data
  const jobGroups = useMemo(() => {
    const groups: Record<string, typeof state.jobReservations> = {}
    state.jobReservations.forEach((j) => {
      if (!groups[j.jobNo]) groups[j.jobNo] = []
      groups[j.jobNo].push(j)
    })
    return groups
  }, [state.jobReservations])

  const readyJobCount = state.jobReservations.filter((j) => j.status === "READY").length
  const stalledJobCount = state.jobReservations.filter((j) => j.status === "WAITING").length

  function toggleExpand(id: string) {
    setExpandedRes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openOrderModal(itemId: string, shortageQty: number) {
    const si = getStockItem(state.stock, itemId)
    if (!si) return
    setOrderItem({ itemId, shortageQty })
    setOrderQty(Math.ceil(shortageQty * 1.2))
    setOrderModalOpen(true)
  }

  function handleConfirmOrder() {
    if (!orderItem) return
    generatePOForItem(orderItem.itemId, orderItem.shortageQty, orderQty)
    setOrderModalOpen(false)
    setOrderItem(null)
  }

  const orderItemData = orderItem ? getStockItem(state.stock, orderItem.itemId) : null
  const extraQty = orderItem ? Math.max(0, orderQty - orderItem.shortageQty) : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Hint */}
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#fef3c7] p-4 text-[12px] text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>Reservation & Job Order Tracking</strong><br />
          <span className="font-bold text-amber-600">Draft</span> = Reserved, waiting to Link with Job Order &rarr;{" "}
          <span className="font-bold text-blue-600">Linked</span> = Connected to JO, auto-check materials &rarr;{" "}
          <span className="font-bold text-red-600">Waiting</span> = Material shortage, need to order &rarr;{" "}
          <span className="font-bold text-emerald-600">Ready</span> = All materials available, ready to produce
        </div>
      </div>

      {/* Section 1: Reservation Cards with Material Status */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-foreground">All Reservations</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-lg border-0 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{counts.drafts} Draft</Badge>
            <Badge variant="outline" className="rounded-lg border-0 bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{counts.linked} Linked</Badge>
            <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{counts.readyRes} Ready</Badge>
          </div>
        </div>
        <div className="max-h-[500px] overflow-y-auto p-4">
          {allRes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-10 text-center text-sm text-muted-foreground">
              No reservations yet -- go to Simulator tab to create reservations
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allRes.map((r) => {
                const isDraft = r.status === "DRAFT"
                const isLinked = r.status === "LINKED"
                const isExpanded = expandedRes.has(r.id)

                let okItems = 0
                const shortageItems: { name: string; shortage: number }[] = []
                const totalItems = r.batchData.requirements.length

                r.batchData.requirements.forEach((req) => {
                  const si = getStockItem(state.stock, req.id)
                  const available = si ? si.balance : 0
                  if (available >= req.qty) okItems++
                  else shortageItems.push({ name: si?.name || req.id, shortage: req.qty - available })
                })

                const allOk = okItems === totalItems
                const overallPct = totalItems > 0 ? Math.round((okItems / totalItems) * 100) : 0
                const borderColor = isDraft ? "border-l-amber-500" : allOk ? "border-l-emerald-500" : "border-l-red-500"

                return (
                  <div key={r.id} className={`overflow-hidden rounded-2xl border border-border ${borderColor} border-l-4`}>
                    {/* Header */}
                    <div
                      className="flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors hover:bg-primary/[0.02]"
                      onClick={() => toggleExpand(r.id)}
                    >
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-violet-100 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-700">{r.id}</span>
                          {r.ssiRef && <span className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-violet-500">{r.ssiRef}</span>}
                          {isDraft && <Badge variant="outline" className="rounded-lg border-0 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Draft</Badge>}
                          {isLinked && <Badge variant="outline" className="rounded-lg border-0 bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">{r.linkedJo}</Badge>}
                          {isLinked && allOk && <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">ALL READY</Badge>}
                          {isLinked && !allOk && (
                            <Badge variant="outline" className="rounded-lg border-0 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Shortage {shortageItems.length} items
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm font-bold text-foreground">{r.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="mr-1 rounded-md border-0 bg-teal-100 px-1.5 py-0 text-[10px] font-semibold text-teal-700">{r.batchData.batchSize} kg</Badge>
                          {r.date} -- {totalItems} ingredients
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${overallPct}%`,
                                background: allOk ? "var(--color-emerald-500)" : "var(--color-amber-500)",
                              }}
                            />
                          </div>
                          <span className={`font-mono text-[12px] font-bold ${allOk ? "text-emerald-600" : "text-amber-600"}`}>{okItems}/{totalItems}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>

                    {/* Material Detail Body */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {r.batchData.requirements.map((req, ri) => {
                          const si = getStockItem(state.stock, req.id)
                          const available = si ? si.balance : 0
                          const isOk = available >= req.qty
                          const shortage = isOk ? 0 : req.qty - available
                          const pendingQty = getPendingPOQty(state.purchaseOrders, req.id)

                          return (
                            <div key={ri} className={`flex items-center gap-3 border-b border-border px-5 py-2.5 text-[12px] last:border-b-0 ${!isOk ? "bg-red-50/30" : ""}`}>
                              <div className="min-w-0 flex-1 font-medium">
                                {isOk ? <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-500" /> : <XCircle className="mr-1 inline h-3 w-3 text-red-500" />}
                                {si?.name || req.id}
                                <span className="ml-1 text-[10px] text-muted-foreground">{si?.code}</span>
                              </div>
                              <div className="w-20 text-right font-mono text-[11px]">
                                Need: <strong>{req.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                              </div>
                              <div className={`w-20 text-right font-mono text-[11px] ${isOk ? "text-emerald-600" : "text-destructive"}`}>
                                Stock: {available.toLocaleString()}
                              </div>
                              <div className="w-20 text-center">
                                {isOk ? (
                                  <Badge variant="outline" className="rounded-md border-0 bg-emerald-100 px-1.5 py-0 text-[9px] font-semibold text-emerald-700">OK</Badge>
                                ) : (
                                  <Badge variant="outline" className="rounded-md border-0 bg-red-100 px-1.5 py-0 text-[9px] font-semibold text-red-700">
                                    -{shortage.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                  </Badge>
                                )}
                              </div>
                              {!isOk && pendingQty > 0 && (
                                <span className="text-[9px] font-semibold text-blue-600">PO: +{pendingQty}</span>
                              )}
                            </div>
                          )
                        })}

                        {/* Footer with shortage summary */}
                        {shortageItems.length > 0 && (
                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary px-5 py-2.5 text-[11px]">
                            <div className="text-destructive">
                              <strong>Shortage:</strong> {shortageItems.map((s) => `${s.name} (-${s.shortage.toLocaleString(undefined, { maximumFractionDigits: 2 })})`).join(", ")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Shortage Action Center */}
      {shortageEntries.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-red-200 bg-red-50 px-5 py-3">
            <h3 className="text-sm font-bold text-destructive">Shortage Items -- Need to Order</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In Stock</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-destructive">Total Reserved</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-destructive">Shortage</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending PO</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Net After PO</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {shortageEntries.map((e) => {
                  const stillShort = e.netAfterPO < 0
                  return (
                    <tr key={e.itemId} className={`border-b border-border ${stillShort ? "bg-red-50/30" : "bg-blue-50/30"}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{e.si.name}</div>
                        <div className="text-[10px] text-muted-foreground">{e.si.code} -- Used by: {[...new Set(e.jobs)].join(", ")}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs">{e.si.balance.toLocaleString()} {e.si.unit}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs font-bold text-destructive">{e.totalReserved.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center font-mono text-xs font-bold text-destructive">-{e.shortage.toLocaleString(undefined, { maximumFractionDigits: 2 })} {e.si.unit}</td>
                      <td className="px-4 py-3 text-center">
                        {e.pendingPO > 0 ? (
                          <Badge variant="outline" className="rounded-lg border-0 bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">+{e.pendingPO} incoming</Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${stillShort ? "text-destructive" : "text-emerald-600"}`}>
                        {e.netAfterPO > 0 ? "+" : ""}{e.netAfterPO.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        <div className="text-[9px]">{stillShort ? "Still short!" : "PO will cover"}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {stillShort ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 rounded-lg text-[10px] text-destructive hover:bg-destructive hover:text-white"
                            onClick={() => openOrderModal(e.itemId, Math.abs(e.netAfterPO))}
                          >
                            <ShoppingCart className="h-3 w-3" /> Order +{Math.abs(e.netAfterPO).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">PO en route</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 3: Material Allocation per Job */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-foreground">Material Allocation per Job</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{readyJobCount} Ready</Badge>
            <Badge variant="outline" className="rounded-lg border-0 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">{stalledJobCount} Stalled</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-secondary">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job No</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Needed</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allocated</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fill %</th>
                <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.jobReservations.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No job reservations -- Link reservations to Job Orders in Simulator tab</td></tr>
              ) : (
                Object.entries(jobGroups).map(([jobNo, items]) => {
                  const allReady = items.every((j) => j.status === "READY")
                  return items.map((j, idx) => {
                    const pct = j.qtyNeeded > 0 ? Math.round((j.qtyAllocated / j.qtyNeeded) * 100) : 0
                    const isReady = j.status === "READY"
                    const shortage = j.qtyNeeded - j.qtyAllocated
                    const si = getStockItem(state.stock, j.itemCode)

                    return (
                      <tr key={`${jobNo}-${idx}`} className={`border-b border-border ${!isReady ? "bg-red-50/30" : ""}`}>
                        {idx === 0 && (
                          <td rowSpan={items.length} className={`border-r-4 px-4 py-3 align-top font-bold ${allReady ? "border-r-emerald-500" : "border-r-red-500"}`}>
                            {jobNo}
                            <div className="mt-1">
                              <Badge variant="outline" className={`rounded-lg border-0 px-2 py-0.5 text-[9px] font-semibold ${allReady ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                {allReady ? "ALL READY" : "WAITING"}
                              </Badge>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          {j.itemName}
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full rounded-full ${isReady ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{j.qtyNeeded.toLocaleString(undefined, { maximumFractionDigits: 2 })} {si?.unit || ""}</td>
                        <td className={`px-4 py-3 text-center font-mono text-xs ${isReady ? "text-emerald-600" : "text-destructive"}`}>
                          {j.qtyAllocated.toLocaleString(undefined, { maximumFractionDigits: 2 })} / {j.qtyNeeded.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${isReady ? "text-emerald-600" : "text-amber-600"}`}>
                          {pct}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isReady ? (
                            <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Ready</Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg border-0 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              Short -{shortage.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Order Materials</DialogTitle>
                <p className="text-[12px] text-muted-foreground">Enter order quantity -- you can over-order as a buffer</p>
              </div>
            </div>
          </DialogHeader>

          {orderItemData && orderItem && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary p-3">
                <div className="text-sm font-bold">{orderItemData.name}</div>
                <div className="text-[11px] text-muted-foreground">{orderItemData.code} -- {orderItemData.category}</div>
                <div className="mt-2 flex gap-4 text-[12px]">
                  <span>Shortage: <strong className="text-destructive">{orderItem.shortageQty.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
                  <span>Supplier: <strong>{orderItemData.supplier}</strong></span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Order Quantity (can over-order as buffer)</label>
                <Input
                  type="number"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="h-10 rounded-xl text-center font-mono text-base font-bold"
                  min={1}
                />
              </div>

              {/* Breakdown bar */}
              <div>
                <div className="flex h-5 overflow-hidden rounded-md bg-secondary">
                  {orderQty > 0 && (
                    <>
                      <div
                        className="flex items-center justify-center text-[9px] font-bold text-white"
                        style={{
                          width: `${Math.min(100, (Math.min(orderItem.shortageQty, orderQty) / orderQty) * 100)}%`,
                          background: "#ef4444",
                        }}
                      >
                        {Math.min(orderItem.shortageQty, orderQty).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                      </div>
                      {extraQty > 0 && (
                        <div
                          className="flex items-center justify-center text-[9px] font-bold text-white"
                          style={{
                            width: `${(extraQty / orderQty) * 100}%`,
                            background: "#5ea58c",
                          }}
                        >
                          +{extraQty.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-1 flex gap-4 text-[11px]">
                  <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> Shortage: {Math.min(orderItem.shortageQty, orderQty).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  {extraQty > 0 ? (
                    <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-teal-600" /> Buffer: +{extraQty.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  ) : (
                    <span className="text-muted-foreground">No buffer</span>
                  )}
                </div>
              </div>

              {/* Quick buttons */}
              <div className="flex gap-2">
                {[
                  { label: "Exact", mult: 1 },
                  { label: "+20%", mult: 1.2 },
                  { label: "+50%", mult: 1.5 },
                  { label: "x2", mult: 2 },
                ].map((opt) => (
                  <Button
                    key={opt.label}
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-lg text-[10px]"
                    onClick={() => setOrderQty(Math.ceil(orderItem.shortageQty * opt.mult))}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild><Button variant="ghost" className="rounded-xl text-xs">Cancel</Button></DialogClose>
            <Button className="gap-1 rounded-xl text-xs" onClick={handleConfirmOrder} disabled={orderQty <= 0}>
              <ClipboardList className="h-3.5 w-3.5" /> Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
