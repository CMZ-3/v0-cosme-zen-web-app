"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { RegistrationType } from "@/lib/fda-types"
import { REGISTRATION_TYPE_MAP } from "@/lib/fda-types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Building2,
  FlaskConical,
  ClipboardList,
  PackageOpen,
  FileText,
  Users,
} from "lucide-react"

// ──── types ────
export interface FdaIngredientRow {
  no: number
  casNumber: string
  inciName: string
}

export interface FdaFormData {
  // step 1 - type & purpose
  regType: RegistrationType
  purpose: "domestic" | "export_only" | "export_buyer_spec"
  // step 2 - product info
  tradeNameTh: string
  tradeNameEn: string
  productNameTh: string
  productNameEn: string
  productNameSuffix: string
  usageFormat: "rinse_off" | "leave_on" | ""
  applicationArea: string
  productPurpose: string
  usageInstructions: string
  // step 3 - physical form & conditions
  physicalForm: string
  containerType: string
  productFormat: "single" | "single_color_scent" | "multi_combined" | "set" | ""
  conditions: string[]
  conditionMixRatio: string
  conditionOther: string
  // step 4 - business details
  businessType: "manufacture_sell" | "contract_manufacture" | "import_sell"
  // manufacture_sell
  ms_manufacturerName: string
  ms_officeAddress: string
  ms_factoryAddress: string
  ms_storageAddress: string
  ms_bulkRegNo: string
  ms_combinedRegNos: string
  // contract_manufacture
  cm_contractorName: string
  cm_contractorOffice: string
  cm_factoryAddress: string
  cm_storageAddress: string
  cm_clientName: string
  cm_clientAddress: string
  cm_bulkRegNo: string
  cm_combinedRegNos: string
  // import
  imp_importerName: string
  imp_importerAddress: string
  imp_storageAddress: string
  imp_foreignManufacturer: string
  imp_foreignFactory: string
  imp_country: string
  // step 5 - ingredients
  ingredients: FdaIngredientRow[]
  ingredientNotes: string
  // general
  notes: string
}

const EMPTY_FORM: FdaFormData = {
  regType: "jk",
  purpose: "domestic",
  tradeNameTh: "",
  tradeNameEn: "",
  productNameTh: "",
  productNameEn: "",
  productNameSuffix: "",
  usageFormat: "",
  applicationArea: "",
  productPurpose: "",
  usageInstructions: "",
  physicalForm: "",
  containerType: "",
  productFormat: "",
  conditions: [],
  conditionMixRatio: "",
  conditionOther: "",
  businessType: "contract_manufacture",
  ms_manufacturerName: "",
  ms_officeAddress: "",
  ms_factoryAddress: "",
  ms_storageAddress: "",
  ms_bulkRegNo: "",
  ms_combinedRegNos: "",
  cm_contractorName: "",
  cm_contractorOffice: "",
  cm_factoryAddress: "",
  cm_storageAddress: "",
  cm_clientName: "",
  cm_clientAddress: "",
  cm_bulkRegNo: "",
  cm_combinedRegNos: "",
  imp_importerName: "",
  imp_importerAddress: "",
  imp_storageAddress: "",
  imp_foreignManufacturer: "",
  imp_foreignFactory: "",
  imp_country: "",
  ingredients: [{ no: 1, casNumber: "", inciName: "" }],
  ingredientNotes: "",
  notes: "",
}

// ──── Steps ────
const STEPS = [
  { key: "type", label: "ประเภท", icon: FileText },
  { key: "product", label: "ข้อมูลผลิตภัณฑ์", icon: FlaskConical },
  { key: "physical", label: "ลักษณะ/ภาชนะ", icon: PackageOpen },
  { key: "business", label: "ผู้ประกอบการ", icon: Building2 },
  { key: "ingredients", label: "ส่วนผสม", icon: ClipboardList },
  { key: "review", label: "ตรวจสอบ", icon: Check },
] as const

