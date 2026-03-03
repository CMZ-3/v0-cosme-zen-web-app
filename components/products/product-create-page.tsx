"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Search,
  Dice5,
  ImageIcon,
  Plus,
  Trash2,
  FlaskConical,
  Shield,
  Upload,
  X,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { BOMComponentType } from "@/lib/product-types"

interface BOMRow {
  id: string
  type: BOMComponentType
  name: string
  code: string
  qty: number
  conversionQty?: number
  conversionUnit?: string
  wastePercent: number
  unitCost: number
}

interface PricingTierRow {
  id: string
  minQty: number
  maxQty?: number
  pricePerUnit: number
}

const defaultBOM: BOMRow[] = [
  { id: "1", type: "bottle", name: "Dropper Bottle 30ml Frosted", code: "PKG-BT-30DF", qty: 1, wastePercent: 2, unitCost: 8.50 },
  { id: "2", type: "pump", name: "Dropper Pump Gold 18mm", code: "PKG-PM-18G", qty: 1, wastePercent: 1, unitCost: 3.20 },
  { id: "3", type: "sticker", name: "Label Sticker GlowUp Serum", code: "PKG-LB-GWSR", qty: 1, conversionQty: 7000, conversionUnit: "roll", wastePercent: 3, unitCost: 500 },
  { id: "4", type: "box", name: "Individual Box Serum 30ml", code: "PKG-BX-30SR", qty: 1, wastePercent: 1.5, unitCost: 5.00 },
]

const defaultTiers: PricingTierRow[] = [
  { id: "1", minQty: 1000, maxQty: 2999, pricePerUnit: 185 },
  { id: "2", minQty: 3000, maxQty: 4999, pricePerUnit: 165 },
  { id: "3", minQty: 5000, maxQty: 9999, pricePerUnit: 150 },
  { id: "4", minQty: 10000, pricePerUnit: 135 },
]

