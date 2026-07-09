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
import type { FdaRawMaterialSpec } from "@/lib/fda-types"

interface RawMaterialsTabProps {
  specs: FdaRawMaterialSpec[]
  isDraft: boolean
  onRefresh?: () => void
}

export function FdaPifRawMaterialsTab({ specs, isDraft, onRefresh }: RawMaterialsTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [editTarget, setEditTarget] = useState<FdaRawMaterialSpec | null>(null)
  const [editForm, setEditForm] = useState<Partial<FdaRawMaterialSpec>>({})
  const [saving, setSaving] = useState(false)

  function startEdit(spec: FdaRawMaterialSpec) {
    setEditTarget(spec)
    setEditForm({ materialName: spec.materialName, specification: spec.specification, testMethod: spec.testMethod, acceptanceCriteria: spec.acceptanceCriteria, supplier: spec.supplier })
  }

  async function handleSaveEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/fda/raw-material-specs/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (res.ok) { toast.success("อัปเดต spec แล้ว"); setEditTarget(null); onRefresh?.() }
      else toast.error("เกิดข้อผิดพลาด")
    } finally { setSaving(false) }
  }

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
                        <button className="rounded p-1 hover:bg-secondary text-muted-foreground" aria-label="Edit spec" onClick={() => startEdit(spec)}>
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

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl border border-border">
            <p className="mb-4 text-sm font-extrabold text-foreground">แก้ไข Raw Material Spec</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Material Name *", key: "materialName" },
                { label: "Supplier", key: "supplier" },
                { label: "Specification", key: "specification" },
                { label: "Test Method", key: "testMethod" },
                { label: "Acceptance Criteria", key: "acceptanceCriteria" },
              ].map(({ label, key }) => (
                <div key={key} className={key === "acceptanceCriteria" ? "col-span-2" : ""}>
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
