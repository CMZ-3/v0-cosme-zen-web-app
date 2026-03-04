"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Plus, FileUp, FileSpreadsheet, Download, LayoutList, BarChart3, CheckSquare, FileText, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { FdaKpiCards } from "@/components/fda/fda-kpi-cards"
import { FdaTable } from "@/components/fda/fda-table"
import { CreateJkDialog } from "@/components/fda/create-jk-dialog"
import { CreateJrDialog } from "@/components/fda/create-jr-dialog"
import type { JkFormData } from "@/components/fda/create-jk-dialog"
import type { JrFormData } from "@/components/fda/create-jr-dialog"
import { ImportPdfDialog } from "@/components/fda/import-pdf-dialog"
import { mockFdaKPI, mockFdaList } from "@/lib/fda-mock-data"
import type { RegistrationType } from "@/lib/fda-types"
import { cn } from "@/lib/utils"

type PageTab = "list" | "dashboard" | "approval"

const pageTabs: { value: PageTab; label: string; icon: typeof LayoutList }[] = [
  { value: "list", label: "List", icon: LayoutList },
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "approval", label: "Approval", icon: CheckSquare },
]

export default function FdaPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<PageTab>("list")
  const [typeFilter, setTypeFilter] = useState<RegistrationType | "all">("all")

  // Type picker dialog
  const [typePickerOpen, setTypePickerOpen] = useState(false)

  // Separate form dialogs
  const [jkOpen, setJkOpen] = useState(false)
  const [jrOpen, setJrOpen] = useState(false)
  const [jkInitialData, setJkInitialData] = useState<Partial<JkFormData> | undefined>(undefined)
  const [jrInitialData, setJrInitialData] = useState<Partial<JrFormData> | undefined>(undefined)

  // Import dialog
  const [importOpen, setImportOpen] = useState(false)

  const openJk = useCallback((data?: Partial<JkFormData>) => {
    setJkInitialData(data)
    setJkOpen(true)
  }, [])

  const openJr = useCallback((data?: Partial<JrFormData>) => {
    setJrInitialData(data)
    setJrOpen(true)
  }, [])

  const handleJkClose = useCallback((o: boolean) => {
    setJkOpen(o)
    if (!o) setJkInitialData(undefined)
  }, [])

  const handleJrClose = useCallback((o: boolean) => {
    setJrOpen(o)
    if (!o) setJrInitialData(undefined)
  }, [])

  // Import complete handler: routes to the correct form based on detected type
  const handleImportComplete = useCallback((data: Record<string, unknown>) => {
    const s = (k: string) => (data[k] as string) || ""
    const regType = s("regType")

    if (regType === "jr") {
      const jrData: Partial<JrFormData> = {
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
        businessType: (data.businessType as JrFormData["businessType"]) || "contract_manufacture",
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
      }
      openJr(jrData)
    } else {
      const jkData: Partial<JkFormData> = {
        purpose: (data.purpose as JkFormData["purpose"]) || "domestic",
        tradeNameTh: s("tradeNameTh"),
        tradeNameEn: s("tradeNameEn"),
        productNameTh: s("productNameTh"),
        productNameEn: s("productNameEn"),
        usageFormat: (data.usageFormat as JkFormData["usageFormat"]) || "",
        applicationArea: s("applicationArea"),
        productPurpose: s("productPurpose"),
        usageInstructions: s("usageInstructions"),
        physicalForm: s("physicalForm"),
        containerType: s("containerType"),
        productFormat: (data.productFormat as JkFormData["productFormat"]) || "",
        businessType: (data.businessType as JkFormData["businessType"]) || "contract_manufacture",
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
        ingredients: (data.ingredients as JkFormData["ingredients"]) || [{ no: 1, casNumber: "", inciName: "" }],
      }
      openJk(jkData)
    }
  }, [openJk, openJr])

  const filteredList = useMemo(() => {
    if (typeFilter === "all") return mockFdaList
    return mockFdaList.filter((r) => r.registrationType === typeFilter)
  }, [typeFilter])

  return (
    <div className="flex flex-col gap-5 p-6 pb-12 overflow-y-auto h-screen">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10">
            <ShieldCheck className="h-5 w-5 text-[#10b981]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">{"FDA / อย. Management"}</h1>
            <p className="text-[11px] text-muted-foreground">
              {"จดแจ้งเครื่องสำอาง \u2022 Workflow (Draft\u2192Submitted\u2192Approved) \u2022 JK / JR"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-[11px] font-semibold" onClick={() => setImportOpen(true)}>
            <FileUp className="h-3.5 w-3.5" />
            Import PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-[11px] font-semibold">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Import Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-[11px] font-semibold">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="gap-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold shadow-[0_2px_8px_rgba(16,185,129,0.3)]" onClick={() => setTypePickerOpen(true)}>
            <Plus className="h-4 w-4" />
            {"สร้างทะเบียน"}
          </Button>
        </div>
      </div>

      {/* Page Tabs + Type Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {pageTabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)} className={cn("flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold transition-all", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary")}>
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {([
            { value: "all" as const, label: "All", dot: "bg-muted-foreground" },
            { value: "jk" as RegistrationType, label: "จ.ค. (JK)", dot: "bg-blue-500" },
            { value: "jr" as RegistrationType, label: "จ.ร. (JR)", dot: "bg-amber-500" },
          ]).map((opt) => {
            const isActive = typeFilter === opt.value
            return (
              <button key={opt.value} type="button" onClick={() => setTypeFilter(opt.value as RegistrationType | "all")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all", isActive ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                <span className={cn("h-2 w-2 rounded-full", opt.dot)} />{opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <>
          <FdaKpiCards kpi={mockFdaKPI} />
          <FdaTable data={filteredList} onRowClick={(id) => router.push(`/fda/${id}`)} />
        </>
      )}
      {activeTab === "dashboard" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20">
          <BarChart3 className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">FDA Dashboard</p>
          <p className="text-[11px] text-muted-foreground">Charts, expiry timeline & renewal planning coming soon</p>
        </div>
      )}
      {activeTab === "approval" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20">
          <CheckSquare className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-bold text-foreground">Approval Queue</p>
          <p className="text-[11px] text-muted-foreground">Pending review & approval workflow coming soon</p>
        </div>
      )}

      {/* ───── Type Picker Dialog ───── */}
      <Dialog open={typePickerOpen} onOpenChange={setTypePickerOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-extrabold">{"เลือกประเภทแบบฟอร์ม"}</DialogTitle>
            <p className="text-[11px] text-muted-foreground">{"เลือกประเภทเอกสารที่ต้องการสร้าง"}</p>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-3">
            {/* JK Option */}
            <button
              type="button"
              onClick={() => { setTypePickerOpen(false); openJk() }}
              className="flex items-start gap-4 rounded-xl border-2 border-blue-200 bg-blue-50/30 hover:bg-blue-50 px-5 py-4 text-left transition-all hover:border-blue-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-extrabold text-blue-800">{"แบบ จ.ค.๑"}</p>
                <p className="text-[12px] font-semibold text-blue-600">{"คำขอจดแจ้งเครื่องสำอาง"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{"ฟอร์มเต็ม 10 ข้อ: ข้อมูลผลิตภัณฑ์, ลักษณะ, ผู้ประกอบการ, ส่วนผสม INCI, การรับรอง"}</p>
              </div>
            </button>

            {/* JR Option */}
            <button
              type="button"
              onClick={() => { setTypePickerOpen(false); openJr() }}
              className="flex items-start gap-4 rounded-xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50 px-5 py-4 text-left transition-all hover:border-amber-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0 mt-0.5">
                <FileCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-base font-extrabold text-amber-800">{"แบบ จ.ร.๑"}</p>
                <p className="text-[12px] font-semibold text-amber-600">{"ใบรับจดแจ้งเครื่องสำอาง"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{"ข้อมูลสรุป: เลขที่ใบรับจดแจ้ง, วันออก/หมดอายุ, ข้อมูลผลิตภัณฑ์, ผู้ประกอบการ"}</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───── Form Dialogs ───── */}
      <CreateJkDialog open={jkOpen} onOpenChange={handleJkClose} initialData={jkInitialData} />
      <CreateJrDialog open={jrOpen} onOpenChange={handleJrClose} initialData={jrInitialData} />

      {/* ───── Import PDF Dialog ───── */}
      <ImportPdfDialog open={importOpen} onOpenChange={setImportOpen} onImportComplete={handleImportComplete} />
    </div>
  )
}
