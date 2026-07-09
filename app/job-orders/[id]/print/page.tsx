"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Printer, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JobOrder } from "@/lib/job-order-types"
import { JO_STATUS_MAP } from "@/lib/job-order-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function formatDate(d?: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" })
}

export default function JobOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading } = useSWR<{ jobOrder: JobOrder }>(`/api/job-orders/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data?.jobOrder) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">ไม่พบ Job Order</p>
        <Button variant="outline" onClick={() => router.back()}>กลับ</Button>
      </div>
    )
  }

  const jo = data.jobOrder
  const statusInfo = JO_STATUS_MAP[jo.status]

  return (
    <div className="min-h-screen bg-white">
      {/* Print toolbar — hidden when printing */}
      <div className="no-print flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-6 py-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <span className="flex-1 text-sm text-gray-500">Job Order — {jo.orderNumber}</span>
        <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Printable content */}
      <div className="mx-auto max-w-3xl px-10 py-10 print:px-8 print:py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Job Order</h1>
            <p className="mt-1 font-mono text-sm font-bold text-blue-600">#{jo.orderNumber}</p>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-full border px-3 py-1 text-xs font-bold" style={{ color: statusInfo?.color }}>
              {statusInfo?.label ?? jo.status}
            </div>
            <p className="mt-1 text-xs text-gray-500">Priority: {jo.priority}</p>
          </div>
        </div>

        {/* Two-column info */}
        <div className="mb-8 grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-3">
            <h2 className="border-b border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Product</h2>
            <Row label="Product" value={jo.productName} />
            <Row label="SKU" value={jo.sku} />
            <Row label="Formula Code" value={jo.formulaCode} />
            <Row label="FDA Reg." value={jo.fdaRegNumber} />
          </div>
          <div className="space-y-3">
            <h2 className="border-b border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Customer</h2>
            <Row label="Customer" value={jo.customerName} />
            <Row label="Brand" value={jo.brandName} />
            <Row label="Payment Terms" value={jo.paymentTerms} />
          </div>
        </div>

        {/* Quantity & dates */}
        <div className="mb-8 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-900">{jo.quantity.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{jo.unitSize}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Planned Qty</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-extrabold text-gray-900">{jo.batchSize.toLocaleString()} kg</div>
            <div className="text-xs text-gray-500">× {jo.numberOfBatches} batches</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Batch Size</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-xl font-extrabold text-gray-900">฿{jo.totalValue.toLocaleString()}</div>
            <div className="text-xs text-gray-500">฿{jo.costPerUnit}/unit</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">Total Value</div>
          </div>
        </div>

        {/* Dates */}
        <div className="mb-8 grid grid-cols-3 gap-4 text-sm">
          <Row label="Start Date" value={formatDate(jo.startDate)} />
          <Row label="Due Date" value={formatDate(jo.dueDate)} />
          <Row label="Created" value={formatDate(jo.createdAt)} />
        </div>

        {/* Materials */}
        {jo.materials.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Raw Materials</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 font-semibold text-gray-600">Item</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600">Required</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-600">Available</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {jo.materials.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="px-3 py-2">
                      <div className="font-mono text-[11px] text-blue-600">{m.stockCardId ?? m.id}</div>
                      <div className="text-gray-700">{m.name}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">{m.requiredQty.toLocaleString()} {m.requiredUnit}</td>
                    <td className="px-3 py-2 text-right font-mono">{m.stockQty.toLocaleString()} {m.requiredUnit}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.status === "sufficient" ? "bg-green-100 text-green-700" : m.status === "ordered" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Production steps */}
        {jo.productionSteps.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 border-b border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Production Steps</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="w-8 px-3 py-2 font-semibold text-gray-600">#</th>
                  <th className="px-3 py-2 font-semibold text-gray-600">Step</th>
                  <th className="px-3 py-2 font-semibold text-gray-600">Assignee</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-3 py-2 font-semibold text-gray-600">Completed</th>
                </tr>
              </thead>
              <tbody>
                {jo.productionSteps.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 font-mono text-gray-400">{s.stepNumber}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{s.name}</td>
                    <td className="px-3 py-2 text-gray-500">{s.completedQty}/{s.targetQty} {s.unit}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.status === "active" ? "bg-green-100 text-green-700" : s.status === "pending" ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{formatDate(s.endDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes */}
        {jo.notes && (
          <div className="mb-8">
            <h2 className="mb-2 border-b border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-gray-500">Notes</h2>
            <p className="text-sm text-gray-700">{jo.notes}</p>
          </div>
        )}

        {/* Signature rows */}
        <div className="mt-12 grid grid-cols-3 gap-8 text-xs text-gray-500">
          {["Production Manager", "QC Officer", "Customer Approval"].map((role) => (
            <div key={role} className="text-center">
              <div className="h-14 border-b border-gray-300" />
              <div className="mt-1 font-semibold">{role}</div>
              <div className="text-gray-400">Date: _______________</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-[10px] text-gray-400">
          Printed on {new Date().toLocaleDateString("th-TH", { dateStyle: "full" })} — #{jo.orderNumber}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-32 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="font-medium text-gray-800">{value ?? "—"}</span>
    </div>
  )
}
