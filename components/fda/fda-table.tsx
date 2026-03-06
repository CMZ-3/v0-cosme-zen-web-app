"use client"

import { useState, useMemo } from "react"
import { Search, Eye, Pencil, Trash2, FileText, MoreHorizontal, CalendarClock, Factory, FlaskConical, X, Download, ChevronLeft, ChevronRight, Send, Copy } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { FdaListItem, FdaStatus } from "@/lib/fda-types"
import { REGISTRATION_TYPE_MAP, FDA_STATUS_MAP } from "@/lib/fda-types"
import { cn } from "@/lib/utils"

interface FdaTableProps {
  data: FdaListItem[]
  onRowClick: (id: string) => void
}

const statusPills: { value: FdaStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "expired", label: "Expired" },
]

const extraFilters = [
  { label: "Expiry", icon: CalendarClock },
  { label: "ผู้ผลิต", icon: Factory },
  { label: "ส่วนผสม", icon: FlaskConical },
]

const PAGE_SIZE = 15

export function FdaTable({ data, onRowClick }: FdaTableProps) {
  const [search, setSearch] = useState("")
  const [activeStatus, setActiveStatus] = useState<FdaStatus | "all">("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = data
    if (activeStatus !== "all") {
      list = list.filter((r) => r.status === activeStatus)
    }
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
    return list
  }, [data, search, activeStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: data.length }
    statusPills.forEach((p) => {
      if (p.value !== "all") counts[p.value] = data.filter((r) => r.status === p.value).length
    })
    return counts
  }, [data])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((r) => r.id)))
  }

  const getValidityBadge = (days?: number, status?: FdaStatus) => {
    if (status === "expired") return <span className="rounded-md bg-[#ef4444]/10 px-2 py-0.5 text-[10px] font-bold text-[#ef4444]">หมดอายุ</span>
    if (days === undefined) return <span className="text-xs text-muted-foreground">--</span>
    if (days <= 60) return <span className="rounded-md bg-[#f97316]/10 px-2 py-0.5 text-[10px] font-bold text-[#f97316]">{days}d</span>
    return <span className="rounded-md bg-[#10b981]/10 px-2 py-0.5 text-[10px] font-bold text-[#10b981]">{days}d</span>
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Status Pills + Extra Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหา ชื่อ, เลขจดแจ้ง, ชื่อการค้า, ผู้นำเข้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 pr-8 rounded-xl border-border bg-card text-[12px]"
          />
          {search && (
            <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Status pill filters */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {statusPills.map((pill) => {
            const isActive = activeStatus === pill.value
            const count = statusCounts[pill.value] ?? 0
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => setActiveStatus(pill.value)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                  isActive
                    ? "bg-[#10b981] text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {pill.label}
                <span className={cn(
                  "rounded-md px-1 py-px text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "text-muted-foreground/70"
                )}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Extra filter chips */}
        <div className="flex items-center gap-1.5 ml-auto">
          {extraFilters.map((f) => (
            <button
              key={f.label}
              type="button"
              className="flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <f.icon className="h-3 w-3" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 text-center">
                <Checkbox
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[60px]">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[140px]">เลขจดแจ้ง</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ผลิตภัณฑ์</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[140px]">ลูกค้า</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[60px] text-center">ส่วนผสม</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[90px] text-center">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[100px]">หมดอายุ</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[70px] text-center">Validity</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[80px] text-right">ค่าบริการ</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-[90px] text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">ไม่พบข้อมูลทะเบียน</p>
                    <p className="text-[11px] text-muted-foreground/70">{search ? `ไม่พบ "${search}"` : "ลองเปลี่ยนตัวกรอง"}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => {
                const typeCfg = REGISTRATION_TYPE_MAP[row.registrationType]
                const statusCfg = FDA_STATUS_MAP[row.status]
                return (
                  <TableRow
                    key={row.id}
                    className="group cursor-pointer transition-colors hover:bg-secondary/40"
                    onClick={() => onRowClick(row.id)}
                  >
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggleSelect(row.id)} />
                    </TableCell>

                    {/* TYPE */}
                    <TableCell>
                      <span className={cn("inline-flex rounded-md px-2.5 py-1 text-[11px] font-extrabold", typeCfg.bg, typeCfg.color)}>
                        {typeCfg.label}
                      </span>
                    </TableCell>

                    {/* Registration number */}
                    <TableCell>
                      {row.registrationNumber ? (
                        <span className="font-mono text-[12px] font-medium text-foreground">{row.registrationNumber}</span>
                      ) : (
                        <span className="text-[12px] italic text-muted-foreground/60">
                          {row.status === "draft" ? "-- (Draft)" : "-- (รอเลข)"}
                        </span>
                      )}
                    </TableCell>

                    {/* Product name */}
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{row.productNameTh}</p>
                        {row.productNameEn && (
                          <p className="text-[11px] text-muted-foreground/70 truncate">{row.productNameEn}</p>
                        )}
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <p className="text-[12px] text-primary font-medium truncate max-w-[130px]">{row.customerName ?? "--"}</p>
                    </TableCell>

                    {/* Ingredient count */}
                    <TableCell className="text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                        {row.ingredientCount ?? "--"}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold", statusCfg.bg, statusCfg.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                    </TableCell>

                    {/* Expiry */}
                    <TableCell>
                      {row.expiryDate ? (
                        <p className={cn(
                          "text-[12px] font-medium",
                          row.daysUntilExpiry !== undefined && row.daysUntilExpiry <= 60 ? "text-[#f97316]" : "text-foreground"
                        )}>
                          {row.expiryDate}
                        </p>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">--</span>
                      )}
                    </TableCell>

                    {/* Validity */}
                    <TableCell className="text-center">
                      {getValidityBadge(row.daysUntilExpiry, row.status)}
                    </TableCell>

                    {/* Service fee */}
                    <TableCell className="text-right">
                      <span className="text-[12px] font-semibold text-foreground">
                        {row.serviceFee ? `\u0e3f${row.serviceFee.toLocaleString()}` : "--"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5 opacity-60 group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => onRowClick(row.id)}>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {row.status === "draft" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.info(`Editing ${row.registrationCode}`)}>
                              <Pencil className="h-3.5 w-3.5 text-primary" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.error(`Deleted ${row.registrationCode}`)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                        {row.status === "approved" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.success(`Downloading certificate for ${row.registrationCode}`)}>
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                        {row.status === "submitted" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.success(`Approved ${row.registrationCode}`)}>
                              <FileText className="h-3.5 w-3.5 text-[#10b981]" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.error(`Rejected ${row.registrationCode}`)}>
                              <X className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                        {(row.status === "expired" || row.status === "rejected") && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => toast.info(`Renewing ${row.registrationCode}`)}>
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[12px] text-muted-foreground">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} registrations
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-semibold transition-all",
                p === page ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {p}
            </button>
          ))}
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-xl">
          <span className="text-[12px] font-bold text-foreground">
            {selected.size} selected
          </span>
          <div className="h-5 w-px bg-border" />
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-[11px]" onClick={() => toast.success(`Exporting ${selected.size} registrations...`)}>
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-[11px]" onClick={() => toast.info(`Submitting ${selected.size} registrations...`)}>
            <Send className="h-3 w-3" /> Submit All
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-[11px] text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { toast.error(`Deleted ${selected.size} registrations`); setSelected(new Set()) }}>
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
          <button type="button" className="ml-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-secondary" onClick={() => setSelected(new Set())}>
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}
