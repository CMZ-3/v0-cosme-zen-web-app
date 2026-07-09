"use client"

import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { CustomerDetail } from "@/lib/customer-types"

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerDetail | null
  onSaved?: () => void
}

export function EditCustomerDialog({ open, onOpenChange, customer, onSaved }: EditCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!customer) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          customerNameEn: formData.get("customerNameEn") || null,
          customerType: formData.get("customerType"),
          customerTier: formData.get("customerTier"),
          businessType: formData.get("businessType"),
          contactPerson: formData.get("contactPerson") || null,
          email: formData.get("email") || null,
          phone: formData.get("phone") || null,
          website: formData.get("website") || null,
          salesRepresentative: formData.get("salesRepresentative") || null,
          leadSource: formData.get("leadSource") || null,
          address: formData.get("address") || null,
          city: formData.get("city") || null,
          province: formData.get("province") || null,
          postalCode: formData.get("postalCode") || null,
          country: formData.get("country") || "Thailand",
          taxId: formData.get("taxId") || null,
          creditLimit: formData.get("creditLimit") ? Number(formData.get("creditLimit")) : null,
          creditDays: formData.get("creditDays") ? Number(formData.get("creditDays")) : 30,
          notes: formData.get("notes") || null,
        }),
      })
      if (!res.ok) throw new Error("Failed to update customer")
      toast.success(`บันทึกข้อมูล ${customer.customerName} เรียบร้อย`)
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
          <DialogTitle className="text-lg font-extrabold">แก้ไขข้อมูลลูกค้า</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            {customer.customerCode} — แก้ไขข้อมูลแล้วกด Save
          </DialogDescription>
        </DialogHeader>

        <form id="edit-customer-form" onSubmit={(e) => e.preventDefault()}>
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-6">
            {/* Company */}
            <Section title="ข้อมูลบริษัท">
              <FormRow label="ชื่อบริษัท *">
                <Input name="customerName" defaultValue={customer.customerName} />
              </FormRow>
              <FormRow label="ชื่อภาษาอังกฤษ">
                <Input name="customerNameEn" defaultValue={customer.customerNameEn ?? ""} />
              </FormRow>
              <div className="grid grid-cols-3 gap-4">
                <FormRow label="ประเภท">
                  <SelectField name="customerType" defaultValue={customer.customerType}
                    options={[["juristic", "นิติบุคคล"], ["individual", "บุคคลธรรมดา"]]} />
                </FormRow>
                <FormRow label="Tier">
                  <SelectField name="customerTier" defaultValue={customer.customerTier}
                    options={[["standard", "Standard"], ["silver", "Silver"], ["gold", "Gold"], ["platinum", "Platinum"]]} />
                </FormRow>
                <FormRow label="ประเภทธุรกิจ">
                  <SelectField name="businessType" defaultValue={customer.businessType}
                    options={[["brand_owner", "Brand Owner"], ["distributor", "Distributor"], ["retailer", "Retailer"], ["oem", "OEM"], ["other", "Other"]]} />
                </FormRow>
              </div>
              <FormRow label="Lead Source">
                <Input name="leadSource" defaultValue={customer.leadSource ?? ""} />
              </FormRow>
            </Section>

            {/* Contact */}
            <Section title="ข้อมูลติดต่อ">
              <FormRow label="ผู้ติดต่อ">
                <Input name="contactPerson" defaultValue={customer.contactPerson ?? ""} />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Email">
                  <Input name="email" type="email" defaultValue={customer.email ?? ""} />
                </FormRow>
                <FormRow label="โทรศัพท์">
                  <Input name="phone" defaultValue={customer.phone ?? ""} />
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Website">
                  <Input name="website" defaultValue={customer.website ?? ""} />
                </FormRow>
                <FormRow label="Sales Rep">
                  <Input name="salesRepresentative" defaultValue={customer.salesRepresentative ?? ""} />
                </FormRow>
              </div>
            </Section>

            {/* Address */}
            <Section title="ที่อยู่">
              <FormRow label="ที่อยู่">
                <Input name="address" defaultValue={customer.address ?? ""} />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="เขต/อำเภอ">
                  <Input name="city" defaultValue={customer.city ?? ""} />
                </FormRow>
                <FormRow label="จังหวัด">
                  <Input name="province" defaultValue={customer.province ?? ""} />
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="รหัสไปรษณีย์">
                  <Input name="postalCode" defaultValue={customer.postalCode ?? ""} maxLength={10} />
                </FormRow>
                <FormRow label="ประเทศ">
                  <Input name="country" defaultValue={customer.country ?? "Thailand"} />
                </FormRow>
              </div>
            </Section>

            {/* Tax & Credit */}
            <Section title="ภาษี & เครดิต">
              <div className="grid grid-cols-3 gap-4">
                <FormRow label="เลขผู้เสียภาษี">
                  <Input name="taxId" defaultValue={customer.taxId ?? ""} maxLength={13} />
                </FormRow>
                <FormRow label="วงเงินเครดิต">
                  <Input name="creditLimit" type="number" defaultValue={customer.creditLimit ?? ""} />
                </FormRow>
                <FormRow label="เครดิต (วัน)">
                  <Input name="creditDays" type="number" defaultValue={customer.creditDays ?? 30} />
                </FormRow>
              </div>
            </Section>

            {/* Notes */}
            <Section title="หมายเหตุ">
              <FormRow label="Notes">
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={customer.notes ?? ""}
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
                const form = document.getElementById("edit-customer-form") as HTMLFormElement | null
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
