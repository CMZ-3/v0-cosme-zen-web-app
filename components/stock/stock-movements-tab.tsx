"use client"

import { useState, useMemo } from "react"
import { Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { StockMovement, MovementType, MovementStatus } from "@/lib/stock-types"
import { movementTypeLabels, movementTypeColors, movementStatusColors } from "@/lib/stock-types"

interface StockMovementsTabProps {
  data: StockMovement[]
}

export function StockMovementsTab({ data }: StockMovementsTabProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

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
                const isIncoming = ["buy_in", "adjust_in", "return", "found"].includes(mv.movementType)
                return (
                  <tr key={mv.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{mv.referenceNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold ${movementTypeColors[mv.movementType]}`}>
                        {isIncoming ? "+" : "-"} {movementTypeLabels[mv.movementType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] text-primary">{mv.itemCode}</span>
                        <span className="text-xs text-muted-foreground">{mv.itemName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono text-xs font-bold ${isIncoming ? "text-emerald-600" : "text-red-600"}`}>
                        {isIncoming ? "+" : "-"}{mv.quantity.toLocaleString()}
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
                            <DropdownMenuItem className="text-xs gap-2"><Pencil className="h-3 w-3" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2 text-destructive"><Trash2 className="h-3 w-3" /> Delete</DropdownMenuItem>
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
    </div>
  )
}
