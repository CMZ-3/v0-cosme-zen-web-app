import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Formulas - CosmeZen",
  description: "Manage cosmetic formulations, ingredients, phases, QC specs, and versions",
}

export default function FormulasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 min-w-0 h-screen overflow-hidden">{children}</div>
  )
}
