/**
 * Alert Component
 * 
 * Versatile alert/notification component
 * Features:
 * - Multiple variants (info, success, warning, error)
 * - Dismissible
 * - Icons
 * - Actions
 * - Dark mode support
 */

'use client';

import React from 'react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function Alert(props: AlertProps) {
  const {
    variant = 'info',
    title,
    children,
    icon,
    dismissible = false,
    onDismiss,
    action,
    className = '',
  } = props;
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const variantStyles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: 'text-blue-600 dark:text-blue-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: 'text-green-600 dark:text-green-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: 'text-yellow-600 dark:text-yellow-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: 'text-red-600 dark:text-red-400',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`
        rounded-lg border-2 p-4 
        ${styles.bg}
        ${className}
        animate-fade-in
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {icon || styles.defaultIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold ${styles.text} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.text}`}>
            {children}
          </div>

          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium ${styles.icon} hover:underline`}
            >
              {action.label} →
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${styles.icon} hover:opacity-75 transition-opacity`}
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Banner Alert (full-width at top of page)
 */
export function BannerAlert({ children, ...props }: Omit<AlertProps, 'className'>) {
  return (
    <Alert
      {...props}
      className="rounded-none border-x-0 border-t-0"
    >
      {children}
    </Alert>
  );
}

/**
 * Usage Example:
 * 
 * <Alert variant="success" title="Success!" dismissible>
 *   Your settings have been saved successfully.
 * </Alert>
 * 
 * <Alert 
 *   variant="warning" 
 *   title="High Energy Usage Detected"
 *   action={{ label: 'View details', onClick: () => console.log('Clicked') }}
 * >
 *   Your energy consumption is 25% higher than average for your area.
 * </Alert>
 * 
 * <BannerAlert variant="info" title="New Feature Available">
 *   Check out our new carbon intensity tracker!
 * </BannerAlert>
 */
