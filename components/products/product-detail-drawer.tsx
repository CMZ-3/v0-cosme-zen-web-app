"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Image as ImageIcon,
  ClipboardList,
  DollarSign,
  FileText,
  Package,
  Paperclip,
  History,
  Edit,
  Printer,
  ShoppingBag,
  FlaskConical,
  Shield,
  Droplets,
  ThermometerSun,
} from "lucide-react"
import { mockProductDetail, mockLots, mockAudit } from "@/lib/mock-data"
import type { Product, ProductLot, AuditEntry, LotStatus, QCResult } from "@/lib/product-types"
import { cn } from "@/lib/utils"

interface ProductDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
}

export function ProductDetailDrawer({ open, onOpenChange, productId }: ProductDetailDrawerProps) {
  const product = mockProductDetail
  if (!productId) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[660px] max-w-[660px] p-0 sm:max-w-[660px] gap-0">
        {/* Hero Header */}
        <div className="border-b border-border bg-gradient-to-r from-secondary to-card px-6 py-5">
          <SheetHeader className="p-0 gap-0">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8ecf4] to-secondary border border-border">
                <ShoppingBag className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-lg font-extrabold text-foreground tracking-tight">{product.nameInternal}</SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-muted-foreground">
                  <span className="font-mono font-bold text-primary">{product.sku}</span> - {product.packageSize} {product.containerType}
                </SheetDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20 text-[10px] font-bold">Active</Badge>
                  <Badge variant="outline" className="bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20 text-[10px] font-bold">FDA Approved</Badge>
                  <span className="text-[10px] text-muted-foreground">{product.customerName}</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Quick KPI */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { label: "Total Produced", value: product.totalProduced.toLocaleString(), sub: "units" },
              { label: "In Stock", value: product.inStockQty.toLocaleString(), sub: "units" },
              { label: "Cost/Unit", value: `฿${product.totalCostPerUnit.toFixed(2)}`, sub: "COGS" },
              { label: "Selling Price", value: product.sellingPrice ? `฿${product.sellingPrice}` : "-", sub: product.sellingPrice ? `Margin ${((1 - product.totalCostPerUnit / product.sellingPrice) * 100).toFixed(1)}%` : "" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl bg-card/80 border border-border p-2.5 text-center">
                <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{kpi.label}</div>
                <div className="mt-0.5 text-base font-extrabold text-foreground">{kpi.value}</div>
                <div className="text-[9px] text-muted-foreground">{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-border px-4">
            <TabsList className="h-10 bg-transparent p-0 gap-0">
              {[
                { value: "images", icon: ImageIcon, label: "Images" },
                { value: "overview", icon: ClipboardList, label: "Overview" },
                { value: "bom", icon: DollarSign, label: "BOM & Cost" },
                { value: "fda", icon: FileText, label: "FDA & QA" },
                { value: "lots", icon: Package, label: "Lots" },
                { value: "docs", icon: Paperclip, label: "Docs" },
                { value: "history", icon: History, label: "History" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent px-3 py-2 text-[11px] font-semibold data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <tab.icon className="mr-1 h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5">
              {/* Images Tab */}
              <TabsContent value="images" className="mt-0">
                <div className="flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#e8ecf4] border border-border">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10 opacity-40" />
                    <p className="mt-2 text-[11px] font-semibold">No images uploaded</p>
                  </div>
                </div>
              </TabsContent>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-5">
                <OverviewSection product={product} />
              </TabsContent>

              {/* BOM & Cost Tab */}
              <TabsContent value="bom" className="mt-0 space-y-5">
                <BOMCostSection product={product} />
              </TabsContent>

              {/* FDA & QA Tab */}
              <TabsContent value="fda" className="mt-0 space-y-5">
                <FDAQASection product={product} />
              </TabsContent>

              {/* Lots Tab */}
              <TabsContent value="lots" className="mt-0 space-y-5">
                <LotsSection lots={mockLots} />
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="docs" className="mt-0 space-y-3">
                <DocsSection product={product} />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-0">
                <HistorySection entries={mockAudit} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-[10px] text-[11px] font-semibold">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <div className="flex-1" />
          <Button size="sm" className="gap-1.5 rounded-[10px] bg-primary text-[11px] font-semibold text-primary-foreground hover:bg-[#3b6fd4]">
            <Edit className="h-3.5 w-3.5" />
            Edit Product
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ========= Overview Section ========= */
function OverviewSection({ product }: { product: Product }) {
  return (
    <>
      {/* Product Identity */}
      <SectionCard title="Product Identity">
        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Internal Name" value={product.nameInternal} />
          <InfoField label="SKU" value={product.sku} mono />
          <InfoField label="Name TH" value={product.nameTH} />
          <InfoField label="Name EN" value={product.nameEN} />
          <InfoField label="Trade Name TH" value={product.tradeName_TH} />
          <InfoField label="Trade Name EN" value={product.tradeName_EN} />
          <InfoField label="Customer" value={product.customerName} />
          <InfoField label="Brand" value={product.brandName} />
          <InfoField label="Category" value={product.category} />
          <InfoField label="Barcode" value={product.barcode} mono />
        </div>
      </SectionCard>

      {/* Physical Specs */}
      <SectionCard title="Physical Specs">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Package Size", value: product.packageSize, icon: Package },
            { label: "Container", value: product.containerType, icon: Droplets },
            { label: "Shelf Life", value: `${product.shelfLifeMonths}M`, icon: ThermometerSun },
            { label: "PAO", value: product.paoMonths ? `${product.paoMonths}M` : "-", icon: Shield },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-secondary p-2.5 text-center">
              <s.icon className="mx-auto h-4 w-4 text-primary" />
              <div className="mt-1 text-xs font-bold text-foreground">{s.value}</div>
              <div className="text-[9px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* QC Standard */}
      <SectionCard title="QC Specification (Standard)">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Color", value: product.qcSpec.color },
            { label: "Scent", value: product.qcSpec.scent },
            { label: "Texture", value: product.qcSpec.texture },
            { label: "pH Range", value: product.qcSpec.phMin && product.qcSpec.phMax ? `${product.qcSpec.phMin} - ${product.qcSpec.phMax}` : "-" },
            { label: "Viscosity (cPs)", value: product.qcSpec.viscosityMin && product.qcSpec.viscosityMax ? `${product.qcSpec.viscosityMin} - ${product.qcSpec.viscosityMax}` : "-" },
            { label: "Specific Gravity", value: product.qcSpec.specificGravityMin && product.qcSpec.specificGravityMax ? `${product.qcSpec.specificGravityMin} - ${product.qcSpec.specificGravityMax}` : "-" },
          ].map((q, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-2.5">
              <div className="text-[9px] font-bold uppercase text-muted-foreground">{q.label}</div>
              <div className="mt-0.5 text-xs font-bold text-foreground">{q.value || "-"}</div>
            </div>
          ))}
        </div>
        {product.qcSpec.appearance && (
          <div className="mt-2 rounded-xl bg-secondary p-2.5">
            <div className="text-[9px] font-bold uppercase text-muted-foreground">Appearance</div>
            <div className="mt-0.5 text-xs text-foreground">{product.qcSpec.appearance}</div>
          </div>
        )}
      </SectionCard>

      {/* Linked Formula */}
      {product.formulaId && (
        <SectionCard title="Linked Formula">
          <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-[#8b5cf6]/20 bg-[#8b5cf6]/[0.03] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3efff] text-[#8b5cf6] border border-[#8b5cf6]/15">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-foreground">{product.formulaName}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{product.formulaCode}</div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Pricing Tiers */}
      <SectionCard title="Pricing Tiers">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Quantity</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Price/Unit</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">Margin</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Profit/Unit</th>
            </tr>
          </thead>
          <tbody>
            {product.pricingTiers.map((tier) => (
              <tr key={tier.id} className="border-b border-border last:border-0">
                <td className="py-2 font-mono font-bold text-foreground">{tier.minQty.toLocaleString()} - {tier.maxQty ? tier.maxQty.toLocaleString() : "Unlimited"}</td>
                <td className="py-2 text-right font-mono font-bold text-foreground">{"฿"}{tier.pricePerUnit}</td>
                <td className="py-2 text-center"><span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#10b981]">{tier.grossMarginPercent}%</span></td>
                <td className="py-2 text-right font-mono font-bold text-foreground">{"฿"}{tier.profitPerUnit.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  )
}

/* ========= BOM & Cost Section ========= */
function BOMCostSection({ product }: { product: Product }) {
  return (
    <>
      {/* Cost Breakdown */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Bulk Cost", value: `฿${product.bulkCostPerUnit.toFixed(2)}`, color: "text-[#8b5cf6]" },
          { label: "Pack Cost", value: `฿${product.packagingCostPerUnit.toFixed(2)}`, color: "text-[#f59e0b]" },
          { label: "Labor", value: `฿${product.laborCostPerUnit.toFixed(2)}`, color: "text-[#06b6d4]" },
          { label: "Total COGS", value: `฿${product.totalCostPerUnit.toFixed(2)}`, color: "text-primary" },
        ].map((c, i) => (
          <div key={i} className="rounded-xl bg-[#1e293b] p-3 text-center">
            <div className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">{c.label}</div>
            <div className={cn("mt-1 text-lg font-extrabold", c.color)}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* BOM Table */}
      <SectionCard title="Bill of Materials (BOM)">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Type</th>
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Item</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Qty</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Waste%</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Cost</th>
            </tr>
          </thead>
          <tbody>
            {product.bomItems.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="py-2">
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[9px] font-bold capitalize text-muted-foreground">{item.type}</span>
                </td>
                <td className="py-2">
                  <div className="font-semibold text-foreground">{item.stockItemName}</div>
                  <div className="font-mono text-[9px] text-[#06b6d4]">{item.stockItemCode}</div>
                </td>
                <td className="py-2 text-right font-mono text-foreground">{item.quantity}</td>
                <td className="py-2 text-right font-mono text-muted-foreground">{item.wastePercent}%</td>
                <td className="py-2 text-right font-mono font-bold text-foreground">{"฿"}{item.effectiveCost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={4} className="py-2 text-right text-[10px] font-bold text-muted-foreground">Total Packaging Cost:</td>
              <td className="py-2 text-right font-mono text-sm font-extrabold text-primary">{"฿"}{product.packagingCostPerUnit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </SectionCard>
    </>
  )
}

/* ========= FDA & QA Section ========= */
function FDAQASection({ product }: { product: Product }) {
  return (
    <>
      {product.fdaLicenseNumber && (
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-[#10b981]/20 bg-[#10b981]/[0.03] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/15">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">FDA Registration</div>
            <div className="font-mono text-xs font-bold text-[#10b981]">{product.fdaLicenseNumber}</div>
            <Badge variant="outline" className="mt-1 bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20 text-[9px] font-bold">Approved</Badge>
          </div>
        </div>
      )}

      <SectionCard title="QC Specification (Standard)">
        <div className="grid grid-cols-2 gap-2">
          <InfoField label="Appearance" value={product.qcSpec.appearance} />
          <InfoField label="Color" value={product.qcSpec.color} />
          <InfoField label="pH Range" value={product.qcSpec.phMin ? `${product.qcSpec.phMin} - ${product.qcSpec.phMax}` : undefined} />
          <InfoField label="Viscosity" value={product.qcSpec.viscosityMin ? `${product.qcSpec.viscosityMin} - ${product.qcSpec.viscosityMax} cPs` : undefined} />
        </div>
      </SectionCard>
    </>
  )
}

/* ========= Lots Section ========= */
function LotsSection({ lots }: { lots: ProductLot[] }) {
  const totalProduced = lots.reduce((s, l) => s + l.quantity, 0)
  const totalInStock = lots.reduce((s, l) => s + l.inStockQty, 0)
  const avgYield = lots.filter((l) => l.yieldPercent).reduce((s, l, _, arr) => s + (l.yieldPercent || 0) / arr.length, 0)

  return (
    <>
      {/* Lot KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total Lots", value: lots.length.toString() },
          { label: "Total Produced", value: totalProduced.toLocaleString() },
          { label: "Avg Yield", value: `${avgYield.toFixed(1)}%` },
          { label: "In Stock", value: totalInStock.toLocaleString() },
        ].map((k, i) => (
          <div key={i} className="rounded-xl bg-secondary p-2.5 text-center">
            <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-0.5 text-base font-extrabold text-foreground">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Lot Table */}
      <SectionCard title="Production Lots">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Lot No.</th>
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Mfg Date</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Qty</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">QC</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Stock</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <tr key={lot.id} className={cn("border-b border-border last:border-0", lot.status === "rejected" && "opacity-60")}>
                <td className={cn("py-2 font-mono font-bold", lot.status === "rejected" ? "line-through text-muted-foreground" : lot.status === "qc_hold" ? "text-[#f59e0b]" : "text-foreground")}>
                  {lot.lotNumber}
                </td>
                <td className="py-2 text-muted-foreground">{lot.mfgDate}</td>
                <td className="py-2 text-right font-mono text-foreground">{lot.quantity.toLocaleString()}</td>
                <td className="py-2 text-center">{getQCBadge(lot.qcResult)}</td>
                <td className="py-2 text-right">
                  <div className="font-mono text-foreground">{lot.inStockQty.toLocaleString()}</div>
                  {lot.quantity > 0 && (
                    <div className="mt-0.5 h-1.5 w-full rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, (lot.inStockQty / lot.quantity) * 100)}%` }}
                      />
                    </div>
                  )}
                </td>
                <td className="py-2 text-center">{getLotStatusBadge(lot.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  )
}

/* ========= Documents Section ========= */
function DocsSection({ product }: { product: Product }) {
  return (
    <>
      {product.attachments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/50 p-8 text-center">
          <Paperclip className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-[12px] font-semibold text-muted-foreground">No documents uploaded</p>
        </div>
      ) : (
        product.attachments.map((att) => (
          <div key={att.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fef2f2] text-[#ef4444]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-[12px] font-bold text-foreground">{att.fileName}</div>
              <div className="text-[10px] text-muted-foreground">{att.fileSize} - {att.uploadedAt}</div>
            </div>
            <Badge variant="outline" className="text-[9px] font-bold">{att.fileType}</Badge>
          </div>
        ))
      )}
    </>
  )
}

/* ========= History Section ========= */
function HistorySection({ entries }: { entries: AuditEntry[] }) {
  const colorMap: Record<string, string> = {
    blue: "bg-primary",
    green: "bg-[#10b981]",
    orange: "bg-[#f59e0b]",
    purple: "bg-[#8b5cf6]",
    red: "bg-[#ef4444]",
  }
  return (
    <div className="space-y-0">
      {entries.map((entry, i) => (
        <div key={entry.id} className="flex gap-3 py-3">
          <div className="flex flex-col items-center">
            <div className={cn("h-2.5 w-2.5 rounded-full mt-1", colorMap[entry.color] || "bg-primary")} />
            {i < entries.length - 1 && <div className="flex-1 w-px bg-border mt-1" />}
          </div>
          <div className="flex-1 min-w-0 pb-3">
            <div className="text-[12px] font-semibold text-foreground">{entry.description}</div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{entry.userName}</span>
              <span>-</span>
              <span>{entry.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ========= Shared helpers ========= */
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border bg-secondary px-4 py-2.5">
        <h3 className="text-[12px] font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function InfoField({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 text-[12px] font-semibold text-foreground", mono && "font-mono text-primary")}>{value || "-"}</div>
    </div>
  )
}

function getQCBadge(result: QCResult) {
  const map: Record<QCResult, { label: string; className: string }> = {
    pass: { label: "Pass", className: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20" },
    fail: { label: "Fail", className: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20" },
    pending: { label: "Pending", className: "bg-[#fef3c7] text-[#f59e0b] border-[#f59e0b]/20" },
  }
  const s = map[result]
  return <Badge variant="outline" className={cn("text-[9px] font-bold", s.className)}>{s.label}</Badge>
}

function getLotStatusBadge(status: LotStatus) {
  const map: Record<LotStatus, { label: string; className: string }> = {
    released: { label: "Released", className: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20" },
    qc_hold: { label: "QC Hold", className: "bg-[#fef3c7] text-[#f59e0b] border-[#f59e0b]/20" },
    sold_out: { label: "Sold Out", className: "bg-[#e0f2fe] text-[#3b82f6] border-[#3b82f6]/20" },
    rejected: { label: "Rejected", className: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20" },
  }
  const s = map[status]
  return <Badge variant="outline" className={cn("text-[9px] font-bold", s.className)}>{s.label}</Badge>
}
