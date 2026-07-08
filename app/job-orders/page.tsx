"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { JobOrderListPanel } from "@/components/job-orders/job-order-list-panel"
import { JobOrderDetail } from "@/components/job-orders/job-order-detail"
import type { JobOrder } from "@/lib/job-order-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function JobOrdersPage() {
  return (
    <Suspense fallback={null}>
      <JobOrdersView />
    </Suspense>
  )
}

function JobOrdersView() {
  const searchParams = useSearchParams()
  const idFromQuery = searchParams.get("id")

  const { data, isLoading, mutate } = useSWR("/api/job-orders", fetcher, {
    revalidateOnFocus: false,
  })

  const jobOrders: JobOrder[] = useMemo(() => data?.jobOrders ?? [], [data])

  const [selectedId, setSelectedId] = useState<string>("")
  // Auto-select first JO once data loads, or use URL param if valid.
  const resolvedId = useMemo(() => {
    if (selectedId) return selectedId
    if (idFromQuery && jobOrders.some((jo) => jo.id === idFromQuery)) return idFromQuery
    return jobOrders[0]?.id ?? ""
  }, [selectedId, idFromQuery, jobOrders])

  const selectedJO = useMemo(
    () => jobOrders.find((jo) => jo.id === resolvedId),
    [jobOrders, resolvedId],
  )

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Loading job orders...
      </div>
    )
  }

  return (
    <>
      <JobOrderListPanel
        jobOrders={jobOrders}
        selectedId={resolvedId}
        onSelect={setSelectedId}
        onCreated={() => mutate()}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="pointer-events-none absolute top-0 right-0 h-[350px] w-[500px] bg-gradient-to-bl from-[rgba(238,244,255,0.7)] to-transparent z-0" />
        {selectedJO ? (
          <JobOrderDetail jobOrder={selectedJO} onStatusChange={() => mutate()} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Select a Job Order from the list
          </div>
        )}
      </div>
    </>
  )
}
