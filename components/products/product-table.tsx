"use client"

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
import { Eye, Copy, ShoppingBag } from "lucide-react"
import type { ProductListItem, ProductStatus, FDAStatus, ProductCategory } from "@/lib/product-types"
import { cn } from "@/lib/utils"

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

interface ProductTableProps {
  products: ProductListItem[]
  onRowClick: (id: string) => void
}

export function ProductTable({ products, onRowClick }: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="w-10 pl-4">
              <Checkbox />
            </TableHead>
            <TableHead className="w-9"></TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Name</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SKU</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer / Brand</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cost</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin</TableHead>
            <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">FDA</TableHead>
            <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="cursor-pointer transition-colors hover:bg-[rgba(76,139,245,0.02)]"
              onClick={() => onRowClick(product.id)}
            >
              <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                <Checkbox />
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
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRowClick(product.id)}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
