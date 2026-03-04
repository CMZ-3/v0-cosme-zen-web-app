"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowLeft, ChevronRight, Pencil, Copy, Trash2, CheckCircle, Zap, Archive, Undo2,
  FlaskConical, Beaker, Layers, Settings2, ClipboardCheck, GitBranch, DollarSign,
  FileText, Puzzle, Thermometer, Clock, Gauge, Wrench, AlertTriangle, Plus,
  Download, Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  mockFormulaList, mockFormulaIngredients, mockFormulaPhases, mockFormulaSteps,
  mockFormulaQcSpecs, mockFormulaVersions, mockFormulaCostHistory, mockFormulaDocuments,
  mockTrialBatches, mockApprovalSteps, mockStabilityTests,
} from "@/lib/formula-mock-data"
import { formulaStatusLabel, formulaStatusColor, formulaTypeLabel, phaseBadgeColor } from "@/lib/formula-types"
import { toast } from "sonner"

export default function FormulaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const formula = mockFormulaList.find((f) => f.id === params.id)

  if (!formula) {
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
              { v: "qc", label: "QC Specs", icon: ClipboardCheck },
              { v: "versions", label: "Versions", icon: GitBranch },
              { v: "cost", label: "Cost", icon: DollarSign },
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
            <IngredientsTab isDraft={isDraft} />
          </TabsContent>

          {/* ===== PHASES & STEPS ===== */}
          <TabsContent value="phases" className="m-0 p-6">
            <PhasesTab isDraft={isDraft} />
          </TabsContent>

          {/* ===== QC SPECS ===== */}
          <TabsContent value="qc" className="m-0 p-6">
            <QcSpecsTab isDraft={isDraft} />
          </TabsContent>

          {/* ===== VERSIONS ===== */}
          <TabsContent value="versions" className="m-0 p-6">
            <VersionsTab />
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
import type { Formula } from "@/lib/formula-types"

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
function IngredientsTab({ isDraft }: { isDraft: boolean }) {
  const data = mockFormulaIngredients
  const totalPct = data.reduce((s, i) => s + i.percentage, 0)
  const isBalanced = Math.abs(totalPct - 100) < 0.01

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-bold">Ingredients ({data.length})</h3>
          <div className={cn("text-[12px] font-semibold px-2.5 py-0.5 rounded-full", isBalanced ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            Total: {totalPct.toFixed(2)}%
            {!isBalanced && " (should be ~100%)"}
          </div>
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
              <TableHead className="w-16 text-[10px] text-center">Phase</TableHead>
              <TableHead className="w-20 text-[10px] text-right">%</TableHead>
              <TableHead className="text-[10px]">Function</TableHead>
              <TableHead className="w-24 text-[10px] text-right">Unit Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ing) => (
              <TableRow key={ing.id} className="group hover:bg-muted/20">
                <TableCell className="text-[11px] text-center text-muted-foreground">{ing.sortOrder}</TableCell>
                <TableCell className="text-[12px] font-semibold">{ing.ingredientName}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground italic">{ing.inciName ?? "--"}</TableCell>
                <TableCell className="text-center">
                  {ing.phase && (
                    <span className={cn("inline-flex items-center justify-center h-5 w-5 rounded-md text-[10px] font-bold", phaseBadgeColor[ing.phase] ?? "bg-secondary text-foreground")}>
                      {ing.phase}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-[12px] font-medium">{ing.percentage.toFixed(2)}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{ing.function ?? "--"}</TableCell>
                <TableCell className="text-right text-[11px]">{ing.unitCost != null ? `\u0e3f${ing.unitCost.toLocaleString()}` : "--"}</TableCell>
              </TableRow>
            ))}
            {/* Total row */}
            <TableRow className="bg-muted/40 font-bold border-t-2">
              <TableCell />
              <TableCell colSpan={3} className="text-[12px]">Total</TableCell>
              <TableCell className="text-right text-[12px]">{totalPct.toFixed(2)}%</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================================
   PHASES & STEPS TAB
   ============================================================================ */
function PhasesTab({ isDraft }: { isDraft: boolean }) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(mockFormulaPhases[0]?.id ?? null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Phases ({mockFormulaPhases.length})</h3>
        {isDraft && (
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Phase</Button>
        )}
      </div>

      <div className="space-y-3">
        {mockFormulaPhases.map((phase) => {
          const isExpanded = expandedPhase === phase.id
          const steps = mockFormulaSteps.filter((s) => s.phase === phase.phaseKey)

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
function QcSpecsTab({ isDraft }: { isDraft: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">QC Specifications ({mockFormulaQcSpecs.length})</h3>
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
            {mockFormulaQcSpecs.map((spec) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/* ============================================================================
   VERSIONS TAB
   ============================================================================ */
function VersionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Version History ({mockFormulaVersions.length})</h3>
        <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Version</Button>
      </div>

      <div className="space-y-3">
        {mockFormulaVersions.map((ver, idx) => (
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
              <p className="text-[10px] text-muted-foreground mt-1">Created {ver.createdAt} by {ver.createdBy ?? "Unknown"}</p>
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
            {mockFormulaCostHistory.map((ch) => (
              <TableRow key={ch.id} className="hover:bg-muted/10">
                <TableCell className="text-[12px]">{ch.recordedAt}</TableCell>
                <TableCell className="text-right text-[12px] font-medium">{"\u0e3f"}{ch.totalCost.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[12px]">{"\u0e3f"}{ch.costPerUnit.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[12px]">{ch.batchSize} kg</TableCell>
                <TableCell className="text-center text-[12px]">{ch.ingredientCount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{ch.triggeredBy ?? "auto"}</Badge>
                </TableCell>
              </TableRow>
            ))}
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
  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "--"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">Documents ({mockFormulaDocuments.length})</h3>
        <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Upload</Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px]">Title</TableHead>
              <TableHead className="text-[10px]">Type</TableHead>
              <TableHead className="text-[10px]">File</TableHead>
              <TableHead className="text-[10px] text-right">Size</TableHead>
              <TableHead className="text-[10px]">Uploaded</TableHead>
              <TableHead className="text-[10px]">By</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFormulaDocuments.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-muted/20">
                <TableCell className="text-[12px] font-semibold">{doc.title ?? doc.fileName}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{doc.documentType ?? "Other"}</Badge></TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{doc.fileName}</TableCell>
                <TableCell className="text-right text-[11px]">{formatSize(doc.fileSize)}</TableCell>
                <TableCell className="text-[11px] text-muted-foreground">{doc.createdAt}</TableCell>
                <TableCell className="text-[11px]">{doc.createdBy ?? "--"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          <h3 className="text-[14px] font-bold">Trial Batches ({mockTrialBatches.length})</h3>
          <Button size="sm" variant="outline" className="h-8 text-[11px] rounded-xl gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Trial</Button>
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[10px]">Trial Code</TableHead>
                <TableHead className="text-[10px] text-right">Batch Size</TableHead>
                <TableHead className="text-[10px]">Date</TableHead>
                <TableHead className="text-[10px]">Operator</TableHead>
                <TableHead className="text-[10px]">Results</TableHead>
                <TableHead className="text-[10px]">Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrialBatches.map((tb) => (
                <TableRow key={tb.id} className="hover:bg-muted/20">
                  <TableCell className="text-[12px] font-semibold text-primary">{tb.trialCode}</TableCell>
                  <TableCell className="text-right text-[12px]">{tb.batchSize != null ? `${tb.batchSize} kg` : "--"}</TableCell>
                  <TableCell className="text-[11px]">{tb.productionDate ?? "--"}</TableCell>
                  <TableCell className="text-[11px]">{tb.operator ?? "--"}</TableCell>
                  <TableCell className="text-[11px] max-w-[200px] truncate">{tb.results ?? "--"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]",
                      tb.feedbackStatus === "approved" ? "border-emerald-200 text-emerald-600" :
                      tb.feedbackStatus === "revision" ? "border-amber-200 text-amber-600" : ""
                    )}>
                      {tb.feedbackStatus ?? "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Approval Steps */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold">Approval Steps ({mockApprovalSteps.length})</h3>
        <div className="grid grid-cols-4 gap-3">
          {mockApprovalSteps.map((step) => (
            <div key={step.id} className={cn("rounded-xl border p-4", step.status === "approved" ? "border-emerald-200 bg-emerald-50/50" : "border-border bg-card")}>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">{step.stepNumber}</span>
                <div>
                  <p className="text-[12px] font-bold leading-tight">{step.stepName}</p>
                  {step.stepSubtitle && <p className="text-[10px] text-muted-foreground">{step.stepSubtitle}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px]"><span className="text-muted-foreground">Approver:</span> {step.approver ?? "--"}</p>
                <p className="text-[11px]"><span className="text-muted-foreground">Date:</span> {step.approvalDate ?? "--"}</p>
                {step.status && (
                  <Badge variant="outline" className={cn("text-[9px] mt-1", step.status === "approved" ? "border-emerald-200 text-emerald-600" : "border-border text-muted-foreground")}>
                    {step.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stability Tests */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold">Stability Tests ({mockStabilityTests.length})</h3>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[10px]">Test Type</TableHead>
                <TableHead className="text-[10px]">Parameter</TableHead>
                <TableHead className="text-[10px]">Method</TableHead>
                <TableHead className="text-[10px]">Duration</TableHead>
                <TableHead className="text-[10px]">Result</TableHead>
                <TableHead className="text-[10px]">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStabilityTests.map((st) => (
                <TableRow key={st.id} className="hover:bg-muted/20">
                  <TableCell className="text-[12px] font-semibold">{st.testType}</TableCell>
                  <TableCell className="text-[11px]">{st.parameter ?? "--"}</TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{st.method ?? "--"}</TableCell>
                  <TableCell className="text-[11px]">{st.duration ?? "--"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", st.result === "Pass" ? "border-emerald-200 text-emerald-600" : "border-red-200 text-red-600")}>
                      {st.result ?? "--"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">{st.notes ?? "--"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
