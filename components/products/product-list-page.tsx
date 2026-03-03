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
import { mockProducts } from "@/lib/mock-data"
import type { ProductKPISummary } from "@/lib/product-types"
import { cn } from "@/lib/utils"
import Link from "next/link"

const categoryDefs = [
  { value: "all", label: "All" },
  { value: "skincare", label: "Skincare" },
  { value: "bodycare", label: "Bodycare" },
  { value: "haircare", label: "Haircare" },
  { value: "supplement", label: "Supplement" },
  { value: "other", label: "Other" },
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

  // Dynamic category counts
  const categories = useMemo(() => {
    return categoryDefs.map((cat) => ({
      ...cat,
      count: cat.value === "all"
        ? mockProducts.length
        : mockProducts.filter((p) => {
            const otherCats = categoryDefs.filter((c) => c.value !== "all" && c.value !== "other").map((c) => c.value)
            if (cat.value === "other") return !otherCats.includes(p.category)
            return p.category === cat.value
          }).length,
    }))
  }, [])

  // Dynamic KPI
  const kpi: ProductKPISummary = useMemo(() => ({
    total: mockProducts.length,
    active: mockProducts.filter((p) => p.status === "active").length,
    inDevelopment: mockProducts.filter((p) => p.status === "in_development").length,
    fdaWarning: mockProducts.filter((p) => p.fdaStatus === "expired" || p.fdaStatus === "pending").length,
    discontinued: mockProducts.filter((p) => p.status === "discontinued").length,
  }), [])

  const filteredProducts = useMemo(() => {
    let items = mockProducts
    if (activeCategory !== "all") {
      const otherCats = categoryDefs.filter((c) => c.value !== "all" && c.value !== "other").map((c) => c.value)
      if (activeCategory === "other") {
        items = items.filter((p) => !otherCats.includes(p.category))
      } else {
        items = items.filter((p) => p.category === activeCategory)
      }
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
            {categories.map((cat) => {
              const isActive = activeCategory === cat.value
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="rounded-lg px-3.5 py-1.5 text-[12px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_6px_rgba(76,139,245,0.25)]"
                >
                  {cat.label}
                  <span className={cn(
                    "ml-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary/80 text-muted-foreground"
                  )}>
                    {cat.count}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* KPI Stats */}
        <div className="mb-5">
          <ProductKPIStats data={kpi} />
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
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="mt-4 text-sm font-bold text-foreground">No products found</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {search ? `No results for "${search}"` : "Try adjusting your filters"}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-[10px] text-[11px] font-semibold"
              onClick={() => { setSearch(""); setActiveCategory("all"); setActiveStatus("all") }}
            >
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "table" ? (
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
