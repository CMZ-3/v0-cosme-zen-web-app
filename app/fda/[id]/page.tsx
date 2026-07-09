"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, Copy, RotateCcw, Pencil, ChevronRight, Loader2 } from "lucide-react"
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
import { toast } from "sonner"
import type {
  FdaRegistration, FdaIngredient, FdaManufacturingStep, FdaRawMaterialSpec,
  FdaDocument, FdaChecklistItem, FdaAuditLog,
} from "@/lib/fda-types"

interface FdaDetailResponse {
  detail: FdaRegistration
  ingredients: FdaIngredient[]
  manufacturingSteps: FdaManufacturingStep[]
  rawMaterialSpecs: FdaRawMaterialSpec[]
  documents: FdaDocument[]
  checklist: FdaChecklistItem[]
  auditLogs: FdaAuditLog[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FdaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const { data, isLoading, error } = useSWR<FdaDetailResponse>(`/api/fda/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data?.detail) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">ไม่พบข้อมูล FDA registration นี้</p>
      </div>
    )
  }

  const { detail, ingredients, manufacturingSteps, rawMaterialSpecs, documents, checklist, auditLogs } = data
  const typeCfg = REGISTRATION_TYPE_MAP[detail.registrationType] ?? REGISTRATION_TYPE_MAP.jk
  const statusCfg = FDA_STATUS_MAP[detail.status] ?? FDA_STATUS_MAP.draft
  const isDraft = detail.status === "draft"

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <Link href="/fda" className="hover:text-primary transition-colors font-medium">FDA / Reg.</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">{detail.registrationCode}</span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => router.push("/fda")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-mono text-xs text-muted-foreground">{detail.registrationCode}</span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${typeCfg.bg} ${typeCfg.color}`}>
            {typeCfg.label} ({typeCfg.labelTh})
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          {detail.renewalCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              <RotateCcw className="h-2.5 w-2.5" />
              Renewal #{detail.renewalCount}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-foreground truncate">{detail.productNameTh}</h1>
            {detail.productNameEn && (
              <p className="text-sm text-muted-foreground truncate">{detail.productNameEn}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <FdaStatusActions registration={detail} />
            {isDraft && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => toast.info(`Editing ${detail.registrationCode}`)}>
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
            <FdaOverviewTab data={detail} />
          </TabsContent>

          <TabsContent value="pif" className="mt-0">
            <Tabs defaultValue="ingredients" className="mt-3">
              <TabsList className="h-8">
                <TabsTrigger value="ingredients" className="text-xs h-7 px-3">
                  Ingredients ({ingredients.length})
                </TabsTrigger>
                <TabsTrigger value="manufacturing" className="text-xs h-7 px-3">
                  Manufacturing Steps ({manufacturingSteps.length})
                </TabsTrigger>
                <TabsTrigger value="raw-materials" className="text-xs h-7 px-3">
                  Raw Material Specs ({rawMaterialSpecs.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="mt-0">
                <FdaPifIngredientsTab ingredients={ingredients} isDraft={isDraft} />
              </TabsContent>
              <TabsContent value="manufacturing" className="mt-0">
                <FdaPifManufacturingTab steps={manufacturingSteps} isDraft={isDraft} />
              </TabsContent>
              <TabsContent value="raw-materials" className="mt-0">
                <FdaPifRawMaterialsTab specs={rawMaterialSpecs} isDraft={isDraft} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <FdaDocumentsTab documents={documents} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-0">
            <FdaChecklistTab checklist={checklist} />
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <FdaAuditTab logs={auditLogs} />
          </TabsContent>

          <TabsContent value="customer" className="mt-0">
            <FdaCustomerTab data={detail} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
