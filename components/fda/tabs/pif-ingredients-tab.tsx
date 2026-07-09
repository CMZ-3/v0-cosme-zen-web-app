"use client"

import { useState } from "react"
import { AlertTriangle, FlaskConical, Plus, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { FdaIngredient } from "@/lib/fda-types"

interface IngredientsTabProps {
  ingredients: FdaIngredient[]
  isDraft: boolean
  registrationId?: string
  onRefresh?: () => void
}

function formatPct(ing: FdaIngredient): string {
  if (ing.percentage != null) return `${ing.percentage}%`
  if (ing.percentageMin != null && ing.percentageMax != null)
    return `${ing.percentageMin}-${ing.percentageMax}%`
  return "--"
}

type EditForm = {
  ingredientName: string
  inciName: string
  casNumber: string
  percentage: string
  function: string
  supplier: string
}

export function FdaPifIngredientsTab({ ingredients, isDraft, registrationId, onRefresh }: IngredientsTabProps) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [editTarget, setEditTarget] = useState<FdaIngredient | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ ingredientName: "", inciName: "", casNumber: "", percentage: "", function: "", supplier: "" })
  const [saving, setSaving] = useState(false)

  function startEdit(ing: FdaIngredient) {
    setEditTarget(ing)
    setEditForm({
      ingredientName: ing.ingredientName ?? "",
      inciName: ing.inciName ?? "",
      casNumber: ing.casNumber ?? "",
      percentage: ing.percentage != null ? String(ing.percentage) : "",
      function: ing.function ?? "",
      supplier: ing.supplier ?? "",
    })
  }

  async function handleSaveEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/fda/ingredients/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredientName: editForm.ingredientName,
          inciName: editForm.inciName || null,
          casNumber: editForm.casNumber || null,
          percentage: editForm.percentage ? Number(editForm.percentage) : null,
          function: editForm.function || null,
          supplier: editForm.supplier || null,
        }),
      })
      if (res.ok) {
        toast.success("อัปเดตส่วนผสมแล้ว")
        setEditTarget(null)
        onRefresh?.()
      } else {
        toast.error("เกิดข้อผิดพลาด")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/fda/ingredients/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("ลบส่วนผสมแล้ว")
        onRefresh?.()
      } else {
        toast.error("เกิดข้อผิดพลาด")
      }
    } finally {
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  const totalPct = ingredients.reduce((sum, ing) => {
    if (ing.percentage != null) return sum + Number(ing.percentage)
    if (ing.percentageMin != null && ing.percentageMax != null)
      return sum + (Number(ing.percentageMin) + Number(ing.percentageMax)) / 2
    return sum
  }, 0)

  return (
    <div className="flex flex-col gap-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-foreground">{ingredients.length} Ingredients</p>
          <span className={`text-xs font-mono font-semibold ${Math.abs(totalPct - 100) < 0.1 ? "text-emerald-600" : "text-amber-600"}`}>
            Total: {totalPct.toFixed(2)}%
          </span>
        </div>
        {isDraft && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <FlaskConical className="h-3 w-3" />
              Populate from Formula
            </Button>
            <Button size="sm" className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="w-10 text-[10px] font-bold uppercase">#</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Ingredient</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">INCI Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[80px]">CAS</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[70px] text-right">%</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Function</TableHead>
              <TableHead className="text-[10px] font-bold uppercase w-[90px]">Supplier</TableHead>
              {isDraft && <TableHead className="w-[70px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDraft ? 8 : 7} className="py-8 text-center text-sm text-muted-foreground">
                  No ingredients yet
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ing, i) => (
                <TableRow key={ing.id}>
                  <TableCell className="text-xs text-muted-foreground">{ing.sortOrder ?? i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{ing.ingredientName}</span>
                      {ing.isRestricted && (
                        <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[9px] border-amber-300 text-amber-600">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Restricted
                        </Badge>
                      )}
                    </div>
                    {ing.thaiName && <p className="text-[10px] text-muted-foreground">{ing.thaiName}</p>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ing.inciName ?? "--"}</TableCell>
                  <TableCell className="font-mono text-[11px] text-muted-foreground">{ing.casNumber ?? "--"}</TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-foreground">{formatPct(ing)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{ing.function ?? "--"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[80px]">{ing.supplier ?? "--"}</TableCell>
                  {isDraft && (
                    <TableCell>
                      <div className="flex gap-1">
                        <button
                          className="rounded p-1 hover:bg-secondary text-muted-foreground"
                          aria-label="Edit ingredient"
                          onClick={() => startEdit(ing)}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-500"
                          disabled={busy}
                          aria-label="Delete ingredient"
                          onClick={() => setDeleteTarget({ id: ing.id, name: ing.ingredientName })}
                        >
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

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบส่วนผสม</AlertDialogTitle>
            <AlertDialogDescription>ลบ &quot;{deleteTarget?.name}&quot; ออกจากสูตรนี้?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inline edit overlay */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-sm font-extrabold text-foreground">แก้ไขส่วนผสม</p>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { label: "Ingredient Name *", key: "ingredientName" },
                { label: "INCI Name", key: "inciName" },
                { label: "CAS Number", key: "casNumber" },
                { label: "Function", key: "function" },
                { label: "Supplier", key: "supplier" },
                { label: "% (fixed)", key: "percentage", type: "number" },
              ] as { label: string; key: keyof EditForm; type?: string }[]).map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-0.5 block text-[10px] font-bold uppercase text-muted-foreground">{label}</label>
                  <Input
                    type={type ?? "text"}
                    value={editForm[key]}
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
