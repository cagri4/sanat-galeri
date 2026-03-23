export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-w-[320px] min-h-screen bg-neutral-50">
      <nav className="border-b bg-white px-4 py-3 sm:px-6">
        <span className="font-medium text-neutral-900">U-Art Admin</span>
      </nav>
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
