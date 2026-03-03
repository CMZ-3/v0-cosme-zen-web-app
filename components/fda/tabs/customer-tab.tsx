"use client"

import { Building2, Link2, Unlink, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FdaRegistration } from "@/lib/fda-types"

interface CustomerTabProps {
  data: FdaRegistration
}

export function FdaCustomerTab({ data }: CustomerTabProps) {
  const isLinked = !!data.customerId

  if (!isLinked) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Building2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-foreground">No Customer Linked</p>
          <p className="text-xs text-muted-foreground mt-1">
            Link a customer to this registration to track ownership.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Link Customer
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{data.customerName}</p>
              <p className="text-xs text-muted-foreground">Linked Customer</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <ExternalLink className="h-3 w-3" /> View
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-red-500">
              <Unlink className="h-3 w-3" /> Unlink
            </Button>
          </div>
        </div>

        {/* Importer info as related */}
        {data.importerName && (
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Importer / Brand Owner</p>
              <p className="text-sm font-medium text-foreground">{data.importerName}</p>
            </div>
            {data.importerAddress && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{data.importerAddress}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
