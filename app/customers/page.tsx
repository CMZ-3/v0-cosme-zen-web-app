"use client"

import { useState } from "react"
import { CustomerListPanel } from "@/components/customers/customer-list-panel"
import { CustomerDetailPanel } from "@/components/customers/customer-detail-panel"
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog"
import { mockCustomerList, mockCustomerDetail } from "@/lib/customer-mock-data"

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(mockCustomerList[0]?.id ?? null)
  const [showCreate, setShowCreate] = useState(false)

  // In production this would fetch from API -- for now use mock detail for first customer
  const detail = selectedId === mockCustomerList[0]?.id ? mockCustomerDetail : null

  return (
    <>
      <CreateCustomerDialog open={showCreate} onOpenChange={setShowCreate} />
      <CustomerListPanel
        customers={mockCustomerList}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
      />
      <CustomerDetailPanel detail={detail} customerName={mockCustomerList.find(c => c.id === selectedId)?.customerName} />
    </>
  )
}
