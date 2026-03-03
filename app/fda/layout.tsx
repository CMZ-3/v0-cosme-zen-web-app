export default function FdaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">{children}</div>
  )
}
