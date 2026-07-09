"use client"

import { useState } from "react"
import useSWR from "swr"
import { SupplierListPanel } from "@/components/suppliers/supplier-list-panel"
import { SupplierDetailPanel } from "@/components/suppliers/supplier-detail-panel"
import { CreateSupplierDialog } from "@/components/suppliers/create-supplier-dialog"
import { mockSupplierDetail } from "@/lib/supplier-mock-data"
import type { SupplierListItem } from "@/lib/supplier-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SuppliersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, mutate } = useSWR<{ suppliers: SupplierListItem[] }>("/api/suppliers", fetcher)
  const list = data?.suppliers ?? []

  const effectiveSelected = selectedId ?? list[0]?.id ?? null
  const detail = effectiveSelected === list[0]?.id ? mockSupplierDetail : null

  return (
    <>
      <CreateSupplierDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => mutate()}
      />
      <SupplierListPanel
        suppliers={list}
        selectedId={effectiveSelected}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
      />
      <SupplierDetailPanel
        detail={detail}
        supplierName={list.find((s) => s.id === effectiveSelected)?.supplierName}
      />
    </>
  )
}
