"use client"

import { useState } from "react"
import { CheckCircle2, Circle, User, Calendar } from "lucide-react"
import type { FdaChecklistItem } from "@/lib/fda-types"
import { DEFAULT_CHECKLIST_KEYS } from "@/lib/fda-types"

interface ChecklistTabProps {
  checklist: FdaChecklistItem[]
}

export function FdaChecklistTab({ checklist }: ChecklistTabProps) {
  const [items, setItems] = useState(checklist)

  const completed = items.filter((i) => i.isCompleted).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, isCompleted: !item.isCompleted, completedAt: !item.isCompleted ? new Date().toISOString().slice(0, 10) : undefined }
          : item
      )
    )
  }

  const getLabelForKey = (key: string) => {
    return DEFAULT_CHECKLIST_KEYS.find((k) => k.key === key)?.label ?? key
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Progress */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-foreground">Submission Readiness</p>
          <p className="text-sm font-extrabold text-foreground">
            {completed}/{total}
            <span className="ml-1 text-xs font-medium text-muted-foreground">({pct}%)</span>
          </p>
        </div>
        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-primary" : "bg-amber-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="mt-2 text-xs font-semibold text-emerald-600">All items complete -- ready for submission</p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
            onClick={() => handleToggle(item.id)}
            role="checkbox"
            aria-checked={item.isCompleted}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleToggle(item.id) } }}
          >
            {item.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                {getLabelForKey(item.checklistKey)}
              </p>
              {item.isCompleted && (
                <div className="flex items-center gap-3 mt-0.5">
                  {item.completedBy && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="h-2.5 w-2.5" /> {item.completedBy}
                    </span>
                  )}
                  {item.completedAt && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" /> {item.completedAt}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
