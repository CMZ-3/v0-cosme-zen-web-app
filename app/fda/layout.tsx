import { AppSidebar } from "@/components/app-sidebar"

export default function FdaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-[230px] flex flex-1 flex-col min-w-0 h-screen overflow-hidden">{children}</div>
    </div>
  )
}
