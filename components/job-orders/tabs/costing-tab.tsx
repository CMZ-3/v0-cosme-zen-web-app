"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, DollarSign, RotateCcw, Check } from "lucide-react"
import type { JobOrder } from "@/lib/job-order-types"

interface Props {
  jobOrder: JobOrder
}

export function CostingTab({ jobOrder }: Props) {
  const { costBreakdown, yieldAnalysis } = jobOrder
  const revenue = jobOrder.totalValue
  const profit = revenue - costBreakdown.total
  const marginPct = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0"

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="grid grid-cols-2 gap-4">
        {/* Yield Analysis */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <BarChart3 className="h-4 w-4" /> Yield Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            <YieldRow label="Total Input" value={`${yieldAnalysis.totalInput.toFixed(2)} ${yieldAnalysis.unit}`} />
            <YieldRow label="Total Output" value={`${yieldAnalysis.totalOutput.toFixed(2)} ${yieldAnalysis.unit}`} />
            <div className="rounded-lg border border-[rgba(245,158,11,0.2)] bg-[#fef3c7] px-3.5 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#92400e]">Yield Loss</span>
                <span className="font-mono text-sm font-bold text-destructive">
                  -{yieldAnalysis.yieldLoss.toFixed(2)} {yieldAnalysis.unit} ({yieldAnalysis.yieldLossPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <DollarSign className="h-4 w-4" /> Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <CostRow label="Raw Materials" value={costBreakdown.rawMaterial} />
              <CostRow label="Packaging" value={costBreakdown.packaging} />
              <CostRow label="Labor" value={costBreakdown.labor} />
              <CostRow label="QC + Overhead" value={costBreakdown.qcOverhead} />
              <div className="mt-2 border-t-2 border-primary pt-2.5 flex items-center justify-between">
                <span className="text-[15px] font-bold text-foreground">Total</span>
                <span className="font-mono text-lg font-extrabold text-primary">
                  {"\u0E3F"}{costBreakdown.total.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Margin */}
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="rounded-2xl bg-primary/5 px-6 py-5 text-center">
              <div className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">Gross Margin</div>
              <div className="font-mono text-[32px] font-extrabold leading-none text-primary">{marginPct}%</div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Profit {"\u0E3F"}{profit.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Completion */}
        <Card className="bg-secondary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Job Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-center gap-2">
              <RotateCcw className="h-4 w-4" /> Return Leftover Stock
            </Button>
            <Button className="w-full justify-center gap-2 bg-[#10b981] py-3 text-[13px] hover:bg-[#059669]">
              <Check className="h-4 w-4" /> Finish Job & Move to FG
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function YieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-secondary px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold">{value}</span>
    </div>
  )
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-bold">{"\u0E3F"}{value.toLocaleString()}</span>
    </div>
  )
}
