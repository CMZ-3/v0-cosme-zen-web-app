"use client"

import { useState } from "react"
import useSWR from "swr"
import { CustomerListPanel } from "@/components/customers/customer-list-panel"
import { CustomerDetailPanel } from "@/components/customers/customer-detail-panel"
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog"
import type { CustomerDetail, CustomerListItem } from "@/lib/customer-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, mutate } = useSWR<{ customers: CustomerListItem[] }>("/api/customers", fetcher)
  const list = data?.customers ?? []

  const effectiveSelected = selectedId ?? list[0]?.id ?? null

  const { data: detailData, isLoading: detailLoading } = useSWR<{ detail: CustomerDetail }>(
    effectiveSelected ? `/api/customers/${effectiveSelected}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const detail = detailData?.detail ?? null
  const selectedName = list.find((c) => c.id === effectiveSelected)?.customerName

  return (
    <>
      <CreateCustomerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => mutate()}
      />
      <CustomerListPanel
        customers={list}
        selectedId={effectiveSelected}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
      />
      <CustomerDetailPanel
        detail={detail}
        customerName={detailLoading ? selectedName : selectedName}
      />
    </>
  )
}
