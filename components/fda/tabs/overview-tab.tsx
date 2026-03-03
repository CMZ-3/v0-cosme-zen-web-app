"use client"

import { Calendar, Building2, User, FileText, DollarSign, Info } from "lucide-react"
import type { FdaRegistration } from "@/lib/fda-types"

interface OverviewTabProps {
  data: FdaRegistration
}

function FieldCard({ title, icon: Icon, children }: { title: string; icon: typeof Info; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value ?? "--"}</p>
    </div>
  )
}

export function FdaOverviewTab({ data }: OverviewTabProps) {
  return (
    <div className="flex flex-col gap-4 py-4">
      {/* Basic Info */}
      <FieldCard title="Product Information" icon={Info}>
        <Field label="Product Name (TH)" value={data.productNameTh} />
        <Field label="Product Name (EN)" value={data.productNameEn} />
        <Field label="FDA Product Name" value={data.fdaProductName} />
        <Field label="Trade Name" value={data.tradeName} />
        <Field label="Trade Name (EN)" value={data.tradeNameEn} />
        <Field label="Product Name Suffix" value={data.productNameSuffix} />
        <Field label="Registration Number" value={data.registrationNumber} />
        <Field label="License Number" value={data.licenseNumber} />
      </FieldCard>

      {/* Classification */}
      <FieldCard title="Classification" icon={FileText}>
        <Field label="Cosmetic Type" value={data.cosmeticType} />
        <Field label="Cosmetic Form" value={data.cosmeticForm} />
        <Field label="Usage Format" value={data.usageFormat} />
        <Field label="Application Area" value={data.applicationArea} />
        <Field label="Container Type" value={data.containerType} />
        <Field label="Product Form" value={data.productForm} />
        <div className="col-span-2">
          <Field label="Product Purpose" value={data.productPurpose} />
        </div>
        <div className="col-span-2">
          <Field label="Usage Instructions" value={data.usageInstructions} />
        </div>
        <div className="col-span-2">
          <Field label="Warnings" value={data.warnings} />
        </div>
      </FieldCard>

      {/* Manufacturer & Importer */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FieldCard title="Manufacturer" icon={Building2}>
          <div className="col-span-2"><Field label="Name" value={data.manufacturerName} /></div>
          <div className="col-span-2"><Field label="Address" value={data.manufacturerAddress} /></div>
          <Field label="License" value={data.manufacturerLicense} />
          <div className="col-span-2"><Field label="Storage Address" value={data.manufacturerStorageAddress} /></div>
        </FieldCard>

        <FieldCard title="Importer / Brand Owner" icon={User}>
          <div className="col-span-2"><Field label="Name" value={data.importerName} /></div>
          <div className="col-span-2"><Field label="Address" value={data.importerAddress} /></div>
          <Field label="Customer" value={data.customerName} />
        </FieldCard>
      </div>

      {/* Dates & Status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FieldCard title="Dates" icon={Calendar}>
          <Field label="Registration Date" value={data.registrationDate} />
          <Field label="Submitted Date" value={data.submittedDate} />
          <Field label="Expiry Date" value={data.expiryDate} />
          <Field label="Renewal Count" value={data.renewalCount} />
        </FieldCard>

        <FieldCard title="Fees & Notes" icon={DollarSign}>
          <Field label="Service Fee" value={data.serviceFee ? `${data.serviceFee.toLocaleString()} THB` : undefined} />
          <Field label="Fee Notes" value={data.feeNotes} />
          <div className="col-span-2">
            <Field label="Approval Comment" value={data.approvalComment} />
          </div>
          {data.rejectionReason && (
            <div className="col-span-2">
              <Field label="Rejection Reason" value={data.rejectionReason} />
            </div>
          )}
          <div className="col-span-2">
            <Field label="Internal Notes" value={data.notes} />
          </div>
        </FieldCard>
      </div>
    </div>
  )
}
