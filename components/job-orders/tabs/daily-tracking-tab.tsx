"use client"

import { useState } from "react"
import useSWR from "swr"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ChevronDown, ChevronUp, Check, Plus, Zap, Target, CheckCircle,
  AlertTriangle, BarChart3, Percent, Package, Pencil, Trash2, Loader2, ListPlus,
  PackageCheck, Trophy,
} from "lucide-react"
import { toast } from "sonner"
import type { JobOrder, ProductionStep, TrackingStats, DailyRecord } from "@/lib/job-order-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Props {
  jobOrder: JobOrder
  stats: TrackingStats
  onRefresh?: () => void
}

const OPERATORS = ["K. Somsri", "K. Wichai", "K. Somchai", "K. Malee", "K. Anan"]

export function DailyTrackingTab({ jobOrder, stats, onRefresh }: Props) {
  const steps = jobOrder.productionSteps
  const currentStep = steps.find((s) => s.status === "active")
  const allStepsDone = steps.length > 0 && steps.every((s) => s.status === "done")
  const [busy, setBusy] = useState(false)
  const [addStepOpen, setAddStepOpen] = useState(false)
  const [editStep, setEditStep] = useState<ProductionStep | null>(null)
  const [finishOpen, setFinishOpen] = useState(false)

  const refresh = () => onRefresh?.()

  // Apply the standard step template when a job order has no steps yet.
  async function handleApplyTemplate() {
    setBusy(true)
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply_template", targetQty: jobOrder.quantity, unit: "units" }),
      })
      if (!res.ok) throw new Error()
      toast.success("สร้างขั้นตอนการผลิตมาตรฐานแล้ว", { description: "8 steps added" })
      refresh()
    } catch {
      toast.error("สร้างขั้นตอนไม่สำเร็จ")
    } finally {
      setBusy(false)
    }
  }

  // ── Empty state: no steps yet ──────────────────────────────────────────
  if (steps.length === 0) {
    return (
      <div className="animate-in fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <ListPlus className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">ยังไม่มีขั้นตอนการผลิต</h3>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          เริ่มต้นด้วยเทมเพลตมาตรฐาน 8 ขั้นตอน (รับออเดอร์ → เตรียมวัตถุดิบ → ผสม → บรรจุ → QC → ติดฉลาก → แพ็ค → จัดส่ง)
          แล้วปรับแก้ได้ตามต้องการ
        </p>
        <Button className="mt-5 gap-1.5" onClick={handleApplyTemplate} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          สร้างขั้นตอนมาตรฐาน
        </Button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
      {/* Summary Callout */}
      <div className="mb-4 flex items-center gap-3.5 rounded-2xl border border-[rgba(245,158,11,0.2)] bg-[#fef3c7] p-3.5">
        <Zap className="h-6 w-6 shrink-0 text-[#f59e0b]" />
        <div className="flex-1 text-xs leading-relaxed">
          <span className="font-extrabold">วันนี้</span> &mdash; กำลังทำ{" "}
          <span className="font-extrabold">{currentStep ? `Step ${currentStep.stepNumber}: ${currentStep.name}` : "เสร็จทุกขั้นตอน"}</span>
          {" | "}ผลิตแล้ว{" "}
          <span className="font-extrabold">{stats.totalDone.toLocaleString()}</span> / {stats.target.toLocaleString()} หน่วย
          {" | "}เหลือ{" "}
          <span className="font-extrabold text-destructive">{stats.totalPending.toLocaleString()} หน่วย</span>
          {" | "}<span className="font-extrabold text-destructive">ครบกำหนดใน {stats.daysRemaining} วัน</span>
        </div>
      </div>

      {/* KPI Row - 6 cards */}
      <div className="mb-4 grid grid-cols-6 gap-2.5">
        <KPIMini icon={<Target className="h-4 w-4" />} label="Target" value={stats.target.toLocaleString()} />
        <KPIMini icon={<BarChart3 className="h-4 w-4" />} label="Produced" value={stats.totalDone.toLocaleString()} valueColor="text-primary" />
        <KPIMini icon={<Package className="h-4 w-4" />} label="Remaining" value={stats.totalPending.toLocaleString()} valueColor="text-[#f59e0b]" />
        <KPIMini icon={<CheckCircle className="h-4 w-4" />} label="Good" value={stats.totalGood.toLocaleString()} valueColor="text-[#10b981]" />
        <KPIMini icon={<AlertTriangle className="h-4 w-4" />} label="Defect" value={stats.totalDefect.toLocaleString()} valueColor="text-destructive" />
        <KPIMini icon={<Percent className="h-4 w-4" />} label="Defect %" value={`${stats.defectRate.toFixed(2)}%`} />
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-foreground">ขั้นตอนการผลิต ({steps.length})</span>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setAddStepOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> เพิ่มขั้นตอน
        </Button>
      </div>

      {/* Step Tracker Accordion */}
      <div className="space-y-2.5">
        {steps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            jobOrder={jobOrder}
            onRefresh={refresh}
            onEdit={() => setEditStep(step)}
          />
        ))}
      </div>

      {/* All-steps-done banner */}
      {allStepsDone && jobOrder.status !== "delivered" && (
        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <Trophy className="h-8 w-8 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="text-sm font-extrabold text-emerald-900">ทุกขั้นตอนเสร็จสมบูรณ์</p>
            <p className="text-[12px] text-emerald-700">ย้าย FG เข้าสต็อกสินค้าสำเร็จรูปเพื่อปิด Job Order</p>
          </div>
          <Button
            className="shrink-0 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setFinishOpen(true)}
          >
            <PackageCheck className="h-4 w-4" />
            ย้าย FG เข้าสต็อก
          </Button>
        </div>
      )}

      {/* Add / Edit dialogs */}
      <StepFormDialog
        mode="add"
        open={addStepOpen}
        onOpenChange={setAddStepOpen}
        jobOrder={jobOrder}
        onSaved={refresh}
      />
      <StepFormDialog
        mode="edit"
        open={editStep !== null}
        onOpenChange={(o) => !o && setEditStep(null)}
        jobOrder={jobOrder}
        step={editStep ?? undefined}
        onSaved={refresh}
      />

      {/* Move to FG Stock dialog */}
      <MoveToFGDialog
        open={finishOpen}
        onOpenChange={setFinishOpen}
        jobOrder={jobOrder}
        onFinished={refresh}
      />
    </div>
  )
}

