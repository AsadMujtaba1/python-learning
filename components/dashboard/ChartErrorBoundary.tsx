'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  chartName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specifically designed for chart components
 * Provides graceful fallback UI and error reporting
 */
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error(`Chart Error (${this.props.chartName || 'Unknown'}):`, error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you could send to error tracking service
    // e.g., Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center h-full min-h-[300px] p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Chart Loading Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 max-w-md">
                {this.props.chartName && `Unable to load ${this.props.chartName}. `}
                This might be due to data format issues or network problems.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-2 text-xs text-left">
                  <summary className="cursor-pointer text-red-600 dark:text-red-400 hover:underline">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-red-900 dark:text-red-100 overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-lg transition-colors duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap chart components with error boundary
 */
export function withChartErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  chartName?: string
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ChartErrorBoundary chartName={chartName}>
      <WrappedComponent {...props} />
    </ChartErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withChartErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithErrorBoundary;
}

export default ChartErrorBoundary;
