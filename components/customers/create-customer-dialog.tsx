"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, User, DollarSign, MapPin, FileText } from "lucide-react"

interface CreateCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCustomerDialog({ open, onOpenChange }: CreateCustomerDialogProps) {
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Company", icon: Building },
    { label: "Contact", icon: User },
    { label: "Address", icon: MapPin },
    { label: "Credit", icon: DollarSign },
    { label: "Notes", icon: FileText },
  ]

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setStep(0), 200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-card">
          <DialogTitle className="text-lg font-extrabold">New Customer</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Fill in the customer details. Customer code will be auto-generated.
          </DialogDescription>

          {/* Stepper */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((s, i) => {
              const StepIcon = s.icon
              return (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold transition-all",
                    step === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : i < step
                        ? "bg-[#ecfdf5] text-[#15803d]"
                        : "bg-secondary text-muted-foreground"
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              )
            })}
          </div>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
          {/* Step 0: Company */}
          {step === 0 && (
            <div className="space-y-4">
              <SectionTitle>Company Information</SectionTitle>
              <FormRow label="Company Name *">
                <Input placeholder="e.g. Glow Lab Co., Ltd." />
              </FormRow>
              <FormRow label="English Name">
                <Input placeholder="English name (optional)" />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Customer Type">
                  <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="juristic">Juristic</option>
                    <option value="individual">Individual</option>
                  </select>
                </FormRow>
                <FormRow label="Tier">
                  <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="standard">Standard</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Business Type">
                  <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="brand_owner">Brand Owner</option>
                    <option value="distributor">Distributor</option>
                    <option value="retailer">Retailer</option>
                    <option value="oem">OEM</option>
                    <option value="other">Other</option>
                  </select>
                </FormRow>
                <FormRow label="Lead Source">
                  <select className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="">-- Select --</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </FormRow>
              </div>
            </div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <div className="space-y-4">
              <SectionTitle>Primary Contact</SectionTitle>
              <FormRow label="Contact Person">
                <Input placeholder="Full name" />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Email">
                  <Input type="email" placeholder="email@example.com" />
                </FormRow>
                <FormRow label="Phone">
                  <Input placeholder="02-xxx-xxxx" />
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Fax">
                  <Input placeholder="(optional)" />
                </FormRow>
                <FormRow label="LINE ID">
                  <Input placeholder="@line_id" />
                </FormRow>
              </div>
              <FormRow label="Website">
                <Input placeholder="https://" />
              </FormRow>
              <FormRow label="Sales Representative">
                <Input placeholder="Assigned sales rep" />
              </FormRow>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="space-y-4">
              <SectionTitle>Registered Address</SectionTitle>
              <FormRow label="Address">
                <Input placeholder="Street address" />
              </FormRow>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="City / District">
                  <Input placeholder="e.g. Watthana" />
                </FormRow>
                <FormRow label="Province">
                  <Input placeholder="e.g. Bangkok" />
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Postal Code">
                  <Input placeholder="e.g. 10110" />
                </FormRow>
                <FormRow label="Country">
                  <Input placeholder="Thailand" defaultValue="Thailand" />
                </FormRow>
              </div>
            </div>
          )}

          {/* Step 3: Credit & Tax */}
          {step === 3 && (
            <div className="space-y-4">
              <SectionTitle>Tax & Credit</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Tax ID">
                  <Input placeholder="13-digit tax ID" maxLength={13} />
                </FormRow>
                <FormRow label="Branch Code">
                  <Input placeholder="e.g. 00000" maxLength={10} />
                </FormRow>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Credit Limit">
                  <Input type="number" placeholder="0.00" />
                </FormRow>
                <FormRow label="Credit Days">
                  <Input type="number" placeholder="30" defaultValue="30" />
                </FormRow>
              </div>
            </div>
          )}

          {/* Step 4: Notes */}
          {step === 4 && (
            <div className="space-y-4">
              <SectionTitle>Additional Notes</SectionTitle>
              <FormRow label="Notes">
                <textarea
                  rows={4}
                  placeholder="Any additional notes about this customer..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none resize-none focus:border-primary"
                />
              </FormRow>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-secondary/30">
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleClose} className="text-[12px]">Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" className="text-[12px]" onClick={() => setStep(s => s - 1)}>
                  Back
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button size="sm" className="text-[12px]" onClick={() => setStep(s => s + 1)}>
                  Next
                </Button>
              ) : (
                <Button size="sm" className="text-[12px]" onClick={handleClose}>
                  Create Customer
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[13px] font-bold text-foreground pb-1 border-b border-border mb-2">{children}</h3>
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">{label}</Label>
      {children}
    </div>
  )
}
