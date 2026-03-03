"use client"

import { useState } from "react"
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
import type { RegistrationType } from "@/lib/fda-types"
import { REGISTRATION_TYPE_MAP } from "@/lib/fda-types"
import { toast } from "sonner"

interface CreateFdaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFdaDialog({ open, onOpenChange }: CreateFdaDialogProps) {
  const [regType, setRegType] = useState<RegistrationType>("jk")
  const [productNameTh, setProductNameTh] = useState("")
  const [productNameEn, setProductNameEn] = useState("")
  const [tradeName, setTradeName] = useState("")
  const [cosmeticType, setCosmeticType] = useState("")
  const [cosmeticForm, setCosmeticForm] = useState("")
  const [manufacturerName, setManufacturerName] = useState("")
  const [notes, setNotes] = useState("")

  const handleCreate = () => {
    if (!productNameTh.trim()) {
      toast.error("Product name (TH) is required")
      return
    }
    toast.success("FDA Registration created successfully")
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setRegType("jk")
    setProductNameTh("")
    setProductNameEn("")
    setTradeName("")
    setCosmeticType("")
    setCosmeticForm("")
    setManufacturerName("")
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">New FDA Registration</DialogTitle>
          <DialogDescription className="text-xs">
            Create a new Thai FDA cosmetic registration in draft status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Registration Type Toggle */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold">Registration Type</Label>
            <div className="flex gap-2">
              {(["jk", "jr"] as RegistrationType[]).map((t) => {
                const cfg = REGISTRATION_TYPE_MAP[t]
                const isActive = regType === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRegType(t)}
                    className={`flex-1 rounded-lg border-2 px-4 py-3 text-center transition-all ${
                      isActive
                        ? t === "jk"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <p className="text-lg font-extrabold">{cfg.label}</p>
                    <p className="text-[11px] font-medium">{cfg.labelTh}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {t === "jk" ? "Cosmetic Notification" : "Cosmetic Registration"}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Product Name Thai */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">
              Product Name (Thai) <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. เซรั่มวิตามินซี 15%"
              value={productNameTh}
              onChange={(e) => setProductNameTh(e.target.value)}
            />
          </div>

          {/* Product Name English */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Product Name (English)</Label>
            <Input
              placeholder="e.g. Vitamin C 15% Serum"
              value={productNameEn}
              onChange={(e) => setProductNameEn(e.target.value)}
            />
          </div>

          {/* Trade Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Trade Name / Brand</Label>
            <Input
              placeholder="Brand name"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
            />
          </div>

          {/* Cosmetic Type & Form Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Cosmetic Type</Label>
              <Input
                placeholder="e.g. Serum, Cream"
                value={cosmeticType}
                onChange={(e) => setCosmeticType(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold">Cosmetic Form</Label>
              <Input
                placeholder="e.g. Liquid, Cream"
                value={cosmeticForm}
                onChange={(e) => setCosmeticForm(e.target.value)}
              />
            </div>
          </div>

          {/* Manufacturer */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Manufacturer Name</Label>
            <Input
              placeholder="Manufacturing company name"
              value={manufacturerName}
              onChange={(e) => setManufacturerName(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-semibold">Notes</Label>
            <Textarea
              placeholder="Internal notes..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreate}>
            Create Registration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
