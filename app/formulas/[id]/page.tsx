"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, ChevronRight, Pencil, Copy, Trash2, CheckCircle, Zap, Archive, Undo2,
  FlaskConical, Beaker, Layers, Settings2, ClipboardCheck, GitBranch, DollarSign,
  FileText, Puzzle, Thermometer, Clock, Gauge, Wrench, AlertTriangle, Plus,
  Download, Eye, Shield, Package, TestTube, Snowflake, Sun, Bug,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type {
  Formula, FormulaIngredient, FormulaPhase, FormulaProcessingStep,
  FormulaQcSpec, FormulaVersion,
} from "@/lib/formula-types"
import { formulaStatusLabel, formulaStatusColor, formulaTypeLabel, phaseBadgeColor } from "@/lib/formula-types"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface FormulaDetailResponse {
  formula: Formula
  ingredients: FormulaIngredient[]
  phases: FormulaPhase[]
  steps: FormulaProcessingStep[]
  qcSpecs: FormulaQcSpec[]
  versions: FormulaVersion[]
}

export default function FormulaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data, error, isLoading } = useSWR<FormulaDetailResponse>(
    id ? `/api/formulas/${id}` : null,
    fetcher,
  )
  const formula = data?.formula
  const ingredients = data?.ingredients ?? []
  const phases = data?.phases ?? []
  const steps = data?.steps ?? []
  const qcSpecs = data?.qcSpecs ?? []
  const versions = data?.versions ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6 gap-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-10 w-96 rounded-xl" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !formula) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Formula not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/formulas")}>Back to Formulas</Button>
        </div>
      </div>
    )
  }

  const isDraft = formula.status === "draft"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Link href="/formulas" className="hover:text-primary transition-colors font-medium">Formulas</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">{formula.formulaCode}</span>
        </nav>

        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push("/formulas")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-foreground truncate">{formula.formulaCode}</h1>
              <Badge variant="outline" className={cn("text-[10px] font-semibold border px-2 py-0.5", formulaStatusColor[formula.status])}>
                {formulaStatusLabel[formula.status]}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", formula.formulaType === "variation" ? "border-purple-300 text-purple-600" : "border-border text-muted-foreground")}>
                {formulaTypeLabel[formula.formulaType]}
              </Badge>
              {formula.versionString && (
                <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{formula.versionString}</span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground truncate">{formula.formulaName} {formula.formulaNameEn && `/ ${formula.formulaNameEn}`}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Status action buttons */}
            {formula.status === "draft" && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => toast.success(`Formula ${formula.formulaCode} approved`)}>
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </Button>
            )}
            {formula.status === "approved" && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => toast.success(`Formula ${formula.formulaCode} activated`)}>
                <Zap className="h-3.5 w-3.5" /> Activate
              </Button>
            )}
            {formula.status === "active" && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl text-muted-foreground" onClick={() => toast.info(`Formula ${formula.formulaCode} archived`)}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            )}
            {["approved", "active", "archived"].includes(formula.status) && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => toast.warning(`Formula ${formula.formulaCode} reverted to draft`)}>
                <Undo2 className="h-3.5 w-3.5" /> Revert
              </Button>
            )}
            {isDraft && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl" onClick={() => toast.info(`Editing formula ${formula.formulaCode}`)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl" onClick={() => toast.success(`Formula ${formula.formulaCode} cloned`)}>
              <Copy className="h-3.5 w-3.5" /> Clone
            </Button>
            {isDraft && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px] rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card px-6">
          <TabsList className="h-10 bg-transparent gap-0 p-0">
            {[
              { v: "overview", label: "Overview", icon: Eye },
              { v: "ingredients", label: "Ingredients", icon: Beaker },
              { v: "phases", label: "Phases & Steps", icon: Layers },
              { v: "cost", label: "Cost", icon: DollarSign },
              { v: "qc", label: "QC Specs", icon: ClipboardCheck },
              { v: "stability", label: "Stability", icon: Shield },
              { v: "packaging", label: "Packaging", icon: Package },
              { v: "versions", label: "Versions", icon: GitBranch },
              { v: "documents", label: "Documents", icon: FileText },
              { v: "extended", label: "Extended", icon: Puzzle },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="relative gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2.5 text-[12px] font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground"
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ===== OVERVIEW ===== */}
          <TabsContent value="overview" className="m-0 p-6">
            <OverviewTab formula={formula} />
          </TabsContent>

          {/* ===== INGREDIENTS ===== */}
          <TabsContent value="ingredients" className="m-0 p-6">
            <IngredientsTab isDraft={isDraft} data={ingredients} />
          </TabsContent>

          {/* ===== PHASES & STEPS ===== */}
          <TabsContent value="phases" className="m-0 p-6">
            <PhasesTab isDraft={isDraft} phases={phases} steps={steps} />
          </TabsContent>

          {/* ===== QC SPECS ===== */}
          <TabsContent value="qc" className="m-0 p-6">
            <QcSpecsTab isDraft={isDraft} qcSpecs={qcSpecs} />
          </TabsContent>

          {/* ===== STABILITY ===== */}
          <TabsContent value="stability" className="m-0 p-6">
            <StabilityTab />
          </TabsContent>

          {/* ===== PACKAGING ===== */}
          <TabsContent value="packaging" className="m-0 p-6">
            <PackagingTab />
          </TabsContent>

          {/* ===== VERSIONS ===== */}
          <TabsContent value="versions" className="m-0 p-6">
            <VersionsTab versions={versions} />
          </TabsContent>

          {/* ===== COST ===== */}
          <TabsContent value="cost" className="m-0 p-6">
            <CostTab formula={formula} />
          </TabsContent>

          {/* ===== DOCUMENTS ===== */}
          <TabsContent value="documents" className="m-0 p-6">
            <DocumentsTab />
          </TabsContent>

          {/* ===== EXTENDED ===== */}
          <TabsContent value="extended" className="m-0 p-6">
            <ExtendedTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

/* ============================================================================
   OVERVIEW TAB
   ============================================================================ */
function OverviewTab({ formula }: { formula: Formula }) {
  const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-foreground">{value ?? "--"}</dd>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-violet-500" /> Basic Information
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          <InfoItem label="Formula Code" value={formula.formulaCode} />
          <InfoItem label="Formula Type" value={formulaTypeLabel[formula.formulaType]} />
          <InfoItem label="Name (TH)" value={formula.formulaName} />
          <InfoItem label="Name (EN)" value={formula.formulaNameEn} />
          <InfoItem label="Product Type" value={formula.productType} />
          <InfoItem label="Cosmetic Form" value={formula.cosmeticForm} />
          {formula.parentFormulaId && <InfoItem label="Parent Formula" value={formula.parentFormulaId} />}
        </dl>
      </div>

      {/* Batch & Physical */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-blue-500" /> Batch & Physical Properties
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          <InfoItem label="Batch Size" value={`${formula.batchSize.toLocaleString()} ${formula.batchUnit}`} />
          <InfoItem label="Density" value={formula.density != null ? `${formula.density} g/mL` : undefined} />
          <InfoItem label="Unit Weight" value={formula.unitWeightG != null ? `${formula.unitWeightG}g` : undefined} />
          <InfoItem label="Shelf Life" value={formula.shelfLifeMonths != null ? `${formula.shelfLifeMonths} months` : undefined} />
          <InfoItem label="Storage Conditions" value={formula.storageConditions} />
          <InfoItem label="Pkg. Compatibility" value={formula.pkgCompatNotes} />
        </dl>
      </div>

      {/* QC Targets */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-emerald-500" /> QC Targets
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          <InfoItem label="Target pH" value={formula.targetPhMin != null && formula.targetPhMax != null ? `${formula.targetPhMin} - ${formula.targetPhMax}` : undefined} />
          <InfoItem label="Target Viscosity" value={formula.targetViscosityMin != null && formula.targetViscosityMax != null ? `${formula.targetViscosityMin} - ${formula.targetViscosityMax} ${formula.viscosityUnit ?? "cps"}` : undefined} />
        </dl>
      </div>

      {/* Status & Metadata */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-amber-500" /> Status & Metadata
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          <InfoItem label="Status" value={formulaStatusLabel[formula.status]} />
          <InfoItem label="Version" value={formula.versionString ?? `v${formula.version}`} />
          <InfoItem label="Created At" value={formula.createdAt} />
          <InfoItem label="Updated At" value={formula.updatedAt} />
          <InfoItem label="Ingredients" value={formula.ingredientCount} />
        </dl>
      </div>

      {/* Cost (Admin) */}
      <div className="col-span-2 rounded-xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-500" /> Cost (Admin Only)
        </h3>
        <dl className="grid grid-cols-3 gap-x-6 gap-y-3.5">
          <InfoItem label="Total Cost" value={formula.totalCost != null ? `\u0e3f${formula.totalCost.toLocaleString()}` : undefined} />
          <InfoItem label="Cost per Unit" value={formula.costPerUnit != null ? `\u0e3f${formula.costPerUnit.toLocaleString()}` : undefined} />
          <InfoItem label="Est. Cost/Kg" value={formula.estimatedCostPerKg != null ? `\u0e3f${formula.estimatedCostPerKg.toLocaleString()}` : undefined} />
        </dl>
        {formula.notes && (
          <div className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-[12px] text-muted-foreground">{formula.notes}</div>
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   INGREDIENTS TAB
   ============================================================================ */
function IngredientsTab({ isDraft, data }: { isDraft: boolean; data: FormulaIngredient[] }) {
  const totalPct = data.reduce((s, i) => s + i.percentage, 0)
  const isBalanced = Math.abs(totalPct - 100) < 0.01
  const linkedCount = data.filter((i) => i.stockCardId).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-bold">Ingredients ({data.length})</h3>
          <div className={cn("text-[12px] font-semibold px-2.5 py-0.5 rounded-full", isBalanced ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            Total: {totalPct.toFixed(2)}%
            {!isBalanced && " (should be ~100%)"}
          </div>
          {data.length > 0 && (
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full", linkedCount === data.length ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground")}>
              <Package className="h-3 w-3" />
              {linkedCount}/{data.length} linked to stock
            </div>
          )}
        </div>
        {isDraft && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</Button>
            <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Layers className="h-3.5 w-3.5" /> Bulk Add</Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-10 text-[10px] text-center">#</TableHead>
              <TableHead className="text-[10px]">Ingredient</TableHead>
              <TableHead className="text-[10px]">INCI Name</TableHead>
              <TableHead className="w-32 text-[10px]">Stock Item</TableHead>
              <TableHead className="w-16 text-[10px] text-center">Phase</TableHead>
              <TableHead className="w-20 text-[10px] text-right">%</TableHead>
              <TableHead className="w-24 text-[10px] text-right">Unit Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  No ingredients recorded for this formula
                </TableCell>
              </TableRow>
            ) : (
              data.map((ing) => (
                <TableRow key={ing.id} className="group hover:bg-muted/20">
                  <TableCell className="text-[11px] text-center text-muted-foreground">{ing.sortOrder}</TableCell>
                  <TableCell className="text-[12px] font-semibold">{ing.ingredientName}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground italic">{ing.inciName ?? "--"}</TableCell>
                  <TableCell>
                    {ing.stockCardId ? (
                      <Link
                        href={`/stock/${ing.stockCardId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-primary hover:underline"
                      >
                        <Package className="h-3 w-3" />
                        {ing.itemCode ?? ing.stockCardId}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600">
                        <AlertTriangle className="h-3 w-3" /> Unlinked
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {ing.phase && (
                      <span className={cn("inline-flex items-center justify-center h-5 w-5 rounded-md text-[10px] font-bold", phaseBadgeColor[ing.phase] ?? "bg-secondary text-foreground")}>
                        {ing.phase}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[12px] font-medium">{ing.percentage.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-[11px]">{ing.unitCost != null ? `\u0e3f${ing.unitCost.toLocaleString()}` : "--"}</TableCell>
                </TableRow>
              ))
            )}
            {/* Total row */}
            {data.length > 0 && (
              <TableRow className="bg-muted/40 font-bold border-t-2">
                <TableCell />
                <TableCell colSpan={4} className="text-[12px]">Total</TableCell>
                <TableCell className="text-right text-[12px]">{totalPct.toFixed(2)}%</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================================
   PHASES & STEPS TAB
   ============================================================================ */
function PhasesTab({ isDraft, phases, steps: allSteps }: { isDraft: boolean; phases: FormulaPhase[]; steps: FormulaProcessingStep[] }) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(phases[0]?.id ?? null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Phases ({phases.length})</h3>
        {isDraft && (
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Phase</Button>
        )}
      </div>

      {phases.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล phases สำหรับสูตรนี้
        </div>
      )}

      <div className="space-y-3">
        {phases.map((phase) => {
          const isExpanded = expandedPhase === phase.id
          const steps = allSteps.filter((s) => s.phase === phase.phaseKey)

          return (
            <div key={phase.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors text-left"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold", phaseBadgeColor[phase.phaseKey] ?? "bg-secondary text-foreground")}>
                  {phase.phaseKey}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{phase.phaseName}</p>
                  <p className="text-[10px] text-muted-foreground">{steps.length} processing step{steps.length !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
              </button>

              {isExpanded && steps.length > 0 && (
                <div className="border-t border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="w-12 text-[10px] text-center">Step</TableHead>
                        <TableHead className="text-[10px]">Instruction</TableHead>
                        <TableHead className="w-28 text-[10px]"><Thermometer className="h-3 w-3 inline mr-1" />Temp</TableHead>
                        <TableHead className="w-20 text-[10px]"><Clock className="h-3 w-3 inline mr-1" />Time</TableHead>
                        <TableHead className="w-20 text-[10px]"><Gauge className="h-3 w-3 inline mr-1" />RPM</TableHead>
                        <TableHead className="w-32 text-[10px]"><Wrench className="h-3 w-3 inline mr-1" />Equipment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {steps.map((step) => (
                        <TableRow key={step.id} className="hover:bg-muted/10">
                          <TableCell className="text-center">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{step.stepNumber}</span>
                          </TableCell>
                          <TableCell>
                            <p className="text-[12px] font-medium">{step.instruction}</p>
                            {step.notes && <p className="text-[10px] text-amber-600 mt-0.5">{step.notes}</p>}
                          </TableCell>
                          <TableCell className="text-[11px]">
                            {step.temperatureMin != null || step.temperatureMax != null
                              ? `${step.temperatureMin ?? "--"} - ${step.temperatureMax ?? "--"}\u00b0C`
                              : "--"}
                          </TableCell>
                          <TableCell className="text-[11px]">{step.durationMinutes != null ? `${step.durationMinutes} min` : "--"}</TableCell>
                          <TableCell className="text-[11px]">{step.speedRpm != null ? step.speedRpm.toLocaleString() : "--"}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">{step.equipment ?? "--"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================================
   QC SPECS TAB
   ============================================================================ */
function QcSpecsTab({ isDraft, qcSpecs }: { isDraft: boolean; qcSpecs: FormulaQcSpec[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">QC Specifications ({qcSpecs.length})</h3>
        {isDraft && (
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Spec</Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px]">Parameter</TableHead>
              <TableHead className="w-16 text-[10px]">Unit</TableHead>
              <TableHead className="w-20 text-[10px] text-right">Min</TableHead>
              <TableHead className="w-24 text-[10px] text-center">Target</TableHead>
              <TableHead className="w-20 text-[10px] text-right">Max</TableHead>
              <TableHead className="text-[10px]">Test Method</TableHead>
              <TableHead className="text-[10px]">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qcSpecs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  ยังไม่มี QC specifications
                </TableCell>
              </TableRow>
            ) : (
              qcSpecs.map((spec) => (
                <TableRow key={spec.id} className="hover:bg-muted/20">
                  <TableCell className="text-[12px] font-semibold">{spec.parameterName}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{spec.unit ?? "--"}</TableCell>
                  <TableCell className="text-right text-[12px]">{spec.minValue != null ? spec.minValue : "--"}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                      {spec.targetValue ?? "--"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-[12px]">{spec.maxValue != null ? spec.maxValue : "--"}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{spec.testMethod ?? "--"}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{spec.notes ?? "--"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================================
   VERSIONS TAB
   ============================================================================ */
function VersionsTab({ versions }: { versions: FormulaVersion[] }) {
  // Show latest version first (highest versionNumber = current)
  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Version History ({versions.length})</h3>
        <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Version</Button>
      </div>

      {versions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
          ยังไม่มีประวัติ version
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((ver, idx) => (
          <div key={ver.id} className={cn("rounded-xl border bg-card p-4 flex items-start gap-4", idx === 0 ? "border-primary/40 bg-primary/5" : "border-border")}>
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-[14px] font-extrabold shrink-0", idx === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
              v{ver.versionNumber}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold">Version {ver.versionNumber}</span>
                {idx === 0 && <Badge className="text-[9px] h-4 bg-primary text-primary-foreground">Current</Badge>}
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">{ver.changeDescription ?? "No description"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Created {new Date(ver.createdAt).toLocaleDateString("th-TH")} by {ver.createdBy ?? "Unknown"}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] rounded-lg gap-1 text-muted-foreground shrink-0">
              <Eye className="h-3.5 w-3.5" /> Snapshot
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
   COST TAB
   ============================================================================ */
function CostTab({ formula }: { formula: Formula }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Cost Analysis</h3>
        <Button size="sm" className="h-8 text-[11px] rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
          <DollarSign className="h-3.5 w-3.5" /> Recalculate Cost
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Cost", value: formula.totalCost, icon: DollarSign },
          { label: "Cost per Unit", value: formula.costPerUnit, icon: DollarSign },
          { label: "Est. Cost/Kg", value: formula.estimatedCostPerKg, icon: DollarSign },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <c.icon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="text-xl font-extrabold text-foreground">{c.value != null ? `\u0e3f${c.value.toLocaleString()}` : "--"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cost History */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <h4 className="text-[12px] font-bold">Cost History</h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20">
              <TableHead className="text-[10px]">Date</TableHead>
              <TableHead className="text-[10px] text-right">Total Cost</TableHead>
              <TableHead className="text-[10px] text-right">Cost/Unit</TableHead>
              <TableHead className="text-[10px] text-right">Batch Size</TableHead>
              <TableHead className="text-[10px] text-center">Ingredients</TableHead>
              <TableHead className="text-[10px]">Trigger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                ยังไม่มีประวัติการคำนวณต้นทุน
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================================
   DOCUMENTS TAB
   ============================================================================ */
function DocumentsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Documents</h3>
        <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Upload</Button>
      </div>

      <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
        ยังไม่มีเอกสารสำหรับสูตรนี้ — ฟีเจอร์อัพโหลดไฟล์จะพร้อมในเร็วๆ นี้
      </div>
    </div>
  )
}

/* ============================================================================
   EXTENDED TAB (Trials, Approvals, Stability)
   ============================================================================ */
function ExtendedTab() {
  return (
    <div className="space-y-6">
      {/* Trial Batches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold">Trial Batches</h3>
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Trial</Button>
        </div>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล trial batches — ฟีเจอร์นี้จะพร้อมในเร็วๆ นี้
        </div>
      </div>

      {/* Approval Steps */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold">Approval Steps</h3>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล approval steps
        </div>
      </div>

      {/* Stability Tests */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold">Stability Tests</h3>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล stability tests
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   STABILITY TAB
   ============================================================================ */
function StabilityTab() {
  const testTypes = [
    { type: "Room Temperature", icon: Thermometer, temp: "25°C", rh: "60%", duration: "24 months", status: "ongoing", color: "text-blue-600 bg-blue-50" },
    { type: "Accelerated", icon: Thermometer, temp: "40°C", rh: "75%", duration: "6 months", status: "passed", color: "text-emerald-600 bg-emerald-50" },
    { type: "Freeze-Thaw", icon: Snowflake, temp: "-10°C / 25°C", rh: "--", duration: "5 cycles", status: "passed", color: "text-emerald-600 bg-emerald-50" },
    { type: "Photostability", icon: Sun, temp: "25°C", rh: "60%", duration: "ICH Q1B", status: "pending", color: "text-amber-600 bg-amber-50" },
    { type: "Microbial (PET)", icon: Bug, temp: "25°C", rh: "--", duration: "28 days", status: "passed", color: "text-emerald-600 bg-emerald-50" },
  ]

  return (
    <div className="space-y-5">
      {/* Stability Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Shelf Life</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">24 <span className="text-sm font-normal text-muted-foreground">months</span></p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Storage</p>
          <p className="text-[14px] font-bold text-foreground mt-1">Below 30°C</p>
          <p className="text-[11px] text-muted-foreground">Avoid direct sunlight</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">PAO</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">12M</p>
          <p className="text-[11px] text-muted-foreground">Period After Opening</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Test Status</p>
          <p className="text-[14px] font-bold text-emerald-600 mt-1">4/5 Passed</p>
          <p className="text-[11px] text-muted-foreground">1 ongoing</p>
        </div>
      </div>

      {/* Test Cards */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-500" /> Stability Tests
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {testTypes.map((test) => {
            const Icon = test.icon
            return (
              <div key={test.type} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", test.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-[12px] font-bold text-foreground">{test.type}</p>
                    <p className="text-[10px] text-muted-foreground">Stability Test</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Temp</p>
                    <p className="text-[12px] font-semibold">{test.temp}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">RH</p>
                    <p className="text-[12px] font-semibold">{test.rh}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Duration</p>
                    <p className="text-[12px] font-semibold">{test.duration}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn("text-[10px]", 
                      test.status === "passed" ? "border-emerald-200 text-emerald-600" :
                      test.status === "ongoing" ? "border-blue-200 text-blue-600" :
                      "border-amber-200 text-amber-600"
                    )}>
                      {test.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detailed Results — placeholder until stability_tests table is added */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-foreground">Detailed Results</h3>
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          ยังไม่มีข้อมูล detailed stability results
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
   PACKAGING TAB
   ============================================================================ */
function PackagingTab() {
  const compatibleMaterials = [
    { name: "HDPE", compatible: true, notes: "Recommended for most formulas" },
    { name: "PET", compatible: true, notes: "Good clarity, suitable for serums" },
    { name: "PP", compatible: true, notes: "Heat resistant" },
    { name: "Glass", compatible: true, notes: "Best for actives, premium feel" },
    { name: "Aluminum", compatible: false, notes: "May react with low pH formulas" },
    { name: "PS", compatible: false, notes: "Not recommended - solvent sensitivity" },
  ]

  const recommendedPackaging = [
    { type: "Primary", item: "Airless Pump Bottle", material: "PP/HDPE", size: "30mL / 50mL", notes: "Prevents oxidation" },
    { type: "Primary", item: "Dropper Bottle", material: "Glass/PET", size: "30mL", notes: "For serum formats" },
    { type: "Secondary", item: "Carton Box", material: "Cardboard", size: "Custom", notes: "UV protection" },
    { type: "Tertiary", item: "Shipping Box", material: "Corrugated", size: "12 units", notes: "Standard shipping" },
  ]

  return (
    <div className="space-y-5">
      {/* Material Compatibility */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-violet-500" /> Material Compatibility
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {compatibleMaterials.map((mat) => (
            <div key={mat.name} className={cn(
              "rounded-xl border p-4",
              mat.compatible ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
            )}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-bold">{mat.name}</p>
                <Badge variant="outline" className={cn("text-[10px]", 
                  mat.compatible ? "border-emerald-300 text-emerald-600" : "border-red-300 text-red-600"
                )}>
                  {mat.compatible ? "Compatible" : "Not Recommended"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{mat.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Packaging */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-foreground">Recommended Packaging</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[10px]">Type</TableHead>
                <TableHead className="text-[10px]">Item</TableHead>
                <TableHead className="text-[10px]">Material</TableHead>
                <TableHead className="text-[10px]">Size</TableHead>
                <TableHead className="text-[10px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendedPackaging.map((pkg, idx) => (
                <TableRow key={idx} className="hover:bg-muted/20">
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]",
                      pkg.type === "Primary" ? "border-violet-200 text-violet-600" :
                      pkg.type === "Secondary" ? "border-blue-200 text-blue-600" :
                      "border-gray-200 text-gray-600"
                    )}>
                      {pkg.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12px] font-semibold">{pkg.item}</TableCell>
                  <TableCell className="text-[11px]">{pkg.material}</TableCell>
                  <TableCell className="text-[11px]">{pkg.size}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{pkg.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Compatibility Notes */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-bold text-amber-800">Packaging Notes</p>
            <ul className="text-[11px] text-amber-700 mt-1 space-y-1 list-disc list-inside">
              <li>Avoid metallic containers due to low pH (5.0-5.5)</li>
              <li>Use UV-protective packaging for photosensitive actives (Vitamin C)</li>
              <li>Airless pump recommended to prevent oxidation</li>
              <li>Ensure closure torque does not exceed 1.2 Nm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
