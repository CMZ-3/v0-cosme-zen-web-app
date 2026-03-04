"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Search, Plus, MoreHorizontal, Pencil, Star, Archive, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import type { SupplierListItem, SupplierStatus } from "@/lib/supplier-types"
import { SUPPLIER_TYPE_MAP, GRADE_MAP } from "@/lib/supplier-types"

type FilterTab = "active" | "pending" | "issue"

interface SupplierListPanelProps {
  suppliers: SupplierListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onNewClick: () => void
}

export function SupplierListPanel({ suppliers, selectedId, onSelect, onNewClick }: SupplierListPanelProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterTab>("active")

  const counts = useMemo(() => ({
    active: suppliers.filter(s => s.status === "active").length,
    pending: suppliers.filter(s => s.status === "pending").length,
    issue: suppliers.filter(s => s.status === "issue").length,
  }), [suppliers])

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const matchesFilter = s.status === filter
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        s.supplierName.toLowerCase().includes(q) ||
        s.supplierCode.toLowerCase().includes(q) ||
        s.materialTags.some(t => t.label.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [suppliers, filter, search])

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: counts.active },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "issue", label: "Issue", count: counts.issue },
  ]

  return (
    <div className="flex w-[320px] min-w-[320px] flex-col border-r border-border bg-secondary/50 h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-foreground">Suppliers</h2>
          <Button size="sm" className="h-7 w-7 rounded-lg p-0" onClick={onNewClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-2.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Supplier, Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-[13px] font-sans outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 rounded-[10px] border border-border bg-secondary/70 p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-[11px] font-semibold transition-all",
                filter === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[13px] text-muted-foreground">
            No suppliers found
          </div>
        )}
        {filtered.map((sup) => {
          const isSelected = sup.id === selectedId
          const gradeGradient = GRADE_MAP[sup.grade]
          const typeInfo = SUPPLIER_TYPE_MAP[sup.supplierType]
          const flag = sup.country === "Japan" ? "\u{1f1ef}\u{1f1f5}" :
            sup.country === "Germany" ? "\u{1f1e9}\u{1f1ea}" :
            sup.country === "Korea" ? "\u{1f1f0}\u{1f1f7}" :
            sup.country === "China" ? "\u{1f1e8}\u{1f1f3}" :
            sup.country === "Thailand" ? "\u{1f1f9}\u{1f1ed}" : ""

          return (
            <div
              key={sup.id}
              onClick={() => onSelect(sup.id)}
              className={cn(
                "group rounded-xl p-3.5 px-4 cursor-pointer transition-all border mb-1",
                isSelected
                  ? "bg-card border-primary shadow-sm border-l-4 border-l-primary"
                  : "border-transparent hover:bg-card hover:border-border"
              )}
            >
              <div className="flex items-start justify-between mb-0.5">
                <span className="text-[14px] font-bold text-foreground leading-tight">
                  {flag} {sup.supplierName}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] font-extrabold text-card bg-gradient-to-br",
                    gradeGradient
                  )}>
                    {sup.grade}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div role="button" tabIndex={0} className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(sup.id) }}>
                        <Eye className="mr-2 h-3.5 w-3.5" /> View Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Edit Supplier", description: sup.supplierName }) }}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toast({ title: "Rate Supplier", description: `Rating ${sup.supplierName}` }) }}>
                        <Star className="mr-2 h-3.5 w-3.5" /> Rate Supplier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={(e) => { e.stopPropagation(); toast({ title: "Archived", description: `${sup.supplierName} archived` }) }}>
                        <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground mt-0.5">
                {sup.city}, {sup.country} &middot; {typeInfo.label}
              </div>

              {/* Material tags */}
              <div className="flex gap-1 flex-wrap mt-1.5">
                {sup.materialTags.map((tag, i) => (
                  <span key={i} className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", tag.bg, tag.color)}>
                    {tag.label}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] text-muted-foreground">{sup.supplierCode}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                  sup.status === "active" ? "bg-[#ecfdf5] text-[#15803d] border-[#bbf7d0]" :
                  sup.status === "pending" ? "bg-[#fef3c7] text-[#c2410c] border-[#fed7aa]" :
                  "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
                )}>
                  {sup.status === "active" ? "Active" : sup.status === "pending" ? "COA Expiring" : "Issue"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
