/**
 * DataSourceBadge Component
 * 
 * Visual indicator showing the source of data (user, regional, national, estimated)
 * Improves transparency and helps users understand what data they're seeing.
 * 
 * @module components/dashboard/DataSourceBadge
 */

'use client';

import { cn } from '@/lib/utils';
import { User, MapPin, Globe, Calculator } from 'lucide-react';

export type DataSource = 'user' | 'regional' | 'national' | 'estimated';

interface DataSourceBadgeProps {
  source: DataSource;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const sourceConfig = {
  user: {
    label: 'Your Data',
    icon: User,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  regional: {
    label: 'Regional Average',
    icon: MapPin,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  national: {
    label: 'UK Average',
    icon: Globe,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  estimated: {
    label: 'Estimated',
    icon: Calculator,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-300 dark:border-gray-600',
  },
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
  md: 'text-xs px-2 py-1 gap-1',
  lg: 'text-sm px-3 py-1.5 gap-1.5',
};

export default function DataSourceBadge({
  source,
  className,
  size = 'sm',
  showIcon = true,
}: DataSourceBadgeProps) {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border',
        config.color,
        config.borderColor,
        sizeClasses[size],
        className
      )}
      title={`Data source: ${config.label}`}
    >
      {showIcon && <Icon className={cn(
        size === 'sm' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-3 h-3' : 'w-3.5 h-3.5'
      )} />}
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Multi-source badge for charts showing multiple data types
 */
interface MultiSourceBadgeProps {
  sources: DataSource[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MultiSourceBadge({ sources, className, size = 'sm' }: MultiSourceBadgeProps) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {sources.map((source) => (
        <DataSourceBadge key={source} source={source} size={size} />
      ))}
    </div>
  );
}
