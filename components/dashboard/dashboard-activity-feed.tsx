"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Package,
  FlaskConical,
  Truck,
  ShieldCheck,
  ClipboardList,
  ArrowLeftRight,
} from "lucide-react"

interface Activity {
  id: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  time: string
  module: string
}

const activities: Activity[] = [
  {
    id: "a1",
    icon: ClipboardList,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "JO CZ-2601 Filling 64%",
    description: "K. Somsri filled 500 pcs morning shift",
    time: "2 hours ago",
    module: "Job Orders",
  },
  {
    id: "a2",
    icon: Truck,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    title: "DO-2603 Shipped",
    description: "Kerry Express TH20260301KRY",
    time: "4 hours ago",
    module: "Delivery",
  },
  {
    id: "a3",
    icon: Package,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    title: "Stock: RM-001 Buy In +50kg",
    description: "Vitamin C (Ascorbic Acid) - PO-2603-015",
    time: "5 hours ago",
    module: "Stock",
  },
  {
    id: "a4",
    icon: ShieldCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    title: "FDA-260201-003 Submitted",
    description: "NatuGlow HA Toner sent to FDA",
    time: "1 day ago",
    module: "FDA",
  },
  {
    id: "a5",
    icon: FlaskConical,
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50",
    title: "Formula FML-260205-004 Updated",
    description: "K-Glow Sleeping Mask v1 draft saved",
    time: "1 day ago",
    module: "Formulas",
  },
  {
    id: "a6",
    icon: ArrowLeftRight,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    title: "Stock Transfer: Niacinamide",
    description: "10 kg Zone A-1 to Zone B-2",
    time: "2 days ago",
    module: "Stock",
  },
  {
    id: "a7",
    icon: ClipboardList,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    title: "JO CZ-2603 Created",
    description: "NaturaSkin - Niacinamide Body Lotion 10,000 pcs",
    time: "2 days ago",
    module: "Job Orders",
  },
]

export function DashboardActivityFeed() {
  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="pb-3 space-y-0">
        <CardTitle className="text-sm font-extrabold text-foreground">{"Recent Activity"}</CardTitle>
        <p className="text-[11px] text-muted-foreground mt-0.5">{"Latest updates across all modules"}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col">
          {activities.map((a, i) => (
            <div key={a.id} className={cn("flex items-start gap-3 py-2.5", i > 0 && "border-t border-border")}>
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5", a.iconBg)}>
                <a.icon className={cn("h-4 w-4", a.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-foreground leading-snug">{a.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{a.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] text-muted-foreground">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
