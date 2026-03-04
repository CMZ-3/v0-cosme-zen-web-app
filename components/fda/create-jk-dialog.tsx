"use client"

import { useState, useCallback } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Check, ChevronRight, ChevronLeft, Plus, Trash2,
  Building2, FlaskConical, ClipboardList, PackageOpen, FileText, Users, ShieldCheck,
} from "lucide-react"

// ──── Shared types ────
export interface FdaIngredientRow { no: number; casNumber: string; inciName: string }

export interface JkFormData {
  // header
  recordDate: string
  recordNo: string
  // purpose
  purpose: "domestic" | "export_only" | "export_buyer_spec"
  // ๑. product names
  tradeNameTh: string
  tradeNameEn: string
  productNameTh: string
  productNameEn: string
  productNameSuffix: string
  // ๒. usage format
  usageFormat: "rinse_off" | "leave_on" | ""
  // ๓. cosmetic type
  applicationArea: string
  productPurpose: string
  // ๔. instructions
  usageInstructions: string
  // ๕. physical form
  physicalForm: string
  physicalFormOther: string
  // ๖. container
  containerType: string
  containerOther: string
  // ๗. conditions
  conditions: string[]
  conditionMixRatio: string
  conditionOther: string
  // ๘. product format
  productFormat: "single" | "single_color_scent" | "multi_combined" | "set" | ""
  // ๙. business details
  businessType: "manufacture_sell" | "contract_manufacture" | "import_sell"
  ms_manufacturerName: string; ms_officeAddress: string; ms_factoryAddress: string; ms_storageAddress: string; ms_bulkRegNo: string; ms_combinedRegNos: string
  cm_contractorName: string; cm_contractorOffice: string; cm_factoryAddress: string; cm_storageAddress: string; cm_clientName: string; cm_clientAddress: string; cm_bulkRegNo: string; cm_combinedRegNos: string
  imp_importerName: string; imp_importerAddress: string; imp_storageAddress: string; imp_foreignManufacturer: string; imp_foreignFactory: string; imp_country: string
  // ๑๐. ingredients
  ingredients: FdaIngredientRow[]
  ingredientNotes: string
  // internal
  notes: string
}

const EMPTY_JK: JkFormData = {
  recordDate: "", recordNo: "",
  purpose: "domestic",
  tradeNameTh: "", tradeNameEn: "", productNameTh: "", productNameEn: "", productNameSuffix: "",
  usageFormat: "",
  applicationArea: "", productPurpose: "",
  usageInstructions: "",
  physicalForm: "", physicalFormOther: "",
  containerType: "", containerOther: "",
  conditions: [], conditionMixRatio: "", conditionOther: "",
  productFormat: "",
  businessType: "contract_manufacture",
  ms_manufacturerName: "", ms_officeAddress: "", ms_factoryAddress: "", ms_storageAddress: "", ms_bulkRegNo: "", ms_combinedRegNos: "",
  cm_contractorName: "", cm_contractorOffice: "", cm_factoryAddress: "", cm_storageAddress: "", cm_clientName: "", cm_clientAddress: "", cm_bulkRegNo: "", cm_combinedRegNos: "",
  imp_importerName: "", imp_importerAddress: "", imp_storageAddress: "", imp_foreignManufacturer: "", imp_foreignFactory: "", imp_country: "",
  ingredients: [{ no: 1, casNumber: "", inciName: "" }],
  ingredientNotes: "", notes: "",
}

const JK_STEPS = [
  { key: "purpose", label: "วัตถุประสงค์", icon: FileText },
  { key: "product", label: "ข้อ ๑-๔", icon: FlaskConical },
  { key: "physical", label: "ข้อ ๕-๘", icon: PackageOpen },
  { key: "business", label: "ข้อ ๙", icon: Building2 },
  { key: "ingredients", label: "ข้อ ๑๐", icon: ClipboardList },
  { key: "declare", label: "การรับรอง", icon: ShieldCheck },
  { key: "review", label: "ตรวจสอบ", icon: Check },
] as const

