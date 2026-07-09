"use client"

import { useState } from "react"
import { useSWRConfig } from "swr"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { FdaListItem } from "@/lib/fda-types"

interface Props {
  registrations: FdaListItem[]
  onRowClick: (id: string) => void
}

const NEED_REVIEW: Array<FdaListItem["status"]> = ["submitted", "draft"]

export function FdaApprovalQueue({ registrations, onRowClick }: Props) {
  const { mutate } = useSWRConfig()
  const [busy, setBusy] = useState<string | null>(null)

  const queue = registrations.filter((r) => NEED_REVIEW.includes(r.status))
  const approved = registrations.filter((r) => r.status === "approved")

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    setBusy(id + status)
    try {
      const res = await fetch(`/api/fda/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      toast.success(`Registration ${status}`)
      await mutate("/api/fda")
    } catch (e) {
      toast.error("Action failed", { description: String(e) })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Pending review */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Pending Review</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Registrations in draft or submitted state awaiting approval</p>
          </div>
          {queue.length > 0 && (
            <span className="rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-bold px-2.5 py-0.5">
              {queue.length} pending
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-sm font-semibold text-foreground">No pending items</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">All registrations have been reviewed</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {queue.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-foreground truncate">{r.productNameTh || r.registrationCode}</p>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold shrink-0",
                      r.registrationType === "jk" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50",
                    )}>
                      {r.registrationType?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">{r.registrationCode}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={cn(
                      "inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase",
                      r.status === "submitted" ? "bg-blue-100 text-blue-700" : "bg-secondary text-muted-foreground",
                    )}>
                      {r.status}
                    </span>
                    {r.submittedDate && (
                      <span className="text-[10px] text-muted-foreground">
                        Submitted: {new Date(r.submittedDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 rounded-xl text-[11px]"
                    onClick={() => onRowClick(r.id)}
                  >
                    <Eye className="h-3 w-3" /> View
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1 rounded-xl text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!!busy}
                    onClick={() => updateStatus(r.id, "approved")}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {busy === r.id + "approved" ? "..." : "Approve"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 rounded-xl text-[11px] border-red-200 text-red-600 hover:bg-red-50"
                    disabled={!!busy}
                    onClick={() => updateStatus(r.id, "rejected")}
                  >
                    <XCircle className="h-3 w-3" />
                    {busy === r.id + "rejected" ? "..." : "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently approved */}
      {approved.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className="text-sm font-bold text-foreground">Approved ({approved.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {approved.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => onRowClick(r.id)}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{r.productNameTh || r.registrationCode}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{r.registrationCode}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {r.expiryDate ? `Exp: ${new Date(r.expiryDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}` : "--"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
