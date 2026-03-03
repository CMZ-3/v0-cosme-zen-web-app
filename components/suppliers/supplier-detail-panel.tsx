"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { SupplierDetail } from "@/lib/supplier-types"
import { SUPPLIER_TYPE_MAP, CERT_STATUS_MAP } from "@/lib/supplier-types"
import {
  MapPin, Phone, Mail, Globe, FileText, Shield, Package, ShoppingCart,
  BarChart3, FolderOpen, ChevronRight, Download, ExternalLink, Clock,
  User, Building, Star, CheckCircle, AlertTriangle, XCircle, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

type TabKey = "products" | "overview" | "catalog" | "coa" | "orders" | "performance" | "documents"

interface SupplierDetailPanelProps {
  detail: SupplierDetail | null
  supplierName?: string
}

// --- Score Ring SVG ---
function ScoreRing({ value, max, color, label }: { value: number | string; max?: number; color: string; label: string }) {
  const numVal = typeof value === "number" ? value : parseFloat(String(value))
  const pct = max ? numVal / max : numVal / 100
  const circumference = 2 * Math.PI * 20
  const offset = circumference * (1 - Math.min(pct, 1))
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3.5 shadow-sm w-[100px]">
      <div className="relative flex h-[50px] w-[50px] items-center justify-center">
        <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-border" />
          <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="4" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <span className="text-base font-extrabold" style={{ color }}>{value}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

// --- Trade Conditions Card ---
function TradeCard({ paymentTerms, leadTime, moq, ytdOrder }: { paymentTerms?: string; leadTime?: number; moq?: string; ytdOrder?: number }) {
  const items = [
    { val: paymentTerms || "--", sub: "Payment" },
    { val: leadTime ? `${leadTime} days` : "--", sub: "Lead Time" },
    { val: moq || "--", sub: "MOQ" },
    { val: ytdOrder ? `\u0e3f${(ytdOrder / 1000).toFixed(0)}K` : "--", sub: "YTD Order" },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm w-[230px]">
      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Trade Conditions</div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it, i) => (
          <div key={i} className="rounded-lg bg-secondary/70 p-2">
            <div className="text-sm font-extrabold tracking-tight text-foreground">{it.val}</div>
            <div className="text-[9px] font-semibold uppercase text-muted-foreground mt-0.5">{it.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SupplierDetailPanel({ detail, supplierName }: SupplierDetailPanelProps) {
  const [tab, setTab] = useState<TabKey>("overview")

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        {supplierName ? `Select a supplier to see details` : "Select a supplier from the list"}
      </div>
    )
  }

  const flag = detail.country === "Japan" ? "\u{1f1ef}\u{1f1f5}" :
    detail.country === "Germany" ? "\u{1f1e9}\u{1f1ea}" :
    detail.country === "Korea" ? "\u{1f1f0}\u{1f1f7}" :
    detail.country === "China" ? "\u{1f1e8}\u{1f1f3}" :
    detail.country === "Thailand" ? "\u{1f1f9}\u{1f1ed}" : ""

  const typeInfo = SUPPLIER_TYPE_MAP[detail.supplierType]
  const avgRating = detail.qualityRating && detail.deliveryRating && detail.priceRating
    ? ((detail.qualityRating + detail.deliveryRating + detail.priceRating) / 3).toFixed(1)
    : "--"

  const tabs: { key: TabKey; label: string; badge?: string; badgeColor?: string }[] = [
    { key: "products", label: "Products & Packages", badge: String(detail.catalogItems.length), badgeColor: "bg-[#eef4ff] text-primary" },
    { key: "overview", label: "Overview" },
    { key: "catalog", label: "Catalog", badge: String(detail.catalogItems.length), badgeColor: "bg-[#eef4ff] text-[#0369a1]" },
    { key: "coa", label: "COA Tracker", badge: detail.certificates.some(c => c.status === "expired") ? "!" : undefined, badgeColor: "bg-[#fef2f2] text-destructive" },
    { key: "orders", label: "Orders" },
    { key: "performance", label: "Performance" },
    { key: "documents", label: "Documents" },
  ]

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
      {/* Subtle gradient accent */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[350px] bg-gradient-to-bl from-[#eef4ff]/70 to-transparent z-0" />

      {/* Header */}
      <div className="px-8 pt-6 z-10 flex-shrink-0">
        <div className="flex justify-between items-start mb-5 gap-5">
          {/* Left: Avatar + Info */}
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-[#eef4ff] text-3xl">
              {flag || "S"}
              {detail.isApproved && (
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#10b981] text-[11px] font-extrabold text-card border-2 border-card">
                  <CheckCircle className="h-3 w-3" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-[22px] font-extrabold tracking-tight text-foreground text-balance">{detail.supplierName}</h1>
                <span className="rounded-full border border-[#bbf7d0] bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">
                  Verified Supplier
                </span>
              </div>
              <div className="flex flex-wrap gap-3.5 text-[12px] text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {detail.city}, {detail.country}</span>
                {detail.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {detail.phone}</span>}
                {detail.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {detail.email}</span>}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", typeInfo.bg, typeInfo.color)}>{typeInfo.label}</span>
                {detail.materialTags.map((tag, i) => (
                  <span key={i} className={cn("rounded-md border border-transparent px-2 py-0.5 text-[10px] font-bold", tag.bg, tag.color)}>{tag.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Scores + Trade */}
          <div className="flex gap-3.5 flex-shrink-0">
            <ScoreRing value={avgRating} max={5} color="#10b981" label="Rating" />
            <ScoreRing value={`${detail.onTimeDeliveryPct ?? 0}%`} max={100} color="#4c8bf5" label="On-Time" />
            <TradeCard
              paymentTerms={detail.paymentTerms}
              leadTime={detail.avgLeadTimeDays}
              moq={detail.moq}
              ytdOrder={detail.ytdOrderValue}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border -mx-8 px-8">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "py-3 px-5 text-[13px] font-semibold border-b-2 transition-all whitespace-nowrap",
                tab === t.key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {t.label}
              {t.badge && (
                <span className={cn("ml-1.5 rounded-full px-1.5 py-px text-[10px] font-bold", t.badgeColor)}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 z-10">
        {tab === "overview" && <OverviewTab detail={detail} />}
        {tab === "products" && <ProductsTab detail={detail} />}
        {tab === "catalog" && <CatalogTab detail={detail} />}
        {tab === "coa" && <COATrackerTab detail={detail} />}
        {tab === "orders" && <PlaceholderTab label="Orders" />}
        {tab === "performance" && <PlaceholderTab label="Performance" />}
        {tab === "documents" && <DocumentsTab detail={detail} />}
      </div>
    </div>
  )
}

// ─── OVERVIEW TAB ────────────────────────────
function OverviewTab({ detail }: { detail: SupplierDetail }) {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3.5">
        <KPIMini icon={<Package className="h-4 w-4" />} bg="bg-[#e0f7f5]" label="Materials" value={String(detail.catalogItems.length)} />
        <KPIMini icon={<ShoppingCart className="h-4 w-4" />} bg="bg-[#f3efff]" label="YTD Orders" value={detail.ytdOrderValue ? `\u0e3f${(detail.ytdOrderValue / 1000).toFixed(0)}K` : "--"} />
        <KPIMini icon={<Shield className="h-4 w-4" />} bg="bg-[#fef3c7]" label="Certificates" value={String(detail.certificates.length)} />
        <KPIMini icon={<FileText className="h-4 w-4" />} bg="bg-[#fdf2f8]" label="Documents" value={String(detail.documents.length)} />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Company Info */}
          <SectionCard title="Company Information">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Code" value={detail.supplierCode} mono />
              <Field label="Type" value={SUPPLIER_TYPE_MAP[detail.supplierType].label} />
              <Field label="Name (EN)" value={detail.supplierNameEn} />
              <Field label="Tax ID" value={detail.taxId} />
              <Field label="Country" value={detail.country} />
              <Field label="Branch" value={detail.branchCode} />
              <Field label="Website" value={detail.website} link />
              <Field label="Fax" value={detail.fax} />
            </div>
          </SectionCard>

          {/* Address */}
          <SectionCard title="Addresses" count={detail.addresses.length}>
            <div className="space-y-2">
              {detail.addresses.map(addr => (
                <div key={addr.id} className="flex items-start gap-3 rounded-xl bg-secondary/50 p-3.5">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-foreground">{addr.addressName}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{addr.addressLine1}</div>
                    {addr.province && <div className="text-[11px] text-muted-foreground">{addr.province} {addr.postalCode}</div>}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">{addr.addressType}</span>
                    {addr.isDefault && <span className="rounded-md bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">Default</span>}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Payment & Terms */}
          <SectionCard title="Payment & Terms">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <Field label="Payment Terms" value={detail.paymentTerms} />
              <Field label="Payment Days" value={detail.paymentDays ? `${detail.paymentDays} days` : undefined} />
              <Field label="Avg Lead Time" value={detail.avgLeadTimeDays ? `${detail.avgLeadTimeDays} days` : undefined} />
              <Field label="Min Order Qty" value={detail.moq} />
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Contacts */}
          <SectionCard title="Contacts" count={detail.contacts.length}>
            <div className="divide-y divide-border">
              {detail.contacts.map(contact => {
                const initials = contact.contactName.split(" ").map(w => w[0]).join("").slice(0, 2)
                return (
                  <div key={contact.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[12px] font-bold text-primary flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                        {contact.contactName}
                        {contact.isPrimary && <span className="rounded bg-[#ecfdf5] px-1.5 py-px text-[9px] font-bold text-[#15803d]">Primary</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {contact.position}{contact.email ? ` \u00B7 ${contact.email}` : ""}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {contact.phone && (
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4ff] text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Phone className="h-3 w-3" />
                        </button>
                      )}
                      {contact.email && (
                        <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4ff] text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Mail className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* Certificates */}
          <SectionCard title="Certificates" count={detail.certificates.length}>
            <div className="space-y-2">
              {detail.certificates.map(cert => {
                const st = CERT_STATUS_MAP[cert.status]
                const isExpiring = cert.daysRemaining !== undefined && cert.daysRemaining > 0 && cert.daysRemaining <= 30
                return (
                  <div key={cert.id} className={cn(
                    "flex items-center justify-between rounded-xl p-3.5 border-l-4",
                    cert.status === "expired" ? "border-l-destructive bg-[#fef2f2]/40 border border-[#fecaca]" :
                    isExpiring ? "border-l-[#f59e0b] bg-[#fef3c7]/30 border border-[#fed7aa]" :
                    "border-l-[#10b981] border border-border bg-card"
                  )}>
                    <div>
                      <div className="text-[13px] font-bold text-foreground">{cert.certificateType}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {cert.expiryDate ? `Exp: ${cert.expiryDate}` : "No expiry"}
                        {cert.daysRemaining !== undefined && (
                          <span className={cn("ml-1.5 font-bold", cert.daysRemaining < 0 ? "text-destructive" : isExpiring ? "text-[#f59e0b]" : "text-[#10b981]")}>
                            ({cert.daysRemaining < 0 ? "Expired" : `${cert.daysRemaining}d left`})
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold border", st.bg, st.color, st.border)}>
                      {st.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* Notes */}
          {detail.notes && (
            <div className="rounded-2xl border border-[#f59e0b]/15 bg-[#fef3c7] p-4">
              <div className="text-[10px] font-bold uppercase text-[#92400e] mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Notes
              </div>
              <p className="text-[12px] text-[#78350f] leading-relaxed">{detail.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── PRODUCTS TAB ────────────────────────────
function ProductsTab({ detail }: { detail: SupplierDetail }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-extrabold text-foreground">Products & Packaging from {detail.supplierName.split(" ")[0]}</h3>
        <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {detail.catalogItems.map(item => (
          <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="h-[160px] bg-gradient-to-br from-secondary to-[#eef4ff] flex items-center justify-center text-5xl relative">
              <Package className="h-12 w-12 text-muted-foreground/40" />
              {item.coaStatus === "valid" && (
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#ecfdf5] border border-[#bbf7d0] px-2 py-0.5 text-[10px] font-bold text-[#15803d]">Active</span>
              )}
            </div>
            <div className="p-3.5">
              <div className="text-[13px] font-bold text-foreground mb-1">{item.stockItemName}</div>
              <div className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
                INCI: {item.inci || "N/A"} &middot; Purity: {item.purity || "N/A"}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[13px] font-bold text-primary">
                    {item.currency === "JPY" ? "\u00A5" : "\u0e3f"}{item.unitPrice?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground"> / {item.unit || "kg"}</span>
                </div>
                {item.coaStatus && (
                  <span className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    item.coaStatus === "valid" ? "bg-[#ecfdf5] text-[#15803d]" :
                    item.coaStatus === "expiring" ? "bg-[#fef3c7] text-[#c2410c]" :
                    "bg-[#fef2f2] text-[#b91c1c]"
                  )}>
                    COA {item.coaStatus === "valid" ? "\u2713" : item.coaStatus === "expiring" ? "!" : "\u2717"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── CATALOG TAB ────────────────────────────
function CatalogTab({ detail }: { detail: SupplierDetail }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-extrabold">Catalog / Raw Materials</h3>
        <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/70">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Material</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">INCI</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit Price</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lead Time</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">MOQ</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">COA</th>
            </tr>
          </thead>
          <tbody>
            {detail.catalogItems.map(item => (
              <tr key={item.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="text-[13px] font-bold text-foreground">{item.stockItemName}</div>
                  <div className="text-[10px] text-muted-foreground">{item.purity}</div>
                </td>
                <td className="px-4 py-3.5 text-[12px] text-muted-foreground max-w-[200px] truncate">{item.inci || "--"}</td>
                <td className="px-4 py-3.5 text-right font-mono text-[13px] font-bold text-primary">
                  {item.currency === "JPY" ? "\u00A5" : "\u0e3f"}{item.unitPrice?.toLocaleString() ?? "--"}
                </td>
                <td className="px-4 py-3.5 text-center text-[12px] text-foreground">{item.leadTimeDays ? `${item.leadTimeDays}d` : "--"}</td>
                <td className="px-4 py-3.5 text-right text-[12px] text-foreground">{item.minOrderQty ? `${item.minOrderQty} ${item.unit || "kg"}` : "--"}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-bold",
                    item.coaStatus === "valid" ? "bg-[#ecfdf5] text-[#15803d]" :
                    item.coaStatus === "expiring" ? "bg-[#fef3c7] text-[#c2410c]" :
                    item.coaStatus === "expired" ? "bg-[#fef2f2] text-[#b91c1c]" :
                    "bg-secondary text-muted-foreground"
                  )}>
                    {item.coaStatus === "valid" ? "Valid" : item.coaStatus === "expiring" ? "Expiring" : item.coaStatus === "expired" ? "Expired" : "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── COA TRACKER TAB ────────────────────────
function COATrackerTab({ detail }: { detail: SupplierDetail }) {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-extrabold">COA & Certificate Tracker</h3>
        <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Certificate</Button>
      </div>
      {detail.certificates.map(cert => {
        const st = CERT_STATUS_MAP[cert.status]
        const isExpiring = cert.daysRemaining !== undefined && cert.daysRemaining > 0 && cert.daysRemaining <= 30
        return (
          <div key={cert.id} className={cn(
            "rounded-2xl border p-5 border-l-4 transition-all hover:shadow-sm",
            cert.status === "expired" ? "border-l-destructive bg-[#fef2f2]/20 border-[#fecaca]" :
            isExpiring ? "border-l-[#f59e0b] bg-[#fef3c7]/10 border-[#fed7aa]" :
            "border-l-[#10b981] border-border bg-card"
          )}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[15px] font-bold text-foreground">{cert.certificateName}</div>
                <div className="text-[12px] text-muted-foreground mt-1 space-y-0.5">
                  {cert.certificateNumber && <div>No: {cert.certificateNumber}</div>}
                  {cert.issuingBody && <div>Issued by: {cert.issuingBody}</div>}
                  <div>Issue: {cert.issueDate || "--"} &rarr; Expiry: {cert.expiryDate || "--"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cert.daysRemaining !== undefined && (
                  <span className={cn("text-[12px] font-bold",
                    cert.daysRemaining < 0 ? "text-destructive" : isExpiring ? "text-[#f59e0b]" : "text-[#10b981]"
                  )}>
                    {cert.daysRemaining < 0 ? `${Math.abs(cert.daysRemaining)}d overdue` : `${cert.daysRemaining}d left`}
                  </span>
                )}
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold border", st.bg, st.color, st.border)}>
                  {st.label}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DOCUMENTS TAB ──────────────────────────
function DocumentsTab({ detail }: { detail: SupplierDetail }) {
  const typeColors: Record<string, { bg: string; color: string }> = {
    contract: { bg: "bg-[#eef4ff]", color: "text-[#0369a1]" },
    coa: { bg: "bg-[#ecfdf5]", color: "text-[#15803d]" },
    msds: { bg: "bg-[#fef3c7]", color: "text-[#c2410c]" },
    specification: { bg: "bg-[#f3efff]", color: "text-[#6d28d9]" },
    test_report: { bg: "bg-[#fdf2f8]", color: "text-[#ec4899]" },
    license: { bg: "bg-[#ccfbf1]", color: "text-[#14b8a6]" },
    invoice: { bg: "bg-secondary", color: "text-foreground" },
    other: { bg: "bg-secondary", color: "text-muted-foreground" },
  }

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-extrabold">Documents</h3>
        <Button size="sm" variant="outline" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Upload</Button>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/70">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Size</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="text-center px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {detail.documents.map(doc => {
              const tc = typeColors[doc.documentType] || typeColors.other
              return (
                <tr key={doc.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="text-[13px] font-bold text-foreground">{doc.title}</div>
                    <div className="text-[10px] text-muted-foreground">{doc.fileName}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", tc.bg, tc.color)}>
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[12px] text-muted-foreground">
                    {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB` : "--"}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{doc.createdAt}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef4ff] text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── PLACEHOLDER TAB ────────────────────────
function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-40 text-[13px] text-muted-foreground animate-in fade-in-0 duration-300">
      {label} content will be available in a future update.
    </div>
  )
}

// ─── HELPER COMPONENTS ──────────────────────
function KPIMini({ icon, bg, label, value }: { icon: React.ReactNode; bg: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("flex h-[42px] w-[42px] items-center justify-center rounded-[10px] flex-shrink-0 text-foreground", bg)}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
        <div className="text-lg font-extrabold tracking-tight text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  )
}

function SectionCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[14px] font-bold text-foreground">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value, mono, link }: { label: string; value?: string | null; mono?: boolean; link?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">{label}</div>
      {link && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-primary hover:underline flex items-center gap-1">
          {value} <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <div className={cn("text-[13px] font-medium text-foreground", mono && "font-mono")}>{value || "\u2014"}</div>
      )}
    </div>
  )
}
