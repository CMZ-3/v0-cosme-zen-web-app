"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, MoreHorizontal, Pencil, Trash2, Loader2, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import type { StockMovement, MovementType } from "@/lib/stock-types"
import { movementTypeLabels, movementTypeColors, movementStatusColors } from "@/lib/stock-types"

interface StockMovementsTabProps {
  data: StockMovement[]
  onRefresh?: () => void
}

export function StockMovementsTab({ data, onRefresh }: StockMovementsTabProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; ref: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [editTarget, setEditTarget] = useState<{ id: string; ref: string; notes: string } | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleSaveMovementEdit() {
    if (!editTarget) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/stock/movements/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes }),
      })
      if (res.ok) {
        toast.success("อัปเดต movement แล้ว")
        setEditTarget(null)
        onRefresh?.()
        router.refresh()
      } else {
        toast.error("เกิดข้อผิดพลาด")
      }
    } finally {
      setSavingEdit(false)
    }
  }

  const filtered = useMemo(() => {
    return data.filter((mv) => {
      const matchSearch =
        !search ||
        mv.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
        mv.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        mv.itemName.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "all" || mv.movementType === typeFilter
      const matchStatus = statusFilter === "all" || mv.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [data, search, typeFilter, statusFilter])

  const handleDelete = async (id: string, ref: string) => {
    setBusy(true)
    try {
      const res = await fetch(`/api/stock/movements/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success(`ลบ movement ${ref} แล้ว`)
        onRefresh?.()
        router.refresh()
      } else {
        toast.error("เกิดข้อผิดพลาด")
      }
    } finally {
      setBusy(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <h3 className="text-sm font-bold text-foreground">Stock Movements</h3>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search ref, code..."
              className="h-9 w-[180px] rounded-full pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {(Object.keys(movementTypeLabels) as MovementType[]).map((t) => (
                <SelectItem key={t} value={t}>{movementTypeLabels[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[120px] rounded-xl text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-secondary">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
              <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-muted-foreground">
                  No movements found
                </td>
              </tr>
            ) : (
              filtered.map((mv) => {
                const isIncoming = ["buy_in", "adjust_in", "return", "found", "release"].includes(mv.movementType)
                const isNeutral = ["reserve", "transfer"].includes(mv.movementType)
                const typeLabel = movementTypeLabels[mv.movementType] ?? mv.movementType
                const typeColor = movementTypeColors[mv.movementType] ?? "bg-zinc-100 text-zinc-600"
                const sign = isNeutral ? "" : isIncoming ? "+" : "-"
                const qtyColor = isNeutral
                  ? "text-amber-600"
                  : isIncoming
                  ? "text-emerald-600"
                  : "text-red-600"
                return (
                  <tr key={mv.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{mv.referenceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold ${typeColor}`}>
                        {sign && `${sign} `}{typeLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {mv.itemCode && <span className="font-mono text-[11px] text-primary">{mv.itemCode}</span>}
                        <span className="text-xs text-muted-foreground">{mv.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-xs font-bold ${qtyColor}`}>
                        {sign}{mv.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold capitalize ${movementStatusColors[mv.status]}`}>
                        {mv.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{new Date(mv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {mv.status === "draft" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs gap-2" onClick={() => { setEditTarget({ id: mv.id, ref: mv.referenceNumber, notes: mv.notes ?? "" }); setEditNotes(mv.notes ?? "") }}>
                              <Pencil className="h-3 w-3" /> Edit Notes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs gap-2 text-destructive focus:text-destructive"
                              disabled={busy}
                              onClick={() => setDeleteTarget({ id: mv.id, ref: mv.referenceNumber })}
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Movement</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ movement &quot;{deleteTarget?.ref}&quot; อย่างถาวรใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={busy}
              onClick={() => deleteTarget && handleDelete(deleteTarget.id, deleteTarget.ref)}
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit notes overlay */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
            <p className="mb-0.5 text-sm font-extrabold text-foreground">แก้ไข Notes</p>
            <p className="mb-3 text-[11px] text-muted-foreground font-mono">{editTarget.ref}</p>
            <Textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="บันทึกเพิ่มเติม..."
              className="min-h-[80px] text-[12px]"
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" className="gap-1 text-[11px]" onClick={() => setEditTarget(null)}>
                <X className="h-3 w-3" /> ยกเลิก
              </Button>
              <Button size="sm" className="gap-1 text-[11px]" onClick={handleSaveMovementEdit} disabled={savingEdit}>
                {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
