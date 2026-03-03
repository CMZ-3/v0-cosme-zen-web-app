"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FdaKpiCards } from "@/components/fda/fda-kpi-cards"
import { FdaTable } from "@/components/fda/fda-table"
import { CreateFdaDialog } from "@/components/fda/create-fda-dialog"
import { mockFdaKPI, mockFdaList } from "@/lib/fda-mock-data"

export default function FdaPage() {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6 pb-12 overflow-y-auto h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">FDA Registrations</h1>
            <p className="text-xs text-muted-foreground">Thai FDA cosmetic registration management</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Registration
        </Button>
      </div>

      {/* KPI Cards */}
      <FdaKpiCards kpi={mockFdaKPI} />

      {/* Table */}
      <FdaTable data={mockFdaList} onRowClick={(id) => router.push(`/fda/${id}`)} />

      {/* Create Dialog */}
      <CreateFdaDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
