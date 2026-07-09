"use client"

import { useState } from "react"
import useSWR from "swr"
import { SupplierListPanel } from "@/components/suppliers/supplier-list-panel"
import { SupplierDetailPanel } from "@/components/suppliers/supplier-detail-panel"
import { CreateSupplierDialog } from "@/components/suppliers/create-supplier-dialog"
import type { SupplierDetail, SupplierListItem } from "@/lib/supplier-types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SuppliersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, mutate } = useSWR<{ suppliers: SupplierListItem[] }>("/api/suppliers", fetcher)
  const list = data?.suppliers ?? []

  const effectiveSelected = selectedId ?? list[0]?.id ?? null

  const { data: detailData } = useSWR<{ detail: SupplierDetail }>(
    effectiveSelected ? `/api/suppliers/${effectiveSelected}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const detail = detailData?.detail ?? null
  const selectedName = list.find((s) => s.id === effectiveSelected)?.supplierName

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
        supplierName={selectedName}
      />
    </>
  )
}
