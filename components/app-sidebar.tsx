"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Factory,
  ShoppingBag,
  Users,
  Truck,
  PackageCheck,
  ClipboardList,
  DollarSign,
  Settings,
  LogOut,
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  ArrowLeftRight,
  Barcode,
  ClipboardCheck,
  BellRing,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const menuItems: { label: string; icon: typeof LayoutDashboard; href: string; badge?: number }[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Job Orders", icon: ClipboardList, href: "/job-orders", badge: 5 },
  { label: "Products", icon: ShoppingBag, href: "/products" },
  { label: "Stock v3", icon: Package, href: "/stock" },
  { label: "Movements", icon: ArrowLeftRight, href: "/stock/movements" },
  { label: "Stock Check", icon: ClipboardCheck, href: "/stock/checking" },
  { label: "Alerts", icon: BellRing, href: "/stock/alerts" },
  { label: "Barcode", icon: Barcode, href: "/barcode" },
  { label: "Formulas", icon: FlaskConical, href: "/formulas" },
  { label: "Production", icon: Factory, href: "/production" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Suppliers", icon: Truck, href: "/suppliers" },
  { label: "Delivery", icon: PackageCheck, href: "/delivery", badge: 4 },
  { label: "FDA / Reg.", icon: ShieldCheck, href: "/fda" },
  { label: "Accounting", icon: DollarSign, href: "/accounting" },
]

const otherItems = [
  { label: "Setting", icon: Settings, href: "/settings" },
]

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()

  const renderLink = (
    item: { label: string; icon: typeof LayoutDashboard; href: string; badge?: number },
    isActive: boolean
  ) => {
    const link = (
      <Link
        href={item.href}
        className={cn(
          "mb-0.5 flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
          collapsed ? "justify-center rounded-xl p-2.5" : "rounded-[10px] px-3.5 py-2.5",
          isActive &&
            "bg-primary text-primary-foreground font-semibold shadow-[0_2px_8px_rgba(76,139,245,0.3)] hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0 opacity-75" />
        {!collapsed && (
          <>
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "ml-auto shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold",
                  isActive
                    ? "bg-primary-foreground/30 text-primary-foreground"
                    : "bg-destructive text-destructive-foreground"
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <span className="text-xs font-semibold">{item.label}</span>
            {item.badge && (
              <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-px text-[10px] font-bold text-destructive-foreground">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      )
    }

    return <div key={item.href}>{link}</div>
  }

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-200 ease-in-out",
        collapsed ? "w-16" : "w-[230px]"
      )}
    >
      {/* Logo + Toggle */}
      <div className={cn("flex items-center shrink-0", collapsed ? "flex-col gap-1 px-2 pt-5 pb-3" : "gap-3 px-5 pt-6 pb-5")}>
        <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] text-sm font-bold text-card">
          CZ
        </Link>
        {!collapsed && (
          <span className="text-lg font-extrabold tracking-tight text-foreground">CosmeZen</span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "shrink-0 flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            collapsed ? "" : "ml-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Main Nav */}
      <nav className={cn("flex-1 overflow-y-auto pb-4", collapsed ? "px-1.5" : "px-3")}>
        {!collapsed && (
          <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
        )}
        {collapsed && <div className="pt-1" />}

        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/")
          return renderLink(item, isActive)
        })}

        {collapsed ? (
          <div className="my-3 mx-1 border-t border-border" />
        ) : (
          <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Other
          </p>
        )}

        {otherItems.map((item) => {
          const isActive = pathname === item.href
          return renderLink(item, isActive)
        })}
      </nav>

      {/* Footer */}
      <div className={cn("flex items-center gap-2.5 border-t border-border py-4 shrink-0", collapsed ? "justify-center px-2" : "px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c7d2fe] to-[#a5b4fc] text-xs font-bold text-[#4338ca]">
          KS
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">Admin</div>
              <div className="text-[10px] text-muted-foreground truncate">CosmeZen</div>
            </div>
            <button className="ml-auto text-muted-foreground hover:text-foreground shrink-0" aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
