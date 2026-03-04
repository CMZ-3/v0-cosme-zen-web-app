"use client"

import { useState, useMemo } from "react"
import { Search, Eye, Pencil, Printer, Flag, MapPin, MoreHorizontal, ArrowUpDown, Copy, XCircle, Trash2, Truck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { DeliveryOrder, DeliveryStatus } from "@/lib/delivery-types"
import { deliveryStatusMap } from "@/lib/delivery-types"
import { customerAvatarColors } from "@/lib/delivery-mock-data"
import { cn } from "@/lib/utils"

const statusFilters: { value: DeliveryStatus | "all" | "pending_close"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reserved", label: "Preparing" },
  { value: "picking", label: "Picking" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Finished" },
  { value: "pending_close", label: "Pending Close" },
]

interface DeliveryTableProps {
  data: DeliveryOrder[]
  onRowClick?: (id: string) => void
}

const DELIVERY_PAGE_SIZE = 15

export function DeliveryTable({ data, onRowClick }: DeliveryTableProps) {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<"deliveryDate" | "totalAmount" | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filtered = useMemo(() => {
    let result = data

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "pending_close") {
        result = result.filter((d) => d.jobStatus === "pending_close")
      } else {
        result = result.filter((d) => d.status === statusFilter)
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.deliveryNumber.toLowerCase().includes(q) ||
          d.customerName.toLowerCase().includes(q) ||
          (d.salesOrderRef?.toLowerCase().includes(q) ?? false) ||
          (d.productSummary?.toLowerCase().includes(q) ?? false)
      )
    }

    // Sort
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = sortField === "totalAmount" ? (a.totalAmount ?? 0) : (a.deliveryDate ?? "")
        const bVal = sortField === "totalAmount" ? (b.totalAmount ?? 0) : (b.deliveryDate ?? "")
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, search, statusFilter, sortField, sortDir])

  const deliveryTotalPages = Math.max(1, Math.ceil(filtered.length / DELIVERY_PAGE_SIZE))
  const paged = filtered.slice((page - 1) * DELIVERY_PAGE_SIZE, page * DELIVERY_PAGE_SIZE)

  const handleSort = (field: "deliveryDate" | "totalAmount") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--"
    const d = new Date(dateStr)
    const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
    return `${d.getDate()} ${thMonths[d.getMonth()]}`
  }

  const isOverdue = (dateStr?: string, status?: string) => {
    if (!dateStr || status === "delivered" || status === "completed") return false
    return new Date(dateStr) < new Date()
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-all",
              statusFilter === f.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 min-w-[260px] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(76,139,245,0.1)]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DO, Order, Customer, Lot..."
            className="h-auto border-0 bg-transparent p-0 text-[13px] shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-[13px] font-bold text-foreground">
            Delivery Orders
            <span className="ml-2 text-muted-foreground font-normal">({filtered.length})</span>
          </h3>
        </div>
        <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[100px]">DO No.</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[80px]">Ref</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Product</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right w-[80px]">Qty</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[120px]">Shipping</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[110px]">Status</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[90px] cursor-pointer" onClick={() => handleSort("deliveryDate")}>
                  <span className="flex items-center gap-1">Delivery <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground text-right w-[100px] cursor-pointer" onClick={() => handleSort("totalAmount")}>
                  <span className="flex items-center justify-end gap-1">Amount <ArrowUpDown className="h-3 w-3" /></span>
                </TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[80px]">Job</TableHead>
                <TableHead className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row) => {
                const statusInfo = deliveryStatusMap[row.status]
                const avatarColor = customerAvatarColors[row.customerName] || "from-gray-400 to-gray-600"
                const overdue = isOverdue(row.deliveryDate, row.status)
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer transition-colors hover:bg-primary/[0.02]"
                    onClick={() => onRowClick?.(row.id)}
                  >
                    {/* DO Number */}
                    <TableCell>
                      <span className="font-mono text-[12px] font-bold text-teal-600">{row.deliveryNumber}</span>
                    </TableCell>

                    {/* Ref Order */}
                    <TableCell>
                      <span className="text-[11px] font-semibold text-primary cursor-pointer hover:underline">{row.salesOrderRef || "--"}</span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br text-[11px] font-bold text-white", avatarColor)}>
                          {getInitials(row.customerName)}
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-foreground">{row.customerName}</div>
                          {row.customerBrand && (
                            <div className="text-[10px] text-muted-foreground">{row.customerBrand}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <span className="text-[12px] text-foreground">{row.productSummary || "--"}</span>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-right">
                      <span className="font-mono text-[13px] font-bold text-foreground">
                        {row.totalQuantity?.toLocaleString() ?? "--"}
                      </span>
                    </TableCell>

                    {/* Shipping Method */}
                    <TableCell>
                      {row.shippingMethod ? (
                        <span className="inline-flex items-center gap-1 rounded-[10px] bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {row.shippingMethod}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">--</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-2xl px-3 py-1 text-[11px] font-semibold", statusInfo.bgColor, statusInfo.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.dotColor)} />
                        {statusInfo.labelTh}
                      </span>
                    </TableCell>

                    {/* Delivery Date */}
                    <TableCell>
                      <span className={cn(
                        "text-[12px] font-semibold",
                        row.actualDeliveryDate ? "text-emerald-600" : overdue ? "text-destructive" : "text-foreground"
                      )}>
                        {formatDate(row.actualDeliveryDate || row.deliveryDate)}
                        {row.actualDeliveryDate && " \u2713"}
                      </span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right">
                      <span className="font-mono text-[12px] font-bold text-foreground">
                        {row.totalAmount ? `\u0e3f${row.totalAmount.toLocaleString()}` : "--"}
                      </span>
                    </TableCell>

                    {/* Job Status */}
                    <TableCell>
                      {row.jobStatus === "pending_close" && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending</span>
                      )}
                      {row.jobStatus === "closed" && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Closed</span>
                      )}
                      {!row.jobStatus && <span className="text-[10px] text-muted-foreground">--</span>}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10"
                          title="View"
                          onClick={() => onRowClick?.(row.id)}
                        >
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10"
                          title="Print"
                          onClick={() => toast({ title: "Print DO", description: `Printing ${row.deliveryNumber}...` })}
                        >
                          <Printer className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-secondary transition-all hover:border-primary hover:bg-primary/10"
                            >
                              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => onRowClick?.(row.id)}>
                              <Eye className="mr-2 h-3.5 w-3.5" /> View Detail
                            </DropdownMenuItem>
                            {(row.status === "draft" || row.status === "reserved" || row.status === "picking") && (
                              <DropdownMenuItem onClick={() => toast({ title: "Edit", description: `Editing ${row.deliveryNumber}` })}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toast({ title: "Duplicated", description: `Cloned ${row.deliveryNumber}` })}>
                              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                            </DropdownMenuItem>
                            {row.status === "shipped" && (
                              <DropdownMenuItem onClick={() => toast({ title: "Tracking", description: row.trackingNumber || "No tracking yet" })}>
                                <MapPin className="mr-2 h-3.5 w-3.5" /> Track Shipment
                              </DropdownMenuItem>
                            )}
                            {row.jobStatus === "pending_close" && (
                              <DropdownMenuItem onClick={() => toast({ title: "Job Closed", description: `Closed job for ${row.deliveryNumber}` })}>
                                <Flag className="mr-2 h-3.5 w-3.5" /> Close Job
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {(row.status === "draft" || row.status === "reserved") && (
                              <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={() => toast({ title: "Cancelled", description: `${row.deliveryNumber} cancelled`, variant: "destructive" })}>
                                <XCircle className="mr-2 h-3.5 w-3.5" /> Cancel
                              </DropdownMenuItem>
                            )}
                            {row.status === "draft" && (
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => toast({ title: "Deleted", description: `${row.deliveryNumber} deleted`, variant: "destructive" })}>
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm font-semibold text-muted-foreground">No delivery orders found</p>
                      <p className="text-[11px] text-muted-foreground/70">{search ? `No results for "${search}"` : "Try changing your filters"}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-[12px] text-muted-foreground">
            Showing {Math.min((page - 1) * DELIVERY_PAGE_SIZE + 1, filtered.length)}-{Math.min(page * DELIVERY_PAGE_SIZE, filtered.length)} of {filtered.length} orders
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
            >
              <ArrowUpDown className="h-3 w-3 rotate-180" />
            </button>
            {Array.from({ length: Math.min(deliveryTotalPages, 5) }, (_, i) => i + 1).map((p) => (
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
            <button
              type="button"
              disabled={page >= deliveryTotalPages}
              onClick={() => setPage(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary disabled:opacity-30"
            >
              <ArrowUpDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
