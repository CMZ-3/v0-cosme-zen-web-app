"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { normalizeScan } from "@/lib/barcode-utils"
import type { DeliveryOrderLine } from "@/lib/delivery-types"
import { ScanLine, CheckCircle2, Circle, Truck, ClipboardList, AlertTriangle } from "lucide-react"

interface PickVerifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lines: DeliveryOrderLine[]
  mode: "picking" | "shipping"
  onConfirm: () => void
}

/**
 * Barcode-verified pick/ship. The operator scans each line's lot number (or
 * product code) to confirm the correct goods are being picked before the
 * delivery advances. Prevents mis-picks and wrong-lot shipments.
 */
export function PickVerifyDialog({ open, onOpenChange, lines, mode, onConfirm }: PickVerifyDialogProps) {
  const [value, setValue] = useState("")
  const [verified, setVerified] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setValue("")
      setVerified(new Set())
      setError(null)
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  const acceptable = useMemo(() => {
    // Map of scannable value -> line id.
    const map = new Map<string, string>()
    for (const l of lines) {
      if (l.lotNumber) map.set(normalizeScan(l.lotNumber), l.id)
      if (l.pickedLotNumber) map.set(normalizeScan(l.pickedLotNumber), l.id)
      if (l.productCode) map.set(normalizeScan(l.productCode), l.id)
    }
    return map
  }, [lines])

  function scan(raw: string) {
    const clean = normalizeScan(raw)
    setValue("")
    if (!clean) return
    const lineId = acceptable.get(clean)
    if (!lineId) {
      setError(clean)
      return
    }
    setError(null)
    setVerified((prev) => new Set(prev).add(lineId))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      scan(value)
    }
  }

  const allVerified = lines.length > 0 && lines.every((l) => verified.has(l.id))
  const Icon = mode === "picking" ? ClipboardList : Truck
  const title = mode === "picking" ? "Verify Picking" : "Verify Shipment"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" /> {title}
          </DialogTitle>
          <DialogDescription>
            Scan each line&apos;s lot number or product barcode to confirm the correct goods before continuing.
          </DialogDescription>
        </DialogHeader>

        {/* Scan input */}
        <div className="relative">
          <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan lot / product barcode…"
            className="h-11 pl-9 font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
            aria-label="Pick verification scan input"
          />
        </div>
        {error && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> {error} does not match any line on this order
          </div>
        )}

        {/* Lines checklist */}
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {lines.map((l) => {
            const ok = verified.has(l.id)
            return (
              <div
                key={l.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5 text-[12px] transition-colors",
                  ok ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-card",
                )}
              >
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">{l.productName}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {l.productCode && <span className="font-mono">{l.productCode}</span>}
                    {l.lotNumber && <span className="font-mono">· {l.lotNumber}</span>}
                    <span>· {l.quantity.toLocaleString()} {l.unit || "pcs"}</span>
                  </div>
                </div>
                {ok ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[11px] text-muted-foreground">
            {verified.size} / {lines.length} verified
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!allVerified}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {mode === "picking" ? "Confirm Pick" : "Confirm Ship"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
