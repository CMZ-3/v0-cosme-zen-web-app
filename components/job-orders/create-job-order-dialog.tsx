"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateJobOrderDialog({ open, onOpenChange }: Props) {
  const [customer, setCustomer] = useState("")
  const [product, setProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [priority, setPriority] = useState("medium")
  const [dueDate, setDueDate] = useState("")
  const [note, setNote] = useState("")

  const handleSubmit = () => {
    if (!customer || !product || !quantity || !dueDate) {
      toast.error("Please fill in all required fields")
      return
    }
    toast.success("Job Order created successfully")
    onOpenChange(false)
    // reset
    setCustomer("")
    setProduct("")
    setQuantity("")
    setPriority("medium")
    setDueDate("")
    setNote("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Create New Job Order</DialogTitle>
          <DialogDescription>Fill in the order details to create a new production job.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
              Customer <span className="text-destructive">*</span>
            </Label>
            <select
              className="w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            >
              <option value="">Select customer...</option>
              <option value="c-1">Glow Lab Co., Ltd. (GlowUp)</option>
              <option value="c-2">BeautyKing (K-Glow)</option>
              <option value="c-3">PureMind (ClearSkin)</option>
              <option value="c-4">LuxeSkin (LuxeGlow)</option>
              <option value="c-5">NaturaSkin (NaturaGlow)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Product <span className="text-destructive">*</span>
              </Label>
              <select
                className="w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              >
                <option value="">Select product...</option>
                <option>Vitamin C Brightening Serum 30ml</option>
                <option>Hyaluronic Acid Toner 150ml</option>
                <option>Cleansing Foam pH 5.5 150ml</option>
                <option>Sleeping Mask Lavender 50ml</option>
                <option>Niacinamide Body Lotion 250ml</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Priority</Label>
              <select
                className="w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Notes</Label>
            <textarea
              className="w-full resize-y rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              rows={2}
              placeholder="Additional notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-secondary/50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Job Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
