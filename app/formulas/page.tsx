"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import { FlaskConical, Plus, Search, Upload, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FormulaKpiCards } from "@/components/formulas/formula-kpi-cards"
import { FormulaDetail } from "@/components/formulas/formula-detail"
import { CreateFormulaDialog } from "@/components/formulas/create-formula-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Formula, FormulaKPISummary } from "@/lib/formula-types"
import { formulaStatusColor, formulaStatusLabel, formulaTypeLabel } from "@/lib/formula-types"

const FORMULAS_KEY = "/api/formulas"

interface FormulasResponse {
  formulas: Formula[]
  kpi: FormulaKPISummary
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const emptyKpi: FormulaKPISummary = { total: 0, active: 0, approved: 0, draft: 0, archived: 0, discontinued: 0 }

export default function FormulasPage() {
  return (
    <Suspense fallback={null}>
      <FormulasView />
    </Suspense>
  )
}

function FormulasView() {
  const searchParams = useSearchParams()
  const idFromQuery = searchParams.get("id")

  const { data, isLoading } = useSWR<FormulasResponse>(FORMULAS_KEY, fetcher, { revalidateOnFocus: false })

  const formulaList: Formula[] = useMemo(() => data?.formulas ?? [], [data])
  const kpi: FormulaKPISummary = data?.kpi ?? emptyKpi

  const [selectedId, setSelectedId] = useState<string>("")
  const [showCreate, setShowCreate] = useState(false)

  // Auto-select first item once loaded, or use URL param
  const resolvedId = useMemo(() => {
    if (selectedId) return selectedId
    if (idFromQuery && formulaList.some((f) => f.id === idFromQuery)) return idFromQuery
    return formulaList[0]?.id ?? ""
  }, [selectedId, idFromQuery, formulaList])

  const handleCreated = () => {
    setShowCreate(false)
    mutate(FORMULAS_KEY)
  }

  const handleDeleted = () => {
    setSelectedId("")
    mutate(FORMULAS_KEY)
  }

  const handleCloned = (newId: string) => {
    setSelectedId(newId)
    mutate(FORMULAS_KEY)
  }

  return (
    <>
      {/* Left panel — list */}
      <FormulaListPanel
        formulas={formulaList}
        kpi={kpi}
        isLoading={isLoading}
        selectedId={resolvedId}
        onSelect={setSelectedId}
        onCreateClick={() => setShowCreate(true)}
        onRefresh={() => mutate(FORMULAS_KEY)}
      />

      {/* Right panel — detail */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[400px] bg-gradient-to-bl from-[rgba(238,232,255,0.5)] to-transparent z-0" />
        {resolvedId ? (
          <FormulaDetail
            formulaId={resolvedId}
            onDeleted={handleDeleted}
            onCloned={handleCloned}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select a formula from the list
          </div>
        )}
      </div>

      <CreateFormulaDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleCreated}
      />
    </>
  )
}

/* ============================================================================
   LEFT LIST PANEL
   ============================================================================ */
type StatusFilter = "all" | "draft" | "approved" | "active" | "archived"
const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
]

interface ListPanelProps {
  formulas: Formula[]
  kpi: FormulaKPISummary
  isLoading: boolean
  selectedId: string
  onSelect: (id: string) => void
  onCreateClick: () => void
  onRefresh: () => void
}

function FormulaListPanel({ formulas, kpi, isLoading, selectedId, onSelect, onCreateClick, onRefresh }: ListPanelProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const filtered = useMemo(() => {
    let list = formulas
    if (statusFilter !== "all") list = list.filter((f) => f.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          f.formulaCode.toLowerCase().includes(q) ||
          f.formulaName.toLowerCase().includes(q) ||
          (f.formulaNameEn ?? "").toLowerCase().includes(q),
      )
    }
    return list
  }, [formulas, statusFilter, search])

  return (
    <div className="flex w-[320px] min-w-[320px] flex-col border-r border-border bg-secondary/50 h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/60 px-4 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <FlaskConical className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-[14px] font-extrabold tracking-tight text-foreground leading-none">Formulas</h2>
              <p className="text-[10px] text-muted-foreground">{kpi.total} total</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onRefresh}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="h-7 gap-1 rounded-lg text-[11px] bg-violet-600 hover:bg-violet-700 text-white" onClick={onCreateClick}>
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>
        </div>

        {/* KPI mini-row */}
        <div className="flex gap-2 mb-3">
          {[
            { label: "Active", count: kpi.active, color: "text-emerald-600" },
            { label: "Approved", count: kpi.approved, color: "text-blue-600" },
            { label: "Draft", count: kpi.draft, color: "text-muted-foreground" },
          ].map((k) => (
            <div key={k.label} className="flex-1 rounded-lg bg-muted/60 px-2 py-1.5 text-center">
              <p className={cn("text-[14px] font-extrabold leading-none", k.color)}>{k.count}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search formula..."
            className="h-8 pl-8 text-[12px] rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border bg-card/30">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "flex-1 rounded-lg px-1 py-1 text-[10px] font-semibold transition-colors",
              statusFilter === tab.value
                ? "bg-violet-600 text-white"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="space-y-2 px-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
            <FlaskConical className="h-8 w-8 mb-2 opacity-20" />
            No formulas found
          </div>
        ) : (
          filtered.map((formula) => (
            <FormulaListItem
              key={formula.id}
              formula={formula}
              isSelected={formula.id === selectedId}
              onClick={() => onSelect(formula.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   LIST ITEM
   ============================================================================ */
function FormulaListItem({ formula, isSelected, onClick }: { formula: Formula; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 mx-0 transition-colors group",
        isSelected
          ? "bg-violet-600/10 border-r-2 border-violet-600"
          : "hover:bg-muted/50 border-r-2 border-transparent",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 text-[11px] font-extrabold",
          isSelected ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground group-hover:bg-violet-100 group-hover:text-violet-600",
        )}>
          <FlaskConical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={cn("text-[12px] font-bold truncate", isSelected ? "text-violet-700" : "text-foreground")}>
              {formula.formulaCode}
            </span>
            <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-4 font-semibold shrink-0", formulaStatusColor[formula.status])}>
              {formulaStatusLabel[formula.status]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{formula.formulaName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground">{formulaTypeLabel[formula.formulaType]}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] text-muted-foreground">{formula.ingredientCount} ing.</span>
            {formula.batchSize && (
              <>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{formula.batchSize}{formula.batchUnit}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