export function ProductCreatePage() {
  const [bomItems, setBomItems] = useState<BOMRow[]>(defaultBOM)
  const [pricingTiers, setPricingTiers] = useState<PricingTierRow[]>(defaultTiers)
  const [fillWeight, setFillWeight] = useState(30)
  const [laborCost, setLaborCost] = useState(2.0)
  const [overheadCost, setOverheadCost] = useState(1.3)
  const [sellingPrice, setSellingPrice] = useState(185)

  const formulaCostPerKg = 42.50

  const bulkCost = useMemo(() => {
    return (formulaCostPerKg * fillWeight) / 1000
  }, [fillWeight])

  const computeEffectiveCost = useCallback((item: BOMRow) => {
    const wasteFactor = 1 + item.wastePercent / 100
    if (item.conversionQty && item.conversionQty > 0) {
      return (item.unitCost / item.conversionQty) * wasteFactor * item.qty
    }
    return item.unitCost * wasteFactor * item.qty
  }, [])

  const packagingCost = useMemo(() => {
    return bomItems.reduce((sum, item) => sum + computeEffectiveCost(item), 0)
  }, [bomItems, computeEffectiveCost])

  const totalCost = useMemo(() => {
    return bulkCost + packagingCost + laborCost + overheadCost
  }, [bulkCost, packagingCost, laborCost, overheadCost])

  const marginPercent = useMemo(() => {
    if (!sellingPrice || sellingPrice <= 0) return 0
    return ((sellingPrice - totalCost) / sellingPrice) * 100
  }, [sellingPrice, totalCost])

  function addBOMRow() {
    setBomItems([...bomItems, {
      id: Date.now().toString(),
      type: "other",
      name: "",
      code: "",
      qty: 1,
      wastePercent: 0,
      unitCost: 0,
    }])
  }

  function removeBOMRow(id: string) {
    setBomItems(bomItems.filter((r) => r.id !== id))
  }

  function updateBOMRow(id: string, field: keyof BOMRow, value: string | number) {
    setBomItems(bomItems.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }

  function addTier() {
    setPricingTiers([...pricingTiers, {
      id: Date.now().toString(),
      minQty: 0,
      pricePerUnit: 0,
    }])
  }

  function removeTier(id: string) {
    setPricingTiers(pricingTiers.filter((t) => t.id !== id))
  }

  function handleSave() {
    toast.success("Product created successfully!")
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-8 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <button className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-secondary text-muted-foreground transition-colors hover:bg-[#eef4ff] hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <nav className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <span>/</span>
              <span className="font-semibold text-foreground">Create New</span>
            </nav>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Create New Product</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-[10px] text-[11px] font-semibold">
            <Save className="h-3.5 w-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-[10px] bg-[#10b981] text-[11px] font-semibold text-card hover:bg-[#059669]"
            onClick={handleSave}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Create Product
          </Button>
        </div>
      </header>

      <div className="px-8 py-6">
        <div className="mx-auto max-w-[1200px] grid grid-cols-[340px_1fr] gap-6">

          {/* ============ LEFT COLUMN ============ */}
          <div className="space-y-5">

            {/* Image Upload */}
            <FormCard title="Product Images">
              <div className="flex h-48 items-center justify-center rounded-[10px] border border-border bg-gradient-to-br from-secondary to-[#e8ecf4]">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-9 w-9 opacity-40" />
                  <p className="mt-1.5 text-[11px] font-semibold">No image selected</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="flex h-14 w-14 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-[#eef4ff]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 text-[9px] text-muted-foreground">Max 5 files - JPG, PNG, WEBP - Max 10MB</p>
            </FormCard>

            {/* Basic Info */}
            <FormCard title="Basic Information">
              <div className="space-y-3.5">
                <FormGroup label="Customer" required>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search customer..." className="h-9 rounded-[10px] border-border bg-secondary pl-8 text-[13px]" />
                  </div>
                </FormGroup>

                <FormGroup label="Brand">
                  <Select>
                    <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                      <SelectValue placeholder="-- Select Brand --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="glowup">GlowUp</SelectItem>
                      <SelectItem value="natuglow">NatuGlow</SelectItem>
                      <SelectItem value="softtouch">SoftTouch</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>

                <FormGroup label="Product Code">
                  <div className="flex gap-1.5">
                    <Input defaultValue="PRD-260302-001" readOnly className="h-9 flex-1 rounded-[10px] border-border bg-muted font-mono text-[13px] font-bold text-primary cursor-not-allowed" />
                    <span className="flex items-center text-[9px] text-muted-foreground">Auto-generated</span>
                  </div>
                </FormGroup>

                <FormGroup label="SKU Code" required>
                  <div className="flex gap-1.5">
                    <Input defaultValue="SKU-2026-XXXX" className="h-9 flex-1 rounded-[10px] border-border bg-secondary font-mono text-[13px] font-bold text-primary" />
                    <Button variant="outline" size="sm" className="h-9 gap-1 rounded-[10px] text-[11px] font-semibold">
                      <Dice5 className="h-3.5 w-3.5" />
                      Auto
                    </Button>
                  </div>
                </FormGroup>

                <FormGroup label="Barcode / EAN">
                  <Input placeholder="885xxxxxxxxx" className="h-9 rounded-[10px] border-border bg-secondary font-mono text-[13px]" />
                </FormGroup>

                <FormGroup label="Product Name (TH)" required>
                  <Input placeholder="Product name in Thai" className="h-9 rounded-[10px] border-border bg-secondary text-[13px] font-bold" />
                </FormGroup>

                <FormGroup label="Product Name (EN)">
                  <Input placeholder="English product name" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormGroup label="Trade Name (TH)">
                    <Input placeholder="Trade Name TH" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                  <FormGroup label="Trade Name (EN)">
                    <Input placeholder="Trade Name EN" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <FormGroup label="Category" required>
                    <Select defaultValue="skincare">
                      <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Skincare", "Bodycare", "Haircare", "Suncare", "Makeup", "Cleanser", "Supplement", "Fragrance", "Other"].map((c) => (
                          <SelectItem key={c.toLowerCase()} value={c.toLowerCase()}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>
                  <FormGroup label="Subcategory">
                    <Input placeholder="e.g. Serum, Cream, Toner" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                </div>

                <FormGroup label="Description / Key Features">
                  <Textarea placeholder="Product details, key features, marketing copy..." className="min-h-[60px] rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
              </div>
            </FormCard>

            {/* Commercial */}
            <FormCard title="Pricing & MOQ & Status" accentColor="border-t-[3px] border-t-[#10b981]">
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <FormGroup label="Selling Price (Baht)">
                    <div className="flex">
                      <span className="flex items-center rounded-l-[10px] border border-r-0 border-[#10b981]/20 bg-[#ecfdf5] px-2.5 text-[13px] font-bold text-[#10b981]">{"฿"}</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={sellingPrice || ""}
                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                        className="h-9 rounded-l-none rounded-r-[10px] border-border bg-secondary text-right font-mono text-[15px] font-bold"
                      />
                    </div>
                  </FormGroup>
                  <FormGroup label="MOQ (Minimum)">
                    <Input type="number" defaultValue={1000} className="h-9 rounded-[10px] border-border bg-secondary text-right font-mono text-[13px] font-bold" />
                  </FormGroup>
                </div>

                <FormGroup label="Lead Time (Production Days)">
                  <div className="flex items-center gap-1.5">
                    <Input type="number" defaultValue={30} className="h-9 w-20 rounded-[10px] border-border bg-secondary text-right text-[13px]" />
                    <span className="text-[11px] text-muted-foreground">days</span>
                  </div>
                </FormGroup>

                <FormGroup label="Status">
                  <Select defaultValue="draft">
                    <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px] font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_development">In Development</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>
              </div>
            </FormCard>
          </div>

          {/* ============ RIGHT COLUMN ============ */}
          <div className="space-y-5">

            {/* Bulk & Regulatory */}
            <FormCard title="Bulk & Regulatory" step={1} stepColor="bg-[#8b5cf6]" accentColor="border-t-[3px] border-t-[#8b5cf6]">
              <p className="mb-4 text-[11px] text-muted-foreground">Select formula and FDA license for this product</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Formula Selector */}
                <div>
                  <FormLabel>Select Formula (Bulk)</FormLabel>
                  <p className="mb-2 text-[10px] text-muted-foreground">Choose bulk formula - used for bulk cost calculation</p>
                  <div className="rounded-[10px] border-[1.5px] border-[#8b5cf6]/20 bg-[#8b5cf6]/[0.03] p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#f3efff] text-[#8b5cf6] border border-[#8b5cf6]/15">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground">Hyaluronic Serum Formula</div>
                        <div className="font-mono text-[10px] text-muted-foreground">FML-HYASERUM-001</div>
                        <div className="mt-1.5">
                          <span className="rounded-md bg-card px-2 py-0.5 text-[9px] font-semibold text-muted-foreground border border-[#8b5cf6]/10">
                            {"Cost: ฿42.50/kg"}
                          </span>
                        </div>
                      </div>
                      <button className="rounded-md p-1 text-muted-foreground/50 hover:bg-[#fef2f2] hover:text-[#ef4444]">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* FDA Selector */}
                <div>
                  <FormLabel>FDA License</FormLabel>
                  <p className="mb-2 text-[10px] text-muted-foreground">{"Select FDA - auto-mapped from formula if available"}</p>
                  <div className="rounded-[10px] border-[1.5px] border-[#10b981]/20 bg-[#10b981]/[0.03] p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-[#ecfdf5] text-[#10b981] border border-[#10b981]/15">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-foreground">10-1-12345-5-0001</div>
                        <div className="text-[10px] text-muted-foreground">Exp: 2028-06-30</div>
                        <div className="mt-1.5">
                          <span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[9px] font-bold text-[#10b981]">
                            Auto-Mapped
                          </span>
                        </div>
                      </div>
                      <button className="rounded-md p-1 text-muted-foreground/50 hover:bg-[#fef2f2] hover:text-[#ef4444]">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fill Weight */}
              <div className="border-t border-border pt-3.5">
                <FormLabel>Fill Weight (per unit)</FormLabel>
                <p className="mb-2 text-[10px] text-muted-foreground">Net weight per unit - used for bulk cost per unit calculation</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={fillWeight}
                    onChange={(e) => setFillWeight(Number(e.target.value))}
                    className="h-9 w-[90px] rounded-[10px] border-border bg-secondary text-right font-mono text-[13px] font-bold"
                  />
                  <Select defaultValue="ml">
                    <SelectTrigger className="h-9 w-[70px] rounded-[10px] border-border bg-secondary text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="ml-auto text-[11px] text-muted-foreground">
                    {"Est. Bulk Cost: "}
                    <span className="font-bold text-foreground">{"฿ "}{bulkCost.toFixed(2)}</span>
                    {" / unit"}
                  </div>
                </div>
              </div>
            </FormCard>

            {/* QC Specification */}
            <FormCard title="QC Specification (Standard)">
              <div className="flex gap-4 mb-3.5">
                <div className="w-[100px] flex-shrink-0">
                  <FormLabel>Bulk Texture</FormLabel>
                  <div className="flex h-20 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-border bg-secondary text-muted-foreground transition-colors hover:border-primary hover:bg-[#eef4ff]">
                    <div className="text-center">
                      <Upload className="mx-auto h-5 w-5 opacity-50" />
                      <span className="mt-0.5 block text-[9px] font-semibold">Upload</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2.5">
                  <FormGroup label="Color">
                    <Input placeholder="e.g. Light Yellow" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                  <FormGroup label="Scent">
                    <Input placeholder="e.g. Citrus" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                  <FormGroup label="Texture">
                    <Input placeholder="e.g. Liquid Serum" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <FormGroup label="pH Value">
                  <Input placeholder="5.5 - 6.5" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
                <FormGroup label="Viscosity (cPs)">
                  <Input placeholder="300 - 500" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
                <FormGroup label="Specific Gravity">
                  <Input placeholder="0.9 - 1.1" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
              </div>

              <div className="mt-2.5">
                <FormGroup label="Appearance (Standard)">
                  <Input placeholder="e.g. Clear light yellow liquid, free from foreign matters" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
              </div>
            </FormCard>

            {/* Packaging & Storage */}
            <FormCard title="Packaging & Storage" step={2} stepColor="bg-[#f59e0b]">
              <div className="flex gap-4 mb-3.5">
                <div className="w-[100px] flex-shrink-0">
                  <FormLabel>Pack Shot</FormLabel>
                  <div className="flex h-20 items-center justify-center rounded-[10px] border-[1.5px] border-dashed border-border bg-secondary text-muted-foreground transition-colors hover:border-primary hover:bg-[#eef4ff]">
                    <div className="text-center">
                      <Upload className="mx-auto h-5 w-5 opacity-50" />
                      <span className="mt-0.5 block text-[9px] font-semibold">Upload</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2.5">
                  <FormGroup label="Container Type">
                    <Select>
                      <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {["Dropper", "Airless Pump", "Tube", "Jar", "Spray", "Sachet", "Pump Bottle", "Bottle"].map((t) => (
                          <SelectItem key={t} value={t.toLowerCase().replace(" ", "_")}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormGroup>
                  <FormGroup label="Material">
                    <Input placeholder="e.g. Glass, PP, PET" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                  <FormGroup label="Shape">
                    <Input placeholder="e.g. Cylinder, Square" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                  <FormGroup label="Cap / Closure">
                    <Input placeholder="e.g. Pump, Dropper, Flip" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                  </FormGroup>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 border-t border-border pt-3.5">
                <FormGroup label="Package Size">
                  <Input defaultValue="30 ml" className="h-9 rounded-[10px] border-border bg-secondary text-[13px]" />
                </FormGroup>
                <FormGroup label="Shelf Life">
                  <div className="flex items-center gap-1.5">
                    <Input type="number" defaultValue={24} className="h-9 w-[70px] rounded-[10px] border-border bg-secondary text-right text-[13px]" />
                    <span className="text-[10px] text-muted-foreground">months</span>
                  </div>
                </FormGroup>
                <FormGroup label="PAO (After Opening)">
                  <div className="flex items-center gap-1.5">
                    <Input type="number" defaultValue={12} className="h-9 w-[70px] rounded-[10px] border-border bg-secondary text-right text-[13px]" />
                    <span className="text-[10px] text-muted-foreground">M</span>
                  </div>
                </FormGroup>
              </div>

              <div className="mt-2.5">
                <FormGroup label="Storage Condition">
                  <Select defaultValue="30">
                    <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">{"Store below 30C"}</SelectItem>
                      <SelectItem value="25">{"Store below 25C"}</SelectItem>
                      <SelectItem value="cold">{"Cold storage (2-8C)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormGroup>
              </div>
            </FormCard>

            {/* Packaging BOM */}
            <FormCard title="Packaging BOM (Bill of Materials)" step={3} stepColor="bg-[#f59e0b]" accentColor="border-t-[3px] border-t-[#f59e0b]"
              headerRight={
                <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg bg-[#eef4ff] text-[11px] font-semibold text-primary border-primary/15 hover:bg-[#dde7ff]" onClick={addBOMRow}>
                  <Plus className="h-3 w-3" />
                  Add Component
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr>
                      <th className="pb-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground" style={{ width: 80 }}>Type</th>
                      <th className="pb-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Item (Stock)</th>
                      <th className="pb-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted-foreground" style={{ width: 60 }}>Qty</th>
                      <th className="pb-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-muted-foreground" style={{ width: 120 }}>Conversion</th>
                      <th className="pb-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted-foreground" style={{ width: 70 }}>Waste%</th>
                      <th className="pb-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-muted-foreground" style={{ width: 90 }}>Cost/Unit</th>
                      <th style={{ width: 36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomItems.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="py-2.5">
                          <select
                            value={item.type}
                            onChange={(e) => updateBOMRow(item.id, "type", e.target.value)}
                            className="w-full rounded-lg border border-border bg-secondary px-1.5 py-1 text-[10px] font-bold text-foreground"
                          >
                            {["bottle", "pump", "cap", "sticker", "box", "shrink_wrap", "other"].map((t) => (
                              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5">
                          <div className="text-[11px] font-bold text-foreground">{item.name || "Select item..."}</div>
                          <div className="font-mono text-[9px] text-[#06b6d4]">{item.code}</div>
                        </td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateBOMRow(item.id, "qty", Number(e.target.value))}
                            className="h-7 w-[50px] ml-auto rounded-lg border-border bg-secondary text-right text-[11px]"
                          />
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              value={item.conversionQty || ""}
                              onChange={(e) => updateBOMRow(item.id, "conversionQty", Number(e.target.value))}
                              placeholder="pcs"
                              className="h-7 w-[50px] rounded-lg border-border bg-secondary text-right text-[11px]"
                            />
                            <select
                              value={item.conversionUnit || ""}
                              onChange={(e) => updateBOMRow(item.id, "conversionUnit", e.target.value)}
                              className="h-7 w-[50px] rounded-lg border border-border bg-secondary px-1 text-[10px]"
                            >
                              <option value="">--</option>
                              <option value="roll">roll</option>
                              <option value="pcs">pcs</option>
                              <option value="sheet">sheet</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            value={item.wastePercent}
                            onChange={(e) => updateBOMRow(item.id, "wastePercent", Number(e.target.value))}
                            className="h-7 w-[50px] ml-auto rounded-lg border-border bg-secondary text-right text-[11px]"
                          />
                        </td>
                        <td className="py-2.5 text-right">
                          <Input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => updateBOMRow(item.id, "unitCost", Number(e.target.value))}
                            className="h-7 w-[70px] ml-auto rounded-lg border-border bg-secondary text-right text-[11px]"
                          />
                          <div className="mt-0.5 text-right font-mono text-[9px] text-muted-foreground">
                            {"= ฿"}{computeEffectiveCost(item).toFixed(item.conversionQty ? 3 : 2)}
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <button onClick={() => removeBOMRow(item.id)} className="text-muted-foreground/50 hover:text-[#ef4444]">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border bg-secondary/50 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg text-[11px] font-semibold" onClick={addBOMRow}>
                  <Plus className="h-3 w-3" />
                  Add Row
                </Button>
                <div className="text-[12px] font-bold text-foreground">
                  {"Total Packaging Cost: "}
                  <span className="font-mono text-sm text-primary">{"฿ "}{packagingCost.toFixed(2)}</span>
                </div>
              </div>
            </FormCard>

            {/* Cost Summary (Dark Panel) */}
            <div className="rounded-2xl bg-[#1e293b] p-6 text-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-card">Total Estimated Cost</h3>
                  <p className="text-[11px] text-[#94a3b8]">Cost of Goods Sold (COGS) Estimation per Unit</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-card">{"฿ "}{totalCost.toFixed(2)}</div>
                  <div className="text-[11px] text-[#94a3b8]">/ unit</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2.5">
                {[
                  { label: "Bulk Cost", value: `฿ ${bulkCost.toFixed(2)}`, editable: false },
                  { label: "Pack Cost", value: `฿ ${packagingCost.toFixed(2)}`, editable: false },
                ].map((c, i) => (
                  <div key={i} className="rounded-[10px] bg-[rgba(255,255,255,0.06)] p-3 text-center">
                    <div className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">{c.label}</div>
                    <div className="mt-1 text-base font-extrabold text-card">{c.value}</div>
                  </div>
                ))}
                <div className="rounded-[10px] bg-[rgba(255,255,255,0.06)] p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">Labor</div>
                  <Input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="mt-1 h-8 rounded-lg border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] text-center font-mono text-sm font-bold text-card"
                  />
                </div>
                <div className="rounded-[10px] bg-[rgba(255,255,255,0.06)] p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wide text-[#94a3b8]">{"QC + OH"}</div>
                  <Input
                    type="number"
                    value={overheadCost}
                    onChange={(e) => setOverheadCost(Number(e.target.value))}
                    className="mt-1 h-8 rounded-lg border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.08)] text-center font-mono text-sm font-bold text-card"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] pt-4 text-[13px]">
                <span className="text-[#94a3b8]">
                  {"If selling at ฿ "}{sellingPrice.toFixed(2)}
                </span>
                <span className="font-bold text-[#4ade80]">
                  {"Margin: "}{marginPercent.toFixed(0)}{"% (฿ "}{(sellingPrice - totalCost).toFixed(2)}{")"}
                </span>
              </div>
            </div>

            {/* Pricing Tiers */}
            <FormCard title="Pricing Tiers" step={4} stepColor="bg-primary" accentColor="border-t-[3px] border-t-primary"
              headerRight={
                <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg bg-[#eef4ff] text-[11px] font-semibold text-primary border-primary/15 hover:bg-[#dde7ff]" onClick={addTier}>
                  <Plus className="h-3 w-3" />
                  Add Tier
                </Button>
              }
            >
              <p className="mb-3 text-[10px] text-muted-foreground">
                {"Total cost ฿"}{totalCost.toFixed(2)}{"/unit - Margin = (Price - Cost) / Price x 100"}
              </p>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-[9px] font-bold uppercase text-muted-foreground">Order Qty</th>
                    <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">{"Price/Unit (฿)"}</th>
                    <th className="pb-2 text-center text-[9px] font-bold uppercase text-muted-foreground">Gross Margin</th>
                    <th className="pb-2 text-right text-[9px] font-bold uppercase text-muted-foreground">Profit/Unit</th>
                    <th className="w-7"></th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => {
                    const profit = tier.pricePerUnit - totalCost
                    const margin = tier.pricePerUnit > 0 ? (profit / tier.pricePerUnit) * 100 : 0
                    return (
                      <tr key={tier.id} className="border-b border-border last:border-0">
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={tier.minQty || ""}
                              onChange={(e) => {
                                setPricingTiers(pricingTiers.map((t) =>
                                  t.id === tier.id ? { ...t, minQty: Number(e.target.value) } : t
                                ))
                              }}
                              className="h-7 w-[70px] rounded-lg border-border bg-secondary text-right text-[12px]"
                            />
                            <span className="text-muted-foreground">--</span>
                            <Input
                              type="number"
                              value={tier.maxQty || ""}
                              onChange={(e) => {
                                setPricingTiers(pricingTiers.map((t) =>
                                  t.id === tier.id ? { ...t, maxQty: Number(e.target.value) || undefined } : t
                                ))
                              }}
                              placeholder="Unlimited"
                              className="h-7 w-[70px] rounded-lg border-border bg-secondary text-right text-[12px]"
                            />
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <Input
                            type="number"
                            value={tier.pricePerUnit || ""}
                            onChange={(e) => {
                              setPricingTiers(pricingTiers.map((t) =>
                                t.id === tier.id ? { ...t, pricePerUnit: Number(e.target.value) } : t
                              ))
                            }}
                            className="h-7 w-[80px] ml-auto rounded-lg border-border bg-secondary text-right font-mono text-[12px] font-bold"
                          />
                        </td>
                        <td className="py-2 text-center">
                          <span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#10b981]">
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono text-[12px] font-bold text-foreground">
                          {"฿"}{profit.toFixed(2)}
                        </td>
                        <td className="py-2 text-center">
                          <button onClick={() => removeTier(tier.id)} className="text-muted-foreground/50 hover:text-[#ef4444]">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </FormCard>

            {/* Attachments */}
            <FormCard title="Attachments">
              <div className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-dashed border-border bg-secondary p-5 transition-colors hover:border-primary hover:bg-[#eef4ff] cursor-pointer">
                <Upload className="h-5 w-5 text-muted-foreground/50" />
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground">{"Drag & Drop files or Click to upload"}</div>
                  <div className="text-[9px] text-muted-foreground/70">PDF, AI, PNG, JPG (Max 10MB) - Label, Artwork, Spec Sheet, COA</div>
                </div>
              </div>
            </FormCard>

          </div>
        </div>
      </div>
    </>
  )
}

/* ========= Shared components ========= */
function FormCard({
  title,
  children,
  step,
  stepColor,
  accentColor,
  headerRight,
}: {
  title: string
  children: React.ReactNode
  step?: number
  stepColor?: string
  accentColor?: string
  headerRight?: React.ReactNode
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-400", accentColor)}>
      <div className="flex items-center justify-between border-b border-border bg-secondary px-5 py-3">
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-foreground">
          {step !== undefined && (
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-[7px] text-[11px] font-extrabold text-card", stepColor)}>
              {step}
            </span>
          )}
          {title}
        </h3>
        {headerRight}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function FormGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-[#ef4444]">*</span>}
      </label>
      {children}
    </div>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{children}</label>
}
