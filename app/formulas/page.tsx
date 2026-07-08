"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { FlaskConical, Plus, Upload, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormulaKpiCards } from "@/components/formulas/formula-kpi-cards"
import { FormulaTable } from "@/components/formulas/formula-table"
import { CreateFormulaDialog } from "@/components/formulas/create-formula-dialog"
import type { Formula, FormulaKPISummary } from "@/lib/formula-types"
import { Skeleton } from "@/components/ui/skeleton"

const FORMULAS_KEY = "/api/formulas"

interface FormulasResponse {
  formulas: Formula[]
  kpi: FormulaKPISummary
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const emptyKpi: FormulaKPISummary = { total: 0, active: 0, approved: 0, draft: 0, archived: 0, discontinued: 0 }

export default function FormulasPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { data, error, isLoading } = useSWR<FormulasResponse>(FORMULAS_KEY, fetcher)

  const formulaList: Formula[] = data?.formulas ?? []
  const kpi: FormulaKPISummary = data?.kpi ?? emptyKpi

  const handleCreated = () => {
    setShowCreate(false)
    mutate(FORMULAS_KEY)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <FlaskConical className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">Formulas</h1>
            <p className="text-[11px] text-muted-foreground">
              Cosmetic recipes &bull; Ingredients &bull; Processing &bull; QC
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl text-[12px]"
            onClick={() => mutate(FORMULAS_KEY)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-[12px]">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl text-[12px] bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Create Formula
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {isLoading ? (
          <>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : error ? (
          <div className="flex items-center justify-center h-40 text-sm text-destructive">
            Failed to load formulas. Check database connection.
          </div>
        ) : (
          <>
            <FormulaKpiCards kpi={kpi} />
            <FormulaTable data={formulaList} total={kpi.total} />
          </>
        )}
      </div>

      <CreateFormulaDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />
    </div>
  )
}
