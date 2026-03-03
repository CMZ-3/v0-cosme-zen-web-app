"use client"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={cn(
          "flex-1 min-w-0 transition-all duration-200",
          collapsed ? "ml-16" : "ml-[230px]"
        )}
      >
        {children}
      </main>
    </div>
  )
}
