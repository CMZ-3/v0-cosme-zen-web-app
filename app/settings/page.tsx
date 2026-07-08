"use client"

import { Settings, Building2, Users, Bell, ShieldCheck, Palette, ChevronRight } from "lucide-react"

const sections = [
  { label: "Company Profile", desc: "Factory name, address, tax ID, logo", icon: Building2 },
  { label: "Users & Roles", desc: "Manage team members and permissions", icon: Users },
  { label: "Notifications", desc: "Stock alerts, FDA expiry, order updates", icon: Bell },
  { label: "Security", desc: "Password, two-factor authentication, sessions", icon: ShieldCheck },
  { label: "Appearance", desc: "Theme, language (TH / EN), density", icon: Palette },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6">
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

      <div className="max-w-2xl rounded-2xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.label}
              type="button"
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-4.5 w-4.5 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-foreground">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
