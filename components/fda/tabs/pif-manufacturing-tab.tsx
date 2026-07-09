"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { FdaManufacturingStep } from "@/lib/fda-types"

interface ManufacturingTabProps {
  steps: FdaManufacturingStep[]
  isDraft: boolean
  onRefresh?: () => void
}

export function FdaPifManufacturingTab({ steps, isDraft, onRefresh }: ManufacturingTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [editTarget, setEditTarget] = useState<FdaManufacturingStep | null>(null)
  const [editForm, setEditForm] = useState<Partial<FdaManufacturingStep>>({})
  const [saving, setSaving] = useState(false)

  function startEdit(step: FdaManufacturingStep) {
    setEditTarget(step)
    setEditForm({ stepName: step.stepName, description: step.description, equipment: step.equipment, temperatureRange: step.temperatureRange, timeDuration: step.timeDuration, rpmRange: step.rpmRange })
  }

  async function handleSaveEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/fda/manufacturing-steps/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) { toast.success("อัปเดต step แล้ว"); setEditTarget(null); onRefresh?.() }
      else toast.error("เกิดข้อผิดพลาด")
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/fda/manufacturing-steps/${id}`, { method: "DELETE" })
      if (res.ok) { toast.success("ลบ step แล้ว"); onRefresh?.() }
      else toast.error("เกิดข้อผิดพลาด")
    } finally { setBusy(false); setDeleteTarget(null) }
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{steps.length} Manufacturing Steps</p>
        {isDraft && (
          <Button size="sm" className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add Step
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-12 text-[10px] font-bold uppercase">Step</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Equipment</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[90px]">Temp</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[80px]">Duration</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[80px]">RPM</TableHead>
              {isDraft && <TableHead className="w-[70px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDraft ? 7 : 6} className="py-8 text-center text-sm text-muted-foreground">
                  No manufacturing steps
                </TableCell>
              </TableRow>
            ) : (
              steps.map((step) => (
                <TableRow key={step.id}>
                  <TableCell>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {step.stepNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{step.stepName}</p>
                    {step.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{step.description}</p>
                    )}
                    {step.criticalParameters && (
                      <p className="text-[10px] font-medium text-amber-600 mt-0.5">CP: {step.criticalParameters}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{step.equipment ?? "--"}</TableCell>
                  <TableCell className="text-xs font-mono text-foreground">{step.temperatureRange ?? "--"}</TableCell>
                  <TableCell className="text-xs text-foreground">{step.timeDuration ?? "--"}</TableCell>
                  <TableCell className="text-xs font-mono text-foreground">{step.rpmRange ?? "--"}</TableCell>
                  {isDraft && (
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Edit step" onClick={() => startEdit(step)}>
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" disabled={busy} aria-label="Delete step" onClick={() => setDeleteTarget({ id: step.id, name: step.stepName })}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบ Manufacturing Step</AlertDialogTitle>
            <AlertDialogDescription>ลบ &quot;{deleteTarget?.name}&quot;?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteTarget && handleDelete(deleteTarget.id)}>ลบ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl border border-border">
            <p className="mb-4 text-sm font-extrabold text-foreground">แก้ไข Step {editTarget.stepNumber}: {editTarget.stepName}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Step Name *", key: "stepName" },
                { label: "Equipment", key: "equipment" },
                { label: "Temperature Range", key: "temperatureRange" },
                { label: "Time Duration", key: "timeDuration" },
                { label: "RPM Range", key: "rpmRange" },
                { label: "Description", key: "description" },
              ].map(({ label, key }) => (
                <div key={key} className={key === "description" ? "col-span-2" : ""}>
                  <label className="mb-0.5 block text-[10px] font-bold uppercase text-muted-foreground">{label}</label>
                  <Input
                    value={(editForm as Record<string, unknown>)[key] as string ?? ""}
                    onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="h-8 text-[11px]"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={() => setEditTarget(null)}>
                <X className="h-3 w-3" /> ยกเลิก
              </Button>
              <Button size="sm" className="gap-1 text-[11px]" onClick={handleSaveEdit} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
