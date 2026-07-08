"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
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
import type { Formula } from "@/lib/formula-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateJobOrderDialog({ open, onOpenChange, onCreated }: Props) {
  const [formulaId, setFormulaId] = useState("")
  const [customer, setCustomer] = useState("")
  const [batchSizeKg, setBatchSizeKg] = useState("10")
  const [plannedQty, setPlannedQty] = useState("")
  const [priority, setPriority] = useState("normal")
  const [plannedStart, setPlannedStart] = useState("")
  const [plannedEnd, setPlannedEnd] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load formulas from DB for the dropdown.
  const { data: formulasData } = useSWR(open ? "/api/formulas" : null, fetcher, {
    revalidateOnFocus: false,
  })
  const formulas: Formula[] = useMemo(() => formulasData?.formulas ?? [], [formulasData])

  const selectedFormula = useMemo(
    () => formulas.find((f) => f.id === formulaId),
    [formulas, formulaId],
  )

  // Auto-fill batch size from formula default.
  function handleFormulaChange(id: string) {
    setFormulaId(id)
    const f = formulas.find((x) => x.id === id)
    if (f) setBatchSizeKg(String(f.batchSize ?? 10))
  }

  function reset() {
    setFormulaId("")
    setCustomer("")
    setBatchSizeKg("10")
    setPlannedQty("")
    setPriority("normal")
    setPlannedStart("")
    setPlannedEnd("")
    setAssignedTo("")
  }

  async function handleSubmit() {
    if (!formulaId) {
      toast.error("Please select a formula")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/job-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulaId,
          formulaName: selectedFormula?.formulaName ?? "",
          formulaCode: selectedFormula?.formulaCode,
          customer: customer.trim() || undefined,
          batchSizeKg: parseFloat(batchSizeKg) || 10,
          plannedQty: plannedQty ? parseInt(plannedQty) : undefined,
          unit: "kg",
          priority,
          plannedStart: plannedStart || undefined,
          plannedEnd: plannedEnd || undefined,
          assignedTo: assignedTo.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create job order")
      }
      toast.success("Job Order created", {
        description: `${selectedFormula?.formulaName ?? ""} — ${batchSizeKg} kg batch`,
      })
      reset()
      onOpenChange(false)
      onCreated?.()
    } catch (e) {
      toast.error("Error creating job order", { description: String(e) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-extrabold">Create New Job Order</DialogTitle>
          <DialogDescription>
            Select a formula and fill in production details to create a new job order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Formula picker */}
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
              Formula <span className="text-destructive">*</span>
            </Label>
            <select
              className="w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
              value={formulaId}
              onChange={(e) => handleFormulaChange(e.target.value)}
            >
              <option value="">Select formula...</option>
              {formulas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.formulaCode} — {f.formulaName}
                </option>
              ))}
            </select>
            {selectedFormula && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Type: {selectedFormula.productType ?? selectedFormula.cosmeticForm ?? "—"} &bull; Default batch: {selectedFormula.batchSize} {selectedFormula.batchUnit}
              </p>
            )}
          </div>

          {/* Batch size + planned qty */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Batch Size (kg) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0.1}
                step={0.1}
                placeholder="e.g. 10"
                value={batchSizeKg}
                onChange={(e) => setBatchSizeKg(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">
                Planned Qty (units)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={plannedQty}
                onChange={(e) => setPlannedQty(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
          </div>

          {/* Customer + assigned to */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Customer</Label>
              <Input
                placeholder="e.g. Glow Lab Co., Ltd."
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Assigned To</Label>
              <Input
                placeholder="e.g. Khun Somchai"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
          </div>

          {/* Dates + priority */}
          <div className="grid grid-cols-3 gap-3.5">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Planned Start</Label>
              <Input
                type="date"
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Planned End</Label>
              <Input
                type="date"
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="rounded-[10px]"
              />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-muted-foreground">Priority</Label>
              <select
                className="w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-secondary/50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Job Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
