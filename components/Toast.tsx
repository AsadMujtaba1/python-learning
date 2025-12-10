/**
 * Toast Notification Component
 * Shows success, error, warning, and info messages
 */

'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (addToastFn) {
    addToastFn(message, type);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastFn = (message: string, type: ToastType) => {
      const id = toastId++;
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [isExiting, setIsExiting] = useState(false);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsExiting(true), 3600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        ${styles[toast.type]}
        px-6 py-4 rounded-xl shadow-lg
        flex items-center gap-3
        animate-slide-in-right
        ${isExiting ? 'animate-slide-out-right' : ''}
      `}
    >
      <span className="text-2xl">{icons[toast.type]}</span>
      <p className="font-medium">{toast.message}</p>
    </div>
  );
}
