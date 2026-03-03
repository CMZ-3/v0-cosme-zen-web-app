export default function JobOrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 min-w-0 h-screen overflow-hidden">{children}</div>
  )
}
