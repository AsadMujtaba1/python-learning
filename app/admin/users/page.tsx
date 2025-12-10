'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import Alert from '@/components/Alert';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastActive: Date;
  subscriptionTier: 'free' | 'premium';
  status: 'active' | 'suspended';
}

function UserManagementContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">👥</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage user accounts
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" className="mb-6" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Coming Soon Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            User management features are currently under development. 
            Soon you'll be able to view, search, and manage all user accounts from this dashboard.
          </p>
          
          {/* Preview Features List */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Planned Features:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Search and filter users by email, name, or status</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>View detailed user profiles and activity history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Manage user subscription tiers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Suspend or reactivate accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Export user data for reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Send notifications to users</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Preview (Mock Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">-</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">All time</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Active Users</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">-</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 30 days</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">New Users</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">-</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">This month</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Premium Users</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">-</div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Subscribed</div>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <UserManagementContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