const APPLICATION_AREAS = ["ผิวหนัง/ร่างกาย", "ใบหน้า", "เส้นผม/หนังศีรษะ", "ริมฝีปาก", "ตา/รอบดวงตา", "เล็บ", "ช่องปาก/ฟัน", "อวัยวะเพศภายนอก"]
const PRODUCT_PURPOSES = ["แชมพู", "ครีมนวดผม", "บำรุงผิว", "ทำความสะอาดผิว", "กันแดด", "ระงับกลิ่นกาย", "น้ำหอม", "แต่งสีผิว/ปกปิด", "ย้อมสีผม", "ดัดผม/ยืดผม", "ผลิตภัณฑ์เด็ก", "ระงับเหงื่อ", "อื่นๆ"]
const PHYSICAL_FORMS = ["ของเหลว (Liquid)", "ครีม (Cream)", "เจล (Gel)", "ผง (Powder)", "แท่ง (Stick)", "สเปรย์ (Spray)", "โฟม (Foam)", "อิมัลชั่น (Emulsion)", "เพสต์ (Paste)", "แผ่น (Sheet/Patch)", "อื่นๆ"]
const CONTAINER_TYPES = ["ขวดแก้ว", "ขวดพลาสติก/ขวดอะคริลิค", "หลอดพลาสติก", "กระปุก", "ซอง", "กระป๋อง/สเปรย์อัดแก๊ส", "กระบอกฉีดยา (Syringe) / แอมพูล (Ampoule) / ไวอัล (Vial)", "อื่นๆ"]
const CONDITIONS = [
  { key: "child_3", label: "ห้ามใช้ในเด็กอายุต่ำกว่า 3 ปี" },
  { key: "child_10", label: "ห้ามใช้ในเด็กอายุต่ำกว่า 10 ปี" },
  { key: "no_spray", label: "ผลิตภัณฑ์นี้ไม่ใช่ผลิตภัณฑ์รูปแบบฉีดพ่นหรือสเปรย์ (Spray)" },
  { key: "no_aerosol", label: "ผลิตภัณฑ์นี้ไม่ใช่ผลิตภัณฑ์รูปแบบสเปรย์อัดแก๊ส (Aerosol Spray)" },
  { key: "mix_required", label: "ต้องมีการผสมผลิตภัณฑ์อื่นก่อนใช้" },
  { key: "other", label: "อื่นๆ" },
]
const SELF_DECLARE_ITEMS = [
  "ข้าพเจ้าขอรับรองว่าผลิตภัณฑ์ที่ยื่นจดแจ้งเป็นเครื่องสำอางในมาตรา ๔ ตาม พรบ.เครื่องสำอาง พ.ศ.๒๕๕๘",
  "ข้าพเจ้ารับทราบว่า ต้องยื่นคำขอวินิจฉัยประเภทผลิตภัณฑ์ก่อนยื่นคำขอจดแจ้งเครื่องสำอาง ในกรณีที่ไม่แน่ใจว่าผลิตภัณฑ์นั้นเข้าข่ายเป็นเครื่องสำอางหรือไม่",
  "ข้าพเจ้าขอรับรองว่าชื่อการค้าและชื่อเครื่องสำอางสอดคล้องกับสูตรส่วนประกอบที่ใช้เป็นส่วนผสมในการผลิตเครื่องสำอาง",
  "ข้าพเจ้ารับทราบและยอมรับเงื่อนไขว่าหากพนักเจ้าหน้าที่ตรวจสอบแล้วพบว่าการยื่นจดแจ้งไม่เป็นไปตามที่ข้าพเจ้าให้การรับรอง จะถือว่าผลิต/นำเข้าผลิตภัณฑ์ไม่ตรงตามที่จดแจ้ง",
  "ข้าพเจ้ารับทราบว่า ต้องเข้ามาติดตามผลการตรวจสอบภายหลัง (Post-Audit) การอนุมัติแบบ Auto E-permission",
  "ข้าพเจ้าขอรับรองว่าจะไม่บรรยายสรรพคุณของผลิตภัณฑ์นี้ไปในทางฆ่าเชื้อโรค",
]
const CERT_ITEMS = [
  "รายละเอียดของเครื่องสำอางที่จดแจ้งนี้เป็นไปตามกฎกระทรวง ระเบียบ หรือประกาศที่ออกตามพระราชบัญญัติเครื่องสำอาง พ.ศ.๒๕๕๘",
  "จะแจ้งพนักงานเจ้าหน้าที่เมื่อมีการเปลี่ยนแปลงรายละเอียดตามที่ได้จดแจ้งไว้",
  "เมื่อมีคำสั่งจากภาครัฐให้เรียกเก็บเครื่องสำอางคืนจากตลาด จะดำเนินการเรียกเก็บทันที",
  "รายละเอียดที่ได้แจ้งในคำขอจดแจ้งเครื่องสำอางนี้เป็นความจริงทุกประการ",
  "จะรับผิดชอบในการตรวจสอบเอกสารหลักฐานให้ครบถ้วนถูกต้อง",
  "จะปฏิบัติตามกฎหมายต่างๆที่เกี่ยวข้อง",
  "จะไม่ใช้ชื่อการค้าหรือชื่อเครื่องสำอางในทำนองโอ้อวด ไม่สุภาพ หรือทำให้เข้าใจผิดจากความจริง",
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<JkFormData>
}

