"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Download,
  Upload,
  ShoppingBag,
} from "lucide-react"
import { ProductKPIStats } from "./product-kpi-stats"
import { ProductTable } from "./product-table"
import { ProductCardGrid } from "./product-card-grid"
import { ProductDetailDrawer } from "./product-detail-drawer"
import { mockProducts, mockKPI } from "@/lib/mock-data"
import type { ProductCategory, ProductStatus } from "@/lib/product-types"
import Link from "next/link"

const categories: { value: string; label: string; count: number }[] = [
  { value: "all", label: "All", count: 248 },
  { value: "skincare", label: "Skincare", count: 124 },
  { value: "bodycare", label: "Bodycare", count: 48 },
  { value: "haircare", label: "Haircare", count: 28 },
  { value: "supplement", label: "Supplement", count: 22 },
  { value: "other", label: "Other", count: 26 },
]

const statusFilters: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "in_development", label: "In Dev" },
  { value: "draft", label: "Draft" },
  { value: "discontinued", label: "Discontinued" },
]

export function ProductListPage() {
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<string>("table")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeStatus, setActiveStatus] = useState("all")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    let items = mockProducts
    if (activeCategory !== "all") {
      items = items.filter((p) => p.category === activeCategory)
    }
    if (activeStatus !== "all") {
      items = items.filter((p) => p.status === activeStatus)
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.nameInternal.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q)
      )
    }
    return items
  }, [activeCategory, activeStatus, search])

  function handleRowClick(id: string) {
    setSelectedProductId(id)
    setDrawerOpen(true)
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-8 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Products</h1>
            <p className="text-[11px] text-muted-foreground">Manage products, BOM, costing & pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-[10px] text-[11px] font-semibold">
            <Upload className="h-3.5 w-3.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-[10px] text-[11px] font-semibold">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Link href="/products/new">
            <Button size="sm" className="h-8 gap-1.5 rounded-[10px] bg-primary text-[11px] font-semibold text-primary-foreground hover:bg-[#3b6fd4]">
              <Plus className="h-3.5 w-3.5" />
              New Product
            </Button>
          </Link>
        </div>
      </header>

      <div className="px-8 py-6">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-5">
          <TabsList className="h-10 bg-card border border-border rounded-xl p-1 gap-0.5">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="rounded-lg px-3.5 py-1.5 text-[12px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_6px_rgba(76,139,245,0.25)]"
              >
                {cat.label}
                <span className="ml-1.5 rounded-md bg-secondary/80 px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground">
                  {cat.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* KPI Stats */}
        <div className="mb-5">
          <ProductKPIStats data={mockKPI} />
        </div>

        {/* Search + View Toggle + Filter Chips */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-[10px] border-border bg-secondary pl-9 text-[13px]"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex gap-1.5">
            {statusFilters.map((sf) => (
              <button
                key={sf.value}
                onClick={() => setActiveStatus(sf.value)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  activeStatus === sf.value
                    ? "bg-primary text-primary-foreground shadow-[0_2px_6px_rgba(76,139,245,0.25)]"
                    : "bg-card text-muted-foreground border border-border hover:bg-secondary"
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v)}>
              <ToggleGroupItem value="table" className="h-8 w-8 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label="Table view">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="cards" className="h-8 w-8 rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" aria-label="Card view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Content */}
        {viewMode === "table" ? (
          <ProductTable products={filteredProducts} onRowClick={handleRowClick} />
        ) : (
          <ProductCardGrid products={filteredProducts} onCardClick={handleRowClick} />
        )}

        {/* Results count */}
        <div className="mt-3 text-[11px] text-muted-foreground">
          Showing {filteredProducts.length} of {mockProducts.length} products
        </div>
      </div>

      {/* Detail Drawer */}
      <ProductDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        productId={selectedProductId}
      />
    </>
  )
}