// ──── Predefined options (from PDF form) ────
const APPLICATION_AREAS = [
  "ผิวหนัง/ร่างกาย", "ใบหน้า", "เส้นผม/หนังศีรษะ", "ริมฝีปาก", "ตา/รอบดวงตา",
  "เล็บ", "ช่องปาก/ฟัน", "อวัยวะเพศภายนอก",
]

const PRODUCT_PURPOSES = [
  "แชมพู", "ครีมนวดผม", "บำรุงผิว", "ทำความสะอาดผิว", "กันแดด",
  "ระงับกลิ่นกาย", "น้ำหอม", "แต่งสีผิว/ปกปิด", "ย้อมสีผม", "ดัดผม/ยืดผม",
  "ผลิตภัณฑ์เด็ก", "ระงับเหงื่อ", "อื่นๆ",
]

const PHYSICAL_FORMS = [
  "ของเหลว (Liquid)", "ครีม (Cream)", "เจล (Gel)", "ผง (Powder)",
  "แท่ง (Stick)", "สเปรย์ (Spray)", "โฟม (Foam)", "อิมัลชั่น (Emulsion)",
  "เพสต์ (Paste)", "แผ่น (Sheet/Patch)", "อื่นๆ",
]

const CONTAINER_TYPES = [
  "ขวดแก้ว", "ขวดพลาสติก/ขวดอะคริลิค", "หลอดพลาสติก",
  "กระปุก", "ซอง", "กระป๋อง/สเปรย์อัดแก๊ส",
  "กระบอกฉีดยา (Syringe) / แอมพูล (Ampoule) / ไวอัล (Vial)", "อื่นๆ",
]

const CONDITIONS = [
  { key: "child_3", label: "ห้ามใช้ในเด็กอายุต่ำกว่า 3 ปี" },
  { key: "child_10", label: "ห้ามใช้ในเด็กอายุต่ำกว่า 10 ปี" },
  { key: "no_spray", label: "ผลิตภัณฑ์นี้ไม่ใช่ผลิตภัณฑ์รูปแบบฉีดพ่นหรือสเปรย์ (Spray)" },
  { key: "no_aerosol", label: "ผลิตภัณฑ์นี้ไม่ใช่ผลิตภัณฑ์รูปแบบสเปรย์อัดแก๊ส (Aerosol Spray)" },
  { key: "mix_required", label: "ต้องมีการผสมผลิตภัณฑ์อื่นก่อนใช้" },
  { key: "other", label: "อื่นๆ" },
]

// ──── Component ────
interface CreateFdaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<FdaFormData>
}

