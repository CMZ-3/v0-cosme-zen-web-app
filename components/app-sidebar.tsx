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
  LayoutGrid,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Icon = typeof LayoutDashboard

interface NavItem {
  label: string
  icon: Icon
  href: string
  badge?: number
}

interface NavGroup {
  label: string
  icon: Icon
  href: string
  children: NavItem[]
}

const isGroup = (item: NavItem | NavGroup): item is NavGroup => "children" in item

const menuItems: (NavItem | NavGroup)[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Job Orders", icon: ClipboardList, href: "/job-orders", badge: 5 },
  { label: "Products", icon: ShoppingBag, href: "/products" },
  {
    label: "Stock Hub",
    icon: Package,
    href: "/stock",
    children: [
      { label: "Overview", icon: LayoutGrid, href: "/stock" },
      { label: "Movements", icon: ArrowLeftRight, href: "/stock/movements" },
      { label: "Stock Check", icon: ClipboardCheck, href: "/stock/checking" },
      { label: "Alerts", icon: BellRing, href: "/stock/alerts" },
    ],
  },
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

  // Routes that belong to a specific Stock Hub child, so "Overview" (/stock)
  // does not stay highlighted while on a sibling route.
  const stockChildPrefixes = ["/stock/movements", "/stock/checking", "/stock/alerts"]

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/stock") {
      return (
        pathname === "/stock" ||
        (pathname.startsWith("/stock/") && !stockChildPrefixes.some((p) => pathname.startsWith(p)))
      )
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const isGroupActive = (group: NavGroup) => group.children.some((c) => isItemActive(c.href))

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const renderLink = (
    item: NavItem,
    isActive: boolean,
    opts?: { nested?: boolean }
  ) => {
    const nested = opts?.nested
    const link = (
      <Link
        href={item.href}
        className={cn(
          "mb-0.5 flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
          collapsed ? "justify-center rounded-xl p-2.5" : "rounded-[10px] px-3.5 py-2.5",
          nested && !collapsed && "py-2 text-[13px]",
          isActive &&
            "bg-primary text-primary-foreground font-semibold shadow-[0_2px_8px_rgba(76,139,245,0.3)] hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <item.icon className={cn("shrink-0 opacity-75", nested ? "h-4 w-4" : "h-[18px] w-[18px]")} />
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

  const renderGroup = (group: NavGroup) => {
    const groupActive = isGroupActive(group)
    const open = openGroups[group.label] ?? groupActive

    // Collapsed rail: show the group icon; hovering reveals the children as a
    // flyout menu so the sub-nav stays reachable without expanding the sidebar.
    if (collapsed) {
      return (
        <Tooltip key={group.label}>
          <TooltipTrigger asChild>
            <Link
              href={group.href}
              className={cn(
                "mb-0.5 flex items-center justify-center rounded-xl p-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
                groupActive &&
                  "bg-primary text-primary-foreground font-semibold shadow-[0_2px_8px_rgba(76,139,245,0.3)] hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <group.icon className="h-[18px] w-[18px] shrink-0 opacity-75" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="flex flex-col gap-0.5 p-1.5">
            <span className="px-2 py-1 text-xs font-bold">{group.label}</span>
            {group.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isItemActive(child.href) && "bg-secondary text-foreground font-semibold"
                )}
              >
                <child.icon className="h-3.5 w-3.5 shrink-0 opacity-75" />
                {child.label}
              </Link>
            ))}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div key={group.label}>
        <button
          type="button"
          onClick={() => toggleGroup(group.label)}
          aria-expanded={open}
          className={cn(
            "mb-0.5 flex w-full items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
            groupActive && !open && "text-foreground"
          )}
        >
          <group.icon className="h-[18px] w-[18px] shrink-0 opacity-75" />
          <span className="truncate">{group.label}</span>
          <ChevronDown
            className={cn("ml-auto h-4 w-4 shrink-0 transition-transform", open ? "rotate-0" : "-rotate-90")}
          />
        </button>
        {open && (
          <div className="mb-1 ml-3.5 flex flex-col border-l border-border pl-2">
            {group.children.map((child) => renderLink(child, isItemActive(child.href), { nested: true }))}
          </div>
        )}
      </div>
    )
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

        {menuItems.map((item) =>
          isGroup(item) ? renderGroup(item) : renderLink(item, isItemActive(item.href))
        )}

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
