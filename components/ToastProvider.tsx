/**
 * Toast Notification Provider
 * 
 * Centralized toast notifications using react-hot-toast
 * Pre-configured styles matching the dashboard theme
 * 
 * @module components/ToastProvider
 */

'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children?: ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: 'white',
          color: '#1f2937',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
        },
        
        // Success toasts
        success: {
          duration: 3000,
          style: {
            background: 'linear-gradient(to right, #f0fdf4, #dcfce7)',
            color: '#166534',
            border: '1px solid #86efac',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#f0fdf4',
          },
        },
        
        // Error toasts
        error: {
          duration: 5000,
          style: {
            background: 'linear-gradient(to right, #fef2f2, #fee2e2)',
            color: '#991b1b',
            border: '1px solid #fca5a5',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        
        // Loading toasts
        loading: {
          style: {
            background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
            color: '#1e40af',
            border: '1px solid #93c5fd',
          },
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        },
      }}
      />
    </>
  );
}

/**
 * Dark mode Toaster (use in dark theme layouts)
 */
export function ToastProviderDark() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #374151',
        },
        
        success: {
          duration: 3000,
          style: {
            background: 'linear-gradient(to right, #064e3b, #065f46)',
            color: '#d1fae5',
            border: '1px solid #10b981',
          },
          iconTheme: {
            primary: '#34d399',
            secondary: '#064e3b',
          },
        },
        
        error: {
          duration: 5000,
          style: {
            background: 'linear-gradient(to right, #7f1d1d, #991b1b)',
            color: '#fee2e2',
            border: '1px solid #ef4444',
          },
          iconTheme: {
            primary: '#f87171',
            secondary: '#7f1d1d',
          },
        },
        
        loading: {
          style: {
            background: 'linear-gradient(to right, #1e3a8a, #1e40af)',
            color: '#dbeafe',
            border: '1px solid #3b82f6',
          },
          iconTheme: {
            primary: '#60a5fa',
            secondary: '#1e3a8a',
          },
        },
      }}
    />
  );
}
