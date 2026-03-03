"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Truck } from "lucide-react"

interface CreateSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const supplierTypes = [
  { label: "Raw Material", value: "raw_material" },
  { label: "Packaging", value: "packaging" },
  { label: "Service", value: "service" },
  { label: "Equipment", value: "equipment" },
  { label: "Other", value: "other" },
]

export function CreateSupplierDialog({ open, onOpenChange }: CreateSupplierDialogProps) {
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_name_en: "",
    supplier_type: "raw_material",
    contact_person: "",
    email: "",
    phone: "",
    fax: "",
    website: "",
    description: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Thailand",
    tax_id: "",
    branch_code: "",
    payment_terms: "",
    payment_days: "",
    notes: "",
  })

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would call the API
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold">
            <Truck className="h-5 w-5 text-primary" /> Add Supplier
          </DialogTitle>
          <DialogDescription>
            Create a new supplier. Code will be auto-generated.
          </DialogDescription>
        </DialogHeader>

        <form id="create-supplier-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-1 -mx-1 space-y-5">
          {/* Basic Info */}
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Basic Information</legend>
            <div className="grid grid-cols-6 items-center gap-x-4 gap-y-3">
              <Label className="col-span-2 text-right text-[12px]">Supplier Name *</Label>
              <input
                required
                value={formData.supplier_name}
                onChange={e => update("supplier_name", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="e.g. Nikko Chemicals Co., Ltd."
              />
              <Label className="col-span-2 text-right text-[12px]">Name (EN)</Label>
              <input
                value={formData.supplier_name_en}
                onChange={e => update("supplier_name_en", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="English name"
              />
              <Label className="col-span-2 text-right text-[12px]">Type</Label>
              <select
                value={formData.supplier_type}
                onChange={e => update("supplier_type", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                {supplierTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Label className="col-span-2 text-right text-[12px]">Description</Label>
              <textarea
                value={formData.description}
                onChange={e => update("description", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[60px] resize-vertical"
                placeholder="Brief description..."
              />
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Contact</legend>
            <div className="grid grid-cols-6 items-center gap-x-4 gap-y-3">
              <Label className="col-span-2 text-right text-[12px]">Contact Person</Label>
              <input value={formData.contact_person} onChange={e => update("contact_person", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Email</Label>
              <input type="email" value={formData.email} onChange={e => update("email", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Phone</Label>
              <input value={formData.phone} onChange={e => update("phone", e.target.value)}
                className="col-span-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="text-right text-[12px]">Fax</Label>
              <input value={formData.fax} onChange={e => update("fax", e.target.value)}
                className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Website</Label>
              <input value={formData.website} onChange={e => update("website", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="https://..." />
            </div>
          </fieldset>

          {/* Address */}
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Address</legend>
            <div className="grid grid-cols-6 items-center gap-x-4 gap-y-3">
              <Label className="col-span-2 text-right text-[12px]">Address</Label>
              <input value={formData.address} onChange={e => update("address", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">City</Label>
              <input value={formData.city} onChange={e => update("city", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Province</Label>
              <input value={formData.province} onChange={e => update("province", e.target.value)}
                className="col-span-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="text-right text-[12px]">Postal</Label>
              <input value={formData.postal_code} onChange={e => update("postal_code", e.target.value)}
                className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Country</Label>
              <input value={formData.country} onChange={e => update("country", e.target.value)}
                className="col-span-4 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
          </fieldset>

          {/* Tax & Payment */}
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Tax & Payment</legend>
            <div className="grid grid-cols-6 items-center gap-x-4 gap-y-3">
              <Label className="col-span-2 text-right text-[12px]">Tax ID</Label>
              <input value={formData.tax_id} onChange={e => update("tax_id", e.target.value)}
                className="col-span-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="text-right text-[12px]">Branch</Label>
              <input value={formData.branch_code} onChange={e => update("branch_code", e.target.value)}
                className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <Label className="col-span-2 text-right text-[12px]">Payment Terms</Label>
              <input value={formData.payment_terms} onChange={e => update("payment_terms", e.target.value)}
                className="col-span-2 rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="e.g. T/T 30" />
              <Label className="text-right text-[12px]">Days</Label>
              <input type="number" value={formData.payment_days} onChange={e => update("payment_days", e.target.value)}
                className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="30" />
            </div>
          </fieldset>

          {/* Notes */}
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Notes</legend>
            <textarea
              value={formData.notes}
              onChange={e => update("notes", e.target.value)}
              className="w-full rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[80px] resize-vertical"
              placeholder="Additional notes..."
            />
          </fieldset>
        </form>

        <DialogFooter className="pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="create-supplier-form">Create Supplier</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
