"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { findCardByScan, normalizeScan } from "@/lib/barcode-utils"
import type { StockCard } from "@/lib/stock-types"
import { ScanLine, Minus, Plus, Trash2, ClipboardCheck, RotateCcw, Save, AlertTriangle } from "lucide-react"

interface CountRow {
  card: StockCard
  counted: number
  lastAt: number
}

interface CountPanelProps {
  cards: StockCard[]
}

export function CountPanel({ cards }: CountPanelProps) {
  const [value, setValue] = useState("")
  const [listening, setListening] = useState(true)
  const [rows, setRows] = useState<CountRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!listening) return
    const el = inputRef.current
    el?.focus()
    const t = setInterval(() => {
      if (listening && document.activeElement !== el) el?.focus()
    }, 800)
    return () => clearInterval(t)
  }, [listening])

  function scan(raw: string) {
    const clean = normalizeScan(raw)
    if (!clean) return
    setValue("")
    const match = findCardByScan(cards, clean)
    if (!match) {
      setError(clean)
      toast.error(`No item matches ${clean}`)
      return
    }
    setError(null)
    setRows((prev) => {
      const existing = prev.find((r) => r.card.id === match.id)
      if (existing) {
        return prev.map((r) => (r.card.id === match.id ? { ...r, counted: r.counted + 1, lastAt: Date.now() } : r))
      }
      return [{ card: match, counted: 1, lastAt: Date.now() }, ...prev]
    })
  }

  function adjust(id: string, delta: number) {
    setRows((prev) =>
      prev
        .map((r) => (r.card.id === id ? { ...r, counted: Math.max(0, r.counted + delta) } : r))
        .filter((r) => r.counted > 0 || r.card.id !== id),
    )
  }

  function setCounted(id: string, n: number) {
    setRows((prev) => prev.map((r) => (r.card.id === id ? { ...r, counted: Math.max(0, n) } : r)))
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.card.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      scan(value)
    }
  }

  const variances = rows.filter((r) => r.counted !== r.card.balance)

  async function finalize() {
    if (rows.length === 0) {
      toast.error("Scan at least one item before finalizing")
      return
    }
    if (variances.length === 0) {
      toast.success("Count matches the system for every item — no adjustments needed")
      setRows([])
      setError(null)
      return
    }

    try {
      const adjustments = variances.map((r) => ({
        cardId: r.card.id,
        counted: r.counted,
        system: r.card.balance,
        itemName: r.card.itemName,
        itemCode: r.card.itemCode,
      }))
      const res = await fetch("/api/stock/barcode-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalize_count", adjustments }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save")
      toast.success(
        `Count saved (${data.refNo}): ${data.adjusted} adjustment${data.adjusted !== 1 ? "s" : ""} posted`,
      )
      setRows([])
      setError(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save count")
    }
  }

  function reset() {
    setRows([])
    setError(null)
  }

  const totalCounted = rows.reduce((s, r) => s + r.counted, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      {/* Scan column */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                listening ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
              )}
            >
              <ScanLine className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Physical Count</h3>
              <p className="text-[11px] text-muted-foreground">Scan each unit — quantity auto-increments</p>
            </div>
          </div>
          <div className="relative">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setListening(true)}
              placeholder="Scan barcode…"
              className="h-11 pl-9 font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
              aria-label="Count scan input"
            />
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" /> No item matches {error}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-lg font-extrabold text-foreground">{rows.length}</div>
              <div className="text-[10px] text-muted-foreground">Items</div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-lg font-extrabold text-foreground">{totalCounted}</div>
              <div className="text-[10px] text-muted-foreground">Units scanned</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="h-10 flex-1 gap-1.5 text-[12px]" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button className="h-10 flex-1 gap-1.5 text-[12px]" onClick={finalize}>
            <Save className="h-4 w-4" /> Finalize
          </Button>
        </div>
      </div>

      {/* Count sheet */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <ClipboardCheck className="h-9 w-9 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Start scanning to build your count sheet</p>
            <p className="text-[11px] text-muted-foreground">Each scan adds a unit; system balance and variance appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-secondary">
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Item</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Counted</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Variance</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const variance = r.counted - r.card.balance
                  return (
                    <tr
                      key={r.card.id}
                      className={cn(
                        "border-b border-border transition-colors",
                        variance !== 0 && "bg-amber-50/40",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-[11px] text-primary">{r.card.itemCode}</span>
                          <span className="text-xs text-foreground">{r.card.itemName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {r.card.balance.toLocaleString()} {r.card.unit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => adjust(r.card.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <Input
                            type="number"
                            min={0}
                            value={r.counted}
                            onChange={(e) => setCounted(r.card.id, Number(e.target.value))}
                            className="h-7 w-16 text-center font-mono text-xs"
                            aria-label="Counted quantity"
                          />
                          <button
                            onClick={() => adjust(r.card.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "font-mono text-xs font-bold",
                            variance === 0 ? "text-emerald-600" : variance > 0 ? "text-blue-600" : "text-red-600",
                          )}
                        >
                          {variance > 0 ? `+${variance}` : variance}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => remove(r.card.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive"
                          aria-label="Remove row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
