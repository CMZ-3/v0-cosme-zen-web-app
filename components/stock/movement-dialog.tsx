"use client"

import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import type { StockCard, MovementType } from "@/lib/stock-types"
import { movementTypeLabels } from "@/lib/stock-types"

type Mode = "receive" | "issue"

const RECEIVE_TYPES: MovementType[] = ["buy_in", "adjust_in", "return", "found"]
const ISSUE_TYPES: MovementType[] = ["use_out", "adjust_out", "damage", "loss"]

export function MovementDialog({
  card,
  mode,
  open,
  onOpenChange,
}: {
  card: StockCard
  mode: Mode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isReceive = mode === "receive"
  const [movementType, setMovementType] = useState<MovementType>(isReceive ? "buy_in" : "use_out")
  const [quantity, setQuantity] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [lotNumber, setLotNumber] = useState("")
  const [expireDate, setExpireDate] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const types = isReceive ? RECEIVE_TYPES : ISSUE_TYPES
  const freeToIssue = card.balance - card.reservedStock

  function reset() {
    setMovementType(isReceive ? "buy_in" : "use_out")
    setQuantity("")
    setUnitCost("")
    setLotNumber("")
    setExpireDate("")
    setNotes("")
  }

  async function handleSubmit() {
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter a valid quantity")
      return
    }
    if (!isReceive && qty > freeToIssue) {
      toast.error(`Only ${freeToIssue} ${card.unit} can be issued`)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/stock/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockCardId: card.id,
          quantity: qty,
          movementType,
          unitCost: unitCost ? Number(unitCost) : undefined,
          lotNumber: lotNumber || undefined,
          expireDate: expireDate || undefined,
          notes: notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Request failed")

      toast.success(
        `${isReceive ? "Received" : "Issued"} ${qty} ${card.unit} · new balance ${data.balance} · ATP ${data.available}`,
      )
      // Refresh all stock views (list, detail, movements).
      mutate((key) => typeof key === "string" && key.startsWith("/api/stock"))
      reset()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save movement")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isReceive ? "Receive Stock" : "Issue Stock"}</DialogTitle>
          <DialogDescription>
            {card.itemCode} · {card.itemName} — balance {card.balance} {card.unit}
            {!isReceive && ` · ${freeToIssue} ${card.unit} issuable`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          <div className="grid gap-1.5">
            <Label htmlFor="mv-type" className="text-xs font-semibold">Movement type</Label>
            <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
              <SelectTrigger id="mv-type" className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{movementTypeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="mv-qty" className="text-xs font-semibold">Quantity ({card.unit})</Label>
            <Input
              id="mv-qty" type="number" min="0" step="any" inputMode="decimal"
              value={quantity} onChange={(e) => setQuantity(e.target.value)}
              placeholder="0" className="h-9"
            />
          </div>

          {isReceive && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="mv-cost" className="text-xs font-semibold">Unit cost (optional)</Label>
                  <Input id="mv-cost" type="number" min="0" step="any" value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)} placeholder="0.00" className="h-9" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="mv-exp" className="text-xs font-semibold">Expiry (optional)</Label>
                  <Input id="mv-exp" type="date" value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)} className="h-9" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="mv-lot" className="text-xs font-semibold">Lot number (optional)</Label>
                <Input id="mv-lot" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="e.g. LOT-260701-A" className="h-9" />
              </div>
            </>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="mv-notes" className="text-xs font-semibold">Notes (optional)</Label>
            <Input id="mv-notes" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Reference / reason" className="h-9" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : isReceive ? "Receive" : "Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
