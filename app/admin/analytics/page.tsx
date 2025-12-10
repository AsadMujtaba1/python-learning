'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Alert from '@/components/Alert';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalBills: number;
  totalComparisons: number;
  avgSavings: number;
  revenueThisMonth: number;
}

function AnalyticsContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const isAdmin = user?.email?.endsWith('@costsaver.com') || user?.uid === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Track key metrics and insights
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
                {range === '90d' && 'Last 90 Days'}
                {range === '1y' && 'Last Year'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Coming Soon Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center mb-8">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Analytics dashboard is currently under development. 
            Soon you'll have access to comprehensive metrics, charts, and insights about your platform's performance.
          </p>
          
          {/* Preview Features List */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Planned Features:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Real-time user activity tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Bill upload and comparison metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Revenue and subscription analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>User retention and churn analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Interactive charts and graphs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Export reports as PDF or CSV</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Total Users</div>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">-</div>
          <div className="text-xs text-green-600 dark:text-green-400">+0% from last period</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Active Users</div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">-</div>
          <div className="text-xs text-green-600 dark:text-green-400">+0% from last period</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Bills Uploaded</div>
            <span className="text-2xl">📄</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">-</div>
          <div className="text-xs text-green-600 dark:text-green-400">+0% from last period</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-600 dark:text-gray-400 text-sm">Avg. Savings</div>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">-</div>
          <div className="text-xs text-green-600 dark:text-green-400">+0% from last period</div>
        </div>
      </div>

      {/* Charts Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">📈</div>
              <div className="text-sm">Chart placeholder</div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trends
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">💵</div>
              <div className="text-sm">Chart placeholder</div>
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Heatmap
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-sm">Chart placeholder</div>
            </div>
          </div>
        </div>

        {/* Top Tariffs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Most Popular Tariffs
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="text-4xl mb-2">⚡</div>
              <div className="text-sm">Chart placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <AnalyticsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
