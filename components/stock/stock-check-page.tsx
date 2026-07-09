"use client"

import { useMemo, useState } from "react"
import { ClipboardCheck, Plus, Trash2, Play, RotateCcw, PackageCheck, AlertTriangle, TriangleAlert, Loader2 } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Formula } from "@/lib/formula-types"
import {
  checkStatusLabel,
  checkStatusColor,
  type CheckJobInput,
  type CheckSession,
} from "@/lib/stock-check-utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

let jobSeq = 1
function newJob(defaultId = ""): CheckJobInput {
  return { id: `job-${jobSeq++}`, formulaId: defaultId, batchQty: 1 }
}

export function StockCheckPage() {
  const [jobs, setJobs] = useState<CheckJobInput[]>([newJob()])
  const [session, setSession] = useState<CheckSession | null>(null)
  const [running, setRunning] = useState(false)

  // Load DB formulas for the dropdown.
  const { data: formulasData } = useSWR("/api/formulas", fetcher, { revalidateOnFocus: false })
  const allFormulas: Formula[] = useMemo(() => formulasData?.formulas ?? [], [formulasData])
  const formulaOptions = allFormulas

  function addJob() {
    setJobs((j) => [...j, newJob()])
  }
  function removeJob(id: string) {
    setJobs((j) => (j.length > 1 ? j.filter((x) => x.id !== id) : j))
  }
  function updateJob(id: string, patch: Partial<CheckJobInput>) {
    setJobs((j) => j.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  async function run() {
    const valid = jobs.filter((j) => j.formulaId && j.batchQty > 0)
    if (valid.length === 0) {
      toast.error("Add at least one job with a formula and batch quantity")
      return
    }
    setRunning(true)
    try {
      const res = await fetch("/api/stock/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobs: valid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to run stock check")
      const result: CheckSession = data.session
      setSession(result)
      if (result.totalItems === 0) {
        toast.warning("No tracked raw materials matched these formulas")
      } else if (result.shortageItems > 0) {
        toast.error(`${result.shortageItems} material(s) short — review the results below`)
      } else if (result.partialItems > 0) {
        toast.warning(`${result.partialItems} material(s) only partially available`)
      } else {
        toast.success("All materials sufficient for the planned batches")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to run stock check")
    } finally {
      setRunning(false)
    }
  }

  function reset() {
    setJobs([newJob()])
    setSession(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-6 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200">
            <ClipboardCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Stock Check Sessions</h1>
            <p className="text-[11px] text-muted-foreground">
              Check raw-material availability against formula batch requirements before production
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-indigo-600 text-[12px] text-white hover:bg-indigo-700"
            onClick={run}
            disabled={running}
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "Running..." : "Run Check"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-5">
          {/* Job builder */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Production Jobs</h3>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={addJob}>
                <Plus className="h-3.5 w-3.5" /> Add Job
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {/* header row */}
              <div className="hidden grid-cols-[1fr_140px_40px] gap-3 px-1 sm:grid">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Formula</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batch Qty (×)</span>
                <span />
              </div>
              {jobs.map((job) => {
                const formula = allFormulas.find((f) => f.id === job.formulaId)
                return (
                  <div key={job.id} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_40px] sm:items-center">
                    <select
                      value={job.formulaId}
                      onChange={(e) => updateJob(job.id, { formulaId: e.target.value })}
                      className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-indigo-200"
                      aria-label="Formula"
                    >
                      {formulaOptions.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.formulaCode} — {f.formulaName}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={job.batchQty}
                        onChange={(e) => updateJob(job.id, { batchQty: Math.max(0, Number(e.target.value)) })}
                        className="h-10 w-full font-mono text-sm"
                        aria-label="Batch quantity"
                      />
                      {formula && (
                        <span className="hidden whitespace-nowrap text-[10px] text-muted-foreground md:block">
                          {formula.batchSize * job.batchQty} {formula.batchUnit}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeJob(job.id)}
                      disabled={jobs.length <= 1}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive disabled:opacity-30"
                      aria-label="Remove job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Results */}
          {session && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-secondary p-4">
                  <span className="text-[11px] font-medium text-muted-foreground">Materials</span>
                  <div className="mt-1 text-2xl font-extrabold text-foreground">{session.totalItems}</div>
                </div>
                <div className="rounded-2xl bg-[#dcfce7] p-4">
                  <span className="text-[11px] font-medium text-muted-foreground">Sufficient</span>
                  <div className="mt-1 text-2xl font-extrabold text-emerald-700">{session.sufficientItems}</div>
                </div>
                <div className="rounded-2xl bg-[#fef3c7] p-4">
                  <span className="text-[11px] font-medium text-muted-foreground">Partial</span>
                  <div className="mt-1 text-2xl font-extrabold text-amber-700">{session.partialItems}</div>
                </div>
                <div className="rounded-2xl bg-[#fee2e2] p-4">
                  <span className="text-[11px] font-medium text-muted-foreground">Shortage</span>
                  <div className="mt-1 text-2xl font-extrabold text-red-600">{session.shortageItems}</div>
                </div>
              </div>

              {session.totalItems === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
                  <PackageCheck className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No tracked raw materials matched the selected formulas.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="bg-secondary">
                          <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Material</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Required</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allocated</th>
                          <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shortage</th>
                          <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.items.map((item) => (
                          <tr
                            key={item.stockCardId}
                            className={cn(
                              "border-b border-border transition-colors",
                              item.status === "shortage" && "bg-red-50/50",
                              item.status === "partial" && "bg-amber-50/40",
                            )}
                          >
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-mono text-[11px] text-primary">{item.itemCode}</span>
                                <span className="text-xs text-foreground">{item.itemName}</span>
                                {item.perJob.length > 1 && (
                                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                                    {item.perJob.map((p) => `${p.formulaCode}: ${p.allocatedQty}/${p.requiredQty}`).join(" · ")}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">
                              {item.requiredQty.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                              {item.availableQty.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs">
                              {item.allocatedQty.toLocaleString()} {item.unit}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={cn(
                                  "font-mono text-xs font-bold",
                                  item.shortageQty > 0 ? "text-red-600" : "text-emerald-600",
                                )}
                              >
                                {item.shortageQty > 0 ? `-${item.shortageQty.toLocaleString()}` : "0"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-semibold",
                                  checkStatusColor[item.status],
                                )}
                              >
                                {item.status === "shortage" && <TriangleAlert className="h-3 w-3" />}
                                {item.status === "partial" && <AlertTriangle className="h-3 w-3" />}
                                {item.status === "sufficient" && <PackageCheck className="h-3 w-3" />}
                                {checkStatusLabel[item.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {!session && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
              <ClipboardCheck className="h-9 w-9 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">Build your production jobs, then run a check</p>
              <p className="max-w-md text-[11px] text-muted-foreground">
                We calculate each raw material requirement from the formula percentages and batch size, then allocate
                available stock proportionally across competing jobs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
