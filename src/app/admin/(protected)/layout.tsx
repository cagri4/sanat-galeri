import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/admin-nav'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect('/admin/login')
  }
  return (
    <div className="md:flex min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  )
}
