"use client"

import { useState } from "react"
import useSWR from "swr"
import { CustomerListPanel } from "@/components/customers/customer-list-panel"
import { CustomerDetailPanel } from "@/components/customers/customer-detail-panel"
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog"
import { mockCustomerDetail } from "@/lib/customer-mock-data"
import type { CustomerListItem } from "@/lib/customer-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, mutate } = useSWR<{ customers: CustomerListItem[] }>("/api/customers", fetcher)
  const list = data?.customers ?? []

  // Auto-select first on load
  const effectiveSelected = selectedId ?? list[0]?.id ?? null
  const detail = effectiveSelected === list[0]?.id ? mockCustomerDetail : null

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
        customerName={list.find((c) => c.id === effectiveSelected)?.customerName}
      />
    </>
  )
}
