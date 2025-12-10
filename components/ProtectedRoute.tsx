'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/onboarding-v2' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding (has data in localStorage)
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userHomeData');
      setHasData(!!userData);
      
      if (!userData) {
        router.push(redirectTo);
      }
    }
  }, [router, redirectTo]);

  // Still loading
  if (hasData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // No data - redirecting
  if (!hasData) {
    return null;
  }

  return <>{children}</>;
}
