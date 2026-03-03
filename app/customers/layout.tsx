import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customers - CosmeZen",
  description: "Manage customer master data, contacts, brands, contracts, and briefs",
}

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {children}
    </div>
  )
}
