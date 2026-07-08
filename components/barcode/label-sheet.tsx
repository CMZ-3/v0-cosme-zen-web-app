"use client"

import { BarcodeSVG } from "./barcode-svg"
import { resolveBarcodeValue } from "@/lib/barcode-utils"
import type { StockCard } from "@/lib/stock-types"

interface LabelSheetProps {
  cards: StockCard[]
}

/**
 * Print-optimized grid of stock labels. Hidden on screen; only visible when
 * the browser print dialog is active (see print styles in the barcode page).
 */
export function LabelSheet({ cards }: LabelSheetProps) {
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
      </div>
    </div>
  )
}
