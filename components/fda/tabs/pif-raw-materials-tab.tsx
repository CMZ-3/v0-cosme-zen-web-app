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
import type { FdaRawMaterialSpec } from "@/lib/fda-types"

interface RawMaterialsTabProps {
  specs: FdaRawMaterialSpec[]
  isDraft: boolean
  onRefresh?: () => void
}

export function FdaPifRawMaterialsTab({ specs, isDraft, onRefresh }: RawMaterialsTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/fda/raw-material-specs/${id}`, { method: "DELETE" })
      if (res.ok) { toast.success("ลบ spec แล้ว"); onRefresh?.() }
      else toast.error("เกิดข้อผิดพลาด")
    } finally { setBusy(false); setDeleteTarget(null) }
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">{specs.length} Raw Material Specifications</p>
        {isDraft && (
          <Button size="sm" className="h-7 text-xs gap-1">
            <Plus className="h-3 w-3" /> Add Spec
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-[10px] font-bold uppercase">Material Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Specification</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Test Method</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Acceptance Criteria</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[110px]">Supplier</TableHead>
              {isDraft && <TableHead className="w-[70px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {specs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDraft ? 6 : 5} className="py-8 text-center text-sm text-muted-foreground">
                  No raw material specs
                </TableCell>
              </TableRow>
            ) : (
              specs.map((spec) => (
                <TableRow key={spec.id}>
                  <TableCell className="text-sm font-medium text-foreground">{spec.materialName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{spec.specification ?? "--"}</TableCell>
                  <TableCell className="text-xs text-foreground">{spec.testMethod ?? "--"}</TableCell>
                  <TableCell className="text-xs text-foreground">{spec.acceptanceCriteria ?? "--"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]">{spec.supplier ?? "--"}</TableCell>
                  {isDraft && (
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Edit spec" onClick={() => toast.info("แก้ไขใน detail page")}>
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500" disabled={busy} aria-label="Delete spec" onClick={() => setDeleteTarget({ id: spec.id, name: spec.materialName })}>
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
            <AlertDialogTitle>ลบ Raw Material Spec</AlertDialogTitle>
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
