'use client';

/**
 * SELECTABLE CARD COMPONENT
 * 
 * Large tap-based cards for conversational option selection
 * Used for supplier, tariff, home type, etc.
 */

import { Check } from 'lucide-react';

interface SelectableCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: string | React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SelectableCard({
  value,
  label,
  description,
  icon,
  selected,
  onSelect,
  size = 'md',
}: SelectableCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full ${sizeClasses[size]} rounded-2xl border-2 transition-all duration-200
        ${
          selected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-[1.02]'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-md active:scale-[0.98]'
        }
      `}
    >
      {selected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-left">
        {icon && (
          <div className="flex-shrink-0">
            {typeof icon === 'string' ? (
              <span className="text-4xl">{icon}</span>
            ) : (
              icon
            )}
          </div>
        )}

        <div className="flex-1">
          <div className={`font-semibold text-gray-900 dark:text-white ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

interface SelectableGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function SelectableGrid({ children, columns = 2 }: SelectableGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3`}>
      {children}
    </div>
  );
}
