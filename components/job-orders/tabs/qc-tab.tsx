"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import type { JobOrder } from "@/lib/job-order-types"

interface Props {
  jobOrder: JobOrder
}

export function QCTab({ jobOrder }: Props) {
  const allPassed = jobOrder.qcResults.length > 0 && jobOrder.qcResults.every((r) => r.status === "pass")

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-extrabold text-foreground">Bulk Inspection Results</h3>
        {jobOrder.qcResults.length > 0 && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-bold",
              allPassed ? "bg-[#ecfdf5] text-[#15803d]" : "bg-[#fef2f2] text-destructive"
            )}
          >
            {allPassed ? "PASSED" : "REVIEW NEEDED"}
          </span>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Parameter</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Specification</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Result</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Tester</th>
              </tr>
            </thead>
            <tbody>
              {jobOrder.qcResults.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-primary/[0.02]">
                  <td className="px-4 py-3 font-bold text-foreground">{r.parameter}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.specification}</td>
                  <td className="px-4 py-3 font-bold">{r.result}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 font-bold",
                      r.status === "pass" && "text-[#10b981]",
                      r.status === "fail" && "text-destructive",
                      r.status === "pending" && "text-muted-foreground"
                    )}>
                      {r.status === "pass" && <><CheckCircle className="h-3 w-3" /> Pass</>}
                      {r.status === "fail" && <><XCircle className="h-3 w-3" /> Fail</>}
                      {r.status === "pending" && <><Clock className="h-3 w-3" /> Pending</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-muted-foreground">{r.tester}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobOrder.qcResults.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No QC results available yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
