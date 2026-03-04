"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, ChevronRight, Pencil, Package, MapPin, Thermometer,
  Barcode, FlaskConical, ClipboardList, Lock, Layers, AlertTriangle,
  TrendingUp, TrendingDown, ArrowDownToLine, DollarSign, Calendar,
  FileText, ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mockStockCards, mockStockMovements, mockStockLots, mockReservations, mockLinkedProducts,
} from "@/lib/stock-mock-data"
import {
  inventoryStatusLabels, inventoryStatusColors, stockStatusColors,
  itemTypeLabels, itemTypeColors, movementTypeLabels, movementTypeColors,
  movementStatusColors,
} from "@/lib/stock-types"
import { AvailabilityBar } from "@/components/stock/availability-bar"

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const card = mockStockCards.find((c) => c.id === params.id)

  if (!card) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Stock Card not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/stock")}>Back to Stock</Button>
        </div>
      </div>
    )
  }

  const cardMovements = mockStockMovements.filter((m) => m.stockCardId === card.id)
  const cardLots = mockStockLots.filter((l) => l.stockCardId === card.id)
  const cardReservations = mockReservations.filter((r) => r.stockCardId === card.id)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Link href="/stock" className="hover:text-primary transition-colors font-medium">Stock v3</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">{card.itemCode}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push("/stock")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold tracking-tight text-foreground truncate">{card.itemCode}</h1>
              <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-lg border-0", inventoryStatusColors[card.inventoryStatus])}>
                {inventoryStatusLabels[card.inventoryStatus]}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-lg border-0", stockStatusColors[card.status])}>
                {card.status}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-lg border-0", itemTypeColors[card.itemType])}>
                {itemTypeLabels[card.itemType]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{card.itemName}</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-xl text-[11px]">
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          <MiniStat icon={Package} label="Physical" value={card.balance.toLocaleString()} unit={card.unit} />
          <MiniStat icon={Lock} label="Reserved" value={card.reservedStock.toLocaleString()} color="text-amber-600" />
          <MiniStat icon={ArrowDownToLine} label="Incoming" value={card.incomingStock > 0 ? `+${card.incomingStock.toLocaleString()}` : "-"} color="text-blue-600" />
          <MiniStat icon={TrendingUp} label="Available" value={card.available.toLocaleString()} color={card.available <= 0 ? "text-red-600" : "text-emerald-600"} />
          <MiniStat icon={TrendingDown} label="Min Stock" value={card.minStock.toLocaleString()} />
          <MiniStat icon={TrendingUp} label="Max Stock" value={card.maxStock.toLocaleString()} />
          {card.unitCost !== undefined && (
            <MiniStat icon={DollarSign} label="Unit Cost" value={`${card.unitCost.toLocaleString()}`} />
          )}
        </div>

        <div className="mt-3">
          <AvailabilityBar balance={card.balance} reserved={card.reservedStock} incoming={card.incomingStock} />
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-card border border-border rounded-2xl p-1 h-auto flex flex-wrap gap-0.5 w-fit">
            <TabsTrigger value="overview" className="rounded-xl text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_8px_rgba(76,139,245,0.3)]">Overview</TabsTrigger>
            <TabsTrigger value="lots" className="rounded-xl text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_8px_rgba(76,139,245,0.3)]">
              Lots ({cardLots.length})
            </TabsTrigger>
            <TabsTrigger value="movements" className="rounded-xl text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_8px_rgba(76,139,245,0.3)]">
              Movements ({cardMovements.length})
            </TabsTrigger>
            <TabsTrigger value="linked" className="rounded-xl text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_8px_rgba(76,139,245,0.3)]">
              Linked Products
            </TabsTrigger>
            <TabsTrigger value="reservations" className="rounded-xl text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_2px_8px_rgba(76,139,245,0.3)]">
              Reservations ({cardReservations.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Card Info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4">Item Information</h3>
                <div className="flex flex-col gap-3">
                  <DetailRow label="Item Code" value={card.itemCode} mono />
                  <DetailRow label="Item Name" value={card.itemName} />
                  {card.itemNameEn && <DetailRow label="English Name" value={card.itemNameEn} />}
                  <DetailRow label="Category" value={card.category} />
                  <DetailRow label="Unit" value={card.unit} />
                  {card.supplier && <DetailRow label="Supplier" value={card.supplier} />}
                  {card.location && <DetailRow label="Location" value={card.location} icon={MapPin} />}
                  {card.barcode && <DetailRow label="Barcode" value={card.barcode} icon={Barcode} mono />}
                  {card.storageTemp && <DetailRow label="Storage Temp" value={card.storageTemp} icon={Thermometer} />}
                </div>
              </div>

              {/* Scientific Info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground mb-4">Scientific / Regulatory</h3>
                <div className="flex flex-col gap-3">
                  {card.tradeName && <DetailRow label="Trade Name" value={card.tradeName} />}
                  {card.inciName && <DetailRow label="INCI Name" value={card.inciName} />}
                  {card.casNo && <DetailRow label="CAS Number" value={card.casNo} mono />}
                  <DetailRow label="Reorder Point" value={card.reorderPoint.toLocaleString()} />
                  <DetailRow label="Initial Stock" value={card.initialStock.toLocaleString()} />
                  <DetailRow label="Created" value={new Date(card.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} icon={Calendar} />
                  <DetailRow label="Updated" value={new Date(card.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} icon={Calendar} />
                </div>
              </div>

              {/* Sufficiency Check */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-bold text-foreground mb-3">Quick Sufficiency Check</h3>
                <div className="flex items-start gap-3 rounded-xl bg-[#e0f2fe] p-3 text-xs text-blue-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Enter a required quantity to check if this stock card has enough available material. Available: <strong className="font-bold">{card.available.toLocaleString()} {card.unit}</strong></span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Lots Tab */}
          <TabsContent value="lots" className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-bold text-foreground">Stock Lots (FEFO Order)</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Opened lots first, then sealed by expiry date ascending</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lot Number</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reserved</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expiry</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardLots.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No lots found for this stock card</td></tr>
                    ) : (
                      cardLots.map((lot) => {
                        const expiryClass = getExpiryClass(lot.expireDate)
                        return (
                          <tr key={lot.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-mono text-xs font-bold">{lot.lotNumber}</span>
                                {lot.parentLotId && (
                                  <div className="text-[10px] text-muted-foreground mt-0.5">Opened from parent</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-xs font-bold">{lot.quantity.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-xs text-amber-600">{lot.reservedQty.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center">
                              {lot.expireDate ? (
                                <span className={cn("text-xs font-medium", expiryClass)}>
                                  {new Date(lot.expireDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold", lot.lotCategory === "sealed" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700")}>
                                {lot.lotCategory}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold", lot.status === "available" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                {lot.status}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Movements Tab */}
          <TabsContent value="movements" className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-bold text-foreground">Movement History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cardMovements.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No movements for this stock card</td></tr>
                    ) : (
                      cardMovements.map((mv) => {
                        const isIncoming = ["buy_in", "adjust_in", "return", "found"].includes(mv.movementType)
                        return (
                          <tr key={mv.id} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{mv.referenceNumber}</span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold", movementTypeColors[mv.movementType])}>
                                {isIncoming ? "+" : "-"} {movementTypeLabels[mv.movementType]}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={cn("font-mono text-xs font-bold", isIncoming ? "text-emerald-600" : "text-red-600")}>
                                {isIncoming ? "+" : "-"}{mv.quantity.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold capitalize", movementStatusColors[mv.status])}>
                                {mv.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(mv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{mv.notes ?? "-"}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Linked Products Tab */}
          <TabsContent value="linked" className="mt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-3">
                <h3 className="text-sm font-bold text-foreground">Linked Products & Formulas</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Products and formulas that use this material</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Code</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Component</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLinkedProducts.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No linked products</td></tr>
                    ) : (
                      mockLinkedProducts.map((lp) => (
                        <tr key={`${lp.entityType}-${lp.entityId}`} className="border-b border-border transition-colors hover:bg-primary/[0.02]">
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold capitalize", lp.entityType === "formula" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700")}>
                              {lp.entityType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-primary">{lp.code}</td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground">{lp.name}</td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">{lp.componentType}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs font-bold">{lp.quantity}</td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">{lp.unit}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="mt-5">
            <div className="flex flex-col gap-3">
              {cardReservations.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border bg-secondary p-12 text-center text-sm text-muted-foreground">
                  No active reservations
                </div>
              ) : (
                cardReservations.map((res) => {
                  const isActive = res.status === "active"
                  return (
                    <div
                      key={res.id}
                      className={cn(
                        "flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md",
                        isActive ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-zinc-300 opacity-70"
                      )}
                    >
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold bg-secondary px-2 py-0.5 rounded-md">{res.jobNo}</span>
                          <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 rounded-lg border-0 font-semibold capitalize", isActive ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-600")}>
                            {res.status}
                          </Badge>
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          Reserved: <span className="font-mono font-bold text-foreground">{res.reservedQuantity.toLocaleString()}</span>
                          {" "}on {new Date(res.reservedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Helper components
function MiniStat({ icon: Icon, label, value, unit, color }: { icon: typeof Package; label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className={cn("text-sm font-extrabold tracking-tight", color ?? "text-foreground")}>
          {value}
          {unit && <span className="text-[10px] font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: typeof Package }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <span className={cn("text-xs font-semibold text-foreground", mono && "font-mono")}>{value}</span>
    </div>
  )
}

function getExpiryClass(expireDate?: string): string {
  if (!expireDate) return ""
  const date = new Date(expireDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntilExpiry < 0) return "text-red-600 font-bold"
  if (daysUntilExpiry <= 30) return "text-amber-600 font-semibold"
  return ""
}
