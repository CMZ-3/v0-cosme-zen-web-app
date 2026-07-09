"use client"

import { useState } from "react"
import useSWR from "swr"
import { SupplierListPanel } from "@/components/suppliers/supplier-list-panel"
import { SupplierDetailPanel } from "@/components/suppliers/supplier-detail-panel"
import { CreateSupplierDialog } from "@/components/suppliers/create-supplier-dialog"
import { EditSupplierDialog } from "@/components/suppliers/edit-supplier-dialog"
import type { SupplierDetail, SupplierListItem } from "@/lib/supplier-types"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SuppliersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const { data, mutate } = useSWR<{ suppliers: SupplierListItem[] }>("/api/suppliers", fetcher)
  const list = data?.suppliers ?? []

  const effectiveSelected = selectedId ?? list[0]?.id ?? null

  const { data: detailData, mutate: mutateDetail } = useSWR<{ detail: SupplierDetail }>(
    effectiveSelected ? `/api/suppliers/${effectiveSelected}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const detail = detailData?.detail ?? null
  const selectedName = list.find((s) => s.id === effectiveSelected)?.supplierName

  const handleEditRequest = (id: string) => {
    setSelectedId(id)
    setShowEdit(true)
  }

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      })
      if (!res.ok) throw new Error()
      mutate(); mutateDetail()
    } catch {
      toast.error("อัปเดตสถานะอนุมัติไม่สำเร็จ")
    }
  }

  const handleArchive = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      })
      if (!res.ok) throw new Error()
      toast.success(`${name} ถูกเก็บเข้าคลังแล้ว`)
      if (id === effectiveSelected) setSelectedId(null)
      mutate()
    } catch {
      toast.error("เก็บเข้าคลังไม่สำเร็จ")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success(`ลบ ${name} เรียบร้อย`)
      if (id === effectiveSelected) setSelectedId(null)
      mutate()
    } catch {
      toast.error("ลบไม่สำเร็จ")
    }
  }

  return (
    <>
      <CreateSupplierDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => mutate()}
      />
      <EditSupplierDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        supplier={detail}
        onSaved={() => { mutate(); mutateDetail() }}
      />
      <SupplierListPanel
        suppliers={list}
        selectedId={effectiveSelected}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
        onEditRequest={handleEditRequest}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
      <SupplierDetailPanel
        detail={detail}
        supplierName={selectedName}
        onEdit={() => setShowEdit(true)}
        onApprove={handleApprove}
        onDelete={handleDelete}
      />
    </>
  )
}
