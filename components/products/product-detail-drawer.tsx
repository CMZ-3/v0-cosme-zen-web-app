"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  Star,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowDownUp,
  Tags,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
} from "lucide-react"
import { mockProductDetail, mockLots, mockAudit, mockSpecifications, mockAttributes, mockLotMovements, mockLotMovementSummary } from "@/lib/mock-data"
import type { Product, ProductLot, AuditEntry, LotStatus, QCResult, QualityStatus, ProductSpecification, ProductAttribute, LotMovement, MovementType } from "@/lib/product-types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

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
      <SheetContent side="right" className="w-[720px] max-w-[720px] p-0 sm:max-w-[720px] gap-0">
        {/* Hero Header */}
        <div className="shrink-0 border-b border-border bg-gradient-to-r from-secondary to-card px-6 py-5">
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
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border px-3 overflow-x-auto shrink-0">
            <TabsList className="h-10 bg-transparent p-0 gap-0">
              {[
                { value: "images", icon: ImageIcon, label: "Images" },
                { value: "overview", icon: ClipboardList, label: "Overview" },
                { value: "bom", icon: DollarSign, label: "BOM & Cost" },
                { value: "fda", icon: FileText, label: "FDA & QA" },
                { value: "specs", icon: BookOpen, label: "Specs" },
                { value: "attrs", icon: Tags, label: "Attributes" },
                { value: "lots", icon: Package, label: "Lots" },
                { value: "docs", icon: Paperclip, label: "Docs" },
                { value: "history", icon: History, label: "History" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent px-2.5 py-2 text-[10px] font-semibold data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <tab.icon className="mr-1 h-3 w-3" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              <TabsContent value="images" className="mt-0"><ImagesSection product={product} /></TabsContent>
              <TabsContent value="overview" className="mt-0 space-y-5"><OverviewSection product={product} /></TabsContent>
              <TabsContent value="bom" className="mt-0 space-y-5"><BOMCostSection product={product} /></TabsContent>
              <TabsContent value="fda" className="mt-0 space-y-5"><FDAQASection product={product} /></TabsContent>
              <TabsContent value="specs" className="mt-0 space-y-5"><SpecsSection specs={mockSpecifications} /></TabsContent>
              <TabsContent value="attrs" className="mt-0 space-y-5"><AttributesSection attributes={mockAttributes} /></TabsContent>
              <TabsContent value="lots" className="mt-0 space-y-5"><LotsSection lots={mockLots} /></TabsContent>
              <TabsContent value="docs" className="mt-0 space-y-3"><DocsSection product={product} /></TabsContent>
              <TabsContent value="history" className="mt-0"><HistorySection entries={mockAudit} /></TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="shrink-0 flex items-center gap-2 border-t border-border px-5 py-3">
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

/* ========= Images Section (9-4) ========= */
function ImagesSection({ product }: { product: Product }) {
  const [primaryIndex, setPrimaryIndex] = useState(0)
  const mockImages = [
    { id: "img-1", url: "", label: "Main Product Shot" },
    { id: "img-2", url: "", label: "Packaging Front" },
    { id: "img-3", url: "", label: "Packaging Back" },
  ]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="flex h-52 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-[#e8ecf4] border border-border">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-2 text-[11px] font-semibold">Product Image Preview</p>
          <p className="text-[9px] text-muted-foreground">Click thumbnail below to preview</p>
        </div>
      </div>

      {/* Thumbnail Row */}
      <div className="flex gap-2">
        {mockImages.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setPrimaryIndex(i)}
            className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-xl border-2 bg-secondary transition-all",
              i === primaryIndex ? "border-primary shadow-[0_0_0_2px_rgba(76,139,245,0.2)]" : "border-border hover:border-muted-foreground"
            )}
          >
            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            {i === primaryIndex && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Star className="h-2.5 w-2.5" />
              </span>
            )}
          </button>
        ))}
        <button className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-[#eef4ff]">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Upload Zone */}
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-border bg-secondary/50 p-4 cursor-pointer transition-colors hover:border-primary hover:bg-[#eef4ff]">
        <Upload className="h-5 w-5 text-muted-foreground/50" />
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground">{"Drag & Drop or Click to upload images"}</div>
          <div className="text-[9px] text-muted-foreground/70">JPG, PNG, WEBP - Max 10MB per file - Max 10 images</div>
        </div>
      </div>

      {/* Image List */}
      <SectionCard title="Image Gallery">
        <div className="space-y-2">
          {mockImages.map((img, i) => (
            <div key={img.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-secondary/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-foreground">{img.label}</div>
                <div className="text-[9px] text-muted-foreground">1200x1200px - 245 KB</div>
              </div>
              {i === primaryIndex ? (
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold">Primary</Badge>
              ) : (
                <Button variant="ghost" size="sm" className="h-6 rounded-md text-[9px] font-bold text-muted-foreground hover:text-primary" onClick={() => setPrimaryIndex(i)}>
                  Set Primary
                </Button>
              )}
              <button className="text-muted-foreground/40 hover:text-[#ef4444]">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

/* ========= Overview Section ========= */
function OverviewSection({ product }: { product: Product }) {
  return (
    <>
      {/* COGS Summary (9-9) */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Bulk", value: `฿${product.bulkCostPerUnit.toFixed(2)}`, color: "text-[#8b5cf6]" },
          { label: "Packaging", value: `฿${product.packagingCostPerUnit.toFixed(2)}`, color: "text-[#f59e0b]" },
          { label: "Labor", value: `฿${product.laborCostPerUnit.toFixed(2)}`, color: "text-[#06b6d4]" },
          { label: "Overhead", value: `฿${product.overheadCostPerUnit.toFixed(2)}`, color: "text-[#64748b]" },
          { label: "Total COGS", value: `฿${product.totalCostPerUnit.toFixed(2)}`, color: "text-primary" },
        ].map((c, i) => (
          <div key={i} className="rounded-xl bg-[#1e293b] p-2.5 text-center">
            <div className="text-[8px] font-bold uppercase tracking-wide text-[#94a3b8]">{c.label}</div>
            <div className={cn("mt-0.5 text-sm font-extrabold", c.color)}>{c.value}</div>
          </div>
        ))}
      </div>

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

      {/* Inventory Summary (9-9) */}
      <SectionCard title="Inventory Summary">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Total Lots", value: product.lotCount.toString() },
            { label: "In Stock", value: product.inStockQty.toLocaleString() },
            { label: "Total Produced", value: product.totalProduced.toLocaleString() },
            { label: "Expiring (90d)", value: "1" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-secondary p-2.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{s.label}</div>
              <div className="mt-0.5 text-base font-extrabold text-foreground">{s.value}</div>
            </div>
          ))}
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

/* ========= BOM & Cost Section (9-3) ========= */
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
      <SectionCard title="Bill of Materials (BOM)" headerRight={
        <Button variant="outline" size="sm" className="h-6 gap-1 rounded-lg bg-[#eef4ff] text-[10px] font-bold text-primary border-primary/15 hover:bg-[#dde7ff]">
          <Plus className="h-3 w-3" /> Add Item
        </Button>
      }>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Type</th>
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Item</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Qty</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Waste%</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Cost</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {product.bomItems.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0 group">
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
                <td className="py-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-muted-foreground/50 hover:text-[#ef4444]"><Trash2 className="h-3 w-3" /></button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={4} className="py-2 text-right text-[10px] font-bold text-muted-foreground">Total Packaging Cost:</td>
              <td className="py-2 text-right font-mono text-sm font-extrabold text-primary">{"฿"}{product.packagingCostPerUnit.toFixed(2)}</td>
              <td></td>
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

/* ========= Specifications Section (9-6) ========= */
function SpecsSection({ specs }: { specs: ProductSpecification[] }) {
  const typeLabel: Record<string, { label: string; color: string }> = {
    general: { label: "General", color: "bg-[#f3efff] text-[#8b5cf6]" },
    regulatory: { label: "Regulatory", color: "bg-[#fef3c7] text-[#f59e0b]" },
    stability: { label: "Stability", color: "bg-[#ecfdf5] text-[#10b981]" },
    packaging: { label: "Packaging", color: "bg-[#e0f2fe] text-[#3b82f6]" },
    micro: { label: "Microbiology", color: "bg-[#fef2f2] text-[#ef4444]" },
  }

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-bold text-foreground">Product Specifications</h3>
        <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg bg-[#eef4ff] text-[10px] font-bold text-primary border-primary/15 hover:bg-[#dde7ff]">
          <Plus className="h-3 w-3" /> Add Spec
        </Button>
      </div>
      {specs.map((spec) => {
        const t = typeLabel[spec.specType] || typeLabel.general
        return (
          <div key={spec.id} className="rounded-2xl border border-border bg-card overflow-hidden group">
            <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className={cn("rounded-md px-2 py-0.5 text-[9px] font-bold", t.color)}>{t.label}</span>
                <h4 className="text-[12px] font-bold text-foreground">{spec.title}</h4>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-[#ef4444]"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
            <div className="p-4 text-[12px] leading-relaxed text-foreground">{spec.content}</div>
          </div>
        )
      })}
    </>
  )
}

/* ========= Attributes Section (9-6) ========= */
function AttributesSection({ attributes }: { attributes: ProductAttribute[] }) {
  const scopeLabel: Record<string, { label: string; color: string }> = {
    product: { label: "Product", color: "bg-[#f3efff] text-[#8b5cf6]" },
    packaging: { label: "Packaging", color: "bg-[#fef3c7] text-[#f59e0b]" },
    marketing: { label: "Marketing", color: "bg-[#ecfdf5] text-[#10b981]" },
  }

  const grouped = attributes.reduce((acc, attr) => {
    if (!acc[attr.scope]) acc[attr.scope] = []
    acc[attr.scope].push(attr)
    return acc
  }, {} as Record<string, ProductAttribute[]>)

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-bold text-foreground">Product Attributes</h3>
        <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg bg-[#eef4ff] text-[10px] font-bold text-primary border-primary/15 hover:bg-[#dde7ff]">
          <Plus className="h-3 w-3" /> Add Attribute
        </Button>
      </div>
      {Object.entries(grouped).map(([scope, attrs]) => {
        const s = scopeLabel[scope] || scopeLabel.product
        return (
          <SectionCard key={scope} title={`${s.label} Attributes`}>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground w-1/3">Key</th>
                  <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Value</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {attrs.map((attr) => (
                  <tr key={attr.id} className="border-b border-border last:border-0 group/row">
                    <td className="py-2">
                      <div className="text-[11px] font-bold text-foreground">{attr.attributeLabel}</div>
                      <div className="font-mono text-[9px] text-muted-foreground">{attr.attributeKey}</div>
                    </td>
                    <td className="py-2 text-[11px] text-foreground">{attr.attributeValue}</td>
                    <td className="py-2 text-right opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <div className="flex items-center gap-0.5">
                        <button className="text-muted-foreground hover:text-primary"><Edit className="h-3 w-3" /></button>
                        <button className="text-muted-foreground hover:text-[#ef4444]"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectionCard>
        )
      })}
    </>
  )
}

/* ========= Lots Section (9-7, 9-8) ========= */
function LotsSection({ lots }: { lots: ProductLot[] }) {
  const [expandedLot, setExpandedLot] = useState<string | null>(null)
  const [showCreateLot, setShowCreateLot] = useState(false)
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
      <SectionCard title="Production Lots" headerRight={
        <Button variant="outline" size="sm" className="h-6 gap-1 rounded-lg bg-[#eef4ff] text-[10px] font-bold text-primary border-primary/15 hover:bg-[#dde7ff]" onClick={() => setShowCreateLot(true)}>
          <Plus className="h-3 w-3" /> New Lot
        </Button>
      }>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 w-5"></th>
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Lot No. / FDA Ref</th>
              <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Mfg Date</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Qty</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">QC</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">Quality</th>
              <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Stock</th>
              <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => {
              const isExpanded = expandedLot === lot.id
              const lotMovements = mockLotMovements.filter((m) => m.productLotId === lot.id)
              return (
                <>
                  <tr
                    key={lot.id}
                    className={cn("border-b border-border last:border-0 cursor-pointer hover:bg-secondary/50 transition-colors", lot.status === "rejected" && "opacity-60")}
                    onClick={() => setExpandedLot(isExpanded ? null : lot.id)}
                  >
                    <td className="py-2">
                      {isExpanded ? <ChevronDown className="h-3 w-3 text-primary" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    </td>
                    <td className="py-2">
                      <div className={cn("font-mono font-bold", lot.status === "rejected" ? "line-through text-muted-foreground" : "text-foreground")}>
                        {lot.lotNumber}
                      </div>
                      {lot.fdaLotReference && (
                        <div className="font-mono text-[9px] text-[#10b981]">{lot.fdaLotReference}</div>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground">{lot.mfgDate}</td>
                    <td className="py-2 text-right font-mono text-foreground">{lot.quantity.toLocaleString()}</td>
                    <td className="py-2 text-center">{getQCBadge(lot.qcResult)}</td>
                    <td className="py-2 text-center">{getQualityStatusBadge(lot.qualityStatus)}</td>
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
                  {/* Expanded Row - Movements (9-8) */}
                  {isExpanded && (
                    <tr key={`${lot.id}-expanded`}>
                      <td colSpan={8} className="p-0">
                        <div className="border-b border-border bg-[#f8f9fd] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                              <span className="text-[11px] font-bold text-foreground">Lot Movements</span>
                            </div>
                            {lot.qualityStatus === "pending" && (
                              <div className="flex gap-1.5">
                                <Button
                                  size="sm"
                                  className="h-6 gap-1 rounded-lg bg-[#10b981] text-[9px] font-bold text-card hover:bg-[#059669]"
                                  onClick={(e) => { e.stopPropagation(); toast.success("Quality approved") }}
                                >
                                  <CheckCircle2 className="h-3 w-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 gap-1 rounded-lg text-[9px] font-bold text-[#ef4444] border-[#ef4444]/20 hover:bg-[#fef2f2]"
                                  onClick={(e) => { e.stopPropagation(); toast.error("Quality rejected") }}
                                >
                                  <XCircle className="h-3 w-3" /> Reject
                                </Button>
                              </div>
                            )}
                          </div>
                          {/* QC Data */}
                          {lot.qcData && Object.keys(lot.qcData).length > 0 && (
                            <div className="mb-3 grid grid-cols-3 gap-1.5">
                              {Object.entries(lot.qcData).map(([key, val]) => val && (
                                <div key={key} className="rounded-lg bg-card border border-border p-1.5">
                                  <div className="text-[8px] font-bold uppercase text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</div>
                                  <div className="text-[10px] font-bold text-foreground">{String(val)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Movement Table */}
                          {lotMovements.length > 0 ? (
                            <table className="w-full text-[10px]">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="pb-1.5 text-left text-[8px] font-bold uppercase text-muted-foreground">Date</th>
                                  <th className="pb-1.5 text-left text-[8px] font-bold uppercase text-muted-foreground">Type</th>
                                  <th className="pb-1.5 text-right text-[8px] font-bold uppercase text-muted-foreground">Change</th>
                                  <th className="pb-1.5 text-right text-[8px] font-bold uppercase text-muted-foreground">Balance</th>
                                  <th className="pb-1.5 text-left text-[8px] font-bold uppercase text-muted-foreground">Ref</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lotMovements.map((mv) => (
                                  <tr key={mv.id} className="border-b border-border last:border-0">
                                    <td className="py-1.5 text-muted-foreground">{mv.createdAt}</td>
                                    <td className="py-1.5">{getMovementBadge(mv.movementType)}</td>
                                    <td className={cn("py-1.5 text-right font-mono font-bold", mv.quantityChange > 0 ? "text-[#10b981]" : "text-[#ef4444]")}>
                                      {mv.quantityChange > 0 ? "+" : ""}{mv.quantityChange.toLocaleString()}
                                    </td>
                                    <td className="py-1.5 text-right font-mono text-foreground">{mv.balanceAfter.toLocaleString()}</td>
                                    <td className="py-1.5 font-mono text-[9px] text-primary">{mv.referenceNumber || mv.notes || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="text-center text-[10px] text-muted-foreground py-3">No movements recorded</div>
                          )}
                          {/* Delivery history */}
                          {lot.deliveries.length > 0 && (
                            <div className="mt-3 border-t border-border pt-3">
                              <div className="text-[10px] font-bold text-muted-foreground mb-1.5">Deliveries</div>
                              {lot.deliveries.map((d) => (
                                <div key={d.id} className="flex items-center justify-between text-[10px] py-1 border-b border-border last:border-0">
                                  <span className="text-muted-foreground">{d.date}</span>
                                  <span className="text-foreground">{d.customerName}</span>
                                  <span className="font-mono text-primary">{d.invoiceNumber}</span>
                                  <span className="font-mono font-bold text-foreground">{d.quantity.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* Create Lot Dialog */}
      <Dialog open={showCreateLot} onOpenChange={setShowCreateLot}>
        <DialogContent className="rounded-2xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">Create New Lot</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">FDA Lot Reference <span className="text-[#ef4444]">*</span></label>
              <Input placeholder="e.g. FDA-LOT-VC15-260301" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">Manufacturing Date <span className="text-[#ef4444]">*</span></label>
                <Input type="date" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">Expiry Date</label>
                <Input type="date" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">Quantity <span className="text-[#ef4444]">*</span></label>
                <Input type="number" placeholder="10000" className="h-9 rounded-[10px] border-border bg-secondary text-right font-mono text-[13px]" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">Storage Location</label>
                <Input placeholder="e.g. Warehouse A-1" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">Notes</label>
              <Input placeholder="Optional notes..." className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[10px] text-[11px]" onClick={() => setShowCreateLot(false)}>Cancel</Button>
            <Button className="rounded-[10px] bg-primary text-[11px] text-primary-foreground" onClick={() => { toast.success("Lot created"); setShowCreateLot(false) }}>Create Lot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ========= Documents Section ========= */
function DocsSection({ product }: { product: Product }) {
  return (
    <>
      {/* Upload zone */}
      <div className="flex items-center gap-3 rounded-xl border-[1.5px] border-dashed border-border bg-secondary/50 p-4 cursor-pointer transition-colors hover:border-primary hover:bg-[#eef4ff] mb-2">
        <Upload className="h-5 w-5 text-muted-foreground/50" />
        <div>
          <div className="text-[11px] font-semibold text-muted-foreground">{"Drag & Drop files or Click to upload"}</div>
          <div className="text-[9px] text-muted-foreground/70">PDF, PNG, JPG - COA, Spec Sheet, Artwork</div>
        </div>
      </div>
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
            <button className="text-muted-foreground/40 hover:text-[#ef4444]"><Trash2 className="h-3.5 w-3.5" /></button>
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
function SectionCard({ title, children, headerRight }: { title: string; children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-secondary px-4 py-2.5">
        <h3 className="text-[12px] font-bold text-foreground">{title}</h3>
        {headerRight}
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

function getQualityStatusBadge(status: QualityStatus) {
  const map: Record<QualityStatus, { label: string; className: string }> = {
    approved: { label: "Approved", className: "bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20" },
    pending: { label: "Pending", className: "bg-[#fef3c7] text-[#f59e0b] border-[#f59e0b]/20" },
    rejected: { label: "Rejected", className: "bg-[#fef2f2] text-[#ef4444] border-[#ef4444]/20" },
  }
  const s = map[status]
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

function getMovementBadge(type: MovementType) {
  const map: Record<MovementType, { label: string; className: string }> = {
    production_in: { label: "Production In", className: "bg-[#ecfdf5] text-[#10b981]" },
    delivery_out: { label: "Delivery Out", className: "bg-[#e0f2fe] text-[#3b82f6]" },
    adjust: { label: "Adjustment", className: "bg-[#f3efff] text-[#8b5cf6]" },
    return: { label: "Return", className: "bg-[#fef3c7] text-[#f59e0b]" },
    damage: { label: "Damage", className: "bg-[#fef2f2] text-[#ef4444]" },
    loss: { label: "Loss", className: "bg-[#fef2f2] text-[#ef4444]" },
  }
  const s = map[type]
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[8px] font-bold", s.className)}>{s.label}</span>
}
