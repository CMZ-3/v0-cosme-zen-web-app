"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarcodeSVG } from "./barcode-svg"
import { findCardByScan, normalizeScan, resolveBarcodeValue } from "@/lib/barcode-utils"
import type { StockCard } from "@/lib/stock-types"
import { inventoryStatusColors, inventoryStatusLabels } from "@/lib/stock-types"
import { ScanLine, CheckCircle2, XCircle, ExternalLink, MapPin, Package, History, Zap, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { toast } from "sonner"
import { mutate as globalMutate } from "swr"

interface ScanEvent {
  raw: string
  at: number
  match?: StockCard
}

interface ScanPanelProps {
  cards: StockCard[]
}

export function ScanPanel({ cards }: ScanPanelProps) {
  const [value, setValue] = useState("")
  const [listening, setListening] = useState(true)
  const [last, setLast] = useState<ScanEvent | null>(null)
  const [history, setHistory] = useState<ScanEvent[]>([])
  const [actionQty, setActionQty] = useState("1")
  const [actionLoading, setActionLoading] = useState(false)

  async function postAction(cardId: string, action: "issue" | "receive") {
    const qty = Number(actionQty)
    if (!qty || qty <= 0) { toast.error("Enter a valid quantity"); return }
    setActionLoading(true)
    try {
      const res = await fetch("/api/stock/barcode-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cardId, qty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Action failed")
      toast.success(`${action === "issue" ? "Issued" : "Received"} ${qty} — new balance: ${data.newBalance}`)
      globalMutate("/api/stock/cards")
      globalMutate("/api/stock/movements")
      setActionQty("1")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed")
    } finally {
      setActionLoading(false)
    }
  }
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the input focused so a keyboard-wedge scanner always lands here.
  useEffect(() => {
    if (!listening) return
    const el = inputRef.current
    el?.focus()
    const refocus = () => {
      if (listening && document.activeElement !== el) el?.focus()
    }
    const t = setInterval(refocus, 800)
    return () => clearInterval(t)
  }, [listening])

  function processScan(raw: string) {
    const clean = normalizeScan(raw)
    if (!clean) return
    const match = findCardByScan(cards, clean)
    const evt: ScanEvent = { raw: clean, at: Date.now(), match }
    setLast(evt)
    setHistory((h) => [evt, ...h].slice(0, 12))
    setValue("")
    // brief audible/visual cue via title flash handled by CSS state below
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // CJK IME guard (harmless for scanners, correct for manual typing)
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      processScan(value)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Scanner input + result */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              listening ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
            )}>
              <ScanLine className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-foreground">Barcode Scanner</h3>
              <p className="text-[11px] text-muted-foreground">
                {listening ? "Listening — scan a Code 128 label or type a code" : "Paused"}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={listening ? "outline" : "default"}
            className="h-8 gap-1.5 text-[11px]"
            onClick={() => setListening((v) => !v)}
          >
            <Zap className="h-3.5 w-3.5" />
            {listening ? "Pause" : "Resume"}
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scan or enter barcode / item code…"
              className="h-11 pl-9 font-mono text-sm"
              autoComplete="off"
              spellCheck={false}
              aria-label="Barcode scan input"
            />
          </div>
          <Button className="h-11 px-5" onClick={() => processScan(value)}>
            Look up
          </Button>
        </div>

        {/* Result */}
        <div className="mt-4">
          {!last && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
              <ScanLine className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Scan a label to see item details here</p>
            </div>
          )}

          {last && last.match && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 duration-200">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Match found
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      {last.match.itemCode}
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      inventoryStatusColors[last.match.inventoryStatus],
                    )}>
                      {inventoryStatusLabels[last.match.inventoryStatus]}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-base font-extrabold text-foreground text-balance">{last.match.itemName}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {last.match.balance.toLocaleString()} {last.match.unit} on hand</span>
                    {last.match.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {last.match.location}</span>}
                    <span>Available: <strong className="text-foreground">{last.match.available.toLocaleString()}</strong></span>
                  </div>
                </div>
                  <div className="flex flex-col items-end gap-2">
                  <BarcodeSVG value={resolveBarcodeValue(last.match)} height={40} barWidth={1.6} fontSize={11} />
                  <Button asChild size="sm" className="h-8 gap-1.5 text-[11px]">
                    <Link href={`/stock/${last.match.id}`}>
                      Open stock card <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Quick Issue / Receive action */}
              <div className="mt-3 flex items-center gap-2 border-t border-emerald-200 pt-3">
                <Input
                  type="number"
                  min={1}
                  value={actionQty}
                  onChange={(e) => setActionQty(e.target.value)}
                  className="h-8 w-20 text-center font-mono text-sm"
                  aria-label="Quantity"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-[11px] border-red-300 text-red-600 hover:bg-red-50"
                  disabled={actionLoading}
                  onClick={() => postAction(last!.match!.id, "issue")}
                >
                  <ArrowUpFromLine className="h-3.5 w-3.5" /> Issue
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-[11px] border-blue-300 text-blue-600 hover:bg-blue-50"
                  disabled={actionLoading}
                  onClick={() => postAction(last!.match!.id, "receive")}
                >
                  <ArrowDownToLine className="h-3.5 w-3.5" /> Receive
                </Button>
              </div>
            </div>
          )}

          {last && !last.match && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-1 rounded-xl border border-red-200 bg-red-50/60 p-4 duration-200">
              <div className="flex items-center gap-2 text-[11px] font-bold text-destructive">
                <XCircle className="h-4 w-4" /> No match
              </div>
              <p className="mt-1.5 text-sm text-foreground">
                No stock item matches <span className="font-mono font-bold">{last.raw}</span>.
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Check the label or register this barcode against an item.</p>
            </div>
          )}
        </div>
      </div>

      {/* Scan history */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Recent Scans</h3>
        </div>
        {history.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-muted-foreground">No scans yet</p>
        ) : (
          <ul className="space-y-1.5">
            {history.map((h, i) => (
              <li
                key={`${h.at}-${i}`}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2 text-[11px]",
                  h.match ? "border-emerald-200 bg-emerald-50/40" : "border-red-200 bg-red-50/40",
                )}
              >
                <div className="min-w-0">
                  <div className="font-mono font-bold text-foreground">{h.raw}</div>
                  <div className="truncate text-muted-foreground">
                    {h.match ? h.match.itemName : "Not found"}
                  </div>
                </div>
                {h.match ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
