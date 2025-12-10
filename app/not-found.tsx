'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700">404</h1>
          <div className="text-6xl mb-4">🔍</div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-block"
          >
            🏠 Go to Homepage
          </Link>
          <Link
            href="/dashboard-new"
            className="px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors inline-block"
          >
            📊 Go to Dashboard
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/tariffs" className="text-sm text-blue-600 hover:underline">
              💷 Tariff Comparison
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/solar" className="text-sm text-blue-600 hover:underline">
              ☀️ Solar Calculator
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/heat-pump" className="text-sm text-blue-600 hover:underline">
              🔥 Heat Pump Guide
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/products" className="text-sm text-blue-600 hover:underline">
              🛒 Products
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-sm text-blue-600 hover:underline">
              📧 Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
