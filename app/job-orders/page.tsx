"use client"

import { useState, useMemo } from "react"
import { JobOrderListPanel } from "@/components/job-orders/job-order-list-panel"
import { JobOrderDetail } from "@/components/job-orders/job-order-detail"
import { mockJobOrders } from "@/lib/job-order-mock-data"

export default function JobOrdersPage() {
  const [selectedId, setSelectedId] = useState<string>(mockJobOrders[0]?.id ?? "")
  const selectedJO = useMemo(() => mockJobOrders.find((jo) => jo.id === selectedId), [selectedId])

  return (
    <>
      <JobOrderListPanel
        jobOrders={mockJobOrders}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="pointer-events-none absolute top-0 right-0 h-[350px] w-[500px] bg-gradient-to-bl from-[rgba(238,244,255,0.7)] to-transparent z-0" />
        {selectedJO ? (
          <JobOrderDetail jobOrder={selectedJO} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select a Job Order from the list
          </div>
        )}
      </div>
    </>
  )
}
