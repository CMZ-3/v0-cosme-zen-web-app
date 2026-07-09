"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR, { mutate as globalMutate } from "swr"
import { cn } from "@/lib/utils"
import {
  Pencil, Copy, Trash2, CheckCircle, Zap, Archive, Undo2,
  FlaskConical, Beaker, Layers, Settings2, ClipboardCheck, GitBranch, DollarSign,
  FileText, Puzzle, Thermometer, Clock, Gauge, Wrench, AlertTriangle, Plus,
  Eye, Shield, Package, TestTube, Snowflake, Sun, Bug, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type {
  Formula, FormulaIngredient, FormulaPhase, FormulaProcessingStep,
  FormulaQcSpec, FormulaVersion,
} from "@/lib/formula-types"
import { formulaStatusLabel, formulaStatusColor, formulaTypeLabel, phaseBadgeColor } from "@/lib/formula-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface FormulaDetailResponse {
  formula: Formula
  ingredients: FormulaIngredient[]
  phases: FormulaPhase[]
  steps: FormulaProcessingStep[]
  qcSpecs: FormulaQcSpec[]
  versions: FormulaVersion[]
}

interface FormulaDetailProps {
  formulaId: string
  onDeleted?: () => void
  onCloned?: (newId: string) => void
}

export function FormulaDetail({ formulaId, onDeleted, onCloned }: FormulaDetailProps) {
  const swrKey = formulaId ? `/api/formulas/${formulaId}` : null
  const { data, error, isLoading, mutate } = useSWR<FormulaDetailResponse>(swrKey, fetcher)
  const formula = data?.formula
  const ingredients = data?.ingredients ?? []
  const phases = data?.phases ?? []
  const steps = data?.steps ?? []
  const qcSpecs = data?.qcSpecs ?? []
  const versions = data?.versions ?? []

  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const patchAction = async (action: string, extraLabel?: string) => {
    if (!formula) return
    setActionBusy(action)
    try {
      const res = await fetch(`/api/formulas/${formulaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "status"
            ? { action: "status", status: extraLabel }
            : { action },
        ),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Request failed")
      }
      const json = await res.json()
      if (action === "clone") {
        toast.success(`Formula cloned as ${json.formula.formulaCode}`)
        globalMutate("/api/formulas")
        onCloned?.(json.formula.id)
      } else {
        toast.success(`${json.formula?.formulaCode ?? formula.formulaCode} updated`)
        mutate()
        globalMutate("/api/formulas")
      }
    } catch (e) {
      toast.error("Error", { description: String(e) })
    } finally {
      setActionBusy(null)
    }
  }

  const handleDelete = async () => {
    if (!formula) return
    setActionBusy("delete")
    try {
      const res = await fetch(`/api/formulas/${formulaId}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Delete failed")
      }
      toast.success(`Formula ${formula.formulaCode} deleted`)
      globalMutate("/api/formulas")
      onDeleted?.()
    } catch (e) {
      toast.error("Delete failed", { description: String(e) })
      setActionBusy(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-6 gap-4">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-10 w-80 rounded-xl" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !formula) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Select a formula from the list
      </div>
    )
  }

  const isDraft = formula.status === "draft"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold tracking-tight text-foreground truncate">{formula.formulaCode}</h2>
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
            <p className="text-[12px] text-muted-foreground truncate mt-0.5">{formula.formulaName}{formula.formulaNameEn ? ` / ${formula.formulaNameEn}` : ""}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-wrap justify-end shrink-0">
            {formula.status === "draft" && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50"
                disabled={actionBusy === "status"}
                onClick={() => patchAction("status", "approved")}>
                <CheckCircle className="h-3 w-3" /> Approve
              </Button>
            )}
            {formula.status === "approved" && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                disabled={actionBusy === "status"}
                onClick={() => patchAction("status", "active")}>
                <Zap className="h-3 w-3" /> Activate
              </Button>
            )}
            {formula.status === "active" && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg text-muted-foreground"
                disabled={actionBusy === "status"}
                onClick={() => patchAction("status", "archived")}>
                <Archive className="h-3 w-3" /> Archive
              </Button>
            )}
            {["approved", "active", "archived"].includes(formula.status) && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50"
                disabled={actionBusy === "status"}
                onClick={() => patchAction("status", "draft")}>
                <Undo2 className="h-3 w-3" /> Revert
              </Button>
            )}
            {isDraft && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg"
                onClick={() => window.open(`/formulas/${formulaId}`, "_blank")}>
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg"
              disabled={actionBusy === "clone"}
              onClick={() => patchAction("clone")}>
              <Copy className="h-3 w-3" /> Clone
            </Button>
            {isDraft && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px] rounded-lg text-destructive border-destructive/30 hover:bg-destructive/5"
                disabled={actionBusy === "delete"}
                onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-3 w-3" /> Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border bg-card px-4">
          <TabsList className="h-9 bg-transparent gap-0 p-0 overflow-x-auto flex-nowrap">
            {[
              { v: "overview", label: "Overview", icon: Eye },
              { v: "ingredients", label: "Ingredients", icon: Beaker },
              { v: "phases", label: "Phases", icon: Layers },
              { v: "cost", label: "Cost", icon: DollarSign },
              { v: "qc", label: "QC", icon: ClipboardCheck },
              { v: "stability", label: "Stability", icon: Shield },
              { v: "packaging", label: "Packaging", icon: Package },
              { v: "versions", label: "Versions", icon: GitBranch },
              { v: "documents", label: "Docs", icon: FileText },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="relative gap-1 rounded-none border-b-2 border-transparent px-2.5 py-2 text-[11px] font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground whitespace-nowrap"
              >
                <t.icon className="h-3 w-3" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overview" className="m-0 p-5">
            <OverviewTab formula={formula} />
          </TabsContent>
          <TabsContent value="ingredients" className="m-0 p-5">
            <IngredientsTab isDraft={isDraft} data={ingredients} formulaId={formulaId} onRefresh={mutate} />
          </TabsContent>
          <TabsContent value="phases" className="m-0 p-5">
            <PhasesTab isDraft={isDraft} phases={phases} steps={steps} />
          </TabsContent>
          <TabsContent value="cost" className="m-0 p-5">
            <CostTab formula={formula} />
          </TabsContent>
          <TabsContent value="qc" className="m-0 p-5">
            <QcSpecsTab isDraft={isDraft} qcSpecs={qcSpecs} />
          </TabsContent>
          <TabsContent value="stability" className="m-0 p-5">
            <StabilityTab />
          </TabsContent>
          <TabsContent value="packaging" className="m-0 p-5">
            <PackagingTab />
          </TabsContent>
          <TabsContent value="versions" className="m-0 p-5">
            <VersionsTab versions={versions} />
          </TabsContent>
          <TabsContent value="documents" className="m-0 p-5">
            <DocumentsTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Formula</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{formula.formulaCode}</strong>? This cannot be undone and will remove all ingredients.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-[12px] font-bold text-foreground mb-3 flex items-center gap-2">
          <FlaskConical className="h-3.5 w-3.5 text-violet-500" /> Basic Information
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoItem label="Code" value={formula.formulaCode} />
          <InfoItem label="Type" value={formulaTypeLabel[formula.formulaType]} />
          <InfoItem label="Name (TH)" value={formula.formulaName} />
          <InfoItem label="Name (EN)" value={formula.formulaNameEn} />
          <InfoItem label="Product Type" value={formula.productType} />
          <InfoItem label="Form" value={formula.cosmeticForm} />
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-[12px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5 text-blue-500" /> Batch & Physical
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoItem label="Batch Size" value={`${formula.batchSize.toLocaleString()} ${formula.batchUnit}`} />
          <InfoItem label="Density" value={formula.density != null ? `${formula.density} g/mL` : undefined} />
          <InfoItem label="Unit Weight" value={formula.unitWeightG != null ? `${formula.unitWeightG}g` : undefined} />
          <InfoItem label="Shelf Life" value={formula.shelfLifeMonths != null ? `${formula.shelfLifeMonths} months` : undefined} />
          <InfoItem label="Storage" value={formula.storageConditions} />
          <InfoItem label="Pkg Compat." value={formula.pkgCompatNotes} />
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-[12px] font-bold text-foreground mb-3 flex items-center gap-2">
          <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" /> QC Targets
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoItem label="Target pH" value={formula.targetPhMin != null && formula.targetPhMax != null ? `${formula.targetPhMin} – ${formula.targetPhMax}` : undefined} />
          <InfoItem label="Viscosity" value={formula.targetViscosityMin != null && formula.targetViscosityMax != null ? `${formula.targetViscosityMin}–${formula.targetViscosityMax} ${formula.viscosityUnit ?? "cps"}` : undefined} />
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-[12px] font-bold text-foreground mb-3 flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-amber-500" /> Status & Metadata
        </h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <InfoItem label="Status" value={formulaStatusLabel[formula.status]} />
          <InfoItem label="Version" value={formula.versionString ?? `v${formula.version}`} />
          <InfoItem label="Created" value={formula.createdAt} />
          <InfoItem label="Updated" value={formula.updatedAt} />
          <InfoItem label="Ingredients" value={formula.ingredientCount} />
        </dl>
      </div>

      {/* Cost (Admin) */}
      <div className="col-span-2 rounded-xl border border-border bg-card p-4">
        <h3 className="text-[12px] font-bold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-green-500" /> Cost (Admin)
        </h3>
        <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
          <InfoItem label="Total Cost" value={formula.totalCost != null ? `฿${formula.totalCost.toLocaleString()}` : undefined} />
          <InfoItem label="Cost per Unit" value={formula.costPerUnit != null ? `฿${formula.costPerUnit.toLocaleString()}` : undefined} />
          <InfoItem label="Est. Cost/Kg" value={formula.estimatedCostPerKg != null ? `฿${formula.estimatedCostPerKg.toLocaleString()}` : undefined} />
        </dl>
        {formula.notes && (
          <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-[12px] text-muted-foreground">{formula.notes}</div>
        )}
      </div>
    </div>
  )
}

/* ============================================================================
   INGREDIENTS TAB
   ============================================================================ */
function IngredientsTab({
  isDraft, data, formulaId, onRefresh,
}: {
  isDraft: boolean
  data: FormulaIngredient[]
  formulaId: string
  onRefresh: () => void
}) {
  const totalPct = data.reduce((s, i) => s + i.percentage, 0)
  const isBalanced = Math.abs(totalPct - 100) < 0.01
  const linkedCount = data.filter((i) => i.stockCardId).length

  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState("")
  const [addPct, setAddPct] = useState("")
  const [addBusy, setAddBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FormulaIngredient | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const handleAdd = async () => {
    if (!addName.trim() || !addPct) return
    setAddBusy(true)
    try {
      const res = await fetch(`/api/formulas/${formulaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_ingredient", rawMaterialName: addName.trim(), percentage: parseFloat(addPct) }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      toast.success("Ingredient added")
      setShowAdd(false); setAddName(""); setAddPct("")
      onRefresh()
    } catch (e) {
      toast.error("Failed", { description: String(e) })
    } finally {
      setAddBusy(false)
    }
  }

  const handleDeleteIngredient = async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/formulas/${formulaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_ingredient", ingredientId: deleteTarget.id }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      toast.success(`"${deleteTarget.ingredientName}" removed`)
      onRefresh()
    } catch (e) {
      toast.error("Failed", { description: String(e) })
    } finally {
      setDeleteBusy(false); setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[13px] font-bold">Ingredients ({data.length})</h3>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", isBalanced ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {totalPct.toFixed(2)}%{!isBalanced && " ≠ 100"}
          </span>
          {data.length > 0 && (
            <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", linkedCount === data.length ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground")}>
              <Package className="h-3 w-3" />{linkedCount}/{data.length} linked
            </span>
          )}
        </div>
        {isDraft && (
          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg gap-1" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>

      {showAdd && isDraft && (
        <div className="flex items-end gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name *</label>
            <input className="flex h-7 w-full rounded-lg border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g. Sodium Hyaluronate" value={addName} onChange={(e) => setAddName(e.target.value)} />
          </div>
          <div className="w-20 space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">% *</label>
            <input type="number" step="0.01" className="flex h-7 w-full rounded-lg border border-input bg-background px-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0.00" value={addPct} onChange={(e) => setAddPct(e.target.value)} />
          </div>
          <Button size="sm" className="h-7 text-[10px] rounded-lg" disabled={addBusy || !addName.trim() || !addPct} onClick={handleAdd}>
            {addBusy ? "..." : "Save"}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-8 text-[10px] text-center">#</TableHead>
              <TableHead className="text-[10px]">Ingredient</TableHead>
              <TableHead className="w-24 text-[10px]">Stock</TableHead>
              <TableHead className="w-14 text-[10px] text-center">Phase</TableHead>
              <TableHead className="w-16 text-[10px] text-right">%</TableHead>
              {isDraft && <TableHead className="w-8" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDraft ? 6 : 5} className="text-center py-8 text-muted-foreground text-sm">
                  No ingredients yet
                </TableCell>
              </TableRow>
            ) : (
              data.map((ing) => (
                <TableRow key={ing.id} className="group hover:bg-muted/20">
                  <TableCell className="text-[10px] text-center text-muted-foreground">{ing.sortOrder}</TableCell>
                  <TableCell>
                    <p className="text-[11px] font-semibold">{ing.ingredientName}</p>
                    {ing.inciName && <p className="text-[10px] text-muted-foreground italic">{ing.inciName}</p>}
                  </TableCell>
                  <TableCell>
                    {ing.stockCardId ? (
                      <Link href={`/stock/${ing.stockCardId}`} className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline">
                        <Package className="h-2.5 w-2.5" />{(ing as FormulaIngredient & { itemCode?: string }).itemCode ?? ing.stockCardId}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
                        <AlertTriangle className="h-2.5 w-2.5" /> Unlinked
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
                  <TableCell className="text-right text-[11px] font-medium">{ing.percentage.toFixed(2)}</TableCell>
                  {isDraft && (
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(ing)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {data.length > 0 && (
              <TableRow className="bg-muted/40 font-bold border-t-2">
                <TableCell /><TableCell colSpan={3} className="text-[11px]">Total</TableCell>
                <TableCell className="text-right text-[11px]">{totalPct.toFixed(2)}%</TableCell>
                {isDraft && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{deleteTarget?.ingredientName}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteIngredient} disabled={deleteBusy}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ============================================================================
   PHASES & STEPS TAB
   ============================================================================ */
function PhasesTab({ isDraft, phases, steps: allSteps }: { isDraft: boolean; phases: FormulaPhase[]; steps: FormulaProcessingStep[] }) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(phases[0]?.id ?? null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">Phases ({phases.length})</h3>
        {isDraft && (
          <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg gap-1"><Plus className="h-3 w-3" /> Add Phase</Button>
        )}
      </div>

      {phases.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          No phases for this formula yet
        </div>
      )}

      <div className="space-y-2">
        {phases.map((phase) => {
          const isExpanded = expandedPhase === phase.id
          const steps = allSteps.filter((s) => s.phase === phase.phaseKey)
          return (
            <div key={phase.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors text-left"
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}>
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold", phaseBadgeColor[phase.phaseKey] ?? "bg-secondary text-foreground")}>
                  {phase.phaseKey}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold">{phase.phaseName}</p>
                  <p className="text-[10px] text-muted-foreground">{steps.length} step{steps.length !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isExpanded && "rotate-90")} />
              </button>
              {isExpanded && steps.length > 0 && (
                <div className="border-t border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20">
                        <TableHead className="w-10 text-[10px] text-center">Step</TableHead>
                        <TableHead className="text-[10px]">Instruction</TableHead>
                        <TableHead className="w-24 text-[10px]"><Thermometer className="h-3 w-3 inline mr-1" />Temp</TableHead>
                        <TableHead className="w-16 text-[10px]"><Clock className="h-3 w-3 inline mr-1" />Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {steps.map((step) => (
                        <TableRow key={step.id} className="hover:bg-muted/10">
                          <TableCell className="text-center">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{step.stepNumber}</span>
                          </TableCell>
                          <TableCell>
                            <p className="text-[11px] font-medium">{step.instruction}</p>
                            {step.notes && <p className="text-[10px] text-amber-600 mt-0.5">{step.notes}</p>}
                          </TableCell>
                          <TableCell className="text-[10px]">
                            {step.temperatureMin != null || step.temperatureMax != null ? `${step.temperatureMin ?? "--"}–${step.temperatureMax ?? "--"}°C` : "--"}
                          </TableCell>
                          <TableCell className="text-[10px]">{step.durationMinutes != null ? `${step.durationMinutes}m` : "--"}</TableCell>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">QC Specs ({qcSpecs.length})</h3>
        {isDraft && <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg gap-1"><Plus className="h-3 w-3" /> Add</Button>}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-[10px]">Parameter</TableHead>
              <TableHead className="w-14 text-[10px]">Unit</TableHead>
              <TableHead className="w-16 text-[10px] text-right">Min</TableHead>
              <TableHead className="w-20 text-[10px] text-center">Target</TableHead>
              <TableHead className="w-16 text-[10px] text-right">Max</TableHead>
              <TableHead className="text-[10px]">Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qcSpecs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">No QC specs yet</TableCell></TableRow>
            ) : (
              qcSpecs.map((spec) => (
                <TableRow key={spec.id} className="hover:bg-muted/20">
                  <TableCell className="text-[11px] font-semibold">{spec.parameterName}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{spec.unit ?? "--"}</TableCell>
                  <TableCell className="text-right text-[11px]">{spec.minValue != null ? spec.minValue : "--"}</TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">{spec.targetValue ?? "--"}</span>
                  </TableCell>
                  <TableCell className="text-right text-[11px]">{spec.maxValue != null ? spec.maxValue : "--"}</TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{spec.testMethod ?? "--"}</TableCell>
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
  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">Version History ({versions.length})</h3>
        <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg gap-1"><Plus className="h-3 w-3" /> Create Version</Button>
      </div>
      {versions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">No version history yet</div>
      )}
      <div className="space-y-2">
        {sorted.map((ver, idx) => (
          <div key={ver.id} className={cn("rounded-xl border bg-card p-4 flex items-start gap-3", idx === 0 ? "border-primary/40 bg-primary/5" : "border-border")}>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-extrabold shrink-0", idx === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
              v{ver.versionNumber}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold">Version {ver.versionNumber}</span>
                {idx === 0 && <Badge className="text-[9px] h-4 bg-primary text-primary-foreground">Current</Badge>}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{ver.changeDescription ?? "No description"}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {new Date(ver.createdAt).toLocaleDateString("th-TH")} · {ver.createdBy ?? "Unknown"}
              </p>
            </div>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">Cost Analysis</h3>
        <Button size="sm" className="h-7 text-[10px] rounded-lg gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
          <DollarSign className="h-3 w-3" /> Recalculate
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Cost", value: formula.totalCost },
          { label: "Cost per Unit", value: formula.costPerUnit },
          { label: "Est. Cost/Kg", value: formula.estimatedCostPerKg },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="text-lg font-extrabold text-foreground">{c.value != null ? `฿${c.value.toLocaleString()}` : "--"}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
        No cost history yet
      </div>
    </div>
  )
}

/* ============================================================================
   DOCUMENTS TAB
   ============================================================================ */
function DocumentsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">Documents</h3>
        <Button size="sm" variant="outline" className="h-7 text-[10px] rounded-lg gap-1"><Plus className="h-3 w-3" /> Upload</Button>
      </div>
      <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
        No documents yet — upload feature coming soon
      </div>
    </div>
  )
}

/* ============================================================================
   STABILITY TAB
   ============================================================================ */
function StabilityTab() {
  const tests = [
    { type: "Room Temperature", icon: Thermometer, temp: "25°C", rh: "60%", duration: "24 months", status: "ongoing" },
    { type: "Accelerated", icon: Thermometer, temp: "40°C", rh: "75%", duration: "6 months", status: "passed" },
    { type: "Freeze-Thaw", icon: Snowflake, temp: "-10°C / 25°C", rh: "--", duration: "5 cycles", status: "passed" },
    { type: "Photostability", icon: Sun, temp: "25°C", rh: "60%", duration: "ICH Q1B", status: "pending" },
    { type: "Microbial (PET)", icon: Bug, temp: "25°C", rh: "--", duration: "28 days", status: "passed" },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Shelf Life", value: "24 months" },
          { label: "Storage", value: "Below 30°C" },
          { label: "PAO", value: "12M" },
          { label: "Test Status", value: "4/5 Passed" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">{c.label}</p>
            <p className="text-[14px] font-bold text-foreground mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {tests.map((test) => {
          const Icon = test.icon
          return (
            <div key={test.type} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", test.status === "passed" ? "bg-emerald-50 text-emerald-600" : test.status === "ongoing" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600")}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                <p className="text-[11px] font-bold">{test.type}</p>
                <p className="text-[11px]">{test.temp}</p>
                <p className="text-[11px]">{test.duration}</p>
                <Badge variant="outline" className={cn("text-[10px] w-fit", test.status === "passed" ? "border-emerald-200 text-emerald-600" : test.status === "ongoing" ? "border-blue-200 text-blue-600" : "border-amber-200 text-amber-600")}>
                  {test.status}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================================
   PACKAGING TAB
   ============================================================================ */
function PackagingTab() {
  const materials = [
    { name: "HDPE", compatible: true, notes: "Recommended for most formulas" },
    { name: "PET", compatible: true, notes: "Good clarity, suitable for serums" },
    { name: "PP", compatible: true, notes: "Heat resistant" },
    { name: "Glass", compatible: true, notes: "Best for actives" },
    { name: "Aluminum", compatible: false, notes: "May react with low pH" },
    { name: "PS", compatible: false, notes: "Solvent sensitivity" },
  ]
  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-bold flex items-center gap-2"><Package className="h-3.5 w-3.5 text-violet-500" /> Material Compatibility</h3>
      <div className="grid grid-cols-3 gap-2">
        {materials.map((mat) => (
          <div key={mat.name} className={cn("rounded-xl border p-3", mat.compatible ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50")}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-bold">{mat.name}</p>
              <Badge variant="outline" className={cn("text-[9px]", mat.compatible ? "border-emerald-300 text-emerald-600" : "border-red-300 text-red-600")}>
                {mat.compatible ? "OK" : "No"}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{mat.notes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
