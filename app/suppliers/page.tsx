"use client"

import { useState } from "react"
import { SupplierListPanel } from "@/components/suppliers/supplier-list-panel"
import { SupplierDetailPanel } from "@/components/suppliers/supplier-detail-panel"
import { CreateSupplierDialog } from "@/components/suppliers/create-supplier-dialog"
import { mockSupplierList, mockSupplierDetail } from "@/lib/supplier-mock-data"

export default function SuppliersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(mockSupplierList[0]?.id ?? null)
  const [showCreate, setShowCreate] = useState(false)

  // In production this would fetch from API -- for now use mock detail for first supplier
  const detail = selectedId === mockSupplierList[0]?.id ? mockSupplierDetail : null

  return (
    <>
      <CreateSupplierDialog open={showCreate} onOpenChange={setShowCreate} />
      <SupplierListPanel
        suppliers={mockSupplierList}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
      />
      <SupplierDetailPanel detail={detail} supplierName={mockSupplierList.find(s => s.id === selectedId)?.supplierName} />
    </>
  )
}