function KPIMini({ icon, label, value, valueColor = "text-foreground" }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-3 text-center">
      <div className="mb-1 flex items-center justify-center text-muted-foreground">{icon}</div>
      <div className="text-[8px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-lg font-extrabold", valueColor)}>{value}</div>
    </div>
  )
}

interface StepCardProps {
  step: ProductionStep
  jobOrder: JobOrder
  onRefresh: () => void
  onEdit: () => void
}

function StepCard({ step, jobOrder, onRefresh, onEdit }: StepCardProps) {
  const [expanded, setExpanded] = useState(step.status === "active")
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const batches = jobOrder.batches
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [formGood, setFormGood] = useState("")
  const [formDefect, setFormDefect] = useState("")
  const [formOperator, setFormOperator] = useState(OPERATORS[0])
  const [formNote, setFormNote] = useState("")

  const pct = step.targetQty > 0 ? Math.round((step.completedQty / step.targetQty) * 100) : 0
  const remaining = Math.max(step.targetQty - step.completedQty, 0)
  const records = step.dailyRecords

  async function handleAddRecord() {
    const good = parseInt(formGood) || 0
    const defect = parseInt(formDefect) || 0
    if (good <= 0 && defect <= 0) {
      toast.error("กรอกจำนวน Good หรือ Defect อย่างน้อย 1")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}/steps/${step.id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formDate,
          goodQty: good,
          defectQty: defect,
          operatorName: formOperator,
          note: formNote,
          batchId: batches[batches.length - 1]?.id ?? "",
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("บันทึกยอดผลิตแล้ว", { description: `+${good} good${defect ? `, ${defect} defect` : ""}` })
      setFormGood("")
      setFormDefect("")
      setFormNote("")
      onRefresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    if (!confirm(`ปิดขั้นตอน "${step.name}" และเริ่มขั้นตอนถัดไป?`)) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}/steps/${step.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      })
      if (!res.ok) throw new Error()
      toast.success(`ปิดขั้นตอน: ${step.name}`)
      onRefresh()
    } catch {
      toast.error("ปิดขั้นตอนไม่สำเร็จ")
    } finally {
      setCompleting(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`ลบขั้นตอน "${step.name}"? ข้อมูลบันทึกทั้งหมดของขั้นตอนนี้จะถูกลบด้วย`)) return
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}/steps/${step.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`ลบขั้นตอน: ${step.name}`)
      onRefresh()
    } catch {
      toast.error("ลบไม่สำเร็จ")
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-all",
        step.status === "done" && "border-l-4 border-l-[#10b981] opacity-85 hover:opacity-100",
        step.status === "active" && "border-l-4 border-l-primary",
        step.status === "pending" && "opacity-70",
        expanded && "shadow-md"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <button onClick={() => setExpanded(!expanded)} className="flex flex-1 items-center gap-3.5 text-left">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold transition-all",
              step.status === "done" && "bg-[#10b981] text-white",
              step.status === "active" && "bg-primary text-white shadow-[0_0_0_4px_rgba(76,139,245,0.15)]",
              step.status === "pending" && "border-2 border-border bg-secondary text-muted-foreground"
            )}
          >
            {step.status === "done" ? <Check className="h-4 w-4" /> : step.stepNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-foreground">
              Step {step.stepNumber} &mdash; {step.name}
              {step.status === "active" && (
                <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">{step.description || "—"}</p>
          </div>
        </button>

        {/* Stats */}
        <div className="flex shrink-0 items-center gap-4">
          {(step.status === "done" || step.status === "active") && (
            <>
              <div className="text-center">
                <div className="text-[8px] font-bold uppercase text-muted-foreground">Done</div>
                <div className="font-mono text-base font-extrabold text-primary">{step.completedQty.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] font-bold uppercase text-muted-foreground">Remaining</div>
                <div className="font-mono text-base font-extrabold text-[#f59e0b]">{remaining.toLocaleString()}</div>
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", step.status === "done" ? "bg-[#10b981]" : "bg-primary")}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className="font-mono text-sm font-extrabold">{pct}%</span>
            </>
          )}
          {step.status === "pending" && (
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[9px] font-bold text-muted-foreground">
              Pending
            </span>
          )}
          {/* Row actions */}
          <button onClick={onEdit} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" title="แก้ไขขั้นตอน">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleDelete} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="ลบขั้นตอน">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200 border-t border-border">
          {/* Add record form (active or pending step) */}
          {step.status !== "done" && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <span className="whitespace-nowrap text-[11px] font-bold text-primary">
                <Plus className="mr-0.5 inline h-3 w-3" />บันทึก:
              </span>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="h-7 w-[140px] text-[11px]" />
              <Input type="number" min="0" placeholder="Good" value={formGood} onChange={(e) => setFormGood(e.target.value)} className="h-7 w-[80px] text-[11px]" />
              <Input type="number" min="0" placeholder="Defect" value={formDefect} onChange={(e) => setFormDefect(e.target.value)} className="h-7 w-[75px] text-[11px]" />
              <select
                value={formOperator}
                onChange={(e) => setFormOperator(e.target.value)}
                className="h-7 rounded-md border border-input bg-card px-2 text-[11px] outline-none focus:ring-1 focus:ring-primary/30"
              >
                {OPERATORS.map((op) => <option key={op}>{op}</option>)}
              </select>
              <Input placeholder="หมายเหตุ..." value={formNote} onChange={(e) => setFormNote(e.target.value)} className="h-7 flex-1 min-w-[100px] text-[11px]" />
              <Button size="sm" className="h-7 gap-1 text-[11px]" onClick={handleAddRecord} disabled={saving}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} บันทึก
              </Button>
            </div>
          )}

          {/* Daily log table */}
          {records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-secondary/50">
                    <Th>วันที่</Th><Th>Batch</Th><Th center>Good</Th><Th center>Defect</Th><Th>ผู้ทำ</Th><Th>สะสม</Th><Th>หมายเหตุ</Th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const batch = batches.find((b) => b.id === r.batchId)
                    const isLatest = i === 0 && step.status === "active"
                    return (
                      <tr key={r.id} className={cn("border-b border-border hover:bg-primary/[0.02]", isLatest && "bg-primary/[0.04]")}>
                        <td className={cn("px-4 py-2.5 font-semibold", isLatest && "font-bold text-primary")}>
                          {formatShort(r.date)}
                          {isLatest && <span className="ml-1 rounded bg-primary/10 px-1 py-px text-[9px] text-primary">ล่าสุด</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {batch ? (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">{batch.batchNumber}</span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center font-extrabold text-[14px] text-[#10b981]">+{r.goodQty.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-center">
                          {r.defectQty > 0 ? <span className="font-bold text-destructive">{r.defectQty}</span> : <span className="text-muted-foreground">&mdash;</span>}
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.operatorName}</td>
                        <td className="px-4 py-2.5 font-mono font-bold">{r.cumulativeTotal.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{r.note || "—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-[13px] text-muted-foreground">
              {step.status === "pending" ? "รอขั้นตอนก่อนหน้าเสร็จ" : "ยังไม่มีบันทึก"}
            </div>
          )}

          {/* Footer */}
          {(records.length > 0 || step.status === "active") && (
            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-4 py-2.5">
              <div className="text-[11px] text-muted-foreground">
                {records.length} บันทึก &bull; เฉลี่ย/วัน:{" "}
                <span className="font-bold text-foreground">{calcAvg(records)} หน่วย</span>
              </div>
              {step.status === "active" && (
                <Button size="sm" className="h-7 bg-[#10b981] text-[10px] text-white hover:bg-[#059669]" onClick={handleComplete} disabled={completing}>
                  {completing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />} ปิดขั้นตอน
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Th({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <th className={cn("px-4 py-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground", center ? "text-center" : "text-left")}>
      {children}
    </th>
  )
}

// ── Add / Edit step dialog ────────────────────────────────────────────────
interface StepFormProps {
  mode: "add" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  jobOrder: JobOrder
  step?: ProductionStep
  onSaved: () => void
}

function StepFormDialog({ mode, open, onOpenChange, jobOrder, step, onSaved }: StepFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [targetQty, setTargetQty] = useState("")
  const [saving, setSaving] = useState(false)

  // Sync fields when opening.
  const [lastOpen, setLastOpen] = useState(false)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setName(step?.name ?? "")
      setDescription(step?.description ?? "")
      setTargetQty(String(step?.targetQty ?? jobOrder.quantity))
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error("กรอกชื่อขั้นตอน")
      return
    }
    setSaving(true)
    try {
      const url =
        mode === "add"
          ? `/api/job-orders/${jobOrder.id}/steps`
          : `/api/job-orders/${jobOrder.id}/steps/${step!.id}`
      const res = await fetch(url, {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode === "add" ? "add" : undefined,
          name: name.trim(),
          description: description.trim(),
          targetQty: Number(targetQty) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success(mode === "add" ? "เพิ่มขั้นตอนแล้ว" : "แก้ไขขั้นตอนแล้ว")
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error("บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "เพิ่มขั้นตอนการผลิต" : "แก้ไขขั้นตอนการผลิต"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Field label="ชื่อขั้นตอน *">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ผสม, บรรจุ" className="h-9" />
          </Field>
          <Field label="รายละเอียด">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="คำอธิบายสั้นๆ" className="h-9" />
          </Field>
          <Field label="เป้าหมาย (จำนวน)">
            <Input type="number" min="0" value={targetQty} onChange={(e) => setTargetQty(e.target.value)} className="h-9" />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>ยกเลิก</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "add" ? "เพิ่ม" : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

// ── Move to FG Stock dialog ───────────────────────────────────────────────────
interface MoveToFGDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  jobOrder: JobOrder
  onFinished: () => void
}

function MoveToFGDialog({ open, onOpenChange, jobOrder, onFinished }: MoveToFGDialogProps) {
  const { data } = useSWR(
    open ? "/api/stock/cards?type=finished_good&limit=200" : null,
    fetcher,
    { revalidateOnFocus: false }
  )
  const fgCards: { id: string; itemCode: string; itemName: string }[] = data?.cards ?? []

  const [selectedCard, setSelectedCard] = useState("")
  const [quantity, setQuantity] = useState(String(jobOrder.quantity))
  const [lotNumber, setLotNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const filtered = fgCards.filter(
    (c) =>
      search === "" ||
      c.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      c.itemName.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSubmit() {
    if (!selectedCard) { toast.error("เลือก FG stock card ก่อน"); return }
    const qty = Number(quantity)
    if (!qty || qty <= 0) { toast.error("กรอกจำนวนที่ถูกต้อง"); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/job-orders/${jobOrder.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockCardId: selectedCard, quantity: qty, lotNumber, notes }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      toast.success("ย้าย FG เข้าสต็อกเรียบร้อย", {
        description: `JO #${jobOrder.orderNumber} ปิดแล้ว`,
      })
      onOpenChange(false)
      onFinished()
    } catch (e) {
      toast.error("เกิดข้อผิดพลาด", { description: String(e) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            ย้าย FG เข้าสต็อก — JO #{jobOrder.orderNumber}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            เลือก stock card ของสินค้าสำเร็จรูปและระบุจำนวนที่ผลิตได้จาก Job Order นี้
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* FG stock card search + select */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              ค้นหา FG Stock Card
            </label>
            <Input
              placeholder="ค้นหา code หรือชื่อสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-[12px] mb-2"
            />
            <div className="max-h-44 overflow-y-auto rounded-xl border border-border bg-card">
              {fgCards.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-[12px] text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังโหลด...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-muted-foreground">ไม่พบ FG ที่ตรงกัน</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCard(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 transition-colors hover:bg-secondary/50",
                      selectedCard === c.id && "bg-emerald-50 hover:bg-emerald-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      selectedCard === c.id ? "border-emerald-600 bg-emerald-600" : "border-border bg-card"
                    )}>
                      {selectedCard === c.id && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] font-bold text-primary">{c.itemCode}</div>
                      <div className="truncate text-[11px] text-foreground">{c.itemName}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                จำนวน (units) *
              </label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Lot Number
              </label>
              <Input
                placeholder="เช่น LOT-2025-001"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="h-9 text-[12px]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              หมายเหตุ
            </label>
            <Input
              placeholder={`Finished from JO #${jobOrder.orderNumber}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-[12px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !selectedCard}
            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
            ยืนยัน — ย้าย FG เข้าสต็อก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function calcAvg(records: DailyRecord[]): number {
  if (records.length === 0) return 0
  const total = records.reduce((sum, r) => sum + r.goodQty + r.defectQty, 0)
  const days = new Set(records.map((r) => r.date)).size
  return days > 0 ? Math.round(total / days) : 0
}

function formatShort(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${d.getDate()} ${months[d.getMonth()]}`
}
