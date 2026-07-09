"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { SupplierDetail } from "@/lib/supplier-types"

interface EditSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: SupplierDetail | null
  onSaved?: () => void
}

export function EditSupplierDialog({ open, onOpenChange, supplier, onSaved }: EditSupplierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!supplier) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: formData.get("supplierName"),
          supplierNameEn: formData.get("supplierNameEn") || null,
          supplierType: formData.get("supplierType"),
          grade: formData.get("grade"),
          status: formData.get("status"),
          contactPerson: formData.get("contactPerson") || null,
          email: formData.get("email") || null,
          phone: formData.get("phone") || null,
          website: formData.get("website") || null,
          description: formData.get("description") || null,
          address: formData.get("address") || null,
          city: formData.get("city") || null,
          country: formData.get("country") || "Thailand",
          taxId: formData.get("taxId") || null,
          paymentTerms: formData.get("paymentTerms") || null,
          paymentDays: formData.get("paymentDays") ? Number(formData.get("paymentDays")) : 30,
          avgLeadTimeDays: formData.get("avgLeadTimeDays") ? Number(formData.get("avgLeadTimeDays")) : null,
          moq: formData.get("moq") || null,
          notes: formData.get("notes") || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update supplier")
      toast.success(`บันทึกข้อมูล ${supplier.supplierName} เรียบร้อย`)
      onOpenChange(false)
      onSaved?.()
    } catch (err) {
      toast.error("บันทึกไม่สำเร็จ: " + String(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <DialogTitle className="text-lg font-extrabold">แก้ไขข้อมูลซัพพลายเออร์</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            {supplier.supplierCode} — แก้ไขข้อมูลแล้วกด Save
          </DialogDescription>
        </DialogHeader>

        <form id="edit-supplier-form" onSubmit={(e) => e.preventDefault()}>
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-6">
            <Section title="ข้อมูลทั่วไป">
              <FormRow label="ชื่อซัพพลายเออร์ *">
                <Input name="supplierName" defaultValue={supplier.supplierName} />
              </FormRow>
              <FormRow label="ชื่อภาษาอังกฤษ">
                <Input name="supplierNameEn" defaultValue={supplier.supplierNameEn ?? ""} />
              </FormRow>
              <div className="grid grid-cols-3 gap-4">
                <FormRow label="ประเภท">
                  <SelectField name="supplierType" defaultValue={supplier.supplierType}
                    options={[["raw_material", "Raw Material"], ["packaging", "Packaging"], ["service", "Service"], ["equipment", "Equipment"], ["other", "Other"]]} />
                </FormRow>
                <FormRow label="Grade">
                  <SelectField name="grade" defaultValue={supplier.grade}
                    options={[["A+", "A+"], ["A", "A"], ["B+", "B+"], ["B", "B"], ["C+", "C+"], ["C", "C"]]} />
                </FormRow>
                <FormRow label="สถานะ">
                  <SelectField name="status" defaultValue={supplier.status}
                    options={[["active", "Active"], ["pending", "Pending"], ["issue", "Issue"], ["inactive", "Inactive"]]} />
                </FormRow>
              </div>
              <FormRow label="รายละเอียด">
                <Input name="description" defaultValue={supplier.description ?? ""} />
              </FormRow>
            </Section>

            <Section title="ข้อมูลติดต่อ">
              <FormRow label="ผู้ติดต่อ">
                <Input name="contactPerson" defaultValue={supplier.contactPerson ?? ""} />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Email">
                  <Input name="email" type="email" defaultValue={supplier.email ?? ""} />
                </FormRow>
                <FormRow label="โทรศัพท์">
                  <Input name="phone" defaultValue={supplier.phone ?? ""} />
                </FormRow>
              </div>
              <FormRow label="Website">
                <Input name="website" defaultValue={supplier.website ?? ""} />
              </FormRow>
            </Section>

            <Section title="ที่อยู่">
              <FormRow label="ที่อยู่">
                <Input name="address" defaultValue={supplier.address ?? ""} />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="เมือง">
                  <Input name="city" defaultValue={supplier.city ?? ""} />
                </FormRow>
                <FormRow label="ประเทศ">
                  <Input name="country" defaultValue={supplier.country ?? "Thailand"} />
                </FormRow>
              </div>
            </Section>

            <Section title="เงื่อนไขการค้า">
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="เลขผู้เสียภาษี">
                  <Input name="taxId" defaultValue={supplier.taxId ?? ""} maxLength={13} />
                </FormRow>
                <FormRow label="เงื่อนไขชำระเงิน">
                  <Input name="paymentTerms" defaultValue={supplier.paymentTerms ?? ""} />
                </FormRow>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormRow label="เครดิต (วัน)">
                  <Input name="paymentDays" type="number" defaultValue={supplier.paymentDays ?? 30} />
                </FormRow>
                <FormRow label="Lead Time (วัน)">
                  <Input name="avgLeadTimeDays" type="number" defaultValue={supplier.avgLeadTimeDays ?? ""} />
                </FormRow>
                <FormRow label="MOQ">
                  <Input name="moq" defaultValue={supplier.moq ?? ""} />
                </FormRow>
              </div>
            </Section>

            <Section title="หมายเหตุ">
              <FormRow label="Notes">
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={supplier.notes ?? ""}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none resize-none focus:border-primary"
                />
              </FormRow>
            </Section>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border bg-secondary/30">
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-[12px]">
              Cancel
            </Button>
            <Button
              size="sm"
              className="text-[12px]"
              disabled={isSubmitting}
              onClick={() => {
                const form = document.getElementById("edit-supplier-form") as HTMLFormElement | null
                if (form) handleSubmit(new FormData(form))
              }}
            >
              {isSubmitting ? "กำลังบันทึก..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold text-foreground pb-1 border-b border-border">{title}</h3>
      {children}
    </div>
  )
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">{label}</Label>
      {children}
    </div>
  )
}

function SelectField({ name, defaultValue, options }: { name: string; defaultValue: string; options: [string, string][] }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  )
}
