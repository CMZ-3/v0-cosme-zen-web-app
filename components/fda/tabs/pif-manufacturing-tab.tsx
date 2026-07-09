"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Edit step" onClick={() => toast.info("แก้ไขใน detail page")}>
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
    </div>
  )
}
