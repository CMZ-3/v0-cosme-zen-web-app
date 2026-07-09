"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR from "swr"
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
import { ImportJkDialog } from "@/components/fda/import-jk-dialog"
import { ImportJrDialog } from "@/components/fda/import-jr-dialog"
import type { RegistrationType, FdaListItem, FdaKPISummary } from "@/lib/fda-types"
import { cn } from "@/lib/utils"
import { FdaDashboard } from "@/components/fda/fda-dashboard"
import { FdaApprovalQueue } from "@/components/fda/fda-approval-queue"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const EMPTY_KPI: FdaKPISummary = {
  total: 0, totalJk: 0, totalJr: 0, approved: 0, draft: 0, submitted: 0,
  rejected: 0, expired: 0, expiring30: 0, expiring60: 0, expiring90: 0,
}

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

  const { data } = useSWR<{ registrations: FdaListItem[]; kpi: FdaKPISummary }>("/api/fda", fetcher)
  const registrations = data?.registrations ?? []
  const kpi = data?.kpi ?? EMPTY_KPI

  // Type picker dialog
  const [typePickerOpen, setTypePickerOpen] = useState(false)

  // Separate form dialogs
  const [jkOpen, setJkOpen] = useState(false)
  const [jrOpen, setJrOpen] = useState(false)
  const [jkInitialData, setJkInitialData] = useState<Partial<JkFormData> | undefined>(undefined)
  const [jrInitialData, setJrInitialData] = useState<Partial<JrFormData> | undefined>(undefined)

  // Import dialogs (separate for JK / JR)
  const [importPickerOpen, setImportPickerOpen] = useState(false)
  const [importJkOpen, setImportJkOpen] = useState(false)
  const [importJrOpen, setImportJrOpen] = useState(false)

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

  // Import complete handlers (typed, no generic mapping needed)
  const handleImportJkComplete = useCallback((data: Partial<JkFormData>) => {
    openJk(data)
  }, [openJk])

  const handleImportJrComplete = useCallback((data: Partial<JrFormData>) => {
    openJr(data)
  }, [openJr])

  const filteredList = useMemo(() => {
    if (typeFilter === "all") return registrations
    return registrations.filter((r) => r.registrationType === typeFilter)
  }, [typeFilter, registrations])

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
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-[11px] font-semibold" onClick={() => setImportPickerOpen(true)}>
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
          <FdaKpiCards kpi={kpi} />
          <FdaTable data={filteredList} onRowClick={(id) => router.push(`/fda/${id}`)} />
        </>
      )}
      {activeTab === "dashboard" && (
        <FdaDashboard kpi={kpi} registrations={registrations} />
      )}
      {activeTab === "approval" && (
        <FdaApprovalQueue registrations={registrations} onRowClick={(id) => router.push(`/fda/${id}`)} />
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

      {/* ───── Import Type Picker Dialog ───── */}
      <Dialog open={importPickerOpen} onOpenChange={setImportPickerOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <FileUp className="h-5 w-5 text-primary" />
              {"Import PDF"}
            </DialogTitle>
            <p className="text-[11px] text-muted-foreground">{"เลือกประเภทเอกสารที่ต้องการ Import"}</p>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => { setImportPickerOpen(false); setImportJkOpen(true) }}
              className="flex items-start gap-4 rounded-xl border-2 border-blue-200 bg-blue-50/30 hover:bg-blue-50 px-5 py-4 text-left transition-all hover:border-blue-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-extrabold text-blue-800">{"Import จ.ค.๑"}</p>
                <p className="text-[12px] font-semibold text-blue-600">{"คำขอจดแจ้งเครื่องสำอาง"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{"อัปโหลด PDF แบบ จ.ค.๑ แล้วระบบจะดึงข้อมูลทุก field อัตโนมัติ"}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setImportPickerOpen(false); setImportJrOpen(true) }}
              className="flex items-start gap-4 rounded-xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50 px-5 py-4 text-left transition-all hover:border-amber-400"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0 mt-0.5">
                <FileCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-base font-extrabold text-amber-800">{"Import จ.ร.๑"}</p>
                <p className="text-[12px] font-semibold text-amber-600">{"ใบรับจดแจ้งเครื่องสำอาง"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{"อัปโหลด PDF แบบ จ.ร.๑ แล้วระบบจะดึงเลขที่ วันที่ ข้อมูลผลิตภัณฑ์อัตโนมัติ"}</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ───── Import JK Dialog ───── */}
      <ImportJkDialog open={importJkOpen} onOpenChange={setImportJkOpen} onImportComplete={handleImportJkComplete} />

      {/* ───── Import JR Dialog ───── */}
      <ImportJrDialog open={importJrOpen} onOpenChange={setImportJrOpen} onImportComplete={handleImportJrComplete} />
    </div>
  )
}
