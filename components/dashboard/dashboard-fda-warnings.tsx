"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { mockFdaKPI, mockFdaList } from "@/lib/fda-mock-data"
import Link from "next/link"
import { ArrowRight, ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react"

export function DashboardFdaWarnings() {
  const { total, approved, draft, submitted, rejected, expired, expiring30, expiring60 } = mockFdaKPI

  // Get items expiring soon (within 90 days)
  const expiringItems = mockFdaList
    .filter(item => item.daysUntilExpiry !== undefined && item.daysUntilExpiry <= 90 && item.daysUntilExpiry > 0)
    .sort((a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999))

  // Also get expired items
  const expiredItems = mockFdaList.filter(item => item.status === "expired")

  const urgentItems = [...expiredItems, ...expiringItems].slice(0, 4)

  return (
    <Card className="border border-border shadow-none">
      <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-sm font-extrabold text-foreground">{"FDA Registrations"}</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">{`${total} total registrations`}</p>
        </div>
        <Link href="/fda" className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline">
          {"View all"}<ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Status breakdown */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <div>
              <span className="text-lg font-extrabold text-emerald-700 leading-none">{approved}</span>
              <p className="text-[9px] font-semibold text-emerald-600">{"Approved"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <span className="text-lg font-extrabold text-blue-700 leading-none">{draft + submitted}</span>
              <p className="text-[9px] font-semibold text-blue-600">{"Pending"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <div>
              <span className="text-lg font-extrabold text-amber-700 leading-none">{expiring30 + expiring60}</span>
              <p className="text-[9px] font-semibold text-amber-600">{"Expiring"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
            <ShieldX className="h-4 w-4 text-red-500" />
            <div>
              <span className="text-lg font-extrabold text-red-700 leading-none">{expired + rejected}</span>
              <p className="text-[9px] font-semibold text-red-600">{"Expired / Rejected"}</p>
            </div>
          </div>
        </div>

        {/* Urgent items */}
        {urgentItems.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{"Requires Attention"}</p>
            <div className="flex flex-col gap-1.5">
              {urgentItems.map((item) => {
                const isExpired = item.status === "expired"
                return (
                  <Link key={item.id} href="/fda" className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <Badge variant="outline" className={cn(
                      "text-[8px] px-1 py-0 h-3.5 font-bold",
                      item.registrationType === "jk" ? "border-blue-200 text-blue-700 bg-blue-50" : "border-amber-200 text-amber-700 bg-amber-50"
                    )}>
                      {item.registrationType === "jk" ? "JK" : "JR"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">{item.productNameEn || item.productNameTh}</p>
                      <p className="text-[9px] text-muted-foreground">{item.tradeName}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[9px] px-1.5 py-0 h-4 font-bold shrink-0",
                      isExpired ? "border-red-200 text-red-700 bg-red-50" : "border-amber-200 text-amber-700 bg-amber-50"
                    )}>
                      {isExpired ? "Expired" : `${item.daysUntilExpiry}d left`}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
