"use client"

import { useState } from "react"
import { Loader2, PackagePlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { itemTypeLabels } from "@/lib/stock-types"
import type { ItemType } from "@/lib/stock-types"
import { toast } from "sonner"

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful create so the caller can revalidate SWR data. */
  onCreated?: () => void
  /** Existing category/unit values used to power quick-pick datalists. */
  categories?: string[]
  units?: string[]
}

interface FormState {
  itemCode: string
  itemName: string
  itemNameEn: string
  itemType: ItemType
  category: string
  unit: string
  initialStock: string
  minStock: string
  maxStock: string
  reorderPoint: string
  unitCost: string
  supplier: string
  location: string
  barcode: string
  tradeName: string
  inciName: string
  casNo: string
  storageTemp: string
  expiryDate: string
}

const EMPTY: FormState = {
  itemCode: "",
  itemName: "",
  itemNameEn: "",
  itemType: "raw_material",
  category: "",
  unit: "",
  initialStock: "",
  minStock: "",
  maxStock: "",
  reorderPoint: "",
  unitCost: "",
  supplier: "",
  location: "",
  barcode: "",
  tradeName: "",
  inciName: "",
  casNo: "",
  storageTemp: "",
  expiryDate: "",
}

const num = (v: string) => (v.trim() === "" ? undefined : Number(v))

