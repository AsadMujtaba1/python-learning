'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import OnboardingGate from '@/components/OnboardingGate';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function EnhancedDashboard() {
  return (
    <ProtectedRoute>
      <OnboardingGate minCompleteness={30}>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <DashboardShell />
          <Footer />
        </div>
      </OnboardingGate>
    </ProtectedRoute>
  );
}


