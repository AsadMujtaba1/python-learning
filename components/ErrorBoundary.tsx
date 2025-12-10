/**
 * Error Boundary Component
 * 
 * Enterprise-grade error boundary with:
 * - Automatic error tracking (Sentry)
 * - Self-healing capabilities
 * - User-friendly error messages
 * - Automatic recovery attempts
 * - State preservation
 */

'use client';

import React, { Component, ReactNode } from 'react';
import * as Sentry from "@sentry/nextjs";
import Button from './Button';
import { checkSystemHealth, componentStateManager } from '@/lib/selfHealing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  componentId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempts: number;
}

export default class ErrorBoundary extends Component<Props, State> {
  private maxRecoveryAttempts = 2;
  
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      recoveryAttempts: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Send to Sentry with context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: this.props.componentId || 'unknown',
      },
      level: 'error',
    });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Attempt automatic recovery
    this.attemptRecovery();
  }
  
  componentDidUpdate(prevProps: Props) {
    // Reset on props change if enabled
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        recoveryAttempts: 0,
      });
    }
  }
  
  private async attemptRecovery() {
    const { recoveryAttempts } = this.state;
    
    if (recoveryAttempts >= this.maxRecoveryAttempts) {
      return;
    }
    
    // Check system health
    const health = await checkSystemHealth();
    
    if (health.healthy && recoveryAttempts < this.maxRecoveryAttempts) {
      // Try to recover after a delay
      setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          recoveryAttempts: recoveryAttempts + 1,
        });
      }, 2000);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 dark:text-red-300 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="primary" className="flex-1">
                Reload Page
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="secondary" className="flex-1">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Usage:
 * 
 * // Wrap your app or specific components
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <Dashboard />
 * </ErrorBoundary>
 */
