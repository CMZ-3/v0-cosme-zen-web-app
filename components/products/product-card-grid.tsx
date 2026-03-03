"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag } from "lucide-react"
import type { ProductListItem, ProductStatus, FDAStatus } from "@/lib/product-types"
import { cn } from "@/lib/utils"

function getStatusDot(status: ProductStatus) {
  const map: Record<ProductStatus, string> = {
    active: "bg-[#10b981]",
    in_development: "bg-[#8b5cf6]",
    draft: "bg-[#94a3b8]",
    discontinued: "bg-[#ef4444]",
  }
  return <span className={cn("inline-block h-2 w-2 rounded-full", map[status])} />
}

function getFDALabel(status: FDAStatus) {
  const map: Record<FDAStatus, { label: string; color: string }> = {
    approved: { label: "FDA Approved", color: "text-[#10b981]" },
    pending: { label: "FDA Pending", color: "text-[#f59e0b]" },
    expired: { label: "FDA Expired", color: "text-[#ef4444]" },
    not_registered: { label: "No FDA", color: "text-[#94a3b8]" },
  }
  const s = map[status]
  return <span className={cn("text-[9px] font-bold", s.color)}>{s.label}</span>
}

interface ProductCardGridProps {
  products: ProductListItem[]
  onCardClick: (id: string) => void
}

export function ProductCardGrid({ products, onCardClick }: ProductCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer overflow-hidden border-border transition-all hover:shadow-md hover:-translate-y-0.5"
          onClick={() => onCardClick(product.id)}
        >
          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-secondary to-[#e8ecf4]">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <CardContent className="p-3.5">
            <div className="mb-1 flex items-center gap-1.5">
              {getStatusDot(product.status)}
              <span className="font-mono text-[10px] font-bold text-primary">{product.sku}</span>
            </div>
            <h3 className="mb-0.5 text-[13px] font-bold leading-tight text-foreground">{product.nameInternal}</h3>
            <div className="mb-2 text-[10px] text-muted-foreground">{product.customerName}</div>
            <div className="flex items-center justify-between">
              <div>
                {product.sellingPrice ? (
                  <span className="font-mono text-sm font-bold text-foreground">{"฿"}{product.sellingPrice}</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">No price</span>
                )}
              </div>
              <div className="text-right">
                {getFDALabel(product.fdaStatus)}
                {product.marginPercent > 0 && (
                  <div className="font-mono text-[10px] font-bold text-[#10b981]">+{product.marginPercent.toFixed(1)}%</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