export function AddStockDialog({
  open,
  onOpenChange,
  onCreated,
  categories = [],
  units = [],
}: AddStockDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => setForm(EMPTY)

  const isRawMaterial = form.itemType === "raw_material"

  const canSubmit =
    form.itemCode.trim() !== "" &&
    form.itemName.trim() !== "" &&
    form.category.trim() !== "" &&
    form.unit.trim() !== "" &&
    !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/stock/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCode: form.itemCode.trim(),
          itemName: form.itemName.trim(),
          itemNameEn: form.itemNameEn.trim() || undefined,
          itemType: form.itemType,
          category: form.category.trim(),
          unit: form.unit.trim(),
          initialStock: num(form.initialStock),
          minStock: num(form.minStock),
          maxStock: num(form.maxStock),
          reorderPoint: num(form.reorderPoint),
          unitCost: num(form.unitCost),
          supplier: form.supplier.trim() || undefined,
          location: form.location.trim() || undefined,
          barcode: form.barcode.trim() || undefined,
          tradeName: form.tradeName.trim() || undefined,
          inciName: form.inciName.trim() || undefined,
          casNo: form.casNo.trim() || undefined,
          storageTemp: form.storageTemp.trim() || undefined,
          expiryDate: form.expiryDate.trim() || undefined,
          createdBy: "admin",
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to create stock item")
      }
      toast.success(`Created ${data.itemCode}`, {
        description: `${form.itemName} added to inventory`,
      })
      reset()
      onOpenChange(false)
      onCreated?.()
    } catch (err) {
      toast.error("Could not create stock item", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-hidden rounded-2xl p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackagePlus className="h-4 w-4" />
            </span>
            Add New Stock Item
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a stock card. Fields marked with * are required. An opening balance
            is recorded in the movement ledger automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Identity */}
          <SectionTitle>Identity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Item Code *">
              <Input
                className="mt-1.5 rounded-xl font-mono"
                placeholder="e.g. RAM0010101"
                value={form.itemCode}
                onChange={(e) => set("itemCode", e.target.value.toUpperCase())}
              />
            </Field>
            <Field label="Item Type *">
              <Select value={form.itemType} onValueChange={(v) => set("itemType", v as ItemType)}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(itemTypeLabels) as ItemType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {itemTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Item Name (TH) *">
              <Input
                className="mt-1.5 rounded-xl"
                placeholder="ชื่อสินค้า"
                value={form.itemName}
                onChange={(e) => set("itemName", e.target.value)}
              />
            </Field>
            <Field label="Item Name (EN)">
              <Input
                className="mt-1.5 rounded-xl"
                placeholder="English name"
                value={form.itemNameEn}
                onChange={(e) => set("itemNameEn", e.target.value)}
              />
            </Field>
            <Field label="Category *">
              <Input
                className="mt-1.5 rounded-xl"
                placeholder="e.g. Surfactant"
                list="stock-category-list"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <datalist id="stock-category-list">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Unit *">
              <Input
                className="mt-1.5 rounded-xl"
                placeholder="e.g. kg, ชิ้น"
                list="stock-unit-list"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
              <datalist id="stock-unit-list">
                {units.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
          </div>

          {/* Quantities & thresholds */}
          <SectionTitle className="mt-6">Quantities &amp; Thresholds</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Opening Balance">
              <Input type="number" min={0} step="0.01" className="mt-1.5 rounded-xl font-mono" placeholder="0" value={form.initialStock} onChange={(e) => set("initialStock", e.target.value)} />
            </Field>
            <Field label="Min Stock">
              <Input type="number" min={0} step="0.01" className="mt-1.5 rounded-xl font-mono" placeholder="0" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} />
            </Field>
            <Field label="Max Stock">
              <Input type="number" min={0} step="0.01" className="mt-1.5 rounded-xl font-mono" placeholder="0" value={form.maxStock} onChange={(e) => set("maxStock", e.target.value)} />
            </Field>
            <Field label="Reorder Point">
              <Input type="number" min={0} step="0.01" className="mt-1.5 rounded-xl font-mono" placeholder="0" value={form.reorderPoint} onChange={(e) => set("reorderPoint", e.target.value)} />
            </Field>
          </div>

          {/* Cost & sourcing */}
          <SectionTitle className="mt-6">Cost &amp; Sourcing</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Unit Cost (฿)">
              <Input type="number" min={0} step="0.01" className="mt-1.5 rounded-xl font-mono" placeholder="0.00" value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)} />
            </Field>
            <Field label="Supplier">
              <Input className="mt-1.5 rounded-xl" placeholder="Supplier name" value={form.supplier} onChange={(e) => set("supplier", e.target.value)} />
            </Field>
            <Field label="Location">
              <Input className="mt-1.5 rounded-xl" placeholder="e.g. Rack A-01" value={form.location} onChange={(e) => set("location", e.target.value)} />
            </Field>
            <Field label="Barcode">
              <Input className="mt-1.5 rounded-xl font-mono" placeholder="Barcode / SKU" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
            </Field>
          </div>

          {/* Regulatory (raw materials mainly) */}
          <SectionTitle className="mt-6">
            Regulatory &amp; Storage
            {isRawMaterial && <span className="ml-2 text-[10px] font-normal text-muted-foreground">(INCI / CAS recommended for raw materials)</span>}
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Trade Name">
              <Input className="mt-1.5 rounded-xl" placeholder="Commercial / trade name" value={form.tradeName} onChange={(e) => set("tradeName", e.target.value)} />
            </Field>
            <Field label="INCI Name">
              <Input className="mt-1.5 rounded-xl" placeholder="INCI nomenclature" value={form.inciName} onChange={(e) => set("inciName", e.target.value)} />
            </Field>
            <Field label="CAS No.">
              <Input className="mt-1.5 rounded-xl font-mono" placeholder="e.g. 7732-18-5" value={form.casNo} onChange={(e) => set("casNo", e.target.value)} />
            </Field>
            <Field label="Storage Temp.">
              <Input className="mt-1.5 rounded-xl" placeholder="e.g. Room temp, 2-8°C" value={form.storageTemp} onChange={(e) => set("storageTemp", e.target.value)} />
            </Field>
            <Field label="Expiry Date">
              <Input type="date" className="mt-1.5 rounded-xl" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </Field>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border shrink-0 flex items-center gap-2">
          <div className="flex-1 text-[11px] text-muted-foreground">
            {!canSubmit && !submitting && "Fill in Item Code, Name, Category and Unit to continue."}
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />}
            {submitting ? "Creating..." : "Create Stock Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={`mb-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground ${className ?? ""}`}>
      {children}
    </h4>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
    </div>
  )
}
