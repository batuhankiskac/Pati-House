'use client';

import AdminSidebar from '@/components/layout/admin-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { useSafeRouter } from '@/hooks/use-safe-router';
import { useEffect } from 'react';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useSafeRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Yükleniyor...</div>;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center min-h-screen">Yetkilendiriliyor...</div>;
  }

  // Authenticated - show admin panel
  return (
    <AdminErrorBoundary>
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </AdminErrorBoundary>
  );
}
