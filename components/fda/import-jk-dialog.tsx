"use client"

import { useState, useCallback, useRef } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ChevronRight, Eye,
} from "lucide-react"
import { parseFdaPdfText } from "@/lib/fda-pdf-parser"
import type { JkFormData, FdaIngredientRow } from "@/components/fda/create-jk-dialog"

/* ------------------------------------------------------------------ */
/*  Import JK Dialog  (จ.ค.๑ - คำขอจดแจ้งเครื่องสำอาง)                */
/* ------------------------------------------------------------------ */

interface ImportJkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (data: Partial<JkFormData>) => void
}

type Phase = "upload" | "extracting" | "preview" | "error"
interface Field { key: string; label: string; value: string }

export function ImportJkDialog({ open, onOpenChange, onImportComplete }: ImportJkDialogProps) {
  const [phase, setPhase] = useState<Phase>("upload")
  const [fileName, setFileName] = useState("")
  const [rawText, setRawText] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [mapped, setMapped] = useState<Partial<JkFormData>>({})
  const [showRaw, setShowRaw] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const reset = () => { setPhase("upload"); setFileName(""); setRawText(""); setFields([]); setMapped({}); setShowRaw(false) }
  const close = (o: boolean) => { if (!o) reset(); onOpenChange(o) }

  /* ---- PDF text extraction ---- */
  const extract = useCallback(async (file: File) => {
    const lib = await import("pdfjs-dist")
    lib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.mjs`
    const buf = await file.arrayBuffer()
    const pdf = await lib.getDocument({ data: buf }).promise
    let txt = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i)
      const tc = await pg.getTextContent()
      txt += tc.items.map((it: { str?: string }) => ("str" in it ? it.str : "")).join(" ") + "\n"
    }
    return txt
  }, [])

  /* ---- Process file ---- */
  const process = useCallback(async (file: File) => {
    setFileName(file.name)
    setPhase("extracting")
    try {
      const text = await extract(file)
      setRawText(text)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d: Record<string, any> = parseFdaPdfText(text)

      // Validate this is actually a JK document
      if (d.regType === "jr") {
        toast.error("ไฟล์นี้เป็นเอกสาร จ.ร.๑ (ใบรับจดแจ้ง) กรุณาใช้ Import จ.ร.๑ แทน")
        setPhase("error")
        return
      }

      const s = (k: string) => (d[k] as string) || ""

      // Map parsed data to JkFormData
      const jk: Partial<JkFormData> = {
        purpose: (d.purpose as JkFormData["purpose"]) || "domestic",
        tradeNameTh: s("tradeNameTh"),
        tradeNameEn: s("tradeNameEn"),
        productNameTh: s("productNameTh"),
        productNameEn: s("productNameEn"),
        usageFormat: (d.usageFormat as JkFormData["usageFormat"]) || "",
        applicationArea: s("applicationArea"),
        productPurpose: s("productPurpose"),
        usageInstructions: s("usageInstructions"),
        physicalForm: s("physicalForm"),
        containerType: s("containerType"),
        productFormat: (d.productFormat as JkFormData["productFormat"]) || "",
        businessType: (d.businessType as JkFormData["businessType"]) || "contract_manufacture",
        cm_contractorName: s("cm_contractorName"),
        cm_contractorOffice: s("cm_contractorOffice"),
        cm_factoryAddress: s("cm_factoryAddress"),
        cm_storageAddress: s("cm_storageAddress"),
        cm_clientName: s("cm_clientName"),
        cm_clientAddress: s("cm_clientAddress"),
        ms_manufacturerName: s("ms_manufacturerName"),
        ms_officeAddress: s("ms_officeAddress"),
        ms_factoryAddress: s("ms_factoryAddress"),
        ms_storageAddress: s("ms_storageAddress"),
        imp_importerName: s("imp_importerName"),
        imp_importerAddress: s("imp_importerAddress"),
        imp_storageAddress: s("imp_storageAddress"),
        imp_foreignManufacturer: s("imp_foreignManufacturer"),
        imp_foreignFactory: s("imp_foreignFactory"),
        imp_country: s("imp_country"),
        ingredients: (d.ingredients as FdaIngredientRow[]) || [{ no: 1, casNumber: "", inciName: "" }],
      }
      setMapped(jk)

      // Build preview fields
      const f: Field[] = []
      const purposeMap: Record<string, string> = { domestic: "ขายในประเทศ", export_only: "ส่งออกเท่านั้น", export_buyer_spec: "ส่งออก (ตามผู้ซื้อ)" }
      const bizMap: Record<string, string> = { manufacture_sell: "ผลิตเพื่อขาย", contract_manufacture: "รับจ้างผลิต", import_sell: "นำเข้าเพื่อขาย" }
      const fmtMap: Record<string, string> = { single: "ผลิตภัณฑ์เดี่ยว", single_color_scent: "ต่างสี/กลิ่น", multi_combined: "รวมบรรจุ", set: "ชุดผลิตภัณฑ์" }

      if (jk.purpose) f.push({ key: "purpose", label: "วัตถุประสงค์", value: purposeMap[jk.purpose] || jk.purpose })
      if (jk.tradeNameTh || jk.tradeNameEn) f.push({ key: "tradeName", label: "ชื่อการค้า", value: [jk.tradeNameTh, jk.tradeNameEn].filter(Boolean).join(" / ") })
      if (jk.productNameTh || jk.productNameEn) f.push({ key: "productName", label: "ชื่อเครื่องสำอาง", value: [jk.productNameTh, jk.productNameEn].filter(Boolean).join(" / ") })
      if (jk.applicationArea) f.push({ key: "area", label: "บริเวณที่ใช้", value: jk.applicationArea })
      if (jk.productPurpose) f.push({ key: "productPurpose", label: "วัตถุประสงค์การใช้", value: jk.productPurpose })
      if (jk.usageFormat) f.push({ key: "usageFormat", label: "รูปแบบการใช้", value: jk.usageFormat === "rinse_off" ? "ล้างออก" : "ไม่ต้องล้างออก" })
      if (jk.usageInstructions) f.push({ key: "usage", label: "วิธีใช้", value: jk.usageInstructions })
      if (jk.physicalForm) f.push({ key: "physical", label: "ลักษณะทางกายภาพ", value: jk.physicalForm })
      if (jk.containerType) f.push({ key: "container", label: "ภาชนะบรรจุ", value: jk.containerType })
      if (jk.productFormat) f.push({ key: "format", label: "รูปแบบผลิตภัณฑ์", value: fmtMap[jk.productFormat] || jk.productFormat })
      if (jk.businessType) f.push({ key: "biz", label: "ประเภทผู้ประกอบการ", value: bizMap[jk.businessType] || jk.businessType })
      if (jk.cm_contractorName) f.push({ key: "contractor", label: "ผู้รับจ้างผลิต", value: jk.cm_contractorName })
      if (jk.cm_clientName) f.push({ key: "client", label: "ผู้ว่าจ้างผลิต", value: jk.cm_clientName })
      if (jk.cm_factoryAddress) f.push({ key: "factory", label: "สถานที่ผลิต", value: jk.cm_factoryAddress })
      if (jk.cm_storageAddress) f.push({ key: "storage", label: "สถานที่เก็บ", value: jk.cm_storageAddress })
      if (jk.cm_clientAddress) f.push({ key: "clientAddr", label: "ที่ตั้ง (ผู้ว่าจ้าง)", value: jk.cm_clientAddress })
      if (jk.ms_manufacturerName) f.push({ key: "mfr", label: "ผู้ผลิต", value: jk.ms_manufacturerName })
      if (jk.imp_importerName) f.push({ key: "importer", label: "ผู้นำเข้า", value: jk.imp_importerName })
      if (jk.imp_foreignManufacturer) f.push({ key: "foreignMfr", label: "ผู้ผลิตต่างประเทศ", value: jk.imp_foreignManufacturer })
      if (jk.imp_country) f.push({ key: "country", label: "ประเทศผู้ผลิต", value: jk.imp_country })
      if (jk.ingredients && jk.ingredients.length > 1) f.push({ key: "ingredients", label: "ส่วนผสม (INCI)", value: `${jk.ingredients.length} รายการ` })

      setFields(f)
      setPhase("preview")
    } catch {
      setPhase("error")
    }
  }, [extract])

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type === "application/pdf") process(f); else toast.error("กรุณาอัปโหลดไฟล์ PDF") }, [process])
  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) process(f) }, [process])

  const confirm = () => {
    onImportComplete(mapped)
    close(false)
    toast.success(`Import จ.ค.๑ สำเร็จ (${fields.length} fields)`)
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-blue-100 bg-blue-50/30 shrink-0">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <span className="text-blue-800">{"Import PDF -- แบบ จ.ค.๑"}</span>
              <p className="text-[11px] font-normal text-blue-600/80 mt-0.5">{"คำขอจดแจ้งเครื่องสำอาง (ฟอร์ม 10 ข้อ)"}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Upload */}
          {phase === "upload" && (
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => ref.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/50 py-16 transition-all cursor-pointer">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 mb-4">
                <Upload className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{"ลากไฟล์ PDF มาวางที่นี่"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">{"หรือคลิกเพื่อเลือกไฟล์"}</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-[11px] text-blue-700 font-medium">{"รองรับเฉพาะ: แบบ จ.ค.๑ (คำขอจดแจ้ง)"}</span>
              </div>
              <input ref={ref} type="file" accept="application/pdf" className="hidden" onChange={handleSelect} />
            </div>
          )}

          {/* Extracting */}
          {phase === "extracting" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-foreground mb-1">{"กำลังอ่านเอกสาร จ.ค.๑..."}</p>
              <p className="text-[11px] text-muted-foreground">{fileName}</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{"ไม่สามารถอ่านไฟล์ได้"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">{"กรุณาตรวจสอบว่าไฟล์เป็น PDF แบบ จ.ค.๑"}</p>
              <Button variant="outline" size="sm" onClick={reset}>{"ลองใหม่"}</Button>
            </div>
          )}

          {/* Preview */}
          {phase === "preview" && (
            <div className="flex flex-col gap-4">
              {/* Success bar */}
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-blue-700">{"ดึงข้อมูล จ.ค.๑ สำเร็จ"}</p>
                  <p className="text-[11px] text-blue-600/70 truncate">{fileName}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 border border-blue-200">
                  <span className="text-lg font-extrabold text-blue-700">{fields.length}</span>
                  <span className="text-[10px] text-blue-600">{"fields"}</span>
                </div>
              </div>

              {/* Fields table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-blue-50/50 px-4 py-2">
                  <span className="text-[11px] font-bold text-blue-700">{"ข้อมูลที่ดึงได้จาก จ.ค.๑"}</span>
                  <button type="button" onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline">
                    <Eye className="h-3 w-3" />{showRaw ? "ซ่อน Raw Text" : "ดู Raw Text"}
                  </button>
                </div>
                {!showRaw ? (
                  <div className="divide-y divide-border">
                    {fields.map(f => (
                      <div key={f.key} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{f.label}</span>
                        <span className="text-[12px] font-medium text-foreground flex-1">{f.value}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 max-h-[300px] overflow-y-auto">
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{rawText}</pre>
                  </div>
                )}
              </div>

              {/* Ingredients preview */}
              {mapped.ingredients && mapped.ingredients.length > 1 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-blue-50/50 px-4 py-2">
                    <span className="text-[11px] font-bold text-blue-700">{"ส่วนผสม INCI (" + mapped.ingredients.length + " รายการ)"}</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {mapped.ingredients.map((ing, i) => (
                      <div key={i} className="grid grid-cols-[32px_100px_1fr] gap-0 px-4 py-1.5 border-t border-border text-[11px]">
                        <span className="text-muted-foreground font-bold">{ing.no}</span>
                        <span className="font-mono text-muted-foreground">{ing.casNumber || "-"}</span>
                        <span className="font-medium">{ing.inciName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-3 border-t border-border shrink-0">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" className="text-[11px]" onClick={() => close(false)}>
              <X className="h-3.5 w-3.5 mr-1" />{"ยกเลิก"}
            </Button>
            {phase === "preview" && (
              <Button size="sm" className={cn("gap-1 text-white text-[11px] font-bold bg-blue-600 hover:bg-blue-700")} onClick={confirm}>
                {"นำเข้าไปแบบ จ.ค.๑"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
