"use client"

import { useState, useCallback } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Check, ChevronRight, ChevronLeft,
  Building2, FileCheck, Users, ClipboardList,
} from "lucide-react"

// ──── JR Form Data (ใบรับจดแจ้ง) ────
export interface JrFormData {
  // ข้อมูลใบรับจดแจ้ง
  regNumber: string           // เลขที่ใบรับจดแจ้ง
  issueDate: string           // วันที่ออก
  expiryDate: string          // วันหมดอายุ
  issuedBy: string            // ออกโดย (สำนักงาน)
  // ชื่อผลิตภัณฑ์
  productNameTh: string
  productNameEn: string
  productNameSuffix: string   // ชื่อเครื่องสำอางแนบท้าย
  // ประเภท
  cosmeticType: string        // ประเภทของเครื่องสำอาง (combined string)
  // ลักษณะทางกายภาพ
  physicalForm: string
  containerType: string
  // รูปแบบ
  productFormat: string
  // ผู้ประกอบการ
  businessType: "manufacture_sell" | "contract_manufacture" | "import_sell"
  // ผลิตเพื่อขาย
  ms_manufacturerName: string
  ms_factoryAddress: string
  ms_storageAddress: string
  // รับจ้างผลิต
  cm_contractorName: string
  cm_factoryAddress: string
  cm_storageAddress: string
  cm_clientName: string
  cm_clientAddress: string
  // นำเข้า
  imp_importerName: string
  imp_importerAddress: string
  imp_storageAddress: string
  imp_foreignManufacturer: string
  imp_foreignFactory: string
  imp_country: string
  // แบ่ง/รวมบรรจุ
  bulkRegNo: string
  combinedRegNos: string
  // เงื่อนไข
  conditionNotes: string
  // internal
  notes: string
}

const EMPTY_JR: JrFormData = {
  regNumber: "", issueDate: "", expiryDate: "", issuedBy: "",
  productNameTh: "", productNameEn: "", productNameSuffix: "",
  cosmeticType: "",
  physicalForm: "", containerType: "",
  productFormat: "",
  businessType: "contract_manufacture",
  ms_manufacturerName: "", ms_factoryAddress: "", ms_storageAddress: "",
  cm_contractorName: "", cm_factoryAddress: "", cm_storageAddress: "", cm_clientName: "", cm_clientAddress: "",
  imp_importerName: "", imp_importerAddress: "", imp_storageAddress: "", imp_foreignManufacturer: "", imp_foreignFactory: "", imp_country: "",
  bulkRegNo: "", combinedRegNos: "",
  conditionNotes: "", notes: "",
}

const JR_STEPS = [
  { key: "reg", label: "ข้อมูลใบรับจดแจ้ง", icon: FileCheck },
  { key: "product", label: "ข้อมูลผลิตภัณฑ์", icon: ClipboardList },
  { key: "business", label: "ผู้ประกอบการ", icon: Building2 },
  { key: "review", label: "ตรวจสอบ", icon: Check },
] as const

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<JrFormData>
}

