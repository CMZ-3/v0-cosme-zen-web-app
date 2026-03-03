import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Delivery Order | CosmeZen",
  description: "Manage delivery orders, track shipments, close jobs, and print delivery notes.",
}

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
