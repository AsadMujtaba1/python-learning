/**
 * ERROR HANDLING UTILITIES
 * 
 * Centralized error handling, logging, and user-friendly error messages.
 * Supports error boundaries, API errors, and validation errors.
 * 
 * @module lib/utils/errorHandling
 */

import { ERROR_MESSAGES } from './constants';

/**
 * Custom error types for better error handling
 */
export enum ErrorType {
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CALCULATION = 'calculation',
  STORAGE = 'storage',
  UNKNOWN = 'unknown',
}

/**
 * Custom App Error class
 */
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly userMessage: string;
  public readonly technicalMessage: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      statusCode?: number;
      userMessage?: string;
      context?: Record<string, any>;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = options.statusCode;
    this.technicalMessage = message;
    this.userMessage = options.userMessage || this.getDefaultUserMessage(type);
    this.timestamp = new Date();
    this.context = options.context;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION]: ERROR_MESSAGES.CALCULATION_ERROR,
      [ErrorType.API]: ERROR_MESSAGES.UNKNOWN_ERROR,
      [ErrorType.NETWORK]: ERROR_MESSAGES.NETWORK_ERROR,
      [ErrorType.AUTHENTICATION]: 'Authentication required. Please log in.',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.CALCULATION]: ERROR_MESSAGES.CALCULATION_ERROR,
      [ErrorType.STORAGE]: ERROR_MESSAGES.STORAGE_ERROR,
      [ErrorType.UNKNOWN]: ERROR_MESSAGES.UNKNOWN_ERROR,
    };
    return messages[type] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.technicalMessage,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Error logger (can be extended to send to monitoring service)
 */
class ErrorLogger {
  private logs: AppError[] = [];
  private maxLogs: number = 100;

  log(error: AppError): void {
    this.logs.push(error);
    
    // Keep only last N errors
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[AppError]', {
        type: error.type,
        message: error.technicalMessage,
        userMessage: error.userMessage,
        context: error.context,
        stack: error.stack,
      });
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error);
    }
  }

  private sendToMonitoring(error: AppError): void {
    // TODO: Integrate with Sentry, Datadog, or similar
    // Example: Sentry.captureException(error);
  }

  getLogs(): AppError[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

const errorLogger = new ErrorLogger();

/**
 * Global error handler
 */
export function handleError(
  error: unknown,
  context?: Record<string, any>
): AppError {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(
      ErrorType.UNKNOWN,
      error.message,
      {
        context: {
          ...context,
          originalError: error.name,
          stack: error.stack,
        },
      }
    );
  } else if (typeof error === 'string') {
    appError = new AppError(
      ErrorType.UNKNOWN,
      error,
      { context }
    );
  } else {
    appError = new AppError(
      ErrorType.UNKNOWN,
      'An unknown error occurred',
      { context }
    );
  }

  errorLogger.log(appError);
  return appError;
}

/**
 * API error handler
 */
export function handleApiError(
  error: any,
  endpoint: string
): AppError {
  let statusCode = error?.status || error?.statusCode || 500;
  let message = error?.message || 'API request failed';
  let userMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;

  // Handle specific status codes
  if (statusCode === 400) {
    userMessage = 'Invalid request. Please check your input.';
  } else if (statusCode === 401) {
    userMessage = 'Authentication required.';
  } else if (statusCode === 403) {
    userMessage = 'Access denied.';
  } else if (statusCode === 404) {
    userMessage = 'Resource not found.';
  } else if (statusCode === 429) {
    userMessage = 'Too many requests. Please try again later.';
  } else if (statusCode >= 500) {
    userMessage = 'Server error. Please try again later.';
  }

  return new AppError(
    ErrorType.API,
    message,
    {
      statusCode,
      userMessage,
      context: {
        endpoint,
        error: error?.toString(),
      },
    }
  );
}

/**
 * Network error handler
 */
export function handleNetworkError(
  error: any,
  url: string
): AppError {
  return new AppError(
    ErrorType.NETWORK,
    'Network request failed',
    {
      userMessage: ERROR_MESSAGES.NETWORK_ERROR,
      context: {
        url,
        error: error?.toString(),
      },
    }
  );
}

/**
 * Validation error handler
 */
export function handleValidationError(
  errors: string[],
  context?: Record<string, any>
): AppError {
  return new AppError(
    ErrorType.VALIDATION,
    'Validation failed',
    {
      userMessage: errors.join('. '),
      context: {
        ...context,
        errors,
      },
    }
  );
}

/**
 * Calculation error handler
 */
export function handleCalculationError(
  message: string,
  context?: Record<string, any>
): AppError {
  return new AppError(
    ErrorType.CALCULATION,
    message,
    {
      userMessage: ERROR_MESSAGES.CALCULATION_ERROR,
      context,
    }
  );
}

/**
 * Storage error handler
 */
export function handleStorageError(
  message: string,
  context?: Record<string, any>
): AppError {
  return new AppError(
    ErrorType.STORAGE,
    message,
    {
      userMessage: ERROR_MESSAGES.STORAGE_ERROR,
      context,
    }
  );
}

/**
 * Safe async function wrapper with error handling
 */
export function tryCatch<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | null> {
  return fn().catch((error) => {
    const appError = handleError(error);
    if (errorHandler) {
      errorHandler(appError);
    }
    return null;
  });
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Error boundary helper for React components
 */
export function getErrorBoundaryInfo(error: Error, errorInfo: any) {
  const appError = handleError(error, {
    componentStack: errorInfo.componentStack,
  });

  return {
    error: appError,
    message: appError.userMessage,
    shouldDisplay: process.env.NODE_ENV === 'development',
    technicalDetails: appError.toJSON(),
  };
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: AppError): boolean {
  const recoverableTypes = [
    ErrorType.NETWORK,
    ErrorType.API,
  ];
  
  return recoverableTypes.includes(error.type);
}

/**
 * Get error logs (for debugging)
 */
export function getErrorLogs(): AppError[] {
  return errorLogger.getLogs();
}

/**
 * Clear error logs
 */
export function clearErrorLogs(): void {
  errorLogger.clear();
}

/**
 * Create error notification object for UI
 */
export function createErrorNotification(error: unknown) {
  const appError = error instanceof AppError ? error : handleError(error);
  
  return {
    type: 'error' as const,
    title: 'Error',
    message: appError.userMessage,
    duration: 5000,
    dismissible: true,
    actions: isRecoverableError(appError) ? [
      { label: 'Retry', action: 'retry' },
    ] : undefined,
  };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T,
  context?: Record<string, any>
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    handleError(error, {
      ...context,
      json: json.substring(0, 100), // Log first 100 chars
    });
    return fallback;
  }
}

/**
 * Safe localStorage operations with error handling
 */
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      handleStorageError(`Failed to read from localStorage: ${key}`);
      return fallback;
    }
  },

  setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      handleStorageError(`Failed to write to localStorage: ${key}`);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      handleStorageError(`Failed to remove from localStorage: ${key}`);
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      handleStorageError('Failed to clear localStorage');
      return false;
    }
  },
};

// Export everything
export default {
  AppError,
  ErrorType,
  handleError,
  handleApiError,
  handleNetworkError,
  handleValidationError,
  handleCalculationError,
  handleStorageError,
  tryCatch,
  retry,
  withTimeout,
  getErrorBoundaryInfo,
  formatErrorForUser,
  isRecoverableError,
  getErrorLogs,
  clearErrorLogs,
  createErrorNotification,
  safeJsonParse,
  safeStorage,
};
