"use client"

import { useState, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  FileUp,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Eye,
} from "lucide-react"
import { parseFdaPdfText } from "@/lib/fda-pdf-parser"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedData = Record<string, any>

interface ImportPdfDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: (data: ParsedData) => void
}

type ImportPhase = "upload" | "extracting" | "preview" | "error"

interface ExtractedField {
  label: string
  value: string
  key: string
}

export function ImportPdfDialog({ open, onOpenChange, onImportComplete }: ImportPdfDialogProps) {
  const [phase, setPhase] = useState<ImportPhase>("upload")
  const [fileName, setFileName] = useState("")
  const [rawText, setRawText] = useState("")
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([])
  const [showRawText, setShowRawText] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setPhase("upload")
    setFileName("")
    setRawText("")
    setParsedData(null)
    setExtractedFields([])
    setShowRawText(false)
  }

  const handleOpenChange = (o: boolean) => {
    if (!o) reset()
    onOpenChange(o)
  }

  const extractTextFromPdf = useCallback(async (file: File): Promise<string> => {
    // Use pdf.js to extract text from PDF
    const pdfjsLib = await import("pdfjs-dist")
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ""
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: { str?: string }) => ("str" in item ? item.str : ""))
        .join(" ")
      fullText += pageText + "\n"
    }

    return fullText
  }, [])

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setPhase("extracting")

    try {
      const text = await extractTextFromPdf(file)
      setRawText(text)

      const data = parseFdaPdfText(text)
      setParsedData(data)

      // Build extracted fields summary
      const fields: ExtractedField[] = []
      if (data.regType) fields.push({ key: "regType", label: "ประเภทเอกสาร", value: data.regType === "jk" ? "จ.ค.๑ (JK)" : "จ.ร.๑ (JR)" })
      if (data.purpose) fields.push({ key: "purpose", label: "วัตถุประสงค์", value: { domestic: "ขายในประเทศ", export_only: "ส่งออก", export_buyer_spec: "ส่งออก (ตามผู้ซื้อ)" }[data.purpose] || data.purpose })
      if (data.tradeNameTh || data.tradeNameEn) fields.push({ key: "tradeName", label: "ชื่อการค้า", value: [data.tradeNameTh, data.tradeNameEn].filter(Boolean).join(" / ") })
      if (data.productNameTh || data.productNameEn) fields.push({ key: "productName", label: "ชื่อเครื่องสำอาง", value: [data.productNameTh, data.productNameEn].filter(Boolean).join(" / ") })
      if (data.applicationArea) fields.push({ key: "applicationArea", label: "บริเวณที่ใช้", value: data.applicationArea })
      if (data.productPurpose) fields.push({ key: "productPurpose", label: "วัตถุประสงค์การใช้", value: data.productPurpose })
      if (data.usageFormat) fields.push({ key: "usageFormat", label: "รูปแบบการใช้", value: data.usageFormat === "rinse_off" ? "ล้างออก" : "ไม่ต้องล้างออก" })
      if (data.usageInstructions) fields.push({ key: "usageInstructions", label: "วิธีใช้", value: data.usageInstructions })
      if (data.physicalForm) fields.push({ key: "physicalForm", label: "ลักษณะทางกายภาพ", value: data.physicalForm })
      if (data.containerType) fields.push({ key: "containerType", label: "ภาชนะบรรจุ", value: data.containerType })
      if (data.productFormat) fields.push({ key: "productFormat", label: "รูปแบบผลิตภัณฑ์", value: { single: "ผลิตภัณฑ์เดี่ยว", single_color_scent: "ต่างสี/กลิ่น", multi_combined: "รวมบรรจุ", set: "ชุดผลิตภัณฑ์" }[data.productFormat] || "" })
      if (data.businessType) fields.push({ key: "businessType", label: "ประเภทผู้ประกอบการ", value: { manufacture_sell: "ผลิตเพื่อขาย", contract_manufacture: "รับจ้างผลิต", import_sell: "นำเข้าเพื่อขาย" }[data.businessType] })
      if (data.cm_contractorName) fields.push({ key: "cm_contractorName", label: "ผู้รับจ้างผลิต", value: data.cm_contractorName })
      if (data.cm_clientName) fields.push({ key: "cm_clientName", label: "ผู้ว่าจ้างผลิต", value: data.cm_clientName })
      if (data.cm_factoryAddress) fields.push({ key: "cm_factoryAddress", label: "ที่ตั้งสถานที่ผลิต", value: data.cm_factoryAddress })
      if (data.cm_storageAddress) fields.push({ key: "cm_storageAddress", label: "ที่ตั้งสถานที่เก็บ", value: data.cm_storageAddress })
      if (data.cm_clientAddress) fields.push({ key: "cm_clientAddress", label: "ที่ตั้ง (ผู้ว่าจ้าง)", value: data.cm_clientAddress })
      if (data.ingredients && data.ingredients.length > 1) fields.push({ key: "ingredients", label: "ส่วนผสม (INCI)", value: `${data.ingredients.length} รายการ` })

      setExtractedFields(fields)
      setPhase("preview")
    } catch (err) {
      console.error("PDF extraction error:", err)
      setPhase("error")
    }
  }, [extractTextFromPdf])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      processFile(file)
    } else {
      toast.error("Please upload a PDF file")
    }
  }, [processFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleConfirmImport = () => {
    if (parsedData) {
      onImportComplete(parsedData)
      handleOpenChange(false)
      toast.success(`Imported ${extractedFields.length} fields from ${fileName}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            {"Import PDF - จ.ค.๑ / จ.ร.๑"}
          </DialogTitle>
          <p className="text-[11px] text-muted-foreground">
            {"อัปโหลดไฟล์ PDF ของใบจดแจ้งเครื่องสำอาง ระบบจะดึงข้อมูลจากเอกสารอัตโนมัติ"}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Upload Phase */}
          {phase === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-secondary/20 hover:bg-primary/5 py-16 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Upload className="h-7 w-7 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{"ลากไฟล์ PDF มาวางที่นี่"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">{"หรือคลิกเพื่อเลือกไฟล์"}</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">{"รองรับ: แบบ จ.ค.๑ (คำขอจดแจ้ง) และ แบบ จ.ร.๑ (ใบรับจดแจ้ง)"}</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Extracting Phase */}
          {phase === "extracting" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-sm font-bold text-foreground mb-1">{"กำลังอ่านเอกสาร..."}</p>
              <p className="text-[11px] text-muted-foreground">{fileName}</p>
            </div>
          )}

          {/* Error Phase */}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">{"ไม่สามารถอ่านไฟล์ได้"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">{"กรุณาตรวจสอบว่าไฟล์เป็น PDF ที่ถูกต้อง"}</p>
              <Button variant="outline" size="sm" onClick={reset}>{"ลองใหม่"}</Button>
            </div>
          )}

          {/* Preview Phase */}
          {phase === "preview" && parsedData && (
            <div className="flex flex-col gap-4">
              {/* File info */}
              <div className="flex items-center gap-3 rounded-xl bg-[#10b981]/5 border border-[#10b981]/20 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#10b981]">{"ดึงข้อมูลสำเร็จ"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{fileName}</p>
                </div>
                {parsedData?.regType && (
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg border", parsedData.regType === "jk" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200")}>
                  <span className={cn("text-xs font-extrabold", parsedData.regType === "jk" ? "text-blue-700" : "text-amber-700")}>{parsedData.regType === "jk" ? "จ.ค.๑" : "จ.ร.๑"}</span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border">
                  <span className="text-lg font-extrabold text-foreground">{extractedFields.length}</span>
                  <span className="text-[10px] text-muted-foreground">{"fields"}</span>
                </div>
              </div>

              {/* Extracted fields */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-secondary/60 px-4 py-2">
                  <span className="text-[11px] font-bold text-muted-foreground">{"ข้อมูลที่ดึงมาได้"}</span>
                  <button
                    type="button"
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                  >
                    <Eye className="h-3 w-3" />
                    {showRawText ? "ซ่อน Raw Text" : "ดู Raw Text"}
                  </button>
                </div>

                {!showRawText ? (
                  <div className="divide-y divide-border">
                    {extractedFields.map((f) => (
                      <div key={f.key} className="flex items-start gap-3 px-4 py-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground w-[140px] shrink-0 pt-0.5">{f.label}</span>
                        <span className="text-[12px] font-medium text-foreground flex-1">{f.value}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981] shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 max-h-[300px] overflow-y-auto">
                    <pre className="text-[10px] text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{rawText}</pre>
                  </div>
                )}
              </div>

              {/* Ingredient preview */}
              {parsedData.ingredients && parsedData.ingredients.length > 1 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-secondary/60 px-4 py-2">
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {"ส่วนผสม INCI (" + parsedData.ingredients.length + " รายการ)"}
                    </span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {parsedData.ingredients.map((ing, i) => (
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

        <DialogFooter className="px-6 py-3 border-t border-border shrink-0">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="sm" className="text-[11px]" onClick={() => handleOpenChange(false)}>
              <X className="h-3.5 w-3.5 mr-1" />
              {"ยกเลิก"}
            </Button>
            {phase === "preview" && (
              <Button size="sm" className={cn("gap-1 text-white text-[11px] font-bold", parsedData?.regType === "jr" ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700")} onClick={handleConfirmImport}>
                {parsedData?.regType === "jr" ? "นำเข้าไปแบบ จ.ร.๑" : "นำเข้าไปแบบ จ.ค.๑"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
