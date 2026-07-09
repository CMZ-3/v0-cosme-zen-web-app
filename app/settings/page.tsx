"use client"

import { useState } from "react"
import {
  Settings, Building2, Users, Bell, ShieldCheck, Palette, ChevronRight, ChevronDown,
  Save, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type SectionKey = "company" | "notifications" | "appearance" | "security" | "users"

export default function SettingsPage() {
  const [open, setOpen] = useState<SectionKey | null>("company")

  const toggle = (key: SectionKey) => setOpen((prev) => (prev === key ? null : key))

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Settings</h1>
          <p className="text-[12px] text-muted-foreground">Manage your workspace preferences</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        <SettingSection
          id="company"
          label="Company Profile"
          desc="Factory name, address, tax ID, logo"
          icon={Building2}
          open={open === "company"}
          onToggle={() => toggle("company")}
        >
          <CompanyProfileForm />
        </SettingSection>

        <SettingSection
          id="notifications"
          label="Notifications"
          desc="Stock alerts, FDA expiry, order updates"
          icon={Bell}
          open={open === "notifications"}
          onToggle={() => toggle("notifications")}
        >
          <NotificationsForm />
        </SettingSection>

        <SettingSection
          id="appearance"
          label="Appearance"
          desc="Theme, language (TH / EN), density"
          icon={Palette}
          open={open === "appearance"}
          onToggle={() => toggle("appearance")}
        >
          <AppearanceForm />
        </SettingSection>

        <SettingSection
          id="users"
          label="Users & Roles"
          desc="Manage team members and permissions"
          icon={Users}
          open={open === "users"}
          onToggle={() => toggle("users")}
        >
          <UsersSection />
        </SettingSection>

        <SettingSection
          id="security"
          label="Security"
          desc="Password, two-factor authentication, sessions"
          icon={ShieldCheck}
          open={open === "security"}
          onToggle={() => toggle("security")}
        >
          <SecurityForm />
        </SettingSection>
      </div>
    </div>
  )
}

