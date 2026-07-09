"use client"

import { useParams, useRouter } from "next/navigation"
import { FormulaDetail } from "@/components/formulas/formula-detail"

export default function FormulaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  return (
    <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
      <FormulaDetail
        formulaId={id}
        onDeleted={() => router.push("/formulas")}
        onCloned={(newId) => router.push(`/formulas/${newId}`)}
      />
    </div>
  )
}
