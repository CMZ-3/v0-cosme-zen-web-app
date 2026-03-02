"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Eye, Copy, ShoppingBag, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProductListItem, ProductStatus, FDAStatus, ProductCategory } from "@/lib/product-types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type SortKey = "nameInternal" | "sku" | "customerName" | "category" | "sellingPrice" | "totalCostPerUnit" | "marginPercent" | "fdaStatus" | "status"
type SortDir = "asc" | "desc"

function getStatusBadge(status: ProductStatus) {
  const map: Record<ProductStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20" },
    in_development: { label: "In Dev", className: "bg-[#f3efff] text-[#8b5cf6] border-[#8b5cf6]/20" },
    draft: { label: "Draft", className: "bg-[#f7f8fc] text-[#64748b] border-[#64748b]/20" },
    discontinued: { label: "Discontinued", className: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20" },
  }
  const s = map[status]
  return <Badge variant="outline" className={cn("text-[10px] font-bold", s.className)}>{s.label}</Badge>
}

function getFDABadge(status: FDAStatus) {
  const map: Record<FDAStatus, { label: string; className: string }> = {
    approved: { label: "Approved", className: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20" },
    pending: { label: "Pending", className: "bg-[#fef3c7] text-[#f59e0b] border-[#f59e0b]/20" },
    expired: { label: "Expired", className: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20" },
    not_registered: { label: "N/A", className: "bg-[#f7f8fc] text-[#94a3b8] border-[#94a3b8]/20" },
  }
  const s = map[status]
  return <Badge variant="outline" className={cn("text-[10px] font-bold", s.className)}>{s.label}</Badge>
}

function getCategoryBadge(category: ProductCategory) {
  const colorMap: Record<string, string> = {
    skincare: "bg-[#f3efff] text-[#8b5cf6]",
    bodycare: "bg-[#ecfeff] text-[#06b6d4]",
    haircare: "bg-[#fef3c7] text-[#f59e0b]",
    suncare: "bg-[#fef3c7] text-[#f59e0b]",
    makeup: "bg-[#fde0e6] text-[#e11d48]",
    cleanser: "bg-[#e0f7f5] text-[#06b6d4]",
    supplement: "bg-[#ecfdf5] text-[#10b981]",
    fragrance: "bg-[#f3efff] text-[#8b5cf6]",
    other: "bg-[#f7f8fc] text-[#64748b]",
  }
  return (
    <span className={cn("inline-block rounded-md px-2 py-0.5 text-[10px] font-bold capitalize", colorMap[category] || colorMap.other)}>
      {category}
    </span>
  )
}

const PAGE_SIZE = 8

interface ProductTableProps {
  products: ProductListItem[]
  onRowClick: (id: string) => void
}

export function ProductTable({ products, onRowClick }: ProductTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("nameInternal")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(0)
  }

  const sorted = [...products].sort((a, b) => {
    const av = a[sortKey] ?? ""
    const bv = b[sortKey] ?? ""
    if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av
    return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const allSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id))

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary hover:bg-secondary">
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelected(new Set(paginated.map((p) => p.id)))
                    } else {
                      setSelected(new Set())
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-9"></TableHead>
              <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("nameInternal")}>
                Product Name <SortIcon col="nameInternal" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("sku")}>
                SKU <SortIcon col="sku" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("customerName")}>
                Customer / Brand <SortIcon col="customerName" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("category")}>
                Category <SortIcon col="category" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("sellingPrice")}>
                Price <SortIcon col="sellingPrice" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("totalCostPerUnit")}>
                Cost <SortIcon col="totalCostPerUnit" />
              </TableHead>
              <TableHead className="cursor-pointer select-none text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("marginPercent")}>
                Margin <SortIcon col="marginPercent" />
              </TableHead>
              <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">FDA</TableHead>
              <TableHead className="cursor-pointer select-none text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground" onClick={() => toggleSort("status")}>
                Status <SortIcon col="status" />
              </TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((product) => (
              <TableRow
                key={product.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-[rgba(76,139,245,0.03)]",
                  selected.has(product.id) && "bg-primary/[0.04]"
                )}
                onClick={() => onRowClick(product.id)}
              >
                <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(product.id)}
                    onCheckedChange={(checked) => {
                      const next = new Set(selected)
                      if (checked) next.add(product.id); else next.delete(product.id)
                      setSelected(next)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-[#e8ecf4] text-sm">
                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-[13px] font-bold text-foreground">{product.nameInternal}</div>
                    <div className="text-[10px] text-muted-foreground">{product.packageSize} - {product.containerType}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-[11px] font-bold text-primary">{product.sku}</span>
                </TableCell>
                <TableCell>
                  <div className="text-[12px] font-semibold text-foreground">{product.customerName}</div>
                  {product.brandName && (
                    <div className="text-[10px] text-muted-foreground">{product.brandName}</div>
                  )}
                </TableCell>
                <TableCell>{getCategoryBadge(product.category)}</TableCell>
                <TableCell className="text-right">
                  {product.sellingPrice ? (
                    <span className="font-mono text-[12px] font-bold text-foreground">
                      {"฿"}{product.sellingPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {"฿"}{product.totalCostPerUnit.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {product.marginPercent > 0 ? (
                    <span className={cn(
                      "font-mono text-[11px] font-bold",
                      product.marginPercent >= 80 ? "text-[#10b981]" : product.marginPercent >= 50 ? "text-[#f59e0b]" : "text-[#ef4444]"
                    )}>
                      +{product.marginPercent.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">{getFDABadge(product.fdaStatus)}</TableCell>
                <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRowClick(product.id)} aria-label="View product">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Duplicate product">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-[#ef4444]"
                      onClick={() => setDeleteTarget(product)}
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2.5">
          <div className="text-[11px] text-muted-foreground">
            {selected.size > 0 && <span className="mr-3 font-semibold text-primary">{selected.size} selected</span>}
            Page {page + 1} of {totalPages || 1} ({products.length} items)
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <Button
                key={i}
                variant={i === page ? "default" : "outline"}
                size="icon"
                className={cn("h-7 w-7 rounded-lg text-[11px]", i === page && "bg-primary text-primary-foreground")}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-lg"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.nameInternal}</strong> ({deleteTarget?.sku})? This will soft-delete the product (mark as inactive).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[10px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-[10px] bg-[#ef4444] text-card hover:bg-[#dc2626]"
              onClick={() => {
                toast.success(`Product "${deleteTarget?.nameInternal}" deleted`)
                setDeleteTarget(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
