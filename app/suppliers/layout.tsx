import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Suppliers - CosmeZen",
  description: "Manage supplier master data, contacts, certificates, and catalog items",
}

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {children}
    </div>
  )
}
