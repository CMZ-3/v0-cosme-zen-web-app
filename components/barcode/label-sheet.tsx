"use client"

import { BarcodeSVG } from "./barcode-svg"
import { resolveBarcodeValue, resolveLotBarcodeValue } from "@/lib/barcode-utils"
import type { StockCard, StockLot } from "@/lib/stock-types"

export interface LotLabelData {
  lot: StockLot
  itemCode: string
  itemName: string
  unit: string
}

interface LabelSheetProps {
  cards?: StockCard[]
  lots?: LotLabelData[]
}

function fmtDate(d?: string) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

/**
 * Print-optimized grid of labels. Hidden on screen; only visible when the
 * browser print dialog is active (see print styles in the barcode page).
 * Renders item labels (cards) or lot labels (lots) depending on the print set.
 */
export function LabelSheet({ cards = [], lots = [] }: LabelSheetProps) {
  return (
    <div id="label-print-area" aria-hidden>
      <div className="label-grid">
        {cards.map((card) => (
          <div key={card.id} className="label-cell">
            <div className="label-head">
              <span className="label-code">{card.itemCode}</span>
              {card.location && <span className="label-loc">{card.location}</span>}
            </div>
            <div className="label-name">{card.itemNameEn || card.itemName}</div>
            <div className="label-barcode">
              <BarcodeSVG value={resolveBarcodeValue(card)} height={48} barWidth={1.8} fontSize={12} />
            </div>
            <div className="label-foot">
              <span>CosmeZen</span>
              <span>{card.unit}</span>
            </div>
          </div>
        ))}

        {lots.map(({ lot, itemCode, itemName, unit }) => (
          <div key={lot.id} className="label-cell">
            <div className="label-head">
              <span className="label-code">{itemCode}</span>
              <span className="label-loc">EXP {fmtDate(lot.expireDate)}</span>
            </div>
            <div className="label-name">{itemName}</div>
            <div className="label-barcode">
              <BarcodeSVG value={resolveLotBarcodeValue(lot)} height={46} barWidth={1.7} fontSize={11} />
            </div>
            <div className="label-foot">
              <span>MFG {fmtDate(lot.manufacturedDate)}</span>
              <span>{lot.quantity.toLocaleString()} {unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
