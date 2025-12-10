'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';

function AdminRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const isAdmin = user?.email?.endsWith('@costsaver.com') || user?.uid === 'admin';
    
    if (user && isAdmin) {
      // Redirect to blog management by default
      router.push('/admin/blog');
    } else if (user) {
      // Not an admin, redirect to dashboard
      router.push('/dashboard-new');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function AdminIndexPage() {
  return (
    <ProtectedRoute>
      <AdminRedirect />
    </ProtectedRoute>
  );
}
