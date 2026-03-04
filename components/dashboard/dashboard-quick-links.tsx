"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"
import {
  ClipboardList,
  ShoppingBag,
  Package,
  FlaskConical,
  Users,
  Truck,
  ShieldCheck,
  ArrowLeftRight,
} from "lucide-react"

const links = [
  { label: "Job Orders", icon: ClipboardList, href: "/job-orders", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100", count: 5 },
  { label: "Products", icon: ShoppingBag, href: "/products", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100", count: 248 },
  { label: "Stock", icon: Package, href: "/stock", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100", count: 248 },
  { label: "Movements", icon: ArrowLeftRight, href: "/stock/movements", color: "text-teal-600", bg: "bg-teal-50 hover:bg-teal-100", count: 8 },
  { label: "Formulas", icon: FlaskConical, href: "/formulas", color: "text-cyan-600", bg: "bg-cyan-50 hover:bg-cyan-100", count: 42 },
  { label: "Customers", icon: Users, href: "/customers", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100" },
  { label: "Delivery", icon: Truck, href: "/delivery", color: "text-rose-600", bg: "bg-rose-50 hover:bg-rose-100", count: 47 },
  { label: "FDA / Reg.", icon: ShieldCheck, href: "/fda", color: "text-green-600", bg: "bg-green-50 hover:bg-green-100", count: 155 },
]

export function DashboardQuickLinks() {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3 space-y-0">
        <CardTitle className="text-sm font-extrabold text-foreground">{"Quick Access"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center",
                l.bg
              )}
            >
              <l.icon className={cn("h-5 w-5", l.color)} />
              <span className="text-[10px] font-bold text-foreground leading-tight">{l.label}</span>
              {l.count !== undefined && (
                <span className="text-[9px] text-muted-foreground font-semibold">{l.count}</span>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
