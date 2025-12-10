/**
 * DashboardCard Component
 * 
 * Reusable card component for displaying dashboard metrics
 * Follows the modular architecture requirement
 */

import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  children?: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  children,
  icon,
  variant = 'default',
  className = '',
}: DashboardCardProps) {
  const variantStyles = {
    default: 'from-blue-500/10 to-purple-500/10 border-blue-500/20',
    success: 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    warning: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
    danger: 'from-red-500/10 to-pink-500/10 border-red-500/20',
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${variantStyles[variant]}
        backdrop-blur-xl rounded-2xl border p-6
        shadow-lg hover:shadow-xl transition-all duration-300
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </h3>
          {value !== undefined && (
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`ml-4 ${
            variant === 'success' ? 'text-green-600 dark:text-green-500' :
            variant === 'warning' ? 'text-yellow-600 dark:text-yellow-500' :
            variant === 'danger' ? 'text-red-600 dark:text-red-500' :
            'text-gray-400 dark:text-gray-500'
          }`}>
            {icon}
          </div>
        )}
      </div>

      {/* Content */}
      {children && (
        <div className={value !== undefined ? "mt-4" : ""}>
          {children}
        </div>
      )}
    </div>
  );
}
