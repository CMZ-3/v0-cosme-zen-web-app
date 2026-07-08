"use client"

import { useState, useCallback, useRef } from "react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Upload, FileCheck, CheckCircle2, AlertCircle, Loader2, X, ChevronRight, Eye,
} from "lucide-react"
import { parseFdaPdfText } from "@/lib/fda-pdf-parser"
import type { JrFormData } from "@/components/fda/create-jr-dialog"

/* ------------------------------------------------------------------ */
/*  Import JR Dialog  (จ.ร.๑ - ใบรับจดแจ้งเครื่องสำอาง)               */
/* ------------------------------------------------------------------ */

interface ImportJrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (data: Partial<JrFormData>) => void
}

type Phase = "upload" | "extracting" | "preview" | "error"
interface Field { key: string; label: string; value: string }

export function ImportJrDialog({ open, onOpenChange, onImportComplete }: ImportJrDialogProps) {
  const [phase, setPhase] = useState<Phase>("upload")
  const [fileName, setFileName] = useState("")
  const [rawText, setRawText] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [mapped, setMapped] = useState<Partial<JrFormData>>({})
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
      txt += tc.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n"
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

      // Validate this is actually a JR document
      if (d.regType === "jk") {
        toast.error("ไฟล์นี้เป็นเอกสาร จ.ค.๑ (คำขอจดแจ้ง) กรุณาใช้ Import จ.ค.๑ แทน")
        setPhase("error")
        return
      }

      const s = (k: string) => (d[k] as string) || ""

      // Map parsed data to JrFormData
      const jr: Partial<JrFormData> = {
        regNumber: s("regNumber"),
        issueDate: s("issueDate"),
        expiryDate: s("expiryDate"),
        issuedBy: s("issuedBy"),
        productNameTh: s("productNameTh"),
        productNameEn: s("productNameEn"),
        productNameSuffix: s("productNameSuffix"),
        cosmeticType: s("cosmeticType"),
        physicalForm: s("physicalForm"),
        containerType: s("containerType"),
        productFormat: s("productFormat"),
        businessType: (d.businessType as JrFormData["businessType"]) || "contract_manufacture",
        ms_manufacturerName: s("ms_manufacturerName"),
        ms_factoryAddress: s("ms_factoryAddress"),
        ms_storageAddress: s("ms_storageAddress"),
        cm_contractorName: s("cm_contractorName"),
        cm_factoryAddress: s("cm_factoryAddress"),
        cm_storageAddress: s("cm_storageAddress"),
        cm_clientName: s("cm_clientName"),
        cm_clientAddress: s("cm_clientAddress"),
        imp_importerName: s("imp_importerName"),
        imp_importerAddress: s("imp_importerAddress"),
        imp_storageAddress: s("imp_storageAddress"),
        imp_foreignManufacturer: s("imp_foreignManufacturer"),
        imp_foreignFactory: s("imp_foreignFactory"),
        imp_country: s("imp_country"),
        bulkRegNo: s("bulkRegNo"),
        combinedRegNos: s("combinedRegNos"),
        conditionNotes: s("conditionNotes"),
      }
      setMapped(jr)

      // Build preview fields -- structured like the real จ.ร.๑ receipt
      const f: Field[] = []
      const bizMap: Record<string, string> = { manufacture_sell: "ผลิตเพื่อขาย", contract_manufacture: "รับจ้างผลิต", import_sell: "นำเข้าเพื่อขาย" }

      // Section 1: Registration info
      if (jr.regNumber) f.push({ key: "regNumber", label: "เลขที่ใบรับจดแจ้ง", value: jr.regNumber })
      if (jr.issueDate) f.push({ key: "issueDate", label: "ออกให้ ณ วันที่", value: jr.issueDate })
      if (jr.expiryDate) f.push({ key: "expiryDate", label: "ใช้ได้จนถึงวันที่", value: jr.expiryDate })
      if (jr.issuedBy) f.push({ key: "issuedBy", label: "ออกโดย", value: jr.issuedBy })

      // Section 2: Product info
      if (jr.productNameTh) f.push({ key: "nameTh", label: "ชื่อ (ไทย)", value: jr.productNameTh })
      if (jr.productNameEn) f.push({ key: "nameEn", label: "ชื่อ (อังกฤษ)", value: jr.productNameEn })
      if (jr.productNameSuffix) f.push({ key: "suffix", label: "ชื่อเครื่องสำอางแนบท้าย", value: jr.productNameSuffix })
      if (jr.cosmeticType) f.push({ key: "type", label: "ประเภทเครื่องสำอาง", value: jr.cosmeticType })
      if (jr.physicalForm) f.push({ key: "physical", label: "ลักษณะทางกายภาพ", value: jr.physicalForm })
      if (jr.containerType) f.push({ key: "container", label: "ภาชนะบรรจุ", value: jr.containerType })
      if (jr.productFormat) f.push({ key: "format", label: "รูปแบบผลิตภัณฑ์", value: jr.productFormat })

      // Section 3: Business
      if (jr.businessType) f.push({ key: "biz", label: "ประเภทผู้ประกอบการ", value: bizMap[jr.businessType] || jr.businessType })
      if (jr.cm_contractorName) f.push({ key: "contractor", label: "ชื่อผู้รับจ้างผลิต", value: jr.cm_contractorName })
      if (jr.cm_factoryAddress) f.push({ key: "factory", label: "ที่ตั้งสถานที่ผลิต", value: jr.cm_factoryAddress })
      if (jr.cm_storageAddress) f.push({ key: "storage", label: "ที่ตั้งสถานที่เก็บ", value: jr.cm_storageAddress })
      if (jr.cm_clientName) f.push({ key: "client", label: "ชื่อผู้ว่าจ้างผลิต", value: jr.cm_clientName })
      if (jr.cm_clientAddress) f.push({ key: "clientAddr", label: "ที่ตั้ง (ผู้ว่าจ้าง)", value: jr.cm_clientAddress })
      if (jr.ms_manufacturerName) f.push({ key: "mfr", label: "ชื่อผู้ผลิต", value: jr.ms_manufacturerName })
      if (jr.ms_factoryAddress) f.push({ key: "mfrFactory", label: "สถานที่ผลิต", value: jr.ms_factoryAddress })
      if (jr.ms_storageAddress) f.push({ key: "mfrStorage", label: "สถานที่เก็บ", value: jr.ms_storageAddress })
      if (jr.imp_importerName) f.push({ key: "importer", label: "ชื่อผู้นำเข้า", value: jr.imp_importerName })
      if (jr.imp_foreignManufacturer) f.push({ key: "foreignMfr", label: "ผู้ผลิตต่างประเทศ", value: jr.imp_foreignManufacturer })
      if (jr.imp_foreignFactory) f.push({ key: "foreignFactory", label: "สถานที่ผลิตต่างประเทศ", value: jr.imp_foreignFactory })
      if (jr.imp_country) f.push({ key: "country", label: "ประเทศผู้ผลิต", value: jr.imp_country })

      // Section 4: References
      if (jr.bulkRegNo) f.push({ key: "bulk", label: "เลขที่ Bulk (แบ่งบรรจุ)", value: jr.bulkRegNo })
      if (jr.combinedRegNos) f.push({ key: "combined", label: "เลขที่ (รวมบรรจุ)", value: jr.combinedRegNos })

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
    toast.success(`Import จ.ร.๑ สำเร็จ (${fields.length} fields)`)
  }

  /* ---- Group fields into sections for display ---- */
  const regFields = fields.filter(f => ["regNumber", "issueDate", "expiryDate", "issuedBy"].includes(f.key))
  const prodFields = fields.filter(f => ["nameTh", "nameEn", "suffix", "type", "physical", "container", "format"].includes(f.key))
  const bizFields = fields.filter(f => !regFields.includes(f) && !prodFields.includes(f))

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-amber-100 bg-amber-50/30 shrink-0">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <FileCheck className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <span className="text-amber-800">{"Import PDF -- แบบ จ.ร.๑"}</span>
              <p className="text-[11px] font-normal text-amber-600/80 mt-0.5">{"ใบรับจดแจ้งเครื่องสำอาง (เลขที่ / วันออก / ข้อมูลผลิตภัณฑ์)"}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Upload */}
          {phase === "upload" && (
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => ref.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 hover:border-amber-400 bg-amber-50/20 hover:bg-amber-50/50 py-16 transition-all cursor-pointer">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 mb-4">
                <Upload className="h-7 w-7 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{"ลากไฟล์ PDF มาวางที่นี่"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">{"หรือคลิกเพื่อเลือกไฟล์"}</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <FileCheck className="h-4 w-4 text-amber-500" />
                <span className="text-[11px] text-amber-700 font-medium">{"รองรับเฉพาะ: แบบ จ.ร.๑ (ใบรับจดแจ้ง)"}</span>
              </div>
              <input ref={ref} type="file" accept="application/pdf" className="hidden" onChange={handleSelect} />
            </div>
          )}

          {/* Extracting */}
          {phase === "extracting" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-foreground mb-1">{"กำลังอ่านเอกสาร จ.ร.๑..."}</p>
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
              <p className="text-[11px] text-muted-foreground mb-4">{"กรุณาตรวจสอบว่าไฟล์เป็น PDF แบบ จ.ร.๑"}</p>
              <Button variant="outline" size="sm" onClick={reset}>{"ลองใหม่"}</Button>
            </div>
          )}

          {/* Preview -- Sectioned layout matching จ.ร.๑ receipt structure */}
          {phase === "preview" && (
            <div className="flex flex-col gap-4">
              {/* Success bar */}
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-amber-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-amber-700">{"ดึงข้อมูล จ.ร.๑ สำเร็จ"}</p>
                  <p className="text-[11px] text-amber-600/70 truncate">{fileName}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-200">
                  <span className="text-lg font-extrabold text-amber-700">{fields.length}</span>
                  <span className="text-[10px] text-amber-600">{"fields"}</span>
                </div>
              </div>

              {/* Section 1: Registration */}
              {regFields.length > 0 && (
                <div className="rounded-xl border border-amber-200 overflow-hidden">
                  <div className="bg-amber-50/60 px-4 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700">{"ข้อมูลใบรับจดแจ้ง"}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {regFields.map(f => (
                      <div key={f.key} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{f.label}</span>
                        <span className="text-[12px] font-bold text-amber-800 flex-1">{f.value}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Product */}
              {prodFields.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-amber-50/40 px-4 py-2">
                    <span className="text-[11px] font-bold text-amber-700">{"ข้อมูลผลิตภัณฑ์"}</span>
                  </div>
                  <div className="divide-y divide-border">
                    {prodFields.map(f => (
                      <div key={f.key} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{f.label}</span>
                        <span className="text-[12px] font-medium text-foreground flex-1">{f.value}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Business */}
              {bizFields.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-amber-50/40 px-4 py-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700">{"ผู้ประกอบการ / ที่อยู่"}</span>
                    <button type="button" onClick={() => setShowRaw(!showRaw)} className="flex items-center gap-1 text-[10px] text-amber-600 font-medium hover:underline">
                      <Eye className="h-3 w-3" />{showRaw ? "ซ่อน Raw" : "ดู Raw Text"}
                    </button>
                  </div>
                  {!showRaw ? (
                    <div className="divide-y divide-border">
                      {bizFields.map(f => (
                        <div key={f.key} className="flex items-start gap-3 px-4 py-2.5">
                          <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{f.label}</span>
                          <span className="text-[12px] font-medium text-foreground flex-1">{f.value}</span>
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{rawText}</pre>
                    </div>
                  )}
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
              <Button size="sm" className={cn("gap-1 text-white text-[11px] font-bold bg-amber-600 hover:bg-amber-700")} onClick={confirm}>
                {"นำเข้าไปแบบ จ.ร.๑"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