export function CreateJrDialog({ open, onOpenChange, initialData }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<JrFormData>(() => ({ ...EMPTY_JR, ...initialData }))

  const handleOpenChange = useCallback((o: boolean) => {
    if (o && initialData) {
      setForm({ ...EMPTY_JR, ...initialData })
      setStep(0)
    }
    if (!o) { setStep(0); setForm({ ...EMPTY_JR }) }
    onOpenChange(o)
  }, [onOpenChange, initialData])

  const u = <K extends keyof JrFormData>(key: K, value: JrFormData[K]) => setForm((p) => ({ ...p, [key]: value }))

  const handleCreate = () => {
    toast.success("FDA Registration (จ.ร.) created as Draft")
    handleOpenChange(false)
  }

  // ──── Step 0: Registration Info ────
  const renderReg = () => (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4">
        <p className="text-base font-extrabold text-amber-800">{"แบบ จ.ร.๑"}</p>
        <p className="text-[12px] text-amber-600 mt-0.5">{"ใบรับจดแจ้งเครื่องสำอาง (Cosmetic Notification Receipt)"}</p>
      </div>

      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-amber-700">{"ข้อมูลใบรับจดแจ้ง"}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="เลขที่ใบรับจดแจ้ง" value={form.regNumber} onChange={(v) => u("regNumber", v)} placeholder="เช่น 12-1-6900002290" />
          <Field label="ออกโดย" value={form.issuedBy} onChange={(v) => u("issuedBy", v)} placeholder="เช่น สำนักงานสาธารณสุขจังหวัดนนทบุรี" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="วันที่ออกใบรับจดแจ้ง" value={form.issueDate} onChange={(v) => u("issueDate", v)} placeholder="เช่น 23 มกราคม 2569" />
          <Field label="ใช้ได้จนถึงวันที่" value={form.expiryDate} onChange={(v) => u("expiryDate", v)} placeholder="เช่น 22 มกราคม 2572" />
        </div>
      </div>
    </div>
  )

  // ──── Step 1: Product Info ────
  const renderProduct = () => (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-amber-700">{"ชื่อการค้าและชื่อเครื่องสำอาง"}</p>
        <Field label="ชื่อการค้าและชื่อเครื่องสำอาง (ไทย)" value={form.productNameTh} onChange={(v) => u("productNameTh", v)} placeholder="ลา รีไฟน์ โคชิ อะมิโน มอยซ์เจอร์ ล็อค แชมพู" />
        <Field label="ชื่อการค้าและชื่อเครื่องสำอาง (อังกฤษ)" value={form.productNameEn} onChange={(v) => u("productNameEn", v)} placeholder="LA REFYNE KOSHI AMINO MOISTURE LOCK SHAMPOO" />
        <Field label="ชื่อเครื่องสำอางแนบท้าย" value={form.productNameSuffix} onChange={(v) => u("productNameSuffix", v)} placeholder="ไม่มี" />
      </div>

      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[11px] font-bold text-amber-700">{"ประเภทและลักษณะ"}</p>
        <Field label="ประเภทของเครื่องสำอาง" value={form.cosmeticType} onChange={(v) => u("cosmeticType", v)} placeholder="แชมพู/เส้นผม/หนังศีรษะ/ล้างออก" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="ลักษณะทางกายภาพ" value={form.physicalForm} onChange={(v) => u("physicalForm", v)} placeholder="ของเหลว (Liquid)" />
          <Field label="ภาชนะบรรจุ" value={form.containerType} onChange={(v) => u("containerType", v)} placeholder="ขวดพลาสติก/ซอง" />
        </div>
        <Field label="รูปแบบของเครื่องสำอาง" value={form.productFormat} onChange={(v) => u("productFormat", v)} placeholder="ผลิตภัณฑ์เดี่ยว" />
      </div>
    </div>
  )

  // ──── Step 2: Business Details ────
  const renderBusiness = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">{"รายละเอียดผู้ประกอบการ"}</p>
      <div className="grid grid-cols-3 gap-2">
        {([
          { v: "manufacture_sell" as const, l: "ผลิตเพื่อขาย", icon: Building2 },
          { v: "contract_manufacture" as const, l: "รับจ้างผลิต", icon: Users },
          { v: "import_sell" as const, l: "นำเข้าเพื่อขาย", icon: ClipboardList },
        ]).map((o) => (
          <button key={o.v} type="button" onClick={() => u("businessType", o.v)} className={cn("rounded-xl border-2 px-3 py-3 text-center transition-all", form.businessType === o.v ? "border-amber-500 bg-amber-50" : "border-border hover:bg-secondary")}>
            <o.icon className={cn("h-5 w-5 mx-auto mb-1", form.businessType === o.v ? "text-amber-600" : "text-muted-foreground")} />
            <p className={cn("text-[11px] font-bold", form.businessType === o.v ? "text-amber-700" : "text-muted-foreground")}>{o.l}</p>
          </button>
        ))}
      </div>

      {form.businessType === "manufacture_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้ผลิต" value={form.ms_manufacturerName} onChange={(v) => u("ms_manufacturerName", v)} />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.ms_factoryAddress} onChange={(v) => u("ms_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.ms_storageAddress} onChange={(v) => u("ms_storageAddress", v)} />
        </div>
      )}

      {form.businessType === "contract_manufacture" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้รับจ้างผลิต" value={form.cm_contractorName} onChange={(v) => u("cm_contractorName", v)} placeholder="บริษัท คอสเม่เซน จำกัด" />
          <Field label="ที่ตั้งสถานที่ผลิต" value={form.cm_factoryAddress} onChange={(v) => u("cm_factoryAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.cm_storageAddress} onChange={(v) => u("cm_storageAddress", v)} />
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ว่าจ้างผลิต"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ว่าจ้างผลิต" value={form.cm_clientName} onChange={(v) => u("cm_clientName", v)} placeholder="บริษัท อินเนสซี่ ออริจินัล จำกัด" />
              <Field label="ที่ตั้งสถานที่ประกอบธุรกิจ" value={form.cm_clientAddress} onChange={(v) => u("cm_clientAddress", v)} />
            </div>
          </div>
        </div>
      )}

      {form.businessType === "import_sell" && (
        <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
          <Field label="ชื่อผู้นำเข้า" value={form.imp_importerName} onChange={(v) => u("imp_importerName", v)} />
          <Field label="ที่ตั้งสถานที่นำเข้า" value={form.imp_importerAddress} onChange={(v) => u("imp_importerAddress", v)} />
          <Field label="ที่ตั้งสถานที่เก็บ" value={form.imp_storageAddress} onChange={(v) => u("imp_storageAddress", v)} />
          <div className="border-t border-border pt-3 mt-1">
            <p className="text-[10px] font-bold text-muted-foreground mb-2">{"ผู้ผลิตต่างประเทศ"}</p>
            <div className="flex flex-col gap-3">
              <Field label="ชื่อผู้ผลิตต่างประเทศ" value={form.imp_foreignManufacturer} onChange={(v) => u("imp_foreignManufacturer", v)} />
              <Field label="ที่ตั้งสถานที่ผลิต" value={form.imp_foreignFactory} onChange={(v) => u("imp_foreignFactory", v)} />
              <Field label="ประเทศผู้ผลิต" value={form.imp_country} onChange={(v) => u("imp_country", v)} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-3">
        <p className="text-[10px] font-bold text-muted-foreground">{"กรณีแบ่ง/รวมบรรจุ"}</p>
        <Field label="เลขที่ใบรับจดแจ้งของเครื่องสำอาง (Bulk) ที่นำมาแบ่งบรรจุ" value={form.bulkRegNo} onChange={(v) => u("bulkRegNo", v)} placeholder="-" />
        <Field label="เลขที่ใบรับจดแจ้งของเครื่องสำอางทุกรายการที่นำมารวมบรรจุ" value={form.combinedRegNos} onChange={(v) => u("combinedRegNos", v)} placeholder="-" />
      </div>
    </div>
  )

  // ──── Step 3: Review ────
  const renderReview = () => (
    <div className="flex flex-col gap-4">
      <p className="text-[11px] text-muted-foreground font-medium">{"ตรวจสอบข้อมูลใบรับจดแจ้ง"}</p>

      {/* Registration card - mimics the real receipt look */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-extrabold text-amber-800">{"แบบ จ.ร.๑"}</p>
            <p className="text-[11px] text-amber-600">{"ใบรับจดแจ้งเครื่องสำอาง"}</p>
          </div>
          {form.regNumber && <div className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5"><p className="text-[10px] text-amber-600 font-medium">{"เลขที่"}</p><p className="text-sm font-extrabold text-amber-800">{form.regNumber}</p></div>}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <RR label="วันที่ออก" value={form.issueDate || "-"} />
          <RR label="หมดอายุ" value={form.expiryDate || "-"} />
          <RR label="ออกโดย" value={form.issuedBy || "-"} />
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2.5">
        <RR label="ชื่อ (ไทย)" value={form.productNameTh || "-"} />
        <RR label="ชื่อ (EN)" value={form.productNameEn || "-"} />
        <RR label="ชื่อแนบท้าย" value={form.productNameSuffix || "ไม่มี"} />
        <RR label="ประเภท" value={form.cosmeticType || "-"} />
        <RR label="ลักษณะทางกายภาพ" value={form.physicalForm || "-"} />
        <RR label="ภาชนะบรรจุ" value={form.containerType || "-"} />
        <RR label="รูปแบบ" value={form.productFormat || "-"} />
        <RR label="ผู้ประกอบการ" value={{
          manufacture_sell: `ผลิตเพื่อขาย - ${form.ms_manufacturerName || "-"}`,
          contract_manufacture: `รับจ้างผลิต - ${form.cm_contractorName || "-"}`,
          import_sell: `นำเข้า - ${form.imp_importerName || "-"}`,
        }[form.businessType]} />
        {form.businessType === "contract_manufacture" && <>
          <RR label="ที่ตั้งสถานที่ผลิต" value={form.cm_factoryAddress || "-"} />
          <RR label="ผู้ว่าจ้าง" value={form.cm_clientName || "-"} />
          <RR label="ที่ตั้ง (ผู้ว่าจ้าง)" value={form.cm_clientAddress || "-"} />
        </>}
      </div>

      {/* Conditions from the receipt */}
      <div className="rounded-xl border border-border p-4 bg-card flex flex-col gap-2">
        <p className="text-[10px] font-bold text-muted-foreground">{"เงื่อนไขใบรับจดแจ้ง"}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{"๑. สำนักงานคณะกรรมการอาหารและยามีสิทธิ์ที่จะเพิกถอนใบรับจดแจ้งนี้ เมื่อปรากฏว่ามีการกระทำอันฝ่าฝืนพระราชบัญญัติเครื่องสำอาง พ.ศ.๒๕๕๘"}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{"๒. สำนักงานคณะกรรมการอาหารและยามีสิทธิ์ที่จะเพิกถอนใบจดแจ้งนี้ เมื่อปรากฏว่ามีการฝ่าฝืนพระราชบัญญัติวิธีปฏิบัติราชการทางปกครอง พ.ศ.๒๕๓๙"}</p>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{"๓. ใบรับจดแจ้งเครื่องสำอางออกให้เพื่อแสดงว่าผลิตภัณฑ์นี้ได้จดแจ้งแล้ว มิใช่เป็นการรับรองคุณภาพมาตรฐานของผลิตภัณฑ์"}</p>
      </div>

      <Field label="หมายเหตุภายใน" value={form.notes} onChange={(v) => u("notes", v)} placeholder="หมายเหตุ..." />
    </div>
  )

  const renderers = [renderReg, renderProduct, renderBusiness, renderReview]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100"><FileCheck className="h-4 w-4 text-amber-600" /></div>
            {"แบบ จ.ร.๑ - ใบรับจดแจ้งเครื่องสำอาง"}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">{"Cosmetic Notification Receipt"}</p>
        </DialogHeader>

        <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-amber-50/30 shrink-0 overflow-x-auto">
          {JR_STEPS.map((s, i) => {
            const done = i < step; const active = i === step
            return (
              <button key={s.key} type="button" onClick={() => i <= step && setStep(i)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap", active ? "bg-amber-600 text-white shadow-sm" : done ? "bg-amber-100 text-amber-700" : "text-muted-foreground hover:bg-secondary")}>
                <s.icon className="h-3.5 w-3.5" />{s.label}{done && <Check className="h-3 w-3" />}{i < JR_STEPS.length - 1 && <ChevronRight className="h-3 w-3 ml-0.5 text-amber-300" />}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{renderers[step]()}</div>

        <DialogFooter className="px-6 py-3 border-t border-border shrink-0 flex items-center justify-between">
          <div>{step > 0 && <Button variant="ghost" size="sm" className="gap-1 text-[11px]" onClick={() => setStep(step - 1)}><ChevronLeft className="h-3.5 w-3.5" />{"ย้อนกลับ"}</Button>}</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[11px]" onClick={() => handleOpenChange(false)}>{"ยกเลิก"}</Button>
            {step < JR_STEPS.length - 1 ? (
              <Button size="sm" className="gap-1 text-[11px] bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setStep(step + 1)}><ChevronRight className="h-3.5 w-3.5" />{"ถัดไป"}</Button>
            ) : (
              <Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold" onClick={handleCreate}><Check className="h-3.5 w-3.5" />{"บันทึกใบรับจดแจ้ง (Draft)"}</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ──── Helpers ────
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (<div className="flex flex-col gap-1"><Label className="text-[10px] font-semibold text-muted-foreground">{label}</Label><Input className="text-sm" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>)
}
function RR({ label, value }: { label: string; value: string }) {
  return (<div className="flex items-start gap-3"><span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{label}</span><span className="text-[12px] font-medium text-foreground">{value}</span></div>)
}
