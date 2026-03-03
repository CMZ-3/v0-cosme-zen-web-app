"use client"

import { ArrowLeft, Copy, RotateCcw, Send, CheckCircle, XCircle, Ban, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FdaRegistration, FdaStatus } from "@/lib/fda-types"
import { FDA_STATUS_MAP, REGISTRATION_TYPE_MAP, FDA_TRANSITIONS } from "@/lib/fda-types"
import { toast } from "sonner"

interface FdaStatusActionsProps {
  registration: FdaRegistration
  isAdmin?: boolean
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Send; variant: "default" | "destructive" | "outline" | "secondary"; target: FdaStatus }> = {
  submit: { label: "Submit", icon: Send, variant: "default", target: "submitted" },
  approve: { label: "Approve", icon: CheckCircle, variant: "default", target: "approved" },
  reject: { label: "Reject", icon: XCircle, variant: "destructive", target: "rejected" },
  cancel: { label: "Cancel", icon: Ban, variant: "outline", target: "inactive" },
  revert: { label: "Revert to Draft", icon: RotateCcw, variant: "secondary", target: "draft" },
}

function getAvailableActions(status: FdaStatus, isAdmin: boolean): string[] {
  const actions: string[] = []
  const trans = FDA_TRANSITIONS[status]

  if (trans.targets.includes("submitted")) actions.push("submit")
  if (trans.targets.includes("approved")) actions.push("approve")
  if (trans.targets.includes("rejected")) actions.push("reject")
  if (trans.targets.includes("inactive")) actions.push("cancel")
  if (trans.targets.includes("draft")) actions.push("revert")
  if (isAdmin && trans.adminOnly?.includes("draft")) actions.push("revert")

  return actions
}

export function FdaStatusActions({ registration, isAdmin = true }: FdaStatusActionsProps) {
  const actions = getAvailableActions(registration.status, isAdmin)

  const handleAction = (actionKey: string) => {
    const cfg = ACTION_CONFIG[actionKey]
    toast.success(`Status changed to ${FDA_STATUS_MAP[cfg.target].label}`)
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
