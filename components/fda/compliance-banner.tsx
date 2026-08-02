"use client"

import { AlertTriangle, Ban, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { summarizeCompliance, type ScreenableIngredient } from "@/lib/moph-ingredient-screening"

interface ComplianceBannerProps {
  ingredients: ScreenableIngredient[]
  className?: string
}

/**
 * Compact banner summarizing MoPH screening across all ingredients.
 * Red when there is a banned substance or a restricted substance over its limit;
 * amber when only within-limit restricted substances are present; green when all clear.
 */
export function ComplianceBanner({ ingredients, className }: ComplianceBannerProps) {
  if (ingredients.length === 0) return null

  const summary = summarizeCompliance(ingredients)
  const withinLimitRestricted = summary.restricted - summary.overLimit

  const tone = summary.hasCritical ? "critical" : summary.restricted > 0 ? "warning" : "ok"

  const toneStyles = {
    critical: "border-destructive/40 bg-destructive/10 text-destructive",
    warning: "border-amber-300 bg-amber-50 text-amber-800",
    ok: "border-emerald-300 bg-emerald-50 text-emerald-800",
  }[tone]

  const Icon = tone === "critical" ? Ban : tone === "warning" ? AlertTriangle : ShieldCheck

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-[11px]", toneStyles, className)}>
      <div className="flex items-center gap-1.5 font-bold">
        <Icon className="h-3.5 w-3.5" />
        {tone === "critical"
          ? "พบสารที่ไม่ผ่านเกณฑ์ อย."
          : tone === "warning"
            ? "มีสารจำกัดปริมาณ — ตรวจสอบเงื่อนไข"
            : "ผ่านการคัดกรอง อย. เบื้องต้น"}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-medium">
        {summary.banned > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
            ห้ามใช้ {summary.banned}
          </span>
        )}
        {summary.overLimit > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
            เกินขีดจำกัด {summary.overLimit}
          </span>
        )}
        {withinLimitRestricted > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            จำกัดปริมาณ {withinLimitRestricted}
          </span>
        )}
        <span className="inline-flex items-center gap-1 opacity-70">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          ผ่าน {summary.ok}/{summary.total}
        </span>
      </div>
      <span className="ml-auto text-[10px] opacity-60">คัดกรองอัตโนมัติ — ผู้เชี่ยวชาญต้องตรวจสอบซ้ำ</span>
    </div>
  )
}
