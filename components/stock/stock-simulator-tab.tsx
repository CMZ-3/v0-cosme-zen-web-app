"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { FlaskConical, Plus, Trash2, Lock, Link2, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useStockSimulation } from "@/lib/stock-simulation-context"
import {
  FORMULAS,
  calcRequired,
  getPiecesFromBatch,
  getStockItem,
  FORMULA_COLORS,
} from "@/lib/stock-simulation-store"
import type { Formula, FormulaIngredient } from "@/lib/stock-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function StockSimulatorTab() {
  const { state, addToMemory, removeFromMemory, clearMemory, confirmSplitReservation, linkReservation } = useStockSimulation()

  // Merge hardcoded FORMULAS (using real stock card ids) with live DB formulas.
  const { data: dbFormulasData } = useSWR("/api/formulas/simulator", fetcher, {
    revalidateOnFocus: false,
  })
  const allFormulas = useMemo<Record<string, Formula & { label?: string }>>(
    () => ({ ...FORMULAS, ...(dbFormulasData?.formulas ?? {}) }),
    [dbFormulasData],
  )

  const [selectedFormula, setSelectedFormula] = useState("f1")
  const [batchSize, setBatchSize] = useState("50")
  const [weightPerUnit, setWeightPerUnit] = useState("")
  const [unitCount, setUnitCount] = useState("")
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [planName, setPlanName] = useState("")
  const [showBreakdown, setShowBreakdown] = useState(true)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkResId, setLinkResId] = useState<string | null>(null)
  const [linkFormulaName, setLinkFormulaName] = useState("")
  const [targetJo, setTargetJo] = useState("")

  const bs = parseFloat(batchSize) || 0
  // If the currently selected formula key no longer exists (e.g. after DB
  // formulas load and "f1" is gone), fall back to the first available key.
  const resolvedFormulaKey = allFormulas[selectedFormula]
    ? selectedFormula
    : Object.keys(allFormulas)[0] ?? ""
  const formula = allFormulas[resolvedFormulaKey]

  const manualPieces = (parseFloat(weightPerUnit) || 0) > 0 && (parseInt(unitCount) || 0) > 0
    ? Math.round((parseFloat(weightPerUnit) * parseInt(unitCount)) / 1000 * 100) / 100
    : 0

  const calcBatchResult = manualPieces > 0 ? manualPieces : 0

  const pieces = useMemo(() => {
    const mp = parseInt(unitCount) || 0
    if (formula && bs > 0 && formula.unitWeight > 0) {
      // Derived from batch kg: (batchKg * 1000) / unitWeightG
      return Math.floor((bs * 1000) / formula.unitWeight)
    }
    return mp > 0 ? mp : 0
  }, [unitCount, formula, bs])

  const preview = useMemo(() => {
    if (!formula) return []
    return formula.ingredients.map((ing) => {
      const si = getStockItem(state.stock, ing.id)
      const req = calcRequired(ing, bs, pieces)
      const ok = si ? si.balance >= req : false
      return { ing, si, req, ok, isPkg: !!ing.perUnit }
    })
  }, [formula, bs, pieces, state.stock])

  // Analysis: aggregate all memory bank items
  const analysis = useMemo(() => {
    if (state.memoryBank.length === 0) return null

    const perItem: Record<string, {
      total: number
      perFormula: { formulaId: string; formulaName: string; qty: number; batches: number }[]
    }> = {}

    const formulaLegend = new Map<string, { name: string; colorIdx: number }>()

    state.memoryBank.forEach((batch) => {
      if (!formulaLegend.has(batch.formulaId)) {
        formulaLegend.set(batch.formulaId, { name: batch.formulaName, colorIdx: formulaLegend.size })
      }
      batch.requirements.forEach((req) => {
        if (!perItem[req.id]) perItem[req.id] = { total: 0, perFormula: [] }
        perItem[req.id].total += req.qty
        const existing = perItem[req.id].perFormula.find((f) => f.formulaId === batch.formulaId)
        if (existing) {
          existing.qty += req.qty
          existing.batches++
        } else {
          perItem[req.id].perFormula.push({
            formulaId: batch.formulaId,
            formulaName: batch.formulaName,
            qty: req.qty,
            batches: 1,
          })
        }
      })
    })

    let shortages = 0
    const items = Object.entries(perItem).map(([id, data]) => {
      const si = getStockItem(state.stock, id)
      const balance = (si?.balance ?? 0) - data.total
      const short = balance < 0
      if (short) shortages++
      return { id, ...data, si, balance, short }
    })

    return { items, shortages, totalItems: items.length, formulaLegend }
  }, [state.memoryBank, state.stock])

  // Shortage heatmap
  const shortageEntries = useMemo(() => {
    if (!analysis) return []
    return analysis.items
      .filter((e) => e.short)
      .map((e) => ({
        ...e,
        severity: e.total > 0 ? Math.abs(e.balance) / e.total : 0,
      }))
      .sort((a, b) => b.severity - a.severity)
  }, [analysis])

  function handleCalcBatch() {
    const g = parseFloat(weightPerUnit) || 0
    const n = parseInt(unitCount) || 0
    if (g > 0 && n > 0) {
      const totalKg = Math.round((g * n) / 1000 * 100) / 100
      setBatchSize(String(totalKg))
    }
  }

  function handleAddToMemory() {
    const mp = parseInt(unitCount) || 0
    // Pass formula directly so DB formulas (not in hardcoded FORMULAS map) work.
    const override = formula ? { ...formula } : undefined
    addToMemory(resolvedFormulaKey, bs, mp > 0 ? mp : undefined, override)
  }

  function handleConfirmReserve() {
    confirmSplitReservation(planName)
    setPlanName("")
    setShowReserveModal(false)
  }

  function openLinkModal(resId: string, formulaName: string) {
    setLinkResId(resId)
    setLinkFormulaName(formulaName)
    setTargetJo("")
    setLinkModalOpen(true)
  }

  function handleLink(type: "new" | "existing") {
    if (!linkResId) return
    const jobNo = type === "new" ? `JO-2026-${Math.floor(100 + Math.random() * 900)}` : targetJo.trim().toUpperCase()
    if (!jobNo) return
    linkReservation(linkResId, jobNo)
    setLinkModalOpen(false)
    setLinkResId(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2.5 rounded-2xl bg-[#fef3c7] p-4 text-[12px] text-amber-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>Press "Add to Simulation" multiple times to simulate production of multiple formulas at once. The system will aggregate material requirements automatically.</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* LEFT: Formula Selector */}
        <div className="flex flex-col gap-4">
          {/* Formula Panel */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-foreground">1. Select Formula</h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Product Formula</label>
              <Select value={selectedFormula} onValueChange={setSelectedFormula}>
                <SelectTrigger className="h-10 rounded-xl text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(allFormulas).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v.label ?? v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold text-muted-foreground">Batch Size (kg)</label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => {
                  setBatchSize(e.target.value)
                  setWeightPerUnit("")
                  setUnitCount("")
                }}
                className="h-10 rounded-xl text-xs"
                min={0.01}
                step={0.01}
              />
            </div>
            {/* Calculator */}
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="mb-2 text-[10px] font-semibold text-muted-foreground">Calculate from weight/unit (g) x quantity / 1000 = kg</p>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground">Weight/unit (g)</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={weightPerUnit}
                    onChange={(e) => {
                      setWeightPerUnit(e.target.value)
                      setTimeout(handleCalcBatch, 0)
                    }}
                    className="h-8 rounded-lg text-[11px]"
                  />
                </div>
                <span className="pb-1 text-muted-foreground">x</span>
                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground">Qty (pcs)</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={unitCount}
                    onChange={(e) => {
                      setUnitCount(e.target.value)
                      setTimeout(handleCalcBatch, 0)
                    }}
                    className="h-8 rounded-lg text-[11px]"
                  />
                </div>
                <span className="pb-1 text-muted-foreground">=</span>
                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground">Batch (kg)</label>
                  <div className="py-1 font-mono text-sm font-bold text-primary">
                    {calcBatchResult > 0 ? `${calcBatchResult.toLocaleString()} kg` : "--"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredient Breakdown */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">2. Ingredient Breakdown</h3>
              <span className="text-[11px] text-muted-foreground">
                For {bs} kg batch{pieces > 0 ? ` (${pieces.toLocaleString()} pcs)` : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Material</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Required</th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((p, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-4 py-2.5">
                        <span className="font-medium">{p.si?.name || p.ing.id}</span>
                        {p.isPkg && <span className="ml-1 text-[10px] text-muted-foreground">[PKG]</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[11px]">
                        {p.req.toLocaleString(undefined, { maximumFractionDigits: 2 })} {p.si?.unit || ""}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p.ok ? (
                          <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">OK</Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-lg border-0 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">Low</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border bg-secondary p-3">
              <Button
                className="w-full gap-1.5 rounded-xl text-[12px]"
                onClick={handleAddToMemory}
                disabled={bs <= 0}
              >
                <Plus className="h-3.5 w-3.5" /> Add to Simulation
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Memory Bank + Analysis + Reservations */}
        <div className="flex flex-col gap-6">
          {/* Memory Bank */}
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Memory Bank</h2>
                <p className="text-[11px] text-muted-foreground">Simulate formulas, Split & Reserve, Link to Job Orders</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1 rounded-xl text-[11px] text-destructive hover:bg-destructive hover:text-white" onClick={clearMemory} disabled={state.memoryBank.length === 0}>
                  <Trash2 className="h-3 w-3" /> Clear
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1 rounded-xl bg-amber-500 text-[11px] text-white hover:bg-amber-600"
                  onClick={() => setShowReserveModal(true)}
                  disabled={state.memoryBank.length === 0}
                >
                  <Lock className="h-3 w-3" /> Split & Reserve All
                </Button>
              </div>
            </div>

            {state.memoryBank.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-10 text-center">
                <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">Memory Bank is empty -- add formulas from the left panel</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                {state.memoryBank.map((m) => (
                  <div key={m.id} className="relative rounded-2xl border border-border border-l-4 border-l-violet-500 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <button
                      onClick={() => removeFromMemory(m.id)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <h4 className="pr-6 text-[13px] font-bold text-foreground">{m.formulaName}</h4>
                    <div className="mt-1 font-mono text-2xl font-extrabold text-violet-600">
                      {m.batchSize}<span className="ml-1 text-[11px] font-normal text-muted-foreground">kg</span>
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {m.requirements.length} ingredients
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aggregated Analysis */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between bg-foreground px-5 py-3.5 text-background">
              <h3 className="text-sm font-semibold">Total Resource Analysis</h3>
              <div className="flex items-center gap-3">
                {analysis && (
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="rounded-md border border-white/20 px-2.5 py-1 text-[10px] font-semibold text-white/80 transition-colors hover:bg-white/10"
                  >
                    {showBreakdown ? "Hide Breakdown" : "Show Breakdown"}
                  </button>
                )}
                <span className="font-mono text-[12px] text-muted-foreground">
                  {analysis
                    ? analysis.shortages > 0
                      ? <span className="text-red-400">{analysis.shortages} Shortage{analysis.shortages > 1 ? "s" : ""}</span>
                      : <span className="text-green-400">All {analysis.totalItems} items OK</span>
                    : "Add items to check"}
                </span>
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Raw Material / Packaging</th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Physical Stock</th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-violet-600" style={{ background: "rgba(139,92,246,0.08)" }}>Total Needed</th>
                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Balance After</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!analysis ? (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground italic">Start adding formulas to see stock analysis</td></tr>
                  ) : (
                    analysis.items.map((item) => (
                      <tr key={item.id} className={`border-b border-border ${item.short ? "bg-red-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className={`font-semibold ${item.short ? "text-destructive" : ""}`}>{item.si?.name || item.id}</div>
                          <div className="text-[10px] text-muted-foreground">{item.si?.code} {item.si?.category}</div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-xs text-muted-foreground">{item.si?.balance.toLocaleString()}</td>
                        <td className="px-4 py-3" style={{ background: "rgba(139,92,246,0.04)" }}>
                          <div className="text-center font-mono text-sm font-bold text-violet-600">
                            {item.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            <span className="ml-1 text-[10px] font-normal text-muted-foreground">{item.si?.unit}</span>
                          </div>
                          {showBreakdown && item.perFormula.length > 1 && (
                            <div className="mt-2">
                              {/* Breakdown bar */}
                              <div className="flex h-5 overflow-hidden rounded-md bg-secondary">
                                {item.perFormula.map((f, fi) => {
                                  const legend = analysis.formulaLegend.get(f.formulaId)
                                  const color = FORMULA_COLORS[legend?.colorIdx ?? fi % FORMULA_COLORS.length]
                                  const pct = item.total > 0 ? (f.qty / item.total) * 100 : 0
                                  return (
                                    <div
                                      key={fi}
                                      className="flex items-center justify-center text-[8px] font-bold text-white"
                                      style={{ width: `${pct}%`, background: color, minWidth: pct > 0 ? 16 : 0 }}
                                      title={`${f.formulaName}: ${f.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                    >
                                      {pct > 15 ? f.qty.toLocaleString(undefined, { maximumFractionDigits: 1 }) : ""}
                                    </div>
                                  )
                                })}
                              </div>
                              <div className="mt-1 flex flex-wrap gap-x-2 text-[10px]">
                                {item.perFormula.map((f, fi) => {
                                  const legend = analysis.formulaLegend.get(f.formulaId)
                                  const color = FORMULA_COLORS[legend?.colorIdx ?? fi % FORMULA_COLORS.length]
                                  return (
                                    <span key={fi} className="flex items-center gap-1">
                                      <span className="inline-block h-2 w-2 rounded-sm" style={{ background: color }} />
                                      <span className="text-muted-foreground">{f.formulaName}:</span>
                                      <strong style={{ color }}>{f.qty.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-center font-mono text-xs font-bold ${item.short ? "text-destructive" : "text-emerald-600"}`}>
                          {item.balance > 0 ? "+" : ""}{item.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {item.short ? (
                            <Badge variant="outline" className="rounded-lg border-0 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                              -{Math.abs(item.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">OK</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {analysis && showBreakdown && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border bg-secondary px-5 py-2.5">
                <span className="text-[10px] font-bold text-foreground">Formulas:</span>
                {Array.from(analysis.formulaLegend.entries()).map(([fid, info]) => (
                  <span key={fid} className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                    <span className="inline-block h-2.5 w-2.5 rounded" style={{ background: FORMULA_COLORS[info.colorIdx] }} />
                    {info.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Shortage Heatmap */}
          {shortageEntries.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-bold text-foreground">Shortage Heatmap</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
                {shortageEntries.map((e) => {
                  const intensity = Math.min(e.severity, 1)
                  const bg = `rgba(239,68,68,${0.1 + intensity * 0.5})`
                  const color = intensity > 0.5 ? "#fff" : "#dc2626"
                  return (
                    <div key={e.id} className="rounded-2xl p-3.5 text-center transition-transform hover:scale-105" style={{ background: bg, color }}>
                      <div className="text-[11px] font-bold">{e.si?.name}</div>
                      <div className="mt-1 font-mono text-sm">{e.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active Reservations */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-[15px] font-bold text-foreground">Active Reservations</h3>
              <Badge variant="outline" className="rounded-lg border-0 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {state.savedReservations.length} draft{state.savedReservations.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {state.savedReservations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-10 text-center">
                <Lock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-xs text-muted-foreground">No reservations yet -- simulate and reserve stock above</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {state.savedReservations.map((r) => {
                  const isLinked = r.status === "LINKED"
                  return (
                    <div
                      key={r.id}
                      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md ${isLinked ? "border-l-4 border-l-emerald-500 bg-emerald-50/50" : "border-l-4 border-l-amber-500"}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-violet-100 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-700">{r.id}</span>
                          {r.ssiRef && (
                            <span className="rounded-md bg-violet-50 px-2 py-0.5 font-mono text-[9px] font-bold text-violet-500">{r.ssiRef}</span>
                          )}
                          {isLinked ? (
                            <Badge variant="outline" className="rounded-lg border-0 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Linked to {r.linkedJo}</Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-lg border-0 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Draft Reserved</Badge>
                          )}
                        </div>
                        <div className="text-sm font-bold text-foreground">{r.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="mr-1 rounded-md border-0 bg-teal-100 px-1.5 py-0 text-[10px] font-semibold text-teal-700">{r.batchData.batchSize} kg</Badge>
                          Created {r.date} -- {r.batchData.requirements.length} ingredients
                        </div>
                      </div>
                      {!isLinked && (
                        <Button
                          size="sm"
                          className="h-8 gap-1 rounded-xl text-[11px]"
                          onClick={() => openLinkModal(r.id, r.formulaName)}
                        >
                          <Link2 className="h-3 w-3" /> Link to Job Order
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      <Dialog open={showReserveModal} onOpenChange={setShowReserveModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirm Split & Reserve</DialogTitle>
            <p className="text-xs text-muted-foreground">
              {state.memoryBank.length} formulas will create {state.memoryBank.length} individual reservations
            </p>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Batch Group Name (Optional)</label>
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder='e.g. Lot A for Central Ladprao'
                className="rounded-xl text-xs"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Ex: &quot;Lot A&quot; becomes &quot;Lot A -- Vit C Serum&quot;</p>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-[#e0f2fe] p-3 text-[12px] text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>Each formula gets a unique <strong>RES-ID</strong>. You can link each to a separate Job Order (1:1).</div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" className="rounded-xl text-xs">Cancel</Button></DialogClose>
            <Button className="rounded-xl bg-amber-500 text-xs text-white hover:bg-amber-600" onClick={handleConfirmReserve}>
              Confirm Split & Reserve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Modal */}
      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent className="overflow-hidden rounded-2xl p-0">
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <h3 className="text-base font-bold">Link Reservation to Job Order</h3>
            <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] opacity-85">
              <span className="rounded bg-white/15 px-2 py-0.5 font-mono">{linkResId}</span>
              <span>{linkFormulaName}</span>
            </div>
          </div>
          <div className="p-6">
            <div
              className="cursor-pointer rounded-xl border border-border p-4 transition-colors hover:border-primary"
              onClick={() => handleLink("new")}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-bold">Create New Job Order</div>
                  <div className="text-[11px] text-muted-foreground">Auto-generate JO-xxxx for this formula</div>
                </div>
              </div>
            </div>
            <div className="my-4 flex items-center gap-3 text-[11px] uppercase text-muted-foreground">
              <div className="flex-1 border-t border-border" />OR<div className="flex-1 border-t border-border" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">Link to Existing Job Order</label>
              <div className="flex gap-2">
                <Input
                  value={targetJo}
                  onChange={(e) => setTargetJo(e.target.value)}
                  placeholder="Enter Job No. (e.g. JO-2026-009)"
                  className="rounded-xl text-xs uppercase"
                />
                <Button onClick={() => handleLink("existing")} className="rounded-xl text-xs" disabled={!targetJo.trim()}>Link</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
