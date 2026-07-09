"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Search, Plus, Building, User, MoreHorizontal, Pencil, Archive, Eye, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { CustomerListItem } from "@/lib/customer-types"
import { TIER_MAP } from "@/lib/customer-types"

type FilterTab = "all" | "platinum" | "gold" | "silver" | "standard"

interface CustomerListPanelProps {
  customers: CustomerListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNewClick: () => void
  onEditRequest: (id: string) => void
  onArchive: (id: string, name: string) => void
  onDelete: (id: string, name: string) => void
}

export function CustomerListPanel({ customers, selectedId, onSelect, onNewClick, onEditRequest, onArchive, onDelete }: CustomerListPanelProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("all")
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const counts = useMemo(() => ({
    all: customers.filter(c => c.isActive).length,
    platinum: customers.filter(c => c.customerTier === "platinum" && c.isActive).length,
    gold: customers.filter(c => c.customerTier === "gold" && c.isActive).length,
    silver: customers.filter(c => c.customerTier === "silver" && c.isActive).length,
    standard: customers.filter(c => c.customerTier === "standard" && c.isActive).length,
  }), [customers])

  const filtered = useMemo(() => {
    return customers.filter(c => {
      if (!c.isActive) return false
      const matchesFilter = filter === "all" || c.customerTier === filter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [customers, filter, search])

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "platinum", label: "Platinum", count: counts.platinum },
    { key: "gold", label: "Gold", count: counts.gold },
    { key: "silver", label: "Silver", count: counts.silver },
    { key: "standard", label: "Std", count: counts.standard },
  ]

  return (
    <div className="flex w-[320px] min-w-[320px] flex-col border-r border-border bg-secondary/50 h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-foreground">Customers</h2>
          <Button size="sm" className="h-7 w-7 rounded-lg p-0" onClick={onNewClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Name, Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-[13px] font-sans outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-0.5 rounded-[10px] border border-border bg-secondary/70 p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-[10px] font-semibold transition-all",
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label} <span className="opacity-60">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-[12px] text-muted-foreground">No customers found</div>
        )}
        {filtered.map(c => {
          const isSelected = c.id === selectedId
          const tierInfo = TIER_MAP[c.customerTier]

          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "group w-full text-left mb-1 rounded-2xl border px-4 py-3.5 transition-all",
                isSelected
                  ? "border-primary/30 bg-primary/[0.06] shadow-[0_2px_10px_rgba(76,139,245,0.12)]"
                  : "border-transparent bg-transparent hover:bg-card hover:border-border hover:shadow-sm"
              )}
            >
              {/* Row 1 -- Name + Tier Badge + Actions */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    c.customerType === "juristic"
                      ? "bg-[#eef4ff] text-primary"
                      : "bg-[#f5f3ff] text-[#7c3aed]"
                  )}>
                    {c.customerType === "juristic" ? <Building className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-[13px] font-bold leading-tight truncate", isSelected ? "text-primary" : "text-foreground")}>
                      {c.customerName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.customerCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold border", tierInfo.color, tierInfo.bg, tierInfo.border)}>
                    {tierInfo.label}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div role="button" tabIndex={0} className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(c.id) }}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditRequest(c.id) }}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={(e) => { e.stopPropagation(); onArchive(c.id, c.customerName) }}>
                        <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: c.id, name: c.customerName }) }}>
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Row 2 -- Stats */}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground ml-10">
                <span>{c.totalOrders} orders</span>
                <span className="h-0.5 w-0.5 rounded-full bg-border" />
                <span>{c.productCount} products</span>
                <span className="h-0.5 w-0.5 rounded-full bg-border" />
                <span>{c.brandCount} brands</span>
              </div>

              {/* Row 3 -- Contact + Revenue */}
              <div className="flex items-center justify-between mt-1.5 ml-10">
                <span className="text-[10px] text-muted-foreground truncate">{c.contactPerson}</span>
                <span className="text-[11px] font-bold text-foreground">
                  {"\u0e3f"}{(c.totalRevenue / 1000000).toFixed(1)}M
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบลูกค้า</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ &quot;{deleteTarget?.name}&quot; อย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id, deleteTarget.name)
                setDeleteTarget(null)
              }}
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
