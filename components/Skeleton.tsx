/**
 * Skeleton Component
 * 
 * Loading placeholder with shimmer animation
 * Features:
 * - Various shapes (text, circle, rectangle)
 * - Multiple sizes
 * - Shimmer animation
 * - Dark mode support
 * - Composable for complex layouts
 */

import React from 'react';

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton(props: SkeletonProps) {
  const {
    variant = 'text',
    width,
    height,
    className = '',
    animation = 'wave',
  } = props;
  const baseStyles = 'bg-gray-200 dark:bg-gray-700';
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    none: '',
  };

  const defaultHeight = {
    text: '1rem',
    circular: '3rem',
    rectangular: '8rem',
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : 'auto'),
    height: height || defaultHeight[variant],
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Skeleton Card Component
 */
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height="1.25rem" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rectangular" height="8rem" className="mb-3" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
}

/**
 * Skeleton Table Component
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height="1rem" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Dashboard Component
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="text" width="200px" height="2rem" />
          <Skeleton variant="text" width="150px" />
        </div>
        <Skeleton variant="rectangular" width="120px" height="2.5rem" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <Skeleton variant="text" width="200px" height="1.5rem" className="mb-4" />
        <Skeleton variant="rectangular" height="300px" />
      </div>
    </div>
  );
}

/**
 * Usage Example:
 * 
 * // Single skeleton
 * <Skeleton variant="text" width="200px" />
 * <Skeleton variant="circular" width="50px" height="50px" />
 * <Skeleton variant="rectangular" height="200px" />
 * 
 * // Pre-built skeletons
 * <SkeletonCard />
 * <SkeletonTable rows={5} columns={4} />
 * <SkeletonDashboard />
 * 
 * // Custom skeleton layout
 * {loading ? (
 *   <div className="space-y-3">
 *     <Skeleton variant="text" width="70%" />
 *     <Skeleton variant="text" width="90%" />
 *     <Skeleton variant="rectangular" height="200px" />
 *   </div>
 * ) : (
 *   <ActualContent />
 * )}
 */
