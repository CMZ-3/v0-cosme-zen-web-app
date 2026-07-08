"use client"

import { useEffect, useRef, useState } from "react"
import JsBarcode from "jsbarcode"
import { isValidCode128 } from "@/lib/barcode-utils"
import { cn } from "@/lib/utils"

interface BarcodeSVGProps {
  value: string
  /** Bar height in px. */
  height?: number
  /** Bar width multiplier (thickness of the thinnest bar). */
  barWidth?: number
  /** Show the human-readable value under the bars. */
  showText?: boolean
  fontSize?: number
  className?: string
}

/**
 * Renders a Code 128 barcode as an inline SVG (crisp at any size / on print).
 */
export function BarcodeSVG({
  value,
  height = 60,
  barWidth = 2,
  showText = true,
  fontSize = 14,
  className,
}: BarcodeSVGProps) {
  const ref = useRef<SVGSVGElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    if (!isValidCode128(value)) {
      setError(true)
      return
    }
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        height,
        width: barWidth,
        displayValue: showText,
        fontSize,
        margin: 8,
        font: "monospace",
        textMargin: 4,
        background: "#ffffff",
        lineColor: "#0f172a",
      })
      setError(false)
    } catch {
      setError(true)
    }
  }, [value, height, barWidth, showText, fontSize])

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-3 py-2 text-[11px] font-medium text-destructive",
          className,
        )}
        style={{ minHeight: height }}
      >
        Invalid barcode value
      </div>
    )
  }

  return <svg ref={ref} className={className} aria-label={`Barcode ${value}`} role="img" />
}
