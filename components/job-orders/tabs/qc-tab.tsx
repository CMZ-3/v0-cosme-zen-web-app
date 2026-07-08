"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, AlertTriangle, ShieldCheck, ShieldX, MinusCircle } from "lucide-react"
import { toast } from "sonner"
import type { JobOrder } from "@/lib/job-order-types"

// Spec 6.5: disposition values per failing/out-of-spec QC line
type Disposition = "pass" | "fail" | "waived" | null

interface Props {
  jobOrder: JobOrder
}

export function QCTab({ jobOrder }: Props) {
  // Track dispositions per QC result id (Leader-only action)
  const [dispositions, setDispositions] = useState<Record<string, Disposition>>({})

  function getEffectiveStatus(id: string, original: string): string {
    const d = dispositions[id]
    if (d === "pass") return "pass"
    if (d === "waived") return "waived"
    if (d === "fail") return "fail"
    return original
  }

  function applyDisposition(id: string, param: string, d: Disposition) {
    setDispositions(prev => ({ ...prev, [id]: d }))
    const label = d === "pass" ? "Passed by Leader" : d === "waived" ? "Waived" : "Confirmed Fail"
    toast.success(`QC: ${param} — ${label}`, {
      description: d === "waived" ? "Production can proceed despite out-of-spec result." : undefined,
    })
  }

  const results = jobOrder.qcResults.map(r => ({
    ...r,
    effectiveStatus: getEffectiveStatus(r.id, r.status),
    disposition: dispositions[r.id] ?? null,
  }))

  const failCount = results.filter(r => r.status === "fail" && !dispositions[r.id]).length
  const allResolved = results.length > 0 && results.every(r => r.effectiveStatus !== "fail" || r.disposition === "fail")
  const allPassed = results.length > 0 && results.every(r => r.effectiveStatus === "pass" || r.effectiveStatus === "waived")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-foreground">Bulk Inspection Results</h3>
        {results.length > 0 && (
          <span className={cn(
            "rounded-full px-3 py-1 text-[11px] font-bold",
            allPassed ? "bg-[#ecfdf5] text-[#15803d]" :
            failCount > 0 ? "bg-[#fef2f2] text-destructive" :
            "bg-[#fef3c7] text-[#c2410c]"
          )}>
            {allPassed ? "ALL PASSED" : failCount > 0 ? `${failCount} NEED DISPOSITION` : "REVIEW NEEDED"}
          </span>
        )}
      </div>

      {/* Disposition info banner -- spec 6.5 */}
      {failCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>{failCount} out-of-spec result{failCount > 1 ? "s" : ""}</strong> require a Leader&apos;s disposition before this JO can be completed.
            Choose <strong>Pass</strong> (override), <strong>Waive</strong> (acknowledge risk), or <strong>Fail</strong> (block completion).
          </span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Parameter</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Specification</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Result</th>
                <th className="px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tester</th>
                <th className="px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Disposition</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const isOutOfSpec = r.status === "fail"
                const hasDisposition = r.disposition !== null
                return (
                  <tr key={r.id} className={cn(
                    "border-b border-border last:border-b-0 hover:bg-primary/[0.02]",
                    isOutOfSpec && !hasDisposition && "bg-red-50/50",
                    r.disposition === "waived" && "bg-amber-50/40",
                  )}>
                    <td className="px-4 py-3 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        {isOutOfSpec && !hasDisposition && <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />}
                        {r.parameter}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.specification}</td>
                    <td className="px-4 py-3 font-bold font-mono text-[11px]">
                      <span className={cn(isOutOfSpec ? "text-destructive" : "text-[#10b981]")}>{r.result}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-bold rounded-full px-2 py-0.5 text-[10px]",
                        r.effectiveStatus === "pass" && "bg-[#ecfdf5] text-[#10b981]",
                        r.effectiveStatus === "fail" && "bg-[#fef2f2] text-destructive",
                        r.effectiveStatus === "waived" && "bg-[#fef3c7] text-[#c2410c]",
                        r.effectiveStatus === "pending" && "bg-secondary text-muted-foreground",
                      )}>
                        {r.effectiveStatus === "pass" && <><CheckCircle className="h-3 w-3" /> Pass</>}
                        {r.effectiveStatus === "fail" && <><XCircle className="h-3 w-3" /> Fail</>}
                        {r.effectiveStatus === "waived" && <><MinusCircle className="h-3 w-3" /> Waived</>}
                        {r.effectiveStatus === "pending" && <><Clock className="h-3 w-3" /> Pending</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-muted-foreground">{r.tester}</td>
                    <td className="px-4 py-3 text-center">
                      {isOutOfSpec && !hasDisposition ? (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            className="h-6 px-1.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-md gap-0.5"
                            onClick={() => applyDisposition(r.id, r.parameter, "pass")}
                          >
                            <ShieldCheck className="h-3 w-3" /> Pass
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-1.5 text-[10px] border-amber-300 text-amber-700 hover:bg-amber-50 rounded-md gap-0.5"
                            onClick={() => applyDisposition(r.id, r.parameter, "waived")}
                          >
                            <MinusCircle className="h-3 w-3" /> Waive
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-1.5 text-[10px] border-red-300 text-destructive hover:bg-red-50 rounded-md gap-0.5"
                            onClick={() => applyDisposition(r.id, r.parameter, "fail")}
                          >
                            <ShieldX className="h-3 w-3" /> Fail
                          </Button>
                        </div>
                      ) : hasDisposition ? (
                        <button
                          className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
                          onClick={() => {
                            setDispositions(prev => { const n = { ...prev }; delete n[r.id]; return n })
                          }}
                        >
                          Clear
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {results.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No QC results available yet</div>
          )}
        </CardContent>
      </Card>

      {/* Disposition summary */}
      {results.length > 0 && (
        <div className={cn(
          "rounded-xl border px-4 py-3 text-[11px] font-medium flex items-center gap-2",
          allPassed ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
          failCount > 0 ? "border-red-200 bg-red-50 text-red-800" :
          "border-amber-200 bg-amber-50 text-amber-800"
        )}>
          {allPassed ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
          {allPassed
            ? "All QC parameters resolved. JO can proceed to completion."
            : failCount > 0
            ? `${failCount} parameter${failCount > 1 ? "s" : ""} pending Leader disposition. JO is blocked until resolved.`
            : "Some parameters waived or confirmed fail. Review before proceeding."}
        </div>
      )}
    </div>
  )
}
