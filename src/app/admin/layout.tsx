import AdminSidebar from '@/components/layout/admin-sidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    // This should theoretically not be reached if middleware is set up correctly,
    // but as a fallback.
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