function SettingSection({
  id,
  label,
  desc,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  id: SectionKey
  label: string
  desc: string
  icon: React.ElementType
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shrink-0">
          <Icon className="h-4.5 w-4.5 text-muted-foreground" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground">{desc}</div>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-border bg-secondary/20 px-5 py-5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Company Profile ──────────────────────────────────────────────────────────
function CompanyProfileForm() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    companyName: "CosmeZen",
    companyNameEn: "CosmeZen Co., Ltd.",
    taxId: "0105566123456",
    address: "123/45 ถ.นิมิตรใหม่ แขวงมีนบุรี เขตมีนบุรี",
    city: "กรุงเทพมหานคร",
    postcode: "10510",
    phone: "02-123-4567",
    email: "info@cosmezen.co.th",
    website: "https://cosmezen.co.th",
  })

  const handleSave = () => {
    setSaved(true)
    toast.success("Company profile saved")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="ชื่อบริษัท (TH)" id="companyName">
          <Input id="companyName" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
        <FormField label="Company Name (EN)" id="companyNameEn">
          <Input id="companyNameEn" value={form.companyNameEn} onChange={(e) => setForm({ ...form, companyNameEn: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
        <FormField label="เลขประจำตัวผู้เสียภาษี (Tax ID)" id="taxId">
          <Input id="taxId" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="h-9 rounded-xl text-[12px] font-mono" />
        </FormField>
        <FormField label="โทรศัพท์" id="phone">
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
        <FormField label="อีเมล" id="email">
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
        <FormField label="เว็บไซต์" id="website">
          <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
      </div>
      <FormField label="ที่อยู่" id="address">
        <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-9 rounded-xl text-[12px]" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="จังหวัด / เมือง" id="city">
          <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-9 rounded-xl text-[12px]" />
        </FormField>
        <FormField label="รหัสไปรษณีย์" id="postcode">
          <Input id="postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="h-9 rounded-xl text-[12px] font-mono" />
        </FormField>
      </div>
      <div className="flex justify-end pt-2">
        <Button size="sm" className="gap-1.5 rounded-xl text-[12px]" onClick={handleSave}>
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}

// ─── Notifications ────────────────────────────────────────────────────────────
const NOTIFICATION_OPTIONS = [
  { key: "stockLow", label: "Low Stock Alert", desc: "Notify when item falls below minimum level" },
  { key: "stockOut", label: "Out of Stock Alert", desc: "Notify when available stock = 0" },
  { key: "fdaExpiry30", label: "FDA Expiry (30 days)", desc: "Warn when FDA license expires within 30 days" },
  { key: "fdaExpiry90", label: "FDA Expiry (90 days)", desc: "Early warning at 90 days before expiry" },
  { key: "jobOrderDue", label: "Job Order Due", desc: "Notify 3 days before job order due date" },
  { key: "deliveryDispatched", label: "Delivery Dispatched", desc: "Notify when delivery order ships" },
]

function NotificationsForm() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    stockLow: true,
    stockOut: true,
    fdaExpiry30: true,
    fdaExpiry90: false,
    jobOrderDue: true,
    deliveryDispatched: false,
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    toast.success("Notification preferences saved")
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-3">
      {NOTIFICATION_OPTIONS.map((opt) => (
        <div key={opt.key} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground">{opt.label}</p>
            <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
          </div>
          <Switch
            checked={!!prefs[opt.key]}
            onCheckedChange={(v) => setPrefs({ ...prefs, [opt.key]: v })}
          />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button size="sm" className="gap-1.5 rounded-xl text-[12px]" onClick={handleSave}>
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}

// ─── Appearance ───────────────────────────────────────────────────────────────
function AppearanceForm() {
  const [lang, setLang] = useState<"th" | "en">("th")
  const [density, setDensity] = useState<"normal" | "compact">("normal")

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[12px] font-bold text-foreground mb-2">Language</p>
        <div className="flex gap-2">
          {(["th", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "flex-1 rounded-xl border py-2.5 text-[12px] font-bold transition-all",
                lang === l
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {l === "th" ? "ภาษาไทย" : "English"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-bold text-foreground mb-2">Display Density</p>
        <div className="flex gap-2">
          {(["normal", "compact"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={cn(
                "flex-1 rounded-xl border py-2.5 text-[12px] font-bold capitalize transition-all",
                density === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5 rounded-xl text-[12px]" onClick={() => toast.success("Appearance settings saved")}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
    </div>
  )
}

// ─── Users & Roles ────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { name: "Admin User", email: "admin@cosmezen.co.th", role: "Admin", status: "active" },
  { name: "Production Manager", email: "prod@cosmezen.co.th", role: "Production", status: "active" },
  { name: "QC Officer", email: "qc@cosmezen.co.th", role: "QC", status: "active" },
  { name: "Warehouse Staff", email: "wh@cosmezen.co.th", role: "Stock", status: "inactive" },
]

const ROLE_COLORS: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Production: "bg-blue-100 text-blue-700",
  QC: "bg-emerald-100 text-emerald-700",
  Stock: "bg-amber-100 text-amber-700",
}

function UsersSection() {
  return (
    <div className="space-y-2">
      {MOCK_USERS.map((u) => (
        <div key={u.email} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-bold text-muted-foreground">
            {u.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground">{u.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{u.email}</p>
          </div>
          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", ROLE_COLORS[u.role] ?? "bg-secondary text-muted-foreground")}>
            {u.role}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold", u.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground")}>
            {u.status}
          </span>
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-[12px]" onClick={() => toast.info("User management coming soon")}>
          Invite User
        </Button>
      </div>
    </div>
  )
}

// ─── Security ────────────────────────────────────────────────────────────────
function SecurityForm() {
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")

  const handleChangePassword = () => {
    if (!currentPw || !newPw) { toast.error("Fill in all fields"); return }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return }
    toast.success("Password changed successfully")
    setCurrentPw(""); setNewPw(""); setConfirmPw("")
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] font-bold text-foreground">Change Password</p>
      <FormField label="Current Password" id="curPw">
        <Input id="curPw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-9 rounded-xl text-[12px]" placeholder="••••••••" />
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="New Password" id="newPw">
          <Input id="newPw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-9 rounded-xl text-[12px]" placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password" id="confirmPw">
          <Input id="confirmPw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-9 rounded-xl text-[12px]" placeholder="••••••••" />
        </FormField>
      </div>
      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5 rounded-xl text-[12px]" onClick={handleChangePassword}>
          <ShieldCheck className="h-3.5 w-3.5" /> Update Password
        </Button>
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function FormField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}
