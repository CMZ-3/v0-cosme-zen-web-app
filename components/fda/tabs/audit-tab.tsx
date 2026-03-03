"use client"

import { Clock, User, ArrowRight, MessageSquare } from "lucide-react"
import type { FdaAuditLog } from "@/lib/fda-types"

interface AuditTabProps {
  logs: FdaAuditLog[]
}

const ACTION_COLORS: Record<string, string> = {
  created: "bg-emerald-500",
  updated: "bg-blue-500",
  status_changed: "bg-primary",
  ingredient_added: "bg-teal-500",
  ingredient_updated: "bg-teal-400",
  ingredient_deleted: "bg-red-400",
  document_uploaded: "bg-purple-500",
  document_deleted: "bg-red-400",
}

const ACTION_LABELS: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  status_changed: "Status Changed",
  ingredient_added: "Ingredient Added",
  ingredient_updated: "Ingredient Updated",
  ingredient_deleted: "Ingredient Deleted",
  document_uploaded: "Document Uploaded",
  document_deleted: "Document Deleted",
}

export function FdaAuditTab({ logs }: AuditTabProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <p className="text-sm font-bold text-foreground">{logs.length} Audit Entries</p>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="flex flex-col gap-0">
          {logs.map((log) => {
            const dotColor = ACTION_COLORS[log.action] ?? "bg-slate-400"
            const actionLabel = ACTION_LABELS[log.action] ?? log.action

            return (
              <div key={log.id} className="relative flex gap-4 py-3 pl-0">
                {/* Dot */}
                <div className={`relative z-10 mt-1 h-[10px] w-[10px] shrink-0 rounded-full border-2 border-card ml-[10px] ${dotColor}`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">{actionLabel}</span>
                    {log.fieldName && log.fieldName !== "registration" && (
                      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {log.fieldName}
                      </span>
                    )}
                  </div>

                  {/* Old -> New */}
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {log.oldValue && (
                        <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] text-red-600 line-through">
                          {log.oldValue}
                        </span>
                      )}
                      {log.oldValue && log.newValue && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      {log.newValue && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] text-emerald-700">
                          {log.newValue}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  {log.comment && (
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageSquare className="h-3 w-3 shrink-0" />
                      {log.comment}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-1 flex items-center gap-3">
                    {log.userName && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="h-2.5 w-2.5" /> {log.userName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" /> {log.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
