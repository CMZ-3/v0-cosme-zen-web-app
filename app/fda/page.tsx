"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Plus, FileUp, FileSpreadsheet, Download, LayoutList, BarChart3, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FdaKpiCards } from "@/components/fda/fda-kpi-cards"
import { FdaTable } from "@/components/fda/fda-table"
import { CreateFdaDialog } from "@/components/fda/create-fda-dialog"
import type { FdaFormData } from "@/components/fda/create-fda-dialog"
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
  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [importedData, setImportedData] = useState<Partial<FdaFormData> | undefined>(undefined)
  const [activeTab, setActiveTab] = useState<PageTab>("list")
  const [typeFilter, setTypeFilter] = useState<RegistrationType | "all">("all")

  const handleImportComplete = (data: Partial<FdaFormData>) => {
    setImportedData(data)
    setCreateOpen(true)
  }

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) setImportedData(undefined)
  }

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
          <Button size="sm" className="gap-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-[11px] font-bold shadow-[0_2px_8px_rgba(16,185,129,0.3)]" onClick={() => { setImportedData(undefined); setCreateOpen(true) }}>
            <Plus className="h-4 w-4" />
            {"สร้างทะเบียน"}
          </Button>
        </div>
      </div>

      {/* Page Tabs + Type Toggle */}
      <div className="flex items-center justify-between">
        {/* Page tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {pageTabs.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* JK / JR toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {([
            { value: "all" as const, label: "All", dot: "bg-muted-foreground" },
            { value: "jk" as RegistrationType, label: "จ.ค. (JK)", dot: "bg-blue-500" },
            { value: "jr" as RegistrationType, label: "จ.ร. (JR)", dot: "bg-amber-500" },
          ]).map((opt) => {
            const isActive = typeFilter === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTypeFilter(opt.value as RegistrationType | "all")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all",
                  isActive
                    ? "bg-secondary text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", opt.dot)} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <>
          {/* KPI Cards */}
          <FdaKpiCards kpi={mockFdaKPI} />

          {/* Table */}
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

      {/* Create Dialog */}
      <CreateFdaDialog open={createOpen} onOpenChange={handleCreateOpenChange} initialData={importedData} />

      {/* Import PDF Dialog */}
      <ImportPdfDialog open={importOpen} onOpenChange={setImportOpen} onImportComplete={handleImportComplete} />
    </div>
  )
}
