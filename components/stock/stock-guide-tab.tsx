"use client"

import { Badge } from "@/components/ui/badge"

export function StockGuideTab() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-foreground">Stock Management Flow Guide</h3>

      {/* Phase Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PhaseCard
          color="bg-[#e0f2fe]"
          title="Phase 1: Planning (SSI)"
          titleColor="text-blue-700"
          steps={[
            "1. Customer places production order",
            "2. Planner selects formula + batch size",
            "3. Add to Memory Bank for multi-formula simulation",
            "4. Press Split & Reserve to create SSI + SRE",
          ]}
        />
        <PhaseCard
          color="bg-[#fef3c7]"
          title="Phase 2: Reservation (SRE)"
          titleColor="text-amber-700"
          steps={[
            "5. System creates SRE per formula",
            "6. Link SRE to Job Order (1:1)",
            "7. Check shortages, order materials, create SIN",
            "8. Status = WAITING (awaiting materials)",
          ]}
        />
        <PhaseCard
          color="bg-[#e0f7f5]"
          title="Phase 3: Incoming (SIN)"
          titleColor="text-teal-700"
          steps={[
            "9. PO created from shortage button creates SIN",
            "10. Materials arrive, press Receive (full/partial)",
            "11. System Auto-Allocates (FIFO)",
            "12. Partial = can receive multiple times",
          ]}
        />
        <PhaseCard
          color="bg-[#ecfdf5]"
          title="Phase 4: Receive (SRR)"
          titleColor="text-emerald-700"
          steps={[
            "13. Press Receive creates SRR referencing SIN",
            "14. Record actual quantities received",
            "15. Status = READY",
            "16. Production starts, status changes to CONSUMED",
          ]}
        />
      </div>

      {/* Document Numbering */}
      <h4 className="mb-3 text-sm font-bold text-foreground">Document Numbering System</h4>
      <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        <DocCard code="SSI-YYMMDD-NNN" desc="Stock Simulator -- created when Split & Reserve" bg="bg-violet-50" border="border-violet-200" color="text-violet-700" />
        <DocCard code="SRE-YYMMDD-NNN" desc="Stock Reservation -- created with SSI (correlated)" bg="bg-amber-50" border="border-amber-200" color="text-amber-700" />
        <DocCard code="SIN-YYMMDD-NNN" desc="Stock Incoming -- created when ordering from shortage" bg="bg-blue-50" border="border-blue-200" color="text-blue-700" />
        <DocCard code="SRR-YYMMDD-NNN" desc="Stock Receive -- created when receiving from Incoming" bg="bg-emerald-50" border="border-emerald-200" color="text-emerald-700" />
      </div>

      {/* Color Legend */}
      <h4 className="mb-3 text-sm font-bold text-foreground">Color & Status Legend</h4>
      <div className="mb-8 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-emerald-100 px-3 py-2 text-[11px] font-semibold text-emerald-700">Ready / Healthy / Sufficient</Badge>
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-red-100 px-3 py-2 text-[11px] font-semibold text-red-700">Waiting / Shortage / Alert</Badge>
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-amber-100 px-3 py-2 text-[11px] font-semibold text-amber-700">Reserved / Draft / Low</Badge>
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-blue-100 px-3 py-2 text-[11px] font-semibold text-blue-700">Incoming / Pending PO</Badge>
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-violet-100 px-3 py-2 text-[11px] font-semibold text-violet-700">Simulated / Needed</Badge>
        <Badge variant="outline" className="justify-start rounded-lg border-0 bg-teal-100 px-3 py-2 text-[11px] font-semibold text-teal-700">Packaging / Category</Badge>
      </div>

      {/* Separator */}
      <div className="my-6 border-t border-border" />

      {/* State Machine */}
      <h4 className="mb-3 text-sm font-bold text-foreground">Reservation Status Machine</h4>
      <div className="mb-8 overflow-x-auto rounded-xl bg-foreground p-5 font-mono text-[12px] leading-8 text-background">
        <pre className="whitespace-pre">{`DRAFT ──(link to JO)──> WAITING <──(partial fill)
  │                          │
  │ (cancel)                 │ (all items filled)
  v                          v
CANCELLED              READY ──(issue material)──> CONSUMED`}</pre>
      </div>

      {/* Key Formulas */}
      <h4 className="mb-3 text-sm font-bold text-foreground">Key Formulas</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormulaCard
          title="Available Stock"
          formula="Available = Physical - Sum(Allocated) + Incoming"
          color="text-emerald-600"
        />
        <FormulaCard
          title="Material Required"
          formula="Qty = BatchSize x (Ingredient% / 100)"
          color="text-violet-600"
        />
        <FormulaCard
          title="Auto-Allocation"
          formula="FIFO: Oldest reservation filled first"
          color="text-blue-600"
        />
        <FormulaCard
          title="Packaging Required"
          formula="Qty = BatchSize x 1000 / unitWeight x perUnit"
          color="text-primary"
        />
      </div>
    </div>
  )
}

function PhaseCard({ color, title, titleColor, steps }: { color: string; title: string; titleColor: string; steps: string[] }) {
  return (
    <div className={`${color} flex flex-col rounded-2xl p-4`}>
      <strong className={`text-[13px] font-bold ${titleColor}`}>{title}</strong>
      <div className="mt-2 flex flex-col gap-0.5 text-[12px] leading-6 text-foreground/80">
        {steps.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function DocCard({ code, desc, bg, border, color }: { code: string; desc: string; bg: string; border: string; color: string }) {
  return (
    <div className={`${bg} rounded-xl border ${border} p-3.5 text-[12px]`}>
      <strong className={`${color} font-mono`}>{code}</strong>
      <div className="mt-0.5 text-muted-foreground">{desc}</div>
    </div>
  )
}

function FormulaCard({ title, formula, color }: { title: string; formula: string; color: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3.5 text-[12px]">
      <strong className="text-foreground">{title}:</strong>
      <div className={`mt-0.5 font-mono text-[11px] ${color}`}>{formula}</div>
    </div>
  )
}
