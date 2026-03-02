import { AppSidebar } from "@/components/app-sidebar"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[230px] flex-1 min-w-0">{children}</main>
    </div>
  )
}
