/**
 * Badge Component
 * 
 * Small status indicator or label
 * Features:
 * - Multiple variants
 * - Sizes
 * - Icons
 * - Dot indicator
 * - Dark mode support
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export default function Badge(props: BadgeProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    dot = false,
    className = '',
  } = props;
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    primary: 'bg-blue-600 dark:bg-blue-400',
    secondary: 'bg-gray-600 dark:bg-gray-400',
    success: 'bg-green-600 dark:bg-green-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    error: 'bg-red-600 dark:bg-red-400',
    info: 'bg-cyan-600 dark:bg-cyan-400',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-full ${dotColors[variant]}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

/**
 * Numerical Badge (for counts)
 */
export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="error" size="sm">
      {displayCount}
    </Badge>
  );
}

/**
 * Status Badge (with predefined statuses)
 */
export interface StatusBadgeProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const statusConfig = {
    online: { label: 'Online', variant: 'success' as const },
    offline: { label: 'Offline', variant: 'secondary' as const },
    away: { label: 'Away', variant: 'warning' as const },
    busy: { label: 'Busy', variant: 'error' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={showDot} size="sm">
      {config.label}
    </Badge>
  );
}

/**
 * Usage Example:
 * 
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" icon="⚠️">High Usage</Badge>
 * <Badge variant="info" dot>Live Data</Badge>
 * 
 * <CountBadge count={5} />
 * <CountBadge count={150} max={99} /> // Shows "99+"
 * 
 * <StatusBadge status="online" />
 */