export function CreateFdaDialog({ open, onOpenChange, initialData }: CreateFdaDialogProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FdaFormData>(() => ({ ...EMPTY_FORM, ...initialData }))

  // Reset when dialog opens with new initialData
  const handleOpenChange = useCallback((o: boolean) => {
    if (o && initialData) {
      setForm({ ...EMPTY_FORM, ...initialData })
      setStep(initialData.ingredients && initialData.ingredients.length > 1 ? 5 : 0)
    }
    if (!o) {
      setStep(0)
      setForm({ ...EMPTY_FORM })
    }
    onOpenChange(o)
  }, [onOpenChange, initialData])

  const updateField = <K extends keyof FdaFormData>(key: K, value: FdaFormData[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const addIngredient = () =>
    setForm((p) => ({
      ...p,
      ingredients: [...p.ingredients, { no: p.ingredients.length + 1, casNumber: "", inciName: "" }],
    }))

  const removeIngredient = (idx: number) =>
    setForm((p) => ({
      ...p,
      ingredients: p.ingredients.filter((_, i) => i !== idx).map((r, i) => ({ ...r, no: i + 1 })),
    }))

  const updateIngredient = (idx: number, field: keyof FdaIngredientRow, value: string) =>
    setForm((p) => ({
      ...p,
      ingredients: p.ingredients.map((r, i) => (i === idx ? { ...r, [field]: field === "no" ? Number(value) : value } : r)),
    }))

  const handleCreate = () => {
    if (!form.productNameTh.trim() && !form.productNameEn.trim()) {
      toast.error("Product name is required")
      return
    }
    toast.success(`FDA Registration (${form.regType === "jk" ? "จ.ค." : "จ.ร."}) created as Draft`)
    handleOpenChange(false)
  }

  const canNext = () => {
    if (step === 0) return true
    if (step === 1) return form.productNameTh.trim() !== "" || form.productNameEn.trim() !== ""
    return true
  }

  // ──── Step Renderers ────
  const renderStep0 = () => (
    <div className="flex flex-col gap-5">
      {/* Registration Type */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold text-foreground">{"ประเภทการจดแจ้ง"}</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["jk", "jr"] as RegistrationType[]).map((t) => {
            const cfg = REGISTRATION_TYPE_MAP[t]
            const active = form.regType === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => updateField("regType", t)}
                className={cn(
                  "rounded-xl border-2 px-4 py-4 text-center transition-all",
                  active
                    ? t === "jk" ? "border-blue-500 bg-blue-50" : "border-amber-500 bg-amber-50"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                <p className={cn("text-2xl font-extrabold", active ? (t === "jk" ? "text-blue-700" : "text-amber-700") : "text-muted-foreground")}>{cfg.label}</p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">{t === "jk" ? "แบบ จ.ค.๑ - คำขอจดแจ้ง" : "แบบ จ.ร.๑ - ใบรับจดแจ้ง"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t === "jk" ? "Cosmetic Notification Application" : "Cosmetic Notification Receipt"}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Purpose */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold text-foreground">{"วัตถุประสงค์การจดแจ้ง"}</Label>
        <div className="flex flex-col gap-2">
          {[
            { value: "domestic" as const, label: "จดแจ้งเพื่อขายในประเทศไทย หรือส่งออก (ตามมาตรฐานของประเทศไทย)" },
            { value: "export_only" as const, label: "จดแจ้งเฉพาะเพื่อการส่งออกเท่านั้น" },
            { value: "export_buyer_spec" as const, label: "จดแจ้งเฉพาะเพื่อการส่งออก โดยมีคุณภาพ มาตรฐาน ตามที่ผู้สั่งซื้อกำหนด (มาตรา ๓๕)" },
          ].map((opt) => (
            <label key={opt.value} className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all",
              form.purpose === opt.value ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
            )}>
              <input
                type="radio"
                name="purpose"
                checked={form.purpose === opt.value}
                onChange={() => updateField("purpose", opt.value)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-[12px] leading-relaxed">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">
        {"ข้อ ๑-๔ ตามแบบ จ.ค.๑ / จ.ร.๑"}
      </p>

      {/* ๑. Trade Name */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-primary">{"๑. ชื่อการค้าและชื่อเครื่องสำอาง"}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">{"ชื่อการค้า (ไทย)"}</Label>
            <Input className="text-sm" placeholder="เช่น ลา รีไฟน์" value={form.tradeNameTh} onChange={(e) => updateField("tradeNameTh", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">{"ชื่อการค้า (อังกฤษ)"}</Label>
            <Input className="text-sm" placeholder="e.g. LA REFYNE" value={form.tradeNameEn} onChange={(e) => updateField("tradeNameEn", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">{"ชื่อเครื่องสำอาง (ไทย)"} <span className="text-destructive">*</span></Label>
            <Input className="text-sm" placeholder="เช่น โคชิ อะมิโน มอยซ์เจอร์ ล็อค แชมพู" value={form.productNameTh} onChange={(e) => updateField("productNameTh", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-[10px] font-semibold text-muted-foreground">{"ชื่อเครื่องสำอาง (อังกฤษ)"}</Label>
            <Input className="text-sm" placeholder="e.g. KOSHI AMINO MOISTURE LOCK SHAMPOO" value={form.productNameEn} onChange={(e) => updateField("productNameEn", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">{"ชื่อเครื่องสำอางแนบท้าย (๑.๓)"}</Label>
          <Input className="text-sm" placeholder="กรณีผลิตภัณฑ์เดี่ยวแต่ต่างสี/กลิ่น" value={form.productNameSuffix} onChange={(e) => updateField("productNameSuffix", e.target.value)} />
        </div>
      </div>

      {/* ๒. Usage format */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๒. รูปแบบการใช้เครื่องสำอาง"}</p>
        <div className="flex gap-3">
          {([
            { v: "rinse_off" as const, label: "ใช้แล้วล้างออก" },
            { v: "leave_on" as const, label: "ใช้แล้วไม่ต้องล้างออก" },
          ]).map((o) => (
            <label key={o.v} className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer text-[12px] font-medium transition-all",
              form.usageFormat === o.v ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
            )}>
              <input type="radio" name="usageFormat" checked={form.usageFormat === o.v} onChange={() => updateField("usageFormat", o.v)} className="accent-primary" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* ๓. Cosmetic Type */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-primary">{"๓. ประเภทของเครื่องสำอาง"}</p>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">{"๓.๑ บริเวณที่ใช้ผลิตภัณฑ์"}</Label>
          <div className="flex flex-wrap gap-1.5">
            {APPLICATION_AREAS.map((a) => (
              <button key={a} type="button" onClick={() => updateField("applicationArea", a)} className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                form.applicationArea === a ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
              )}>{a}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">{"๓.๒ วัตถุประสงค์ในการใช้ผลิตภัณฑ์"}</Label>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_PURPOSES.map((p) => (
              <button key={p} type="button" onClick={() => updateField("productPurpose", p)} className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all",
                form.productPurpose === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
              )}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ๔. Usage instructions */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๔. วิธีใช้"}</p>
        <Textarea className="text-sm" rows={2} placeholder="เช่น ใช้ทำความสะอาดเส้นผมและหนังศีรษะ แล้วล้างออกด้วยน้ำสะอาด" value={form.usageInstructions} onChange={(e) => updateField("usageInstructions", e.target.value)} />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">{"ข้อ ๕-๘ ลักษณะทางกายภาพ, ภาชนะบรรจุ, เงื่อนไข, และรูปแบบ"}</p>

      {/* ๕. Physical form */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๕. ลักษณะทางกายภาพของเครื่องสำอาง"}</p>
        <div className="flex flex-wrap gap-1.5">
          {PHYSICAL_FORMS.map((f) => (
            <button key={f} type="button" onClick={() => updateField("physicalForm", f)} className={cn(
              "rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all",
              form.physicalForm === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
            )}>{f}</button>
          ))}
        </div>
      </div>

      {/* ๖. Container */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๖. ลักษณะทางกายภาพของภาชนะบรรจุ"}</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTAINER_TYPES.map((c) => (
            <button key={c} type="button" onClick={() => updateField("containerType", c)} className={cn(
              "rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all",
              form.containerType === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary"
            )}>{c}</button>
          ))}
        </div>
      </div>

      {/* ๗. Conditions */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๗. เงื่อนไขของการใช้เครื่องสำอาง"}</p>
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.key} className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={form.conditions.includes(c.key)}
                onCheckedChange={(checked) => {
                  if (checked) updateField("conditions", [...form.conditions, c.key])
                  else updateField("conditions", form.conditions.filter((k) => k !== c.key))
                }}
                className="mt-0.5"
              />
              <span className="text-[11px] leading-relaxed">{c.label}</span>
            </label>
          ))}
          {form.conditions.includes("mix_required") && (
            <div className="ml-6 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{"อัตราส่วน 1 :"}</span>
              <Input className="w-20 text-xs h-7" value={form.conditionMixRatio} onChange={(e) => updateField("conditionMixRatio", e.target.value)} />
            </div>
          )}
          {form.conditions.includes("other") && (
            <Input className="ml-6 text-xs" placeholder="ระบุเงื่อนไขอื่น" value={form.conditionOther} onChange={(e) => updateField("conditionOther", e.target.value)} />
          )}
        </div>
      </div>

      {/* ๘. Product Format */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[11px] font-bold text-primary">{"๘. รูปแบบเครื่องสำอาง"}</p>
        <div className="flex flex-col gap-2">
          {([
            { v: "single" as const, label: "ผลิตภัณฑ์เดี่ยว" },
            { v: "single_color_scent" as const, label: "ผลิตภัณฑ์เดี่ยวชนิดเดียวกันที่มีส่วนประกอบเหมือนกัน แต่แตกต่างกันที่สีหรือกลิ่น" },
            { v: "multi_combined" as const, label: "ผลิตภัณฑ์หลายรายการที่รวมบรรจุในบรรจุภัณฑ์เดียวกันไม่สามารถแยกจำหน่ายได้" },
            { v: "set" as const, label: "ผลิตภัณฑ์เดี่ยวที่ได้รับการจดแจ้งแล้ว นำมารวมบรรจุเป็นชุดผลิตภัณฑ์" },
          ]).map((o) => (
            <label key={o.v} className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2.5 cursor-pointer text-[11px] transition-all",
              form.productFormat === o.v ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
            )}>
              <input type="radio" name="productFormat" checked={form.productFormat === o.v} onChange={() => updateField("productFormat", o.v)} className="mt-0.5 accent-primary" />
              <span className="leading-relaxed">{o.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">{"ข้อ ๙ รายละเอียดของผู้ประกอบการ"}</p>

      {/* Business type selector */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { v: "manufacture_sell" as const, label: "๙.๑ ผลิตเพื่อขาย", icon: Building2 },
          { v: "contract_manufacture" as const, label: "๙.๒ รับจ้างผลิต", icon: Users },
          { v: "import_sell" as const, label: "๙.๓ นำเข้าเพื่อขาย", icon: PackageOpen },
        ]).map((o) => (
          <button key={o.v} type="button" onClick={() => updateField("businessType", o.v)} className={cn(
            "rounded-xl border-2 px-3 py-3 text-center transition-all",
            form.businessType === o.v ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
          )}>
            <o.icon className={cn("h-5 w-5 mx-auto mb-1", form.businessType === o.v ? "text-primary" : "text-muted-foreground")} />
            <p className={cn("text-[11px] font-bold", form.businessType === o.v ? "text-primary" : "text-muted-foreground")}>{o.label}</p>
          </button>
        ))}
      </div>

      {/* Fields based on type */}
      {form.businessType === "manufacture_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้ผลิต" value={form.ms_manufacturerName} onChange={(v) => updateField("ms_manufacturerName", v)} />
          <Field label="ที่ตั้งสำนักงาน" value={form.ms_officeAddress} onChange={(v) => updateField("ms_officeAddress", v)} />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.ms_factoryAddress} onChange={(v) => updateField("ms_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.ms_storageAddress} onChange={(v) => updateField("ms_storageAddress", v)} />
          <Field label="เลขที่ใบรับจดแจ้ง Bulk (กรณีแบ่งบรรจุ)" value={form.ms_bulkRegNo} onChange={(v) => updateField("ms_bulkRegNo", v)} />
          <Field label="เลขที่ใบรับจดแจ้ง (กรณีรวมบรรจุ)" value={form.ms_combinedRegNos} onChange={(v) => updateField("ms_combinedRegNos", v)} />
        </div>
      )}

      {form.businessType === "contract_manufacture" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้รับจ้างผลิต" value={form.cm_contractorName} onChange={(v) => updateField("cm_contractorName", v)} placeholder="เช่น บริษัท คอสเม่เซน จำกัด" />
          <Field label="ที่ตั้งสำนักงาน (ผู้รับจ้าง)" value={form.cm_contractorOffice} onChange={(v) => updateField("cm_contractorOffice", v)} />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.cm_factoryAddress} onChange={(v) => updateField("cm_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.cm_storageAddress} onChange={(v) => updateField("cm_storageAddress", v)} />
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ว่าจ้างผลิต"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ว่าจ้างผลิต" value={form.cm_clientName} onChange={(v) => updateField("cm_clientName", v)} placeholder="เช่น บริษัท อินเนสซี่ ออริจินัล จำกัด" />
              <Field label="ที่ตั้งสถานที่ประกอบธุรกิจ" value={form.cm_clientAddress} onChange={(v) => updateField("cm_clientAddress", v)} />
            </div>
          </div>
          <Field label="เลขที่ใบรับจดแจ้ง Bulk (กรณีแบ่งบรรจุ)" value={form.cm_bulkRegNo} onChange={(v) => updateField("cm_bulkRegNo", v)} />
          <Field label="เลขที่ใบรับจดแจ้ง (กรณีรวมบรรจุ)" value={form.cm_combinedRegNos} onChange={(v) => updateField("cm_combinedRegNos", v)} />
        </div>
      )}

      {form.businessType === "import_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้นำเข้า" value={form.imp_importerName} onChange={(v) => updateField("imp_importerName", v)} />
          <Field label="ที่ตั้งสถานที่นำเข้า" value={form.imp_importerAddress} onChange={(v) => updateField("imp_importerAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.imp_storageAddress} onChange={(v) => updateField("imp_storageAddress", v)} />
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ผลิตต่างประเทศ"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ผลิตต่างประเทศ" value={form.imp_foreignManufacturer} onChange={(v) => updateField("imp_foreignManufacturer", v)} />
              <Field label="ที่ตั้งสถานที่ผลิต" value={form.imp_foreignFactory} onChange={(v) => updateField("imp_foreignFactory", v)} />
              <Field label="ประเทศผู้ผลิต" value={form.imp_country} onChange={(v) => updateField("imp_country", v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">
        {"ข้อ ๑๐ รายการสารที่ใช้เป็นส่วนผสมในเครื่องสำอาง (INCI Name)"}
      </p>

      {/* Ingredient table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_1fr_36px] gap-0 bg-secondary/60 px-3 py-2">
          <span className="text-[10px] font-bold text-muted-foreground">{"#"}</span>
          <span className="text-[10px] font-bold text-muted-foreground">{"CAS Number"}</span>
          <span className="text-[10px] font-bold text-muted-foreground">{"INCI Name"}</span>
          <span />
        </div>
        <div className="max-h-[340px] overflow-y-auto">
          {form.ingredients.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[40px_1fr_1fr_36px] gap-0 px-3 py-1.5 border-t border-border items-center">
              <span className="text-[11px] font-bold text-muted-foreground">{row.no}</span>
              <Input
                className="h-7 text-[11px] rounded-md border-transparent bg-transparent hover:bg-secondary focus:bg-card"
                placeholder="e.g. 7732-18-5"
                value={row.casNumber}
                onChange={(e) => updateIngredient(idx, "casNumber", e.target.value)}
              />
              <Input
                className="h-7 text-[11px] rounded-md border-transparent bg-transparent hover:bg-secondary focus:bg-card"
                placeholder="e.g. AQUA"
                value={row.inciName}
                onChange={(e) => updateIngredient(idx, "inciName", e.target.value)}
              />
              <button type="button" onClick={() => removeIngredient(idx)} className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" className="gap-1 text-[11px] text-primary w-full" onClick={addIngredient}>
            <Plus className="h-3 w-3" />
            {"เพิ่มสารส่วนผสม"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] font-semibold text-muted-foreground">{"รายละเอียดเพิ่มเติม"}</Label>
        <Textarea className="text-xs" rows={2} placeholder="หมายเหตุเกี่ยวกับส่วนผสม..." value={form.ingredientNotes} onChange={(e) => updateField("ingredientNotes", e.target.value)} />
      </div>
    </div>
  )

  const renderStep5 = () => {
    const fullName = [form.tradeNameTh, form.productNameTh].filter(Boolean).join(" ")
    const fullNameEn = [form.tradeNameEn, form.productNameEn].filter(Boolean).join(" ")
    const filledIngredients = form.ingredients.filter((r) => r.inciName.trim())

    return (
      <div className="flex flex-col gap-4">
        <p className="text-[11px] text-muted-foreground font-medium">{"ตรวจสอบข้อมูลก่อนสร้างทะเบียน"}</p>

        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <ReviewRow label="ประเภท" value={form.regType === "jk" ? "แบบ จ.ค.๑ (JK)" : "แบบ จ.ร.๑ (JR)"} />
          <ReviewRow label="ชื่อผลิตภัณฑ์ (ไทย)" value={fullName || "-"} />
          <ReviewRow label="ชื่อผลิตภัณฑ์ (EN)" value={fullNameEn || "-"} />
          <ReviewRow label="บริเวณที่ใช้" value={form.applicationArea || "-"} />
          <ReviewRow label="วัตถุประสงค์" value={form.productPurpose || "-"} />
          <ReviewRow label="ลักษณะทางกายภาพ" value={form.physicalForm || "-"} />
          <ReviewRow label="ภาชนะบรรจุ" value={form.containerType || "-"} />
          <ReviewRow label="รูปแบบ" value={form.productFormat ? {
            single: "ผลิตภัณฑ์เดี่ยว",
            single_color_scent: "ผลิตภัณฑ์เดี่ยว (ต่างสี/กลิ่น)",
            multi_combined: "หลายรายการรวมบรรจุ",
            set: "ชุดผลิตภัณฑ์",
          }[form.productFormat] || "-" : "-"} />
          <ReviewRow label="ผู้ประกอบการ" value={{
            manufacture_sell: "ผลิตเพื่อขาย",
            contract_manufacture: `รับจ้างผลิต - ${form.cm_contractorName || "-"}`,
            import_sell: `นำเข้าเพื่อขาย - ${form.imp_importerName || "-"}`,
          }[form.businessType]} />
          {form.businessType === "contract_manufacture" && (
            <ReviewRow label="ผู้ว่าจ้าง" value={form.cm_clientName || "-"} />
          )}
          <ReviewRow label="จำนวนส่วนผสม" value={`${filledIngredients.length} รายการ`} />
        </div>

        {filledIngredients.length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[32px_100px_1fr] gap-0 bg-secondary/60 px-3 py-1.5">
              <span className="text-[10px] font-bold text-muted-foreground">{"#"}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{"CAS"}</span>
              <span className="text-[10px] font-bold text-muted-foreground">{"INCI Name"}</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filledIngredients.map((r, i) => (
                <div key={i} className="grid grid-cols-[32px_100px_1fr] gap-0 px-3 py-1 border-t border-border">
                  <span className="text-[11px] text-muted-foreground">{r.no}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{r.casNumber || "-"}</span>
                  <span className="text-[11px] font-medium">{r.inciName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <Label className="text-[10px] font-semibold text-muted-foreground">{"หมายเหตุ"}</Label>
          <Textarea className="text-xs" rows={2} placeholder="หมายเหตุภายใน..." value={form.notes} onChange={(e) => updateField("notes", e.target.value)} />
        </div>
      </div>
    )
  }

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-extrabold">
            {initialData && Object.keys(initialData).length > 2 ? "Import PDF - ตรวจสอบข้อมูล" : "สร้างทะเบียนใหม่"}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            {"แบบ จ.ค.๑ / จ.ร.๑ - คำขอจดแจ้งเครื่องสำอาง"}
          </p>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-secondary/30 shrink-0 overflow-x-auto">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground shadow-sm" :
                  done ? "bg-[#10b981]/10 text-[#10b981]" :
                  "text-muted-foreground hover:bg-secondary"
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
                {done && <Check className="h-3 w-3" />}
                {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 ml-0.5 text-border" />}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {stepRenderers[step]()}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-border shrink-0 flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button variant="ghost" size="sm" className="gap-1 text-[11px]" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
                {"ย้อนกลับ"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[11px]" onClick={() => handleOpenChange(false)}>
              {"ยกเลิก"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="sm" className="gap-1 text-[11px]" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                {"ถัดไป"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" className="gap-1 bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold" onClick={handleCreate}>
                <Check className="h-3.5 w-3.5" />
                {"สร้างทะเบียน (Draft)"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──── Helper Components ────

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-[10px] font-semibold text-muted-foreground">{label}</Label>
      <Input className="text-sm" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{label}</span>
      <span className="text-[12px] font-medium text-foreground">{value}</span>
    </div>
  )
}
