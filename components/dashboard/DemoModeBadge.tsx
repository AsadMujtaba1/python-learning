/**
 * DemoModeBadge Component
 * 
 * Subtle badge indicating demo mode when user hasn't provided personal data
 * 
 * @module components/dashboard/DemoModeBadge
 */

import { Eye } from 'lucide-react';

interface DemoModeBadgeProps {
  className?: string;
}

export default function DemoModeBadge({ className = '' }: DemoModeBadgeProps) {
  return (
    <div 
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <Eye className="w-4 h-4 animate-pulse" />
      <span>Demo Mode</span>
    </div>
  );
}

/**
 * Banner version for prominent display
 */
export function DemoModeBanner({ className = '' }: DemoModeBadgeProps) {
  return (
    <div 
      className={`flex items-center justify-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-2 border-blue-300 dark:border-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-lg">
        <Eye className="w-5 h-5 text-white animate-pulse" />
      </div>
      <div className="text-sm">
        <span className="font-bold text-blue-900 dark:text-blue-100 block mb-1">Demo Mode Active</span>
        <span className="text-blue-700 dark:text-blue-300 font-medium">
          Showing benchmark data. Upload your bills or add meter readings to see personalized insights.
        </span>
      </div>
    </div>
  );
}
