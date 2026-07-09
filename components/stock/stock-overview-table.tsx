"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, ExternalLink, MoreHorizontal, PackagePlus, ArrowLeftRight, Tags, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvailabilityBar } from "./availability-bar"
import type { StockCard } from "@/lib/stock-types"
import {
  inventoryStatusLabels,
  inventoryStatusColors,
  itemTypeLabels,
  itemTypeColors,
} from "@/lib/stock-types"

interface StockOverviewTableProps {
  data: StockCard[]
}

export function StockOverviewTable({ data }: StockOverviewTableProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const categories = useMemo(() => {
    const cats = new Set(data.map((c) => c.category))
    return Array.from(cats).sort()
  }, [data])

  const filtered = useMemo(() => {
    return data.filter((card) => {
      const matchSearch =
        !search ||
        card.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        card.itemName.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "all" || card.itemType === typeFilter
      const matchStatus = statusFilter === "all" || card.inventoryStatus === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [data, search, typeFilter, statusFilter])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <h3 className="text-sm font-bold text-foreground">Stock Card Overview</h3>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              className="h-9 w-[200px] rounded-full pl-9 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="raw_material">{itemTypeLabels.raw_material}</SelectItem>
              <SelectItem value="packaging">{itemTypeLabels.packaging}</SelectItem>
              <SelectItem value="packaging_aux">{itemTypeLabels.packaging_aux}</SelectItem>
              <SelectItem value="finished_good">{itemTypeLabels.finished_good}</SelectItem>
              <SelectItem value="overhead">{itemTypeLabels.overhead}</SelectItem>
              <SelectItem value="labor">{itemTypeLabels.labor}</SelectItem>
              <SelectItem value="tester">{itemTypeLabels.tester}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[150px] rounded-xl text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="over_stock">Over Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-secondary">
              <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item Details</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Physical</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-amber-600">Reserved</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-blue-600">Incoming</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-emerald-600">Available</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Availability</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-muted-foreground">
                  No stock cards match your filters
                </td>
              </tr>
            ) : (
              filtered.map((card) => (
                <tr key={card.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{card.itemCode}</span>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 rounded-md border-0 font-semibold ${itemTypeColors[card.itemType]}`}>
                          {itemTypeLabels[card.itemType]}
                        </Badge>
                      </div>
                      <span className="text-[12px] font-medium text-foreground">{card.itemName}</span>
                      {card.location && (
                        <span className="text-[10px] text-muted-foreground">{card.location} &bull; {card.unit}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono text-xs font-bold">{card.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="font-mono text-xs font-bold text-amber-600">{card.reservedStock.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {card.incomingStock > 0 ? (
                      <span className="font-mono text-xs font-bold text-blue-600">+{card.incomingStock.toLocaleString()}</span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`font-mono text-xs font-extrabold ${card.available <= 0 ? "text-red-600" : card.inventoryStatus === "low" ? "text-amber-600" : "text-emerald-600"}`}>
                      {card.available.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="mx-auto w-24">
                      <AvailabilityBar
                        balance={card.balance}
                        reserved={card.reservedStock}
                        incoming={card.incomingStock}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold ${inventoryStatusColors[card.inventoryStatus]}`}>
                      {inventoryStatusLabels[card.inventoryStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 rounded-lg text-[11px] text-primary hover:text-primary" asChild>
                        <Link href={`/stock/${card.id}`}>
                          Detail <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10">
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/stock/${card.id}`}><Eye className="mr-2 h-3.5 w-3.5" /> View Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast({ title: "Receive Stock", description: `Adding stock for ${card.itemCode}` })}>
                            <PackagePlus className="mr-2 h-3.5 w-3.5" /> Receive (Buy In)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "Issue Stock", description: `Issuing stock from ${card.itemCode}` })}>
                            <PackagePlus className="mr-2 h-3.5 w-3.5 rotate-180" /> Issue (Out)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast({ title: "Transfer", description: `Transfer ${card.itemCode} between locations` })}>
                            <ArrowLeftRight className="mr-2 h-3.5 w-3.5" /> Transfer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => toast({ title: "Print Label", description: `Printing label for ${card.itemCode}` })}>
                            <Tags className="mr-2 h-3.5 w-3.5" /> Print Label
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-secondary px-5 py-2.5 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-500" /> Reserved</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500" /> Incoming</span>
        <span className="text-border">|</span>
        <strong className="font-semibold text-foreground">Available = Physical - Reserved + Incoming</strong>
      </div>
    </div>
  )
}
