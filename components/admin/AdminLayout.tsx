'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminLinks = [
  {
    href: '/admin/blog',
    label: 'Blog Management',
    icon: '📝',
    description: 'Create and manage blog posts'
  },
  {
    href: '/admin/promo-codes',
    label: 'Promo Codes',
    icon: '🎟️',
    description: 'Manage promotional codes'
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: '👥',
    description: 'View and manage users'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: '📊',
    description: 'Dashboard metrics and insights'
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🛠️</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {user?.email || 'Administrator'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-2">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  block px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{link.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                      {link.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/dashboard-new"
            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
