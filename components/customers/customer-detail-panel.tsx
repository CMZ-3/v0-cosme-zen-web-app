"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { CustomerDetail } from "@/lib/customer-types"
import {
  TIER_MAP, BUSINESS_TYPE_MAP, CUSTOMER_TYPE_MAP,
  BRIEF_STATUS_MAP, COMPLAINT_SEVERITY_MAP, COMPLAINT_STATUS_MAP,
  CONTRACT_STATUS_MAP,
} from "@/lib/customer-types"
import {
  Building, User, Mail, Phone, Globe, MapPin,
  FileText, ShieldCheck, Briefcase, MessageSquare,
  ClipboardList, Package, Palette, ScrollText,
  AlertTriangle, Clock, Star, Download, Plus,
  Pencil, CheckCircle, XCircle, CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type TabKey = "overview" | "contacts" | "addresses" | "brands" | "documents" | "contracts" | "briefs" | "complaints" | "contact-logs" | "fda" | "lots"

interface CustomerDetailPanelProps {
  detail: CustomerDetail | null
  customerName?: string
}

// --- KPI Stat Card ---
function StatCard({ value, label, sub, color }: { value: string; label: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
      <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[9px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

// --- Info Field ---
function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-dashed border-border last:border-b-0">
      <span className="text-[11px] font-medium text-muted-foreground w-[120px] shrink-0">{label}</span>
      <span className={cn("text-[12px] text-foreground", mono && "font-mono")}>{value || "\u2014"}</span>
    </div>
  )
}

export function CustomerDetailPanel({ detail, customerName }: CustomerDetailPanelProps) {
  const [tab, setTab] = useState<TabKey>("overview")

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        {customerName ? "Loading customer details..." : "Select a customer from the list"}
      </div>
    )
  }

  const tierInfo = TIER_MAP[detail.customerTier]
  const typeInfo = CUSTOMER_TYPE_MAP[detail.customerType]
  const creditPct = detail.creditLimit ? Math.round((detail.creditUsed ?? 0) / detail.creditLimit * 100) : 0

  const tabs: { key: TabKey; label: string; badge?: string; badgeColor?: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "contacts", label: "Contacts", badge: String(detail.contacts.length), badgeColor: "bg-[#eef4ff] text-primary" },
    { key: "addresses", label: "Addresses", badge: String(detail.addresses.length), badgeColor: "bg-[#eef4ff] text-primary" },
    { key: "brands", label: "Brands", badge: String(detail.brands.length), badgeColor: "bg-[#f5f3ff] text-[#7c3aed]" },
    { key: "documents", label: "Documents", badge: String(detail.documents.length), badgeColor: "bg-secondary text-muted-foreground" },
    { key: "contracts", label: "Contracts", badge: String(detail.contracts.length), badgeColor: "bg-[#ecfdf5] text-[#15803d]" },
    { key: "briefs", label: "Briefs", badge: String(detail.briefs.length), badgeColor: "bg-[#eff6ff] text-[#2563eb]" },
    { key: "complaints", label: "Complaints", badge: detail.complaints.length > 0 ? String(detail.complaints.length) : undefined, badgeColor: "bg-[#fef2f2] text-destructive" },
    { key: "contact-logs", label: "Contact Logs" },
    { key: "fda", label: "FDA" },
    { key: "lots", label: "Lots" },
  ]

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden relative">
      {/* Gradient accent */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-[#eef4ff]/60 to-transparent z-0" />

      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-border bg-card/80 backdrop-blur-sm z-10 relative">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold", typeInfo.bg, typeInfo.color)}>
            {detail.customerType === "juristic" ? <Building className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-extrabold text-foreground truncate">{detail.customerName}</h1>
              {detail.isActive && <CheckCircle className="h-4 w-4 text-[#15803d] shrink-0" />}
            </div>
            <p className="text-[12px] font-mono text-muted-foreground mb-1.5">{detail.customerCode}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold border", tierInfo.color, tierInfo.bg, tierInfo.border)}>{tierInfo.label}</span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold", typeInfo.color, typeInfo.bg)}>{typeInfo.label}</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">{BUSINESS_TYPE_MAP[detail.businessType]}</span>
            </div>
          </div>

          {/* Right -- Credit Meter + Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Pencil className="h-3 w-3" /> Edit</Button>
            </div>
            {detail.creditLimit && (
              <div className="w-[160px]">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Credit Used</span>
                  <span className="font-bold text-foreground">{creditPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", creditPct > 80 ? "bg-destructive" : creditPct > 50 ? "bg-[#f59e0b]" : "bg-[#15803d]")}
                    style={{ width: `${Math.min(creditPct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                  <span>{"\u0e3f"}{((detail.creditUsed ?? 0) / 1000).toFixed(0)}K used</span>
                  <span>{"\u0e3f"}{(detail.creditLimit / 1000).toFixed(0)}K limit</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <StatCard value={String(detail.totalOrders)} label="Orders" color="#4c8bf5" />
          <StatCard value={`${"\u0e3f"}${(detail.totalRevenue / 1000000).toFixed(1)}M`} label="Revenue" color="#15803d" />
          <StatCard value={String(detail.productCount)} label="Products" color="#7c3aed" />
          <StatCard value={String(detail.brandCount)} label="Brands" color="#f59e0b" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="shrink-0 border-b border-border bg-card/60 backdrop-blur-sm px-6 z-10 relative">
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[12px] font-semibold border-b-2 transition-colors shrink-0",
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.badge && (
                <span className={cn("rounded-full px-1.5 py-px text-[9px] font-bold", t.badgeColor)}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 z-10 relative">
        {tab === "overview" && <OverviewTab detail={detail} />}
        {tab === "contacts" && <ContactsTab contacts={detail.contacts} />}
        {tab === "addresses" && <AddressesTab addresses={detail.addresses} />}
        {tab === "brands" && <BrandsTab brands={detail.brands} />}
        {tab === "documents" && <DocumentsTab documents={detail.documents} />}
        {tab === "contracts" && <ContractsTab contracts={detail.contracts} />}
        {tab === "briefs" && <BriefsTab briefs={detail.briefs} />}
        {tab === "complaints" && <ComplaintsTab complaints={detail.complaints} />}
        {tab === "contact-logs" && <ContactLogsTab logs={detail.contactLogs} />}
        {tab === "fda" && <PlaceholderTab label="FDA Registrations" description="FDA registration linking will be available in a future update." />}
        {tab === "lots" && <PlaceholderTab label="Lots & Batches" description="Lot tracking and cross-module views will be available in a future update." />}
      </div>
    </div>
  )
}

// ===================== Overview Tab =====================
function OverviewTab({ detail }: { detail: CustomerDetail }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Basic Info */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Basic Info</h3>
        <Field label="Customer Code" value={detail.customerCode} mono />
        <Field label="Name (TH)" value={detail.customerName} />
        <Field label="Name (EN)" value={detail.customerNameEn} />
        <Field label="Type" value={CUSTOMER_TYPE_MAP[detail.customerType].label} />
        <Field label="Tier" value={TIER_MAP[detail.customerTier].label} />
        <Field label="Business Type" value={BUSINESS_TYPE_MAP[detail.businessType]} />
        <Field label="Lead Source" value={detail.leadSource} />
        <Field label="Sales Rep" value={detail.salesRepresentative} />
      </div>

      {/* Contact Info */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Contact Info</h3>
        <Field label="Contact Person" value={detail.contactPerson} />
        <Field label="Email" value={detail.email} />
        <Field label="Phone" value={detail.phone} />
        <Field label="Fax" value={detail.fax} />
        <Field label="LINE ID" value={detail.lineId} />
        <Field label="Website" value={detail.website} />
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Address</h3>
        <Field label="Address" value={detail.address} />
        <Field label="City" value={detail.city} />
        <Field label="Province" value={detail.province} />
        <Field label="Postal Code" value={detail.postalCode} />
        <Field label="Country" value={detail.country} />
      </div>

      {/* Tax & Credit */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Tax & Credit</h3>
        <Field label="Tax ID" value={detail.taxId} mono />
        <Field label="Branch Code" value={detail.branchCode} mono />
        <Field label="Credit Limit" value={detail.creditLimit ? `\u0e3f${detail.creditLimit.toLocaleString()}` : undefined} />
        <Field label="Credit Days" value={detail.creditDays ? `${detail.creditDays} days` : undefined} />
        <Field label="Credit Used" value={detail.creditUsed != null ? `\u0e3f${detail.creditUsed.toLocaleString()}` : undefined} />
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-border bg-card p-5 md:col-span-2">
        <h3 className="text-[13px] font-bold text-foreground mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Notes & Metadata</h3>
        <Field label="Notes" value={detail.notes} />
        <Field label="Created" value={detail.createdAt} />
        <Field label="Updated" value={detail.updatedAt} />
      </div>
    </div>
  )
}

// ===================== Contacts Tab =====================
function ContactsTab({ contacts }: { contacts: CustomerDetail["contacts"] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Contacts ({contacts.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> Add Contact</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="bg-secondary/60 text-left">
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Position</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Email</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Phone</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Dept</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground text-center">Primary</th>
          </tr></thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{c.contactName}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.position || "\u2014"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email || "\u2014"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone || "\u2014"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.department || "\u2014"}</td>
                <td className="px-4 py-3 text-center">
                  {c.isPrimary && <span className="inline-flex rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[9px] font-bold text-[#15803d]">Primary</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===================== Addresses Tab =====================
function AddressesTab({ addresses }: { addresses: CustomerDetail["addresses"] }) {
  const typeLabel: Record<string, string> = {
    registered: "Registered", shipping: "Shipping", billing: "Billing",
    branch: "Branch", warehouse: "Warehouse", factory: "Factory",
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Addresses ({addresses.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> Add Address</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map(a => (
          <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[10px] font-bold text-primary">{typeLabel[a.addressType] || a.addressType}</span>
              {a.isDefault && <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[9px] font-bold text-[#15803d]">Default</span>}
              {a.isFdaApproved && <span className="rounded-full bg-[#fffbeb] px-2 py-0.5 text-[9px] font-bold text-[#d97706]">FDA</span>}
            </div>
            <p className="text-[12px] font-semibold text-foreground">{a.addressName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{a.addressLine1}</p>
            <p className="text-[11px] text-muted-foreground">{[a.province, a.postalCode, a.country].filter(Boolean).join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================== Brands Tab =====================
function BrandsTab({ brands }: { brands: CustomerDetail["brands"] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Brands ({brands.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> Add Brand</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {brands.map(b => (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-xl"
              style={{ backgroundColor: b.brandColor || "#e5e7eb" }}
            />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{b.brandName}</p>
              {b.brandNameEn && b.brandNameEn !== b.brandName && (
                <p className="text-[10px] text-muted-foreground">{b.brandNameEn}</p>
              )}
              {b.brandCategory && <span className="inline-block mt-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-muted-foreground">{b.brandCategory}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===================== Documents Tab =====================
function DocumentsTab({ documents }: { documents: CustomerDetail["documents"] }) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return "\u2014"
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
    return `${(bytes / 1_000).toFixed(0)} KB`
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Documents ({documents.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> Upload</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="bg-secondary/60 text-left">
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Title</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">File</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Size</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Created</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground w-10"></th>
          </tr></thead>
          <tbody>
            {documents.map(d => (
              <tr key={d.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3"><span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-bold text-primary capitalize">{d.documentType}</span></td>
                <td className="px-4 py-3 font-semibold text-foreground">{d.title}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{d.fileName}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatSize(d.fileSize)}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.createdAt}</td>
                <td className="px-4 py-3"><button className="text-muted-foreground hover:text-primary"><Download className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===================== Contracts Tab =====================
function ContractsTab({ contracts }: { contracts: CustomerDetail["contracts"] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Contracts ({contracts.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> New Contract</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="bg-secondary/60 text-left">
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Number</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Type</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Period</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground text-center">Auto Renew</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">Value</th>
          </tr></thead>
          <tbody>
            {contracts.map(c => {
              const st = CONTRACT_STATUS_MAP[c.status]
              return (
                <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-foreground">{c.contractNumber}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{c.contractName}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{c.contractType.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", st.color, st.bg)}>{st.label}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.startDate} ~ {c.endDate}</td>
                  <td className="px-4 py-3 text-center">{c.autoRenew ? <CheckCircle className="inline h-3.5 w-3.5 text-[#15803d]" /> : <XCircle className="inline h-3.5 w-3.5 text-muted-foreground" />}</td>
                  <td className="px-4 py-3 text-right font-semibold">{c.totalValue ? `\u0e3f${c.totalValue.toLocaleString()}` : "\u2014"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===================== Briefs Tab =====================
function BriefsTab({ briefs }: { briefs: CustomerDetail["briefs"] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Briefs ({briefs.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> New Brief</Button>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="bg-secondary/60 text-left">
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Number</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Title</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Product Type</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Assigned</th>
            <th className="px-4 py-2.5 font-semibold text-muted-foreground">Created</th>
          </tr></thead>
          <tbody>
            {briefs.map(b => {
              const st = BRIEF_STATUS_MAP[b.status]
              return (
                <tr key={b.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-foreground">{b.briefNumber}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{b.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.productType || "\u2014"}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", st.color, st.bg)}>{st.label}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{b.assignedTo || "\u2014"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.createdAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ===================== Complaints Tab =====================
function ComplaintsTab({ complaints }: { complaints: CustomerDetail["complaints"] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Complaints ({complaints.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> New Complaint</Button>
      </div>
      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CheckCircle className="h-10 w-10 mb-2 text-[#15803d]/30" />
          <p className="text-[13px] font-semibold">No complaints recorded</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-[12px]">
            <thead><tr className="bg-secondary/60 text-left">
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Number</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Category</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Severity</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Assigned</th>
              <th className="px-4 py-2.5 font-semibold text-muted-foreground">Reported</th>
            </tr></thead>
            <tbody>
              {complaints.map(c => {
                const sev = COMPLAINT_SEVERITY_MAP[c.severity]
                const st = COMPLAINT_STATUS_MAP[c.status]
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-foreground">{c.complaintNumber}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{c.title || "\u2014"}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{c.category.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", sev.color, sev.bg)}>{sev.label}</span></td>
                    <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", st.color, st.bg)}>{st.label}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.assignedTo || "\u2014"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.reportedDate || "\u2014"}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ===================== Contact Logs Tab =====================
function ContactLogsTab({ logs }: { logs: CustomerDetail["contactLogs"] }) {
  const channelIcon: Record<string, typeof Phone> = {
    phone: Phone, email: Mail, line: MessageSquare, meeting: Building,
    video_call: Globe, site_visit: MapPin,
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Contact Logs ({logs.length})</h3>
        <Button size="sm" className="h-8 rounded-lg text-[11px] gap-1.5"><Plus className="h-3 w-3" /> Log Contact</Button>
      </div>
      <div className="space-y-3">
        {logs.map(l => {
          const Icon = channelIcon[l.channel] || MessageSquare
          return (
            <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff]">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-[13px] font-bold text-foreground truncate">{l.subject}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{l.contactDate}</span>
                  </div>
                  {l.summary && <p className="text-[11px] text-muted-foreground mb-1.5">{l.summary}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="capitalize rounded-full bg-secondary px-2 py-0.5 font-bold">{l.channel.replace(/_/g, " ")}</span>
                    {l.contactName && <span>Contact: {l.contactName}</span>}
                    {l.internalUser && <span>By: {l.internalUser}</span>}
                  </div>
                  {l.followUpDate && (
                    <div className={cn("mt-2 flex items-center gap-1.5 text-[10px] font-semibold rounded-lg px-2.5 py-1 w-fit",
                      l.isFollowUpDone ? "bg-[#ecfdf5] text-[#15803d]" : "bg-[#fef2f2] text-destructive"
                    )}>
                      <CalendarDays className="h-3 w-3" />
                      Follow-up: {l.followUpDate}
                      {l.isFollowUpDone ? " (Done)" : " (Pending)"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===================== Placeholder Tab =====================
function PlaceholderTab({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <ScrollText className="h-12 w-12 mb-3 opacity-20" />
      <h3 className="text-sm font-bold mb-1">{label}</h3>
      <p className="text-[12px]">{description}</p>
    </div>
  )
}
