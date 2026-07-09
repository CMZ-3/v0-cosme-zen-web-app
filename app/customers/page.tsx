"use client"

import { useState } from "react"
import useSWR from "swr"
import { CustomerListPanel } from "@/components/customers/customer-list-panel"
import { CustomerDetailPanel } from "@/components/customers/customer-detail-panel"
import { CreateCustomerDialog } from "@/components/customers/create-customer-dialog"
import { EditCustomerDialog } from "@/components/customers/edit-customer-dialog"
import type { CustomerDetail, CustomerListItem } from "@/lib/customer-types"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const { data, mutate } = useSWR<{ customers: CustomerListItem[] }>("/api/customers", fetcher)
  const list = data?.customers ?? []

  const effectiveSelected = selectedId ?? list[0]?.id ?? null

  const { data: detailData, isLoading: detailLoading, mutate: mutateDetail } = useSWR<{ detail: CustomerDetail }>(
    effectiveSelected ? `/api/customers/${effectiveSelected}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const detail = detailData?.detail ?? null
  const selectedName = list.find((c) => c.id === effectiveSelected)?.customerName

  const handleEditRequest = (id: string) => {
    setSelectedId(id)
    setShowEdit(true)
  }

  const handleArchive = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
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
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
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
      <CreateCustomerDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={() => mutate()}
      />
      <EditCustomerDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        customer={detail}
        onSaved={() => { mutate(); mutateDetail() }}
      />
      <CustomerListPanel
        customers={list}
        selectedId={effectiveSelected}
        onSelect={setSelectedId}
        onNewClick={() => setShowCreate(true)}
        onEditRequest={handleEditRequest}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
      <CustomerDetailPanel
        detail={detail}
        customerName={detailLoading ? selectedName : selectedName}
        onEdit={() => setShowEdit(true)}
        onDelete={handleDelete}
      />
    </>
  )
}
