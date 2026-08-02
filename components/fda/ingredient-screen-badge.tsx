"use client"

import { AlertTriangle, Ban, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { screenIngredient } from "@/lib/moph-ingredient-screening"

interface IngredientScreenBadgeProps {
  name?: string | null
  inciName?: string | null
  percentage?: number | null
  /** Show a small "ผ่าน" badge for compliant rows. Defaults to false (render nothing). */
  showOk?: boolean
  className?: string
}

/**
 * Screens one ingredient against the MoPH banned/restricted lists and renders a status badge.
 * Banned = red, restricted-over-limit = red, restricted = amber, ok = optional green.
 */
export function IngredientScreenBadge({
  name,
  inciName,
  percentage,
  showOk = false,
  className,
}: IngredientScreenBadgeProps) {
  const result = screenIngredient(name, inciName, percentage)

  if (result.status === "ok") {
    if (!showOk) return null
    return (
      <Badge variant="outline" className={cn("h-4 gap-0.5 px-1 text-[9px] border-emerald-300 text-emerald-600", className)}>
        <ShieldCheck className="h-2.5 w-2.5" />
        ผ่าน
      </Badge>
    )
  }

  if (result.status === "banned") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("h-4 gap-0.5 px-1 text-[9px] bg-destructive text-destructive-foreground hover:bg-destructive/90", className)}>
            <Ban className="h-2.5 w-2.5" />
            ห้ามใช้
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-[11px]">
          <p className="font-bold">สารต้องห้ามตามประกาศ อย.</p>
          {result.note && <p className="mt-0.5 text-muted-foreground">{result.note}</p>}
        </TooltipContent>
      </Tooltip>
    )
  }

  // restricted
  const over = result.overLimit
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          className={cn(
            "h-4 gap-0.5 px-1 text-[9px]",
            over
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
            className,
          )}
          variant={over ? "default" : "outline"}
        >
          <AlertTriangle className="h-2.5 w-2.5" />
          {over ? `เกินขีดจำกัด` : `จำกัดปริมาณ`}
          {result.limit != null && ` ≤${result.limit}%`}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-[11px]">
        <p className="font-bold">
          {over ? "ปริมาณเกินขีดจำกัดตามประกาศ อย." : "สารจำกัดปริมาณตามประกาศ อย."}
        </p>
        {result.limit != null && (
          <p className="mt-0.5">
            ขีดจำกัด: <span className="font-mono">{result.limit}%</span>
            {result.percentage != null && (
              <>
                {" · "}ในสูตร: <span className={cn("font-mono", over && "font-bold text-destructive")}>{result.percentage}%</span>
              </>
            )}
          </p>
        )}
        {result.note && <p className="mt-0.5 text-muted-foreground">{result.note}</p>}
      </TooltipContent>
    </Tooltip>
  )
}
