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
  Mail,
  ClipboardList,
  DollarSign,
  Settings,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Stock v3", icon: Package, href: "/stock" },
  { label: "Formulas", icon: FlaskConical, href: "/formulas" },
  { label: "Production", icon: Factory, href: "/production" },
  { label: "Products", icon: ShoppingBag, href: "/products" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Suppliers", icon: Truck, href: "/suppliers" },
  { label: "Delivery", icon: Mail, href: "/delivery" },
  { label: "FDA / อย.", icon: ClipboardList, href: "/fda" },
  { label: "Accounting", icon: DollarSign, href: "/accounting" },
]

const otherItems = [
  { label: "Setting", icon: Settings, href: "/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-40 flex w-[230px] min-w-[230px] flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#7c3aed] text-sm font-bold text-card">
          CZ
        </div>
        <span className="text-lg font-extrabold tracking-tight text-foreground">CosmeZen</span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== "/" || pathname === "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-0.5 flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
                isActive && "bg-primary text-primary-foreground font-semibold shadow-[0_2px_8px_rgba(76,139,245,0.3)] hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] opacity-75" />
              {item.label}
            </Link>
          )
        })}
        <p className="px-3 pt-5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Other
        </p>
        {otherItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mb-0.5 flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="h-[18px] w-[18px] opacity-75" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-2.5 border-t border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#c7d2fe] to-[#a5b4fc] text-xs font-bold text-[#4338ca]">
          KS
        </div>
        <div>
          <div className="text-xs font-bold text-foreground">Admin</div>
          <div className="text-[10px] text-muted-foreground">CosmeZen</div>
        </div>
        <button className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Logout">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
