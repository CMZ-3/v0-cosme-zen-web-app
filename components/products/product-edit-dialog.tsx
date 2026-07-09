"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { mutate } from "swr"
import type { Product } from "@/lib/product-types"

interface Props {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

const CATEGORIES = [
  "Soap Bar",
  "Body Wash",
  "Shampoo",
  "Conditioner",
  "Lotion",
  "Cream",
  "Serum",
  "Facial",
  "Other",
] as const

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "discontinued", label: "Discontinued" },
  { value: "development", label: "In Development" },
] as const

export function ProductEditDialog({ product, open, onOpenChange, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nameInternal: "",
    nameTH: "",
    nameEN: "",
    sku: "",
    barcode: "",
    category: "",
    brandName: "",
    customerName: "",
    description: "",
    status: "active",
  })

  // Sync form when product changes
  useEffect(() => {
    if (product) {
      setForm({
        nameInternal: product.nameInternal ?? "",
        nameTH: product.nameTH ?? "",
        nameEN: product.nameEN ?? "",
        sku: product.sku ?? "",
        barcode: product.barcode ?? "",
        category: product.category ?? "",
        brandName: product.brandName ?? "",
        customerName: product.customerName ?? "",
        description: product.description ?? "",
        status: product.status ?? "active",
      })
    }
  }, [product])

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!product) return
    if (!form.nameInternal.trim()) {
      toast.error("ชื่อสินค้าต้องไม่ว่าง")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameInternal: form.nameInternal.trim(),
          nameTH: form.nameTH.trim() || null,
          nameEN: form.nameEN.trim() || null,
          sku: form.sku.trim() || null,
          barcode: form.barcode.trim() || null,
          category: form.category || null,
          brandName: form.brandName.trim() || null,
          customerName: form.customerName.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save")
      }
      toast.success("บันทึกสินค้าแล้ว")
      mutate("/api/products")
      mutate(`/api/products/${product.id}`)
      onOpenChange(false)
      onSaved?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    } finally {
      setSaving(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold">แก้ไขสินค้า</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1 max-h-[70vh] overflow-y-auto pr-1">
          {/* Name fields */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase text-muted-foreground">ชื่อภายใน (Internal Name) *</Label>
            <Input
              value={form.nameInternal}
              onChange={(e) => set("nameInternal", e.target.value)}
              className="h-9 rounded-[10px] border-border bg-secondary text-[13px]"
              placeholder="ชื่อสินค้าสำหรับใช้ภายใน"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">ชื่อภาษาไทย</Label>
              <Input
                value={form.nameTH}
                onChange={(e) => set("nameTH", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px]"
                placeholder="ชื่อภาษาไทย"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">ชื่อภาษาอังกฤษ</Label>
              <Input
                value={form.nameEN}
                onChange={(e) => set("nameEN", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px]"
                placeholder="English Name"
              />
            </div>
          </div>

          {/* SKU + Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">SKU</Label>
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px] font-mono"
                placeholder="SKU-001"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">Barcode</Label>
              <Input
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px] font-mono"
                placeholder="8850000000000"
              />
            </div>
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">หมวดหมู่</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="text-[13px]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">สถานะ</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="h-9 rounded-[10px] border-border bg-secondary text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-[13px]">{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Brand + Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">แบรนด์</Label>
              <Input
                value={form.brandName}
                onChange={(e) => set("brandName", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px]"
                placeholder="ชื่อแบรนด์"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase text-muted-foreground">ลูกค้า</Label>
              <Input
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className="h-9 rounded-[10px] border-border bg-secondary text-[13px]"
                placeholder="ชื่อลูกค้า"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase text-muted-foreground">คำอธิบาย</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="rounded-[10px] border-border bg-secondary text-[13px] min-h-[72px] resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-1">
          <Button
            variant="outline"
            className="rounded-[10px] text-[12px]"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            ยกเลิก
          </Button>
          <Button
            className="rounded-[10px] bg-primary text-[12px] text-primary-foreground"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
