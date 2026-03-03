"use client"

import { useState } from "react"
import { FlaskConical, Plus, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormulaKpiCards } from "@/components/formulas/formula-kpi-cards"
import { FormulaTable } from "@/components/formulas/formula-table"
import { CreateFormulaDialog } from "@/components/formulas/create-formula-dialog"
import { mockFormulaList, mockFormulaKPI } from "@/lib/formula-mock-data"

export default function FormulasPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200">
            <FlaskConical className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Formulas</h1>
            <p className="text-[11px] text-muted-foreground">Cosmetic recipes &bull; Ingredients &bull; Processing &bull; QC</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="h-9 gap-1.5 rounded-xl text-[12px] bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Formula
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <FormulaKpiCards kpi={mockFormulaKPI} />
        <FormulaTable data={mockFormulaList} total={mockFormulaKPI.total} />
      </div>

      <CreateFormulaDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  )
}
