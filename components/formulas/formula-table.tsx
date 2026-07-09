"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { cn } from "@/lib/utils"
import { Search, SlidersHorizontal, Eye, Pencil, Copy, Trash2, MoreHorizontal, ArrowUpDown, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Formula, FormulaStatus } from "@/lib/formula-types"
import { formulaStatusLabel, formulaStatusColor, formulaTypeLabel } from "@/lib/formula-types"
import { toast } from "sonner"

const statusFilters: { key: FormulaStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "approved", label: "Approved" },
  { key: "draft", label: "Draft" },
  { key: "archived", label: "Archived" },
  { key: "discontinued", label: "Discontinued" },
]

interface FormulaTableProps {
  data: Formula[]
  total: number
}

export function FormulaTable({ data, total }: FormulaTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FormulaStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<"formulaCode" | "formulaName" | "batchSize" | "ingredientCount" | "status">("formulaCode")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [rowBusy, setRowBusy] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Formula | null>(null)

  const handleClone = async (row: Formula) => {
    setRowBusy(row.id)
    try {
      const res = await fetch(`/api/formulas/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clone" }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      const { formula } = await res.json()
      toast.success(`Cloned as ${formula.formulaCode}`)
      mutate("/api/formulas")
      router.push(`/formulas/${formula.id}`)
    } catch (e) {
      toast.error("Clone failed", { description: String(e) })
    } finally {
      setRowBusy(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setRowBusy(deleteTarget.id)
    try {
      const res = await fetch(`/api/formulas/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      toast.success(`Formula ${deleteTarget.formulaCode} deleted`)
      mutate("/api/formulas")
    } catch (e) {
      toast.error("Delete failed", { description: String(e) })
    } finally {
      setRowBusy(null)
      setDeleteTarget(null)
    }
  }

  const filtered = useMemo(() => {
    let list = [...data]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          f.formulaCode.toLowerCase().includes(q) ||
          f.formulaName.toLowerCase().includes(q) ||
          f.formulaNameEn?.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") list = list.filter((f) => f.status === statusFilter)
    if (typeFilter !== "all") list = list.filter((f) => f.formulaType === typeFilter)
    list.sort((a, b) => {
      const av = a[sortField] ?? ""
      const bv = b[sortField] ?? ""
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return list
  }, [data, search, statusFilter, typeFilter, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("asc") }
  }

  const allSelected = filtered.length > 0 && selectedRows.size === filtered.length
  const toggleAll = () => {
    if (allSelected) setSelectedRows(new Set())
    else setSelectedRows(new Set(filtered.map((f) => f.id)))
  }
  const toggleRow = (id: string) => {
    const s = new Set(selectedRows)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelectedRows(s)
  }

  const SortHeader = ({ field, children }: { field: typeof sortField; children: React.ReactNode }) => (
    <button className="flex items-center gap-1 text-left" onClick={() => toggleSort(field)}>
      {children}
      <ArrowUpDown className={cn("h-3 w-3 opacity-40", sortField === field && "opacity-100 text-primary")} />
    </button>
  )

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search formula code, name..."
            className="pl-9 h-9 text-[13px] rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {statusFilters.map((sf) => {
            const count = sf.key === "all" ? total : data.filter((d) => d.status === sf.key).length
            return (
              <button
                key={sf.key}
                onClick={() => setStatusFilter(sf.key)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors border",
                  statusFilter === sf.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary"
                )}
              >
                {sf.label}
                <span className="text-[10px] opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl gap-1 h-8 text-[12px]">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Type
              {typeFilter !== "all" && (
                <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0 text-[10px] h-4">1</Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTypeFilter("all")} className={typeFilter === "all" ? "font-bold" : ""}>All Types</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTypeFilter("master")} className={typeFilter === "master" ? "font-bold" : ""}>Master</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("variation")} className={typeFilter === "variation" ? "font-bold" : ""}>Variation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFilterCount > 0 && (
          <button className="text-[11px] text-muted-foreground underline" onClick={() => { setStatusFilter("all"); setTypeFilter("all") }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 text-center">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                <TableHead className="w-36 text-[11px]"><SortHeader field="formulaCode">Code</SortHeader></TableHead>
                <TableHead className="min-w-[240px] text-[11px]"><SortHeader field="formulaName">Formula Name</SortHeader></TableHead>
                <TableHead className="w-24 text-[11px]">Type</TableHead>
                <TableHead className="w-28 text-[11px]">Product Type</TableHead>
                <TableHead className="w-24 text-[11px]">Form</TableHead>
                <TableHead className="w-28 text-[11px] text-right"><SortHeader field="batchSize">Batch Size</SortHeader></TableHead>
                <TableHead className="w-16 text-[11px] text-center"><SortHeader field="ingredientCount">Ingr.</SortHeader></TableHead>
                <TableHead className="w-24 text-[11px]"><SortHeader field="status">Status</SortHeader></TableHead>
                <TableHead className="w-24 text-[11px] text-right">Cost/Unit</TableHead>
                <TableHead className="w-16 text-[11px] text-center">Ver</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-12 text-muted-foreground text-sm">
                    No formulas found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "group transition-colors hover:bg-muted/30",
                      selectedRows.has(row.id) && "bg-primary/5"
                    )}
                  >
                    <TableCell className="text-center">
                      <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={() => toggleRow(row.id)} />
                    </TableCell>

                    {/* Code */}
                    <TableCell>
                      <Link href={`/formulas/${row.id}`} className="text-[12px] font-semibold text-primary hover:underline">
                        {row.formulaCode}
                      </Link>
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <div className="text-[12px] font-semibold text-foreground leading-tight truncate max-w-[260px]">{row.formulaName}</div>
                      {row.formulaNameEn && <div className="text-[10px] text-muted-foreground truncate max-w-[260px]">{row.formulaNameEn}</div>}
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold px-1.5 py-0", row.formulaType === "variation" ? "border-purple-300 text-purple-600" : "border-border text-foreground")}>
                        {formulaTypeLabel[row.formulaType]}
                      </Badge>
                    </TableCell>

                    {/* Product type */}
                    <TableCell className="text-[12px] text-muted-foreground">{row.productType ?? "--"}</TableCell>

                    {/* Form */}
                    <TableCell className="text-[12px] text-muted-foreground">{row.cosmeticForm ?? "--"}</TableCell>

                    {/* Batch size */}
                    <TableCell className="text-right text-[12px] font-medium">
                      {row.batchSize.toLocaleString()} {row.batchUnit}
                    </TableCell>

                    {/* Ingredient count */}
                    <TableCell className="text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold">
                        {row.ingredientCount}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px] font-semibold border px-1.5 py-0", formulaStatusColor[row.status])}>
                        {formulaStatusLabel[row.status]}
                      </Badge>
                    </TableCell>

                    {/* Cost */}
                    <TableCell className="text-right text-[12px] font-medium">
                      {row.costPerUnit != null ? `\u0e3f${row.costPerUnit.toLocaleString()}` : "--"}
                    </TableCell>

                    {/* Version */}
                    <TableCell className="text-center text-[11px] text-muted-foreground">
                      {row.versionString ?? `v${row.version}`}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" disabled={rowBusy === row.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/formulas/${row.id}`} className="gap-2 text-[12px]">
                              <Eye className="h-3.5 w-3.5" /> View Detail
                            </Link>
                          </DropdownMenuItem>
                          {row.status === "draft" && (
                            <DropdownMenuItem className="gap-2 text-[12px]" onClick={() => router.push(`/formulas/${row.id}?edit=1`)}>
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 text-[12px]" onClick={() => handleClone(row)}>
                            <Copy className="h-3.5 w-3.5" /> Clone
                          </DropdownMenuItem>
                          {row.status === "draft" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-[12px] text-destructive focus:text-destructive" onClick={() => setDeleteTarget(row)}>
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-muted/20">
          <p className="text-[11px] text-muted-foreground">
            {selectedRows.size > 0 ? `${selectedRows.size} selected` : `${filtered.length} of ${total} formulas`}
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg" disabled>Next</Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Formula</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.formulaCode}</strong>? This will permanently remove the formula and all its ingredients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
