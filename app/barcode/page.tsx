"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ScanPanel } from "@/components/barcode/scan-panel"
import { CountPanel } from "@/components/barcode/count-panel"
import { BarcodeSVG } from "@/components/barcode/barcode-svg"
import { LabelSheet, type LotLabelData } from "@/components/barcode/label-sheet"
import {
  resolveBarcodeValue,
  barcodeSource,
  resolveLotBarcodeValue,
  expiryLevel,
  daysUntilExpiry,
  type ExpiryLevel,
} from "@/lib/barcode-utils"
import type { StockCard, StockLot } from "@/lib/stock-types"
import { itemTypeColors, itemTypeLabels } from "@/lib/stock-types"
import { ScanLine, Printer, Search, Barcode as BarcodeIcon, Layers, CheckCircle2, ClipboardCheck, Boxes, Clock } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const expiryBadge: Record<ExpiryLevel, string> = {
  expired: "bg-red-100 text-red-700",
  critical: "bg-orange-100 text-orange-700",
  warning: "bg-amber-100 text-amber-700",
  ok: "bg-emerald-100 text-emerald-700",
}

export default function BarcodePage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lotSelected, setLotSelected] = useState<Set<string>>(new Set())
  const [printTarget, setPrintTarget] = useState<"cards" | "lots">("cards")

  // Live data from DB via SWR
  const { data: cardsData } = useSWR("/api/stock/cards", fetcher, { revalidateOnFocus: false })
  const { data: lotsData } = useSWR("/api/stock/lots", fetcher, { revalidateOnFocus: false })

  const cards: StockCard[] = useMemo(() => {
    const rows = cardsData?.cards ?? []
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      itemCode: r.itemCode as string,
      itemName: r.itemName as string,
      itemNameEn: r.itemNameEn as string | undefined,
      itemType: (r.itemType ?? "raw_material") as StockCard["itemType"],
      unit: r.unit as string,
      balance: Number(r.balance ?? 0),
      available: Number(r.available ?? 0),
      reservedStock: Number(r.reservedStock ?? 0),
      incomingStock: Number(r.incomingStock ?? 0),
      minStock: Number(r.minStock ?? 0),
      maxStock: Number(r.maxStock ?? 0),
      inventoryStatus: (r.inventoryStatus ?? "healthy") as StockCard["inventoryStatus"],
      location: r.location as string | undefined,
      barcode: r.barcode as string | undefined,
      supplier: r.supplier as string | undefined,
    }))
  }, [cardsData])

  const rawLots: StockLot[] = useMemo(() => {
    const rows = lotsData?.lots ?? []
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      stockCardId: r.stockCardId as string,
      lotNumber: r.lotNumber as string,
      quantity: Number(r.quantity ?? 0),
      expireDate: r.expireDate as string | undefined,
      manufactureDate: r.manufactureDate as string | undefined,
      status: (r.status ?? "active") as StockLot["status"],
    }))
  }, [lotsData])

  // Join lots with their stock card for display + labels.
  const lotData: LotLabelData[] = useMemo(
    () =>
      rawLots.map((lot) => {
        const card = cards.find((c) => c.id === lot.stockCardId)
        return {
          lot,
          itemCode: card?.itemCode ?? "—",
          itemName: card?.itemNameEn || card?.itemName || "Unknown item",
          unit: card?.unit ?? "",
        }
      }),
    [rawLots, cards],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return cards
    return cards.filter(
      (c) =>
        c.itemCode.toLowerCase().includes(q) ||
        c.itemName.toLowerCase().includes(q) ||
        (c.itemNameEn?.toLowerCase().includes(q) ?? false) ||
        resolveBarcodeValue(c).toLowerCase().includes(q),
    )
  }, [cards, search])

  const selectedCards = cards.filter((c) => selected.has(c.id))
  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id))
  const generatedCount = cards.filter((c) => barcodeSource(c) === "generated").length

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev)
        filtered.forEach((c) => next.delete(c.id))
        return next
      }
      return new Set([...prev, ...filtered.map((c) => c.id)])
    })
  }

  const selectedLots = lotData.filter((l) => lotSelected.has(l.lot.id))

  function toggleLot(id: string) {
    setLotSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handlePrint() {
    if (selectedCards.length === 0) {
      toast.error("Select at least one item to print labels")
      return
    }
    setPrintTarget("cards")
    toast.success(`Printing ${selectedCards.length} label${selectedCards.length > 1 ? "s" : ""}…`)
    // Allow the print area to render before invoking the dialog.
    setTimeout(() => window.print(), 60)
  }

  function handlePrintLots() {
    if (selectedLots.length === 0) {
      toast.error("Select at least one lot to print labels")
      return
    }
    setPrintTarget("lots")
    toast.success(`Printing ${selectedLots.length} lot label${selectedLots.length > 1 ? "s" : ""}…`)
    setTimeout(() => window.print(), 60)
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6">
      {/* Print styles — only the label sheet shows on paper */}
      <style>{`
        #label-print-area { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #label-print-area, #label-print-area * { visibility: visible !important; }
          #label-print-area {
            display: block !important;
            position: absolute; left: 0; top: 0; width: 100%;
          }
          .label-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            padding: 12px;
          }
          .label-cell {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px 12px;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .label-head { display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
          .label-code { font-family: monospace; font-weight: 700; background: #eef2ff; color: #4338ca; padding: 1px 6px; border-radius: 4px; }
          .label-loc { color: #64748b; }
          .label-name { font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.3; min-height: 30px; }
          .label-barcode { display: flex; justify-content: center; }
          .label-foot { display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
          @page { margin: 12mm; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Link href="/stock" className="hover:text-foreground">Stock</Link>
            <span>/</span>
            <span className="text-foreground">Barcode</span>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground">
            <BarcodeIcon className="h-6 w-6 text-primary" />
            Barcode Management
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Scan, generate, and print Code 128 labels linked to each stock item.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            {cards.length} items
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
            {generatedCount} auto-generated
          </span>
        </div>
      </div>

      <Tabs defaultValue="scan">
        <TabsList>
          <TabsTrigger value="scan" className="gap-1.5"><ScanLine className="h-4 w-4" /> Scanner</TabsTrigger>
          <TabsTrigger value="count" className="gap-1.5"><ClipboardCheck className="h-4 w-4" /> Physical Count</TabsTrigger>
          <TabsTrigger value="registry" className="gap-1.5"><Layers className="h-4 w-4" /> Label Registry</TabsTrigger>
          <TabsTrigger value="lots" className="gap-1.5"><Boxes className="h-4 w-4" /> Lot Labels</TabsTrigger>
        </TabsList>

        {/* Scanner */}
        <TabsContent value="scan" className="mt-5">
          <ScanPanel cards={cards} />
        </TabsContent>

        {/* Physical Count */}
        <TabsContent value="count" className="mt-5">
          <CountPanel cards={cards} />
        </TabsContent>

        {/* Registry */}
        <TabsContent value="registry" className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, or barcode…"
                className="h-9 pl-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {selected.size} selected
                </span>
              )}
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]" onClick={toggleAll}>
                {allFilteredSelected ? "Clear page" : "Select all"}
              </Button>
              <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handlePrint} disabled={selected.size === 0}>
                <Printer className="h-4 w-4" /> Print labels
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((card) => {
              const isSel = selected.has(card.id)
              const src = barcodeSource(card)
              return (
                <div
                  key={card.id}
                  className={cn(
                    "group flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition-all",
                    isSel ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <label className="flex cursor-pointer items-start gap-2">
                      <Checkbox checked={isSel} onCheckedChange={() => toggle(card.id)} className="mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-primary">{card.itemCode}</span>
                          <span className={cn("rounded px-1.5 py-px text-[9px] font-bold", itemTypeColors[card.itemType])}>
                            {itemTypeLabels[card.itemType]}
                          </span>
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[13px] font-semibold text-foreground">
                          {card.itemNameEn || card.itemName}
                        </div>
                      </div>
                    </label>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold",
                        src === "stored" ? "bg-blue-50 text-blue-600" : "bg-secondary text-muted-foreground",
                      )}
                      title={src === "stored" ? "Barcode stored on the item" : "Derived from item code"}
                    >
                      {src === "stored" ? "STORED" : "AUTO"}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center rounded-xl bg-white py-3">
                    <BarcodeSVG value={resolveBarcodeValue(card)} height={48} barWidth={1.7} fontSize={12} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{card.location || "—"}</span>
                    <span>{card.balance.toLocaleString()} {card.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No items match “{search}”
            </div>
          )}
        </TabsContent>
        {/* Lot Labels */}
        <TabsContent value="lots" className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Lot-level traceability labels</h3>
              <p className="text-[11px] text-muted-foreground">
                Each lot has its own Code 128 barcode encoding the lot number, with expiry for FEFO picking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lotSelected.size > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {lotSelected.size} selected
                </span>
              )}
              <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handlePrintLots} disabled={lotSelected.size === 0}>
                <Printer className="h-4 w-4" /> Print lot labels
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lotData.map(({ lot, itemCode, itemName, unit }) => {
              const isSel = lotSelected.has(lot.id)
              const level = expiryLevel(lot.expireDate)
              const days = daysUntilExpiry(lot.expireDate)
              return (
                <div
                  key={lot.id}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-card p-4 shadow-sm transition-all",
                    isSel ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/40",
                    lot.status === "exhausted" && "opacity-60",
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <label className="flex cursor-pointer items-start gap-2">
                      <Checkbox checked={isSel} onCheckedChange={() => toggleLot(lot.id)} className="mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-primary">{lot.lotNumber}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono">{itemCode}</span>
                          <span className="line-clamp-1">{itemName}</span>
                        </div>
                      </div>
                    </label>
                    <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold", expiryBadge[level])}>
                      <Clock className="h-2.5 w-2.5" />
                      {level === "expired"
                        ? "EXPIRED"
                        : days !== null
                          ? `${days}d`
                          : "—"}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center rounded-xl bg-white py-3">
                    <BarcodeSVG value={resolveLotBarcodeValue(lot)} height={44} barWidth={1.6} fontSize={11} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Qty {lot.quantity.toLocaleString()} {unit}</span>
                    <span>EXP {lot.expireDate ? new Date(lot.expireDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {lotData.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No lots recorded yet
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden print sheet */}
      <LabelSheet
        cards={printTarget === "cards" ? selectedCards : []}
        lots={printTarget === "lots" ? selectedLots : []}
      />
    </div>
  )
}
