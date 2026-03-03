"use client"

import { useState, useMemo } from "react"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FdaListItem, RegistrationType, FdaStatus } from "@/lib/fda-types"
import { REGISTRATION_TYPE_MAP, FDA_STATUS_MAP } from "@/lib/fda-types"

interface FdaTableProps {
  data: FdaListItem[]
  onRowClick: (id: string) => void
}

const ALL_STATUSES: FdaStatus[] = ["draft", "submitted", "approved", "rejected", "expired", "inactive"]
const ALL_TYPES: RegistrationType[] = ["jk", "jr"]

export function FdaTable({ data, onRowClick }: FdaTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FdaStatus[]>([])
  const [typeFilter, setTypeFilter] = useState<RegistrationType[]>([])

  const filtered = useMemo(() => {
    let list = data
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.productNameTh.toLowerCase().includes(s) ||
          (r.productNameEn?.toLowerCase().includes(s)) ||
          r.registrationCode.toLowerCase().includes(s) ||
          (r.registrationNumber?.toLowerCase().includes(s)) ||
          (r.tradeName?.toLowerCase().includes(s)) ||
          (r.customerName?.toLowerCase().includes(s))
      )
    }
    if (statusFilter.length > 0) list = list.filter((r) => statusFilter.includes(r.status))
    if (typeFilter.length > 0) list = list.filter((r) => typeFilter.includes(r.registrationType))
    return list
  }, [data, search, statusFilter, typeFilter])

  const clearFilters = () => {
    setSearch("")
    setStatusFilter([])
    setTypeFilter([])
  }

  const hasFilters = search || statusFilter.length > 0 || typeFilter.length > 0

  return (
    <div className="flex flex-col gap-3">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search product, code, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Type
              {typeFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {typeFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel className="text-xs">Registration Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_TYPES.map((t) => (
              <DropdownMenuCheckboxItem
                key={t}
                checked={typeFilter.includes(t)}
                onCheckedChange={(checked) => {
                  setTypeFilter((prev) =>
                    checked ? [...prev, t] : prev.filter((v) => v !== t)
                  )
                }}
              >
                <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${REGISTRATION_TYPE_MAP[t].bg.replace('bg-', 'bg-')}`} />
                {REGISTRATION_TYPE_MAP[t].label} ({REGISTRATION_TYPE_MAP[t].labelTh})
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Status
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_STATUSES.map((s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={statusFilter.includes(s)}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) =>
                    checked ? [...prev, s] : prev.filter((v) => v !== s)
                  )
                }}
              >
                <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${FDA_STATUS_MAP[s].dot}`} />
                {FDA_STATUS_MAP[s].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={clearFilters}>
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {data.length} registrations
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[150px]">Code</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider">Product Name</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[80px] text-center">Type</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[110px] text-center">Status</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[100px]">Expiry</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[140px]">Customer</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider w-[50px] text-center">Rnw</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => {
                const typeCfg = REGISTRATION_TYPE_MAP[row.registrationType]
                const statusCfg = FDA_STATUS_MAP[row.status]
                const isExpiringSoon = row.daysUntilExpiry !== undefined && row.daysUntilExpiry <= 90 && row.daysUntilExpiry > 0
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-secondary/40 transition-colors"
                    onClick={() => onRowClick(row.id)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-foreground">{row.registrationCode}</TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{row.productNameTh}</p>
                        {row.productNameEn && (
                          <p className="text-xs text-muted-foreground truncate">{row.productNameEn}</p>
                        )}
                        {row.tradeName && (
                          <p className="text-[10px] text-muted-foreground/70 truncate">Brand: {row.tradeName}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
                        {typeCfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      {row.expiryDate ? (
                        <div>
                          <p className={`text-xs font-medium ${isExpiringSoon ? "text-amber-600" : "text-foreground"}`}>
                            {row.expiryDate}
                          </p>
                          {isExpiringSoon && (
                            <p className="text-[10px] font-semibold text-amber-500">{row.daysUntilExpiry}d left</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-foreground truncate max-w-[130px]">{row.customerName ?? "--"}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.renewalCount > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {row.renewalCount}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
