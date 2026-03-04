"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FlaskConical, Beaker, Settings2, FileText } from "lucide-react"

interface CreateFormulaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFormulaDialog({ open, onOpenChange }: CreateFormulaDialogProps) {
  const [step, setStep] = useState(0)

  const steps = [
    { label: "Basic Info", icon: FlaskConical },
    { label: "Batch & QC", icon: Beaker },
    { label: "Settings", icon: Settings2 },
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
          <DialogTitle className="text-lg font-extrabold">New Formula</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">
            Create a new formula record. Code will be auto-generated.
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
                      ? "bg-violet-600 text-white shadow-sm"
                      : i < step
                        ? "bg-violet-50 text-violet-700"
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

        <div className="px-6 py-5 min-h-[340px]">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Name (TH) *</Label>
                  <Input placeholder="e.g. เซรั่มวิตามินซี 15%" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Name (EN)</Label>
                  <Input placeholder="e.g. Vitamin C 15% Serum" className="text-[12px] rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Formula Type *</Label>
                  <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]">
                    <option value="master">Master Formula</option>
                    <option value="variation">Variation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Product Type *</Label>
                  <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]">
                    <option value="">Select type...</option>
                    <option value="serum">Serum</option>
                    <option value="cream">Cream</option>
                    <option value="lotion">Lotion</option>
                    <option value="cleanser">Cleanser</option>
                    <option value="sunscreen">Sunscreen</option>
                    <option value="toner">Toner</option>
                    <option value="mask">Mask</option>
                    <option value="shampoo">Shampoo</option>
                    <option value="lip">Lip Product</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Cosmetic Form</Label>
                  <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]">
                    <option value="">Select form...</option>
                    <option value="Emulsion (O/W)">Emulsion (O/W)</option>
                    <option value="Emulsion (W/O)">Emulsion (W/O)</option>
                    <option value="Gel">Gel</option>
                    <option value="Solution">Solution</option>
                    <option value="Powder">Powder</option>
                    <option value="Solid">Solid</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Customer / Brand Owner</Label>
                  <Input placeholder="Search customer..." className="text-[12px] rounded-lg" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Parent Formula (for Variations)</Label>
                <Input placeholder="Search parent formula..." className="text-[12px] rounded-lg" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground">Batch & QC Parameters</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Batch Size *</Label>
                  <Input type="number" placeholder="100" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Batch Unit *</Label>
                  <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]">
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Density (g/mL)</Label>
                  <Input type="number" step="0.01" placeholder="1.00" className="text-[12px] rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Target pH (Min - Max)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" step="0.1" placeholder="5.0" className="text-[12px] rounded-lg" />
                    <span className="text-[11px] text-muted-foreground">to</span>
                    <Input type="number" step="0.1" placeholder="7.0" className="text-[12px] rounded-lg" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Target Viscosity (Min - Max)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" placeholder="5000" className="text-[12px] rounded-lg" />
                    <span className="text-[11px] text-muted-foreground">to</span>
                    <Input type="number" placeholder="15000" className="text-[12px] rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Viscosity Unit</Label>
                  <select className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px]">
                    <option value="cP">cP (centipoise)</option>
                    <option value="mPa.s">mPa.s</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Unit Weight (g)</Label>
                  <Input type="number" step="0.1" placeholder="50" className="text-[12px] rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground">Settings & Shelf Life</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Shelf Life (Months)</Label>
                  <Input type="number" placeholder="24" className="text-[12px] rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold">Storage Conditions</Label>
                  <Input placeholder="e.g. Store below 30 C, away from sunlight" className="text-[12px] rounded-lg" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Packaging Compatibility Notes</Label>
                <Textarea
                  placeholder="e.g. Compatible with HDPE, PET. Avoid metallic containers."
                  className="text-[12px] rounded-lg min-h-[80px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Initial Version</Label>
                <div className="flex items-center gap-3">
                  <Input value="v1.0" readOnly className="w-24 text-[12px] rounded-lg bg-secondary" />
                  <span className="text-[11px] text-muted-foreground">Auto-assigned. Subsequent versions are created via Version Management.</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[13px] font-bold text-foreground">Additional Notes</h3>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Internal Notes</Label>
                <Textarea
                  placeholder="Any internal notes about this formula..."
                  className="text-[12px] rounded-lg min-h-[100px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold">Tags / Keywords</Label>
                <Input placeholder="e.g. brightening, anti-aging, sensitive (comma-separated)" className="text-[12px] rounded-lg" />
              </div>

              {/* Summary preview */}
              <div className="rounded-xl bg-secondary/60 border border-border p-4 space-y-2 mt-4">
                <h4 className="text-[12px] font-bold text-foreground">Summary</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A new <strong>Master Formula</strong> will be created in <strong>Draft</strong> status.
                  After saving, you can add ingredients, phases, processing steps, and QC specs from the detail page.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-card gap-2">
          {step > 0 && (
            <Button variant="outline" size="sm" className="rounded-lg text-[12px]" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="ghost" size="sm" className="rounded-lg text-[12px]" onClick={handleClose}>
            Cancel
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" className="rounded-lg text-[12px] bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button size="sm" className="rounded-lg text-[12px] bg-violet-600 hover:bg-violet-700 text-white" onClick={handleClose}>
              Create Formula
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