export function CreateJkDialog({ open, onOpenChange, initialData }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<JkFormData>(() => ({ ...EMPTY_JK, ...initialData }))
  const [selfDeclareChecked, setSelfDeclareChecked] = useState<boolean[]>(SELF_DECLARE_ITEMS.map(() => false))
  const [certChecked, setCertChecked] = useState<boolean[]>(CERT_ITEMS.map(() => false))

  const handleOpenChange = useCallback((o: boolean) => {
    if (o && initialData) {
      setForm({ ...EMPTY_JK, ...initialData })
      setStep(initialData.ingredients && initialData.ingredients.length > 1 ? 6 : 0)
    }
    if (!o) { setStep(0); setForm({ ...EMPTY_JK }); setSelfDeclareChecked(SELF_DECLARE_ITEMS.map(() => false)); setCertChecked(CERT_ITEMS.map(() => false)) }
    onOpenChange(o)
  }, [onOpenChange, initialData])

  const u = <K extends keyof JkFormData>(key: K, value: JkFormData[K]) => setForm((p) => ({ ...p, [key]: value }))

  const addIngredient = () => setForm((p) => ({ ...p, ingredients: [...p.ingredients, { no: p.ingredients.length + 1, casNumber: "", inciName: "" }] }))
  const removeIngredient = (idx: number) => setForm((p) => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx).map((r, i) => ({ ...r, no: i + 1 })) }))
  const updateIngredient = (idx: number, field: keyof FdaIngredientRow, value: string) => setForm((p) => ({ ...p, ingredients: p.ingredients.map((r, i) => (i === idx ? { ...r, [field]: field === "no" ? Number(value) : value } : r)) }))

  const handleCreate = () => {
    toast.success("FDA Registration (จ.ค.) created as Draft")
    handleOpenChange(false)
  }

  // ──── Step 0: Purpose ────
  const renderPurpose = () => (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-5 py-4">
        <p className="text-base font-extrabold text-blue-800">{"แบบ จ.ค.๑"}</p>
        <p className="text-[12px] text-blue-600 mt-0.5">{"คำขอจดแจ้งเครื่องสำอาง (Cosmetic Notification Application)"}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-bold text-foreground">{"จดแจ้งเพื่อ (เลือก)"}</Label>
        {([
          { value: "domestic" as const, label: "จดแจ้งเพื่อขายในประเทศไทย หรือส่งออก (ตามมาตรฐานของประเทศไทย)" },
          { value: "export_only" as const, label: "จดแจ้งเฉพาะเพื่อการส่งออกเท่านั้น" },
          { value: "export_buyer_spec" as const, label: "จดแจ้งเฉพาะเพื่อการส่งออก โดยมีคุณภาพ มาตรฐาน ฉลากหรือรายละเอียดอื่นๆ ตามที่ผู้สั่งซื้อกำหนด (มาตรา ๓๕)" },
        ]).map((opt) => (
          <label key={opt.value} className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all", form.purpose === opt.value ? "border-blue-500 bg-blue-50/50" : "border-border hover:bg-secondary")}>
            <input type="radio" name="purpose" checked={form.purpose === opt.value} onChange={() => u("purpose", opt.value)} className="mt-0.5 accent-blue-600" />
            <span className="text-[12px] leading-relaxed">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  // ──── Step 1: sections ๑-๔ ────
  const renderProduct = () => (
    <div className="flex flex-col gap-4">
      <Section num="๑" title="ชื่อการค้าและชื่อเครื่องสำอาง">
        <p className="text-[10px] text-muted-foreground mb-2">{"๑.๑ ชื่อการค้าภาษาไทยและภาษาอังกฤษ"}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ชื่อการค้า (ไทย)" value={form.tradeNameTh} onChange={(v) => u("tradeNameTh", v)} placeholder="เช่น ลา รีไฟน์" />
          <Field label="ชื่อการค้า (EN)" value={form.tradeNameEn} onChange={(v) => u("tradeNameEn", v)} placeholder="e.g. LA REFYNE" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 mb-2">{"๑.๒ ชื่อเครื่องสำอางภาษาไทยและภาษาอังกฤษ"}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ชื่อเครื่องสำอาง (ไทย) *" value={form.productNameTh} onChange={(v) => u("productNameTh", v)} placeholder="โคชิ อะมิโน มอยซ์เจอร์ ล็อค แชมพู" />
          <Field label="ชื่อเครื่องสำอาง (EN)" value={form.productNameEn} onChange={(v) => u("productNameEn", v)} placeholder="KOSHI AMINO MOISTURE LOCK SHAMPOO" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 mb-1">{"๑.๓ ชื่อเครื่องสำอางแนบท้าย (กรณีผลิตภัณฑ์เดี่ยว แต่ต่างกันที่สี/กลิ่น)"}</p>
        <Input className="text-sm" placeholder="ระบุชื่อเครื่องสำอางแนบท้าย (ถ้ามี)" value={form.productNameSuffix} onChange={(e) => u("productNameSuffix", e.target.value)} />
      </Section>

      <Section num="๒" title="รูปแบบการใช้เครื่องสำอาง">
        <div className="flex gap-3">
          {([{ v: "rinse_off" as const, l: "ใช้แล้วล้างออก" }, { v: "leave_on" as const, l: "ใช้แล้วไม่ต้องล้างออก" }]).map((o) => (
            <label key={o.v} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer text-[12px] font-medium transition-all", form.usageFormat === o.v ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-border text-muted-foreground hover:bg-secondary")}>
              <input type="radio" name="usageFormat" checked={form.usageFormat === o.v} onChange={() => u("usageFormat", o.v)} className="accent-blue-600" />
              {o.l}
            </label>
          ))}
        </div>
      </Section>

      <Section num="๓" title="ประเภทของเครื่องสำอาง">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">{"๓.๑ บริเวณที่ใช้ผลิตภัณฑ์"}</p>
        <div className="flex flex-wrap gap-1.5">
          {APPLICATION_AREAS.map((a) => <Chip key={a} label={a} active={form.applicationArea === a} onClick={() => u("applicationArea", a)} />)}
        </div>
        <p className="text-[10px] font-semibold text-muted-foreground mt-3 mb-1.5">{"๓.๒ วัตถุประสงค์ในการใช้ผลิตภัณฑ์"}</p>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_PURPOSES.map((p) => <Chip key={p} label={p} active={form.productPurpose === p} onClick={() => u("productPurpose", p)} />)}
        </div>
      </Section>

      <Section num="๔" title="วิธีใช้">
        <Textarea className="text-sm" rows={2} placeholder="เช่น ใช้ทำความสะอาดเส้นผมและหนังศีรษะ แล้วล้างออกด้วยน้ำสะอาด" value={form.usageInstructions} onChange={(e) => u("usageInstructions", e.target.value)} />
      </Section>
    </div>
  )

  // ──── Step 2: sections ๕-๘ ────
  const renderPhysical = () => (
    <div className="flex flex-col gap-4">
      <Section num="๕" title="ลักษณะทางกายภาพของเครื่องสำอาง">
        <div className="flex flex-wrap gap-1.5">
          {PHYSICAL_FORMS.map((f) => <Chip key={f} label={f} active={form.physicalForm === f} onClick={() => u("physicalForm", f)} />)}
        </div>
        {form.physicalForm === "อื่นๆ" && <Input className="mt-2 text-xs" placeholder="ระบุลักษณะทางกายภาพ" value={form.physicalFormOther} onChange={(e) => u("physicalFormOther", e.target.value)} />}
      </Section>

      <Section num="๖" title="ลักษณะทางกายภาพของภาชนะบรรจุ">
        <div className="flex flex-wrap gap-1.5">
          {CONTAINER_TYPES.map((c) => <Chip key={c} label={c} active={form.containerType === c} onClick={() => u("containerType", c)} />)}
        </div>
        {form.containerType === "อื่นๆ" && <Input className="mt-2 text-xs" placeholder="ระบุภาชนะบรรจุ" value={form.containerOther} onChange={(e) => u("containerOther", e.target.value)} />}
      </Section>

      <Section num="๗" title="เงื่อนไขของการใช้เครื่องสำอาง (ถ้ามี)">
        <div className="flex flex-col gap-2">
          {CONDITIONS.map((c) => (
            <label key={c.key} className="flex items-start gap-2 cursor-pointer">
              <Checkbox checked={form.conditions.includes(c.key)} onCheckedChange={(ck) => u("conditions", ck ? [...form.conditions, c.key] : form.conditions.filter((k) => k !== c.key))} className="mt-0.5" />
              <span className="text-[11px] leading-relaxed">{c.label}</span>
            </label>
          ))}
          {form.conditions.includes("mix_required") && <div className="ml-6 flex items-center gap-2"><span className="text-[10px] text-muted-foreground whitespace-nowrap">{"อัตราส่วน 1 :"}</span><Input className="w-20 text-xs h-7" value={form.conditionMixRatio} onChange={(e) => u("conditionMixRatio", e.target.value)} /></div>}
          {form.conditions.includes("other") && <Input className="ml-6 text-xs" placeholder="ระบุเงื่อนไขอื่น" value={form.conditionOther} onChange={(e) => u("conditionOther", e.target.value)} />}
        </div>
      </Section>

      <Section num="๘" title="รูปแบบเครื่องสำอาง">
        <div className="flex flex-col gap-2">
          {([
            { v: "single" as const, l: "ผลิตภัณฑ์เดี่ยว" },
            { v: "single_color_scent" as const, l: "ผลิตภัณฑ์เดี่ยวชนิดเดียวกันที่มีส่วนประกอบและการใช้เหมือนกัน แต่แตกต่างกันที่สีหรือกลิ่น" },
            { v: "multi_combined" as const, l: "ผลิตภัณฑ์หลายรายการที่รวมบรรจุในบรรจุภัณฑ์เดียวกัน ไม่สามารถแยกจำหน่ายได้" },
            { v: "set" as const, l: "ผลิตภัณฑ์เดี่ยวที่ได้รับการจดแจ้งแล้ว นำมารวมบรรจุในบรรจุภัณฑ์เดียวกันเป็นชุดผลิตภัณฑ์" },
          ]).map((o) => (
            <label key={o.v} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5 cursor-pointer text-[11px] transition-all", form.productFormat === o.v ? "border-blue-500 bg-blue-50/50" : "border-border hover:bg-secondary")}>
              <input type="radio" name="productFormat" checked={form.productFormat === o.v} onChange={() => u("productFormat", o.v)} className="mt-0.5 accent-blue-600" />
              <span className="leading-relaxed">{o.l}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )

  // ──── Step 3: section ๙ ────
  const renderBusiness = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">{"ข้อ ๙ รายละเอียดของผู้ประกอบการ"}</p>
      <div className="grid grid-cols-3 gap-2">
        {([
          { v: "manufacture_sell" as const, l: "๙.๑ ผลิตเพื่อขาย", icon: Building2 },
          { v: "contract_manufacture" as const, l: "๙.๒ รับจ้างผลิต", icon: Users },
          { v: "import_sell" as const, l: "๙.๓ นำเข้าเพื่อขาย", icon: PackageOpen },
        ]).map((o) => (
          <button key={o.v} type="button" onClick={() => u("businessType", o.v)} className={cn("rounded-xl border-2 px-3 py-3 text-center transition-all", form.businessType === o.v ? "border-blue-500 bg-blue-50" : "border-border hover:bg-secondary")}>
            <o.icon className={cn("h-5 w-5 mx-auto mb-1", form.businessType === o.v ? "text-blue-600" : "text-muted-foreground")} />
            <p className={cn("text-[11px] font-bold", form.businessType === o.v ? "text-blue-700" : "text-muted-foreground")}>{o.l}</p>
          </button>
        ))}
      </div>

      {form.businessType === "manufacture_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้ผลิต" value={form.ms_manufacturerName} onChange={(v) => u("ms_manufacturerName", v)} />
          <Field label="ที่ตั้งสำนักงาน" value={form.ms_officeAddress} onChange={(v) => u("ms_officeAddress", v)} />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.ms_factoryAddress} onChange={(v) => u("ms_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.ms_storageAddress} onChange={(v) => u("ms_storageAddress", v)} />
          <div className="border-t border-border pt-3"><p className="text-[10px] font-bold text-muted-foreground mb-2">{"กรณีแบ่ง/รวมบรรจุ"}</p></div>
          <Field label="เลขที่ใบรับจดแจ้ง Bulk (กรณีแบ่งบรรจุ)" value={form.ms_bulkRegNo} onChange={(v) => u("ms_bulkRegNo", v)} />
          <Field label="เลขที่ใบรับจดแจ้ง (กรณีรวมบรรจุ)" value={form.ms_combinedRegNos} onChange={(v) => u("ms_combinedRegNos", v)} />
        </div>
      )}

      {form.businessType === "contract_manufacture" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้รับจ้างผลิต" value={form.cm_contractorName} onChange={(v) => u("cm_contractorName", v)} placeholder="บริษัท คอสเม่เซน จำกัด" />
          <Field label="ที่ตั้งสำนักงาน (ผู้รับจ้าง)" value={form.cm_contractorOffice} onChange={(v) => u("cm_contractorOffice", v)} />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.cm_factoryAddress} onChange={(v) => u("cm_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.cm_storageAddress} onChange={(v) => u("cm_storageAddress", v)} />
          <div className="border-t border-border pt-3"><p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ว่าจ้างผลิต"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ว่าจ้างผลิต" value={form.cm_clientName} onChange={(v) => u("cm_clientName", v)} placeholder="บริษัท อินเนสซี่ ออริจินัล จำกัด" />
              <Field label="ที่ตั้งสถานที่ประกอบธุรกิจ" value={form.cm_clientAddress} onChange={(v) => u("cm_clientAddress", v)} />
            </div>
          </div>
          <div className="border-t border-border pt-3"><p className="text-[10px] font-bold text-muted-foreground mb-2">{"กรณีแบ่ง/รวมบรรจุ"}</p></div>
          <Field label="เลขที่ใบรับจดแจ้ง Bulk (กรณีแบ่งบรรจุ)" value={form.cm_bulkRegNo} onChange={(v) => u("cm_bulkRegNo", v)} />
          <Field label="เลขที่ใบรับจดแจ้ง (กรณีรวมบรรจุ)" value={form.cm_combinedRegNos} onChange={(v) => u("cm_combinedRegNos", v)} />
        </div>
      )}

      {form.businessType === "import_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้นำเข้า" value={form.imp_importerName} onChange={(v) => u("imp_importerName", v)} />
          <Field label="ที่ตั้งสถานที่นำเข้า" value={form.imp_importerAddress} onChange={(v) => u("imp_importerAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.imp_storageAddress} onChange={(v) => u("imp_storageAddress", v)} />
          <div className="border-t border-border pt-3"><p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ผลิตต่างประเทศ"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ผลิตต่างประเทศ" value={form.imp_foreignManufacturer} onChange={(v) => u("imp_foreignManufacturer", v)} />
              <Field label="ที่ตั้งสถานที่ผลิต" value={form.imp_foreignFactory} onChange={(v) => u("imp_foreignFactory", v)} />
              <Field label="ประเทศผู้ผลิต" value={form.imp_country} onChange={(v) => u("imp_country", v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ──── Step 4: section ๑๐ (Ingredients) ────
  const renderIngredients = () => (
    <div className="flex flex-col gap-4">
      <div className="text-[11px] text-muted-foreground font-medium space-y-1">
        <p>{"ข้อ ๑๐ รายการสารที่ใช้เป็นส่วนผสมในเครื่องสำอาง"}</p>
        <p>{"ระบุเป็น International Nomenclature of Cosmetic Ingredients (INCI) Name"}</p>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_1fr_36px] gap-0 bg-blue-50 px-3 py-2">
          <span className="text-[10px] font-bold text-blue-700">{"#"}</span>
          <span className="text-[10px] font-bold text-blue-700">{"CAS Number"}</span>
          <span className="text-[10px] font-bold text-blue-700">{"INCI Name"}</span>
          <span />
        </div>
        <div className="max-h-[340px] overflow-y-auto">
          {form.ingredients.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[40px_1fr_1fr_36px] gap-0 px-3 py-1.5 border-t border-border items-center">
              <span className="text-[11px] font-bold text-muted-foreground">{row.no}</span>
              <Input className="h-7 text-[11px] rounded-md border-transparent bg-transparent hover:bg-secondary focus:bg-card" placeholder="e.g. 7732-18-5" value={row.casNumber} onChange={(e) => updateIngredient(idx, "casNumber", e.target.value)} />
              <Input className="h-7 text-[11px] rounded-md border-transparent bg-transparent hover:bg-secondary focus:bg-card" placeholder="e.g. AQUA" value={row.inciName} onChange={(e) => updateIngredient(idx, "inciName", e.target.value)} />
              <button type="button" onClick={() => removeIngredient(idx)} className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <div className="p-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" className="gap-1 text-[11px] text-blue-600 w-full" onClick={addIngredient}><Plus className="h-3 w-3" />{"เพิ่มสารส่วนผสม"}</Button>
        </div>
      </div>
      <Field label="รายละเอียดเพิ่มเติม" value={form.ingredientNotes} onChange={(v) => u("ingredientNotes", v)} placeholder="หมายเหตุเกี่ยวกับส่วนผสม..." />
    </div>
  )

  // ──── Step 5: Declaration/Certification ────
  const renderDeclare = () => (
    <div className="flex flex-col gap-5">
      {/* การรับรอง 7 ข้อ */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-blue-700">{"การรับรอง (ข้าพเจ้าขอรับรองว่า)"}</p>
        {CERT_ITEMS.map((item, i) => (
          <label key={i} className="flex items-start gap-2 cursor-pointer">
            <Checkbox checked={certChecked[i]} onCheckedChange={(ck) => { const n = [...certChecked]; n[i] = !!ck; setCertChecked(n) }} className="mt-0.5" />
            <span className="text-[11px] leading-relaxed text-muted-foreground">{"๑." + (i + 1) + " " + item}</span>
          </label>
        ))}
      </div>

      {/* Self-declare 6 ข้อ */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-blue-700">{"การรับรองตนเอง (Self Declare)"}</p>
        {SELF_DECLARE_ITEMS.map((item, i) => (
          <label key={i} className="flex items-start gap-2 cursor-pointer">
            <Checkbox checked={selfDeclareChecked[i]} onCheckedChange={(ck) => { const n = [...selfDeclareChecked]; n[i] = !!ck; setSelfDeclareChecked(n) }} className="mt-0.5" />
            <span className="text-[11px] leading-relaxed text-muted-foreground">{"๑." + (i + 1) + " " + item}</span>
          </label>
        ))}
      </div>
    </div>
  )

  // ──── Step 6: Review ────
  const renderReview = () => {
    const fullName = [form.tradeNameTh, form.productNameTh].filter(Boolean).join(" ")
    const fullNameEn = [form.tradeNameEn, form.productNameEn].filter(Boolean).join(" ")
    const filledIng = form.ingredients.filter((r) => r.inciName.trim())
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[11px] text-muted-foreground font-medium">{"ตรวจสอบข้อมูลก่อนส่งคำขอจดแจ้ง"}</p>
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2.5">
          <RR label="ประเภท" value="แบบ จ.ค.๑ (JK) - คำขอจดแจ้ง" />
          <RR label="ชื่อผลิตภัณฑ์ (ไทย)" value={fullName || "-"} />
          <RR label="ชื่อผลิตภัณฑ์ (EN)" value={fullNameEn || "-"} />
          <RR label="บริเวณที่ใช้" value={form.applicationArea || "-"} />
          <RR label="วัตถุประสงค์" value={form.productPurpose || "-"} />
          <RR label="วิธีใช้" value={form.usageInstructions || "-"} />
          <RR label="ลักษณะทางกายภาพ" value={form.physicalForm || "-"} />
          <RR label="ภาชนะบรรจุ" value={form.containerType || "-"} />
          <RR label="ผู้ประกอบการ" value={{ manufacture_sell: `ผลิตเพื่อขาย - ${form.ms_manufacturerName || "-"}`, contract_manufacture: `รับจ้างผลิต - ${form.cm_contractorName || "-"}`, import_sell: `นำเข้า - ${form.imp_importerName || "-"}` }[form.businessType]} />
          {form.businessType === "contract_manufacture" && <RR label="ผู้ว่าจ้าง" value={form.cm_clientName || "-"} />}
          <RR label="จำนวนส่วนผสม" value={`${filledIng.length} รายการ`} />
        </div>
        {filledIng.length > 0 && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[32px_100px_1fr] gap-0 bg-blue-50 px-3 py-1.5">
              <span className="text-[10px] font-bold text-blue-700">{"#"}</span>
              <span className="text-[10px] font-bold text-blue-700">{"CAS"}</span>
              <span className="text-[10px] font-bold text-blue-700">{"INCI Name"}</span>
            </div>
            <div className="max-h-[200px] overflow-y-auto">{filledIng.map((r, i) => (<div key={i} className="grid grid-cols-[32px_100px_1fr] gap-0 px-3 py-1 border-t border-border"><span className="text-[11px] text-muted-foreground">{r.no}</span><span className="text-[11px] font-mono text-muted-foreground">{r.casNumber || "-"}</span><span className="text-[11px] font-medium">{r.inciName}</span></div>))}</div>
          </div>
        )}
        <Field label="หมายเหตุภายใน" value={form.notes} onChange={(v) => u("notes", v)} placeholder="หมายเหตุ..." />
      </div>
    )
  }

  const renderers = [renderPurpose, renderProduct, renderPhysical, renderBusiness, renderIngredients, renderDeclare, renderReview]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100"><FileText className="h-4 w-4 text-blue-600" /></div>
            {"แบบ จ.ค.๑ - คำขอจดแจ้งเครื่องสำอาง"}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">{"Cosmetic Notification Application Form"}</p>
        </DialogHeader>

        <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-blue-50/30 shrink-0 overflow-x-auto">
          {JK_STEPS.map((s, i) => {
            const done = i < step; const active = i === step
            return (
              <button key={s.key} type="button" onClick={() => i <= step && setStep(i)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap", active ? "bg-blue-600 text-white shadow-sm" : done ? "bg-blue-100 text-blue-700" : "text-muted-foreground hover:bg-secondary")}>
                <s.icon className="h-3.5 w-3.5" />{s.label}{done && <Check className="h-3 w-3" />}{i < JK_STEPS.length - 1 && <ChevronRight className="h-3 w-3 ml-0.5 text-blue-300" />}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{renderers[step]()}</div>

        <DialogFooter className="px-6 py-3 border-t border-border shrink-0 flex items-center justify-between">
          <div>{step > 0 && <Button variant="ghost" size="sm" className="gap-1 text-[11px]" onClick={() => setStep(step - 1)}><ChevronLeft className="h-3.5 w-3.5" />{"ย้อนกลับ"}</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[11px]" onClick={() => handleOpenChange(false)}>{"ยกเลิก"}</Button>
            {step < JK_STEPS.length - 1 ? (
              <Button size="sm" className="gap-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep(step + 1)}><ChevronRight className="h-3.5 w-3.5" />{"ถัดไป"}</Button>
            ) : (
              <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold" onClick={handleCreate}><Check className="h-3.5 w-3.5" />{"ส่งคำขอจดแจ้ง (Draft)"}</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──── Helper Components ────
function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
      <p className="text-[11px] font-bold text-blue-700">{num + ". " + title}</p>
      {children}
    </div>
  )
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (<div className="flex flex-col gap-1"><Label className="text-[10px] font-semibold text-muted-foreground">{label}</Label><Input className="text-sm" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>)
}
function RR({ label, value }: { label: string; value: string }) {
  return (<div className="flex items-start gap-3"><span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{label}</span><span className="text-[12px] font-medium text-foreground">{value}</span></div>)
}
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (<button type="button" onClick={onClick} className={cn("rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all", active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border text-muted-foreground hover:bg-secondary")}>{label}</button>)
}
