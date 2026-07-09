"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw, Send, CheckCircle, XCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { FdaStatus } from "@/lib/fda-types"
import { FDA_STATUS_MAP, FDA_TRANSITIONS } from "@/lib/fda-types"

interface FdaStatusActionsProps {
  registration: { id: string; status: FdaStatus }
  isAdmin?: boolean
  onStatusChanged?: (newStatus: FdaStatus) => void
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Send; variant: "default" | "destructive" | "outline" | "secondary"; target: FdaStatus }> = {
  submit:  { label: "Submit",          icon: Send,          variant: "default",      target: "submitted" },
  approve: { label: "Approve",         icon: CheckCircle,   variant: "default",      target: "approved"  },
  reject:  { label: "Reject",          icon: XCircle,       variant: "destructive",  target: "rejected"  },
  cancel:  { label: "Cancel",          icon: Ban,           variant: "outline",      target: "inactive"  },
  revert:  { label: "Revert to Draft", icon: RotateCcw,     variant: "secondary",    target: "draft"     },
}

function getAvailableActions(status: FdaStatus, isAdmin: boolean): string[] {
  const actions: string[] = []
  const trans = FDA_TRANSITIONS[status]
  if (!trans) return actions
  if (trans.targets.includes("submitted")) actions.push("submit")
  if (trans.targets.includes("approved"))  actions.push("approve")
  if (trans.targets.includes("rejected"))  actions.push("reject")
  if (trans.targets.includes("inactive"))  actions.push("cancel")
  if (trans.targets.includes("draft"))     actions.push("revert")
  if (isAdmin && trans.adminOnly?.includes("draft")) actions.push("revert")
  return actions
}

export function FdaStatusActions({ registration, isAdmin = true, onStatusChanged }: FdaStatusActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const actions = getAvailableActions(registration.status, isAdmin)

  const handleAction = async (actionKey: string) => {
    const cfg = ACTION_CONFIG[actionKey]
    setBusy(true)
    try {
      const res = await fetch(`/api/fda/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status: cfg.target }),
      })
      if (res.ok) {
        toast.success(`Status: ${FDA_STATUS_MAP[cfg.target].label}`)
        onStatusChanged?.(cfg.target)
        router.refresh()
      } else {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setBusy(false)
    }
  }

  if (actions.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      {actions.map((key) => {
        const cfg = ACTION_CONFIG[key]
        return (
          <Button
            key={key}
            size="sm"
            variant={cfg.variant}
            className="gap-1.5 text-xs h-8"
            disabled={busy}
            onClick={() => handleAction(key)}
          >
            <cfg.icon className="h-3.5 w-3.5" />
            {cfg.label}
          </Button>
        )
      })}
    </div>
  )
}
