"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { movementTypeLabels } from "@/lib/stock-types"
import type { MovementType } from "@/lib/stock-types"
import { mockStockCards } from "@/lib/stock-mock-data"

interface CreateMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = ["Type & Item", "Quantity & Cost", "Lot Info", "Notes"]

export function CreateMovementDialog({ open, onOpenChange }: CreateMovementDialogProps) {
  const [step, setStep] = useState(0)
  const [movementType, setMovementType] = useState<string>("")
  const [stockCardId, setStockCardId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [expireDate, setExpireDate] = useState("")
  const [supplierLotNo, setSupplierLotNo] = useState("")
  const [notes, setNotes] = useState("")

  const isIncoming = ["buy_in", "adjust_in", "return", "found"].includes(movementType)

  function handleClose() {
    setStep(0)
    setMovementType("")
    setStockCardId("")
    setQuantity("")
    setUnitCost("")
    setLotNumber("")
    setExpireDate("")
    setSupplierLotNo("")
    setNotes("")
    onOpenChange(false)
  }

  const canNext =
    step === 0 ? movementType && stockCardId :
    step === 1 ? quantity && Number(quantity) > 0 :
    true

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-base font-bold text-foreground">Create Stock Movement</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}: {steps[step]}</DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-1 px-6 pt-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-blue-500" : "bg-secondary"}`} />
          ))}
        </div>

        <div className="px-6 py-5 min-h-[200px]">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold">Movement Type *</Label>
                <Select value={movementType} onValueChange={setMovementType}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(movementTypeLabels) as MovementType[]).map((t) => (
                      <SelectItem key={t} value={t}>{movementTypeLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Stock Card *</Label>
                <Select value={stockCardId} onValueChange={setStockCardId}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStockCards.filter((c) => c.status === "active").map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="font-mono text-xs">{c.itemCode}</span> - {c.itemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold">Quantity * {isIncoming ? "(incoming)" : "(outgoing)"}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="mt-1.5 rounded-xl font-mono"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unit Cost (Admin only)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="mt-1.5 rounded-xl font-mono"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold">Lot Number (optional)</Label>
                <Input className="mt-1.5 rounded-xl font-mono" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="LOT-XXXXXX" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Expiry Date (optional)</Label>
                <Input type="date" className="mt-1.5 rounded-xl" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Supplier Lot No. (optional)</Label>
                <Input className="mt-1.5 rounded-xl" value={supplierLotNo} onChange={(e) => setSupplierLotNo(e.target.value)} placeholder="Supplier reference..." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="text-xs font-semibold">Notes (optional)</Label>
                <Textarea className="mt-1.5 rounded-xl min-h-[120px] resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information..." />
              </div>
              <div className="rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-2">Summary</div>
                <div className="flex flex-col gap-1">
                  <span>Type: <strong className="text-foreground">{movementTypeLabels[movementType as MovementType] ?? "-"}</strong></span>
                  <span>Item: <strong className="text-foreground">{mockStockCards.find((c) => c.id === stockCardId)?.itemCode ?? "-"}</strong></span>
                  <span>Quantity: <strong className="text-foreground">{quantity || "-"}</strong></span>
                  {lotNumber && <span>Lot: <strong className="text-foreground">{lotNumber}</strong></span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 flex items-center gap-2">
          {step > 0 && (
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleClose}>Cancel</Button>
          {step < steps.length - 1 ? (
            <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={handleClose}>
              Create Movement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
