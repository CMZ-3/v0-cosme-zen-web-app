"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Copy, RotateCcw, Pencil, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FdaStatusActions } from "@/components/fda/fda-status-actions"
import { FdaOverviewTab } from "@/components/fda/tabs/overview-tab"
import { FdaPifIngredientsTab } from "@/components/fda/tabs/pif-ingredients-tab"
import { FdaPifManufacturingTab } from "@/components/fda/tabs/pif-manufacturing-tab"
import { FdaPifRawMaterialsTab } from "@/components/fda/tabs/pif-raw-materials-tab"
import { FdaDocumentsTab } from "@/components/fda/tabs/documents-tab"
import { FdaChecklistTab } from "@/components/fda/tabs/checklist-tab"
import { FdaAuditTab } from "@/components/fda/tabs/audit-tab"
import { FdaCustomerTab } from "@/components/fda/tabs/customer-tab"
import { REGISTRATION_TYPE_MAP, FDA_STATUS_MAP } from "@/lib/fda-types"
import { mockFdaDetail, mockFdaIngredients, mockFdaManufacturingSteps, mockFdaRawMaterialSpecs, mockFdaDocuments, mockFdaChecklist, mockFdaAudit } from "@/lib/fda-mock-data"
import { toast } from "sonner"

export default function FdaDetailPage() {
  const router = useRouter()
  const data = mockFdaDetail
  const typeCfg = REGISTRATION_TYPE_MAP[data.registrationType]
  const statusCfg = FDA_STATUS_MAP[data.status]
  const isDraft = data.status === "draft"

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Link href="/fda" className="hover:text-primary transition-colors font-medium">FDA / Reg.</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">{data.registrationCode}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push("/fda")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono text-xs text-muted-foreground">{data.registrationCode}</span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
            {typeCfg.label} ({typeCfg.labelTh})
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          {data.renewalCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              <RotateCcw className="h-2.5 w-2.5" />
              Renewal #{data.renewalCount}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-foreground truncate">{data.productNameTh}</h1>
            {data.productNameEn && (
              <p className="text-sm text-muted-foreground truncate">{data.productNameEn}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <FdaStatusActions registration={data} />
            {isDraft && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => toast.info("Clone functionality")}
            >
              <Copy className="h-3 w-3" /> Clone
            </Button>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <Tabs defaultValue="overview" className="mt-2">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-0">
            {[
              { value: "overview", label: "Overview" },
              { value: "pif", label: "PIF" },
              { value: "documents", label: "Documents" },
              { value: "checklist", label: "Checklist" },
              { value: "audit", label: "Audit" },
              { value: "customer", label: "Customer" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-xs font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <FdaOverviewTab data={data} />
          </TabsContent>

          <TabsContent value="pif" className="mt-0">
            {/* PIF Sub-tabs */}
            <Tabs defaultValue="ingredients" className="mt-3">
              <TabsList className="h-8">
                <TabsTrigger value="ingredients" className="text-xs h-7 px-3">Ingredients</TabsTrigger>
                <TabsTrigger value="manufacturing" className="text-xs h-7 px-3">Manufacturing Steps</TabsTrigger>
                <TabsTrigger value="raw-materials" className="text-xs h-7 px-3">Raw Material Specs</TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="mt-0">
                <FdaPifIngredientsTab ingredients={mockFdaIngredients} isDraft={isDraft} />
              </TabsContent>
              <TabsContent value="manufacturing" className="mt-0">
                <FdaPifManufacturingTab steps={mockFdaManufacturingSteps} isDraft={isDraft} />
              </TabsContent>
              <TabsContent value="raw-materials" className="mt-0">
                <FdaPifRawMaterialsTab specs={mockFdaRawMaterialSpecs} isDraft={isDraft} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <FdaDocumentsTab documents={mockFdaDocuments} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-0">
            <FdaChecklistTab checklist={mockFdaChecklist} />
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <FdaAuditTab logs={mockFdaAudit} />
          </TabsContent>

          <TabsContent value="customer" className="mt-0">
            <FdaCustomerTab data={data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
