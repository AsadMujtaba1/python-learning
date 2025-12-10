'use client';

/**
 * SYSTEM STATUS CHECK PAGE
 * Verifies Firebase and API connectivity
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { auth, db } from '@/lib/firebase';

export default function SystemCheckPage() {
  const { user, loading: authLoading } = useAuth();
  const [checks, setChecks] = useState({
    firebase: 'checking',
    firestore: 'checking',
    auth: 'checking',
    products: 'checking',
  });

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    // Check Firebase Auth
    if (auth) {
      setChecks(prev => ({ ...prev, firebase: 'ok', auth: 'ok' }));
    } else {
      setChecks(prev => ({ ...prev, firebase: 'error', auth: 'error' }));
    }

    // Check Firestore
    if (db) {
      setChecks(prev => ({ ...prev, firestore: 'ok' }));
    } else {
      setChecks(prev => ({ ...prev, firestore: 'error' }));
    }

    // Check Products API
    try {
      const res = await fetch('/api/products/real?category=heaters&limit=5');
      const data = await res.json();
      if (data.success && data.products.length > 0) {
        setChecks(prev => ({ ...prev, products: 'ok' }));
      } else {
        setChecks(prev => ({ ...prev, products: 'warning' }));
      }
    } catch (error) {
      setChecks(prev => ({ ...prev, products: 'error' }));
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'ok') return '✅';
    if (status === 'warning') return '⚠️';
    if (status === 'error') return '❌';
    return '⏳';
  };

  const getStatusText = (status: string) => {
    if (status === 'ok') return 'Working';
    if (status === 'warning') return 'Partial';
    if (status === 'error') return 'Error';
    return 'Checking...';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">System Status Check</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Service Status</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Firebase Auth</span>
              <span className="text-2xl">{getStatusIcon(checks.firebase)}</span>
              <span className="text-sm text-gray-600">{getStatusText(checks.firebase)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Firestore Database</span>
              <span className="text-2xl">{getStatusIcon(checks.firestore)}</span>
              <span className="text-sm text-gray-600">{getStatusText(checks.firestore)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Authentication Status</span>
              <span className="text-2xl">{getStatusIcon(checks.auth)}</span>
              <span className="text-sm text-gray-600">{getStatusText(checks.auth)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">Real Products API</span>
              <span className="text-2xl">{getStatusIcon(checks.products)}</span>
              <span className="text-sm text-gray-600">{getStatusText(checks.products)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="font-semibold mb-2">Current User Status</h3>
            {authLoading ? (
              <p className="text-sm text-gray-600">Loading...</p>
            ) : user ? (
              <div className="text-sm space-y-1">
                <p>✅ Logged in as: {user.email}</p>
                <p>User ID: {user.uid}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-600">❌ Not logged in</p>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={runChecks}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recheck
            </button>
            <a
              href="/sign-in"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Go to Sign In
            </a>
            <a
              href="/products"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              View Products
            </a>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="text-sm space-y-2 text-gray-600">
            <p>Firebase Project: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not configured'}</p>
            <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not configured'}</p>
            <p>Environment: {process.env.NODE_ENV || 'development'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
