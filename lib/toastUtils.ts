/**
 * Toast Notification Utilities
 * 
 * Pre-configured toast notifications for common dashboard actions
 * 
 * @module lib/toastUtils
 */

import toast from 'react-hot-toast';

/**
 * Demo Mode Notifications
 */
export const toastDemoMode = () => {
  return toast('💡 Demo Mode Active - Upload your bills to see personalized insights', {
    duration: 5000,
  });
};

export const toastExitDemoMode = () => {
  return toast.success('✨ Personalized Data Loaded! Your dashboard now shows your actual energy usage', {
    duration: 3000,
  });
};

/**
 * Bill Upload Notifications
 */
export const toastBillUploading = () => {
  return toast.loading('📄 Uploading bill...', {
    duration: Infinity,
  });
};

export const toastBillSuccess = () => {
  return toast.success('📄 Bill uploaded successfully! Your data has been updated', {
    duration: 3000,
  });
};

export const toastBillError = (error?: string) => {
  return toast.error(`❌ Upload failed - ${error || 'Please try again'}`, {
    duration: 5000,
  });
};

/**
 * Meter Reading Notifications
 */
export const toastMeterReadingSuccess = () => {
  return toast.success('📊 Reading added successfully! Your usage data has been updated', {
    duration: 3000,
  });
};

export const toastMeterReadingError = () => {
  return toast.error('❌ Failed to add reading - Please check your input and try again', {
    duration: 4000,
  });
};

/**
 * Tariff Comparison Notifications
 */
export const toastTariffComparisonReady = (savingsAmount?: number) => {
  const message = savingsAmount 
    ? `You could save £${savingsAmount}/year!`
    : 'Comparison complete';
    
  return toast.success('💷 ' + message + ' - View detailed comparison below', {
    duration: 4000,
  });
};

/**
 * Settings Notifications
 */
export const toastSettingsSaved = () => {
  return toast.success('⚙️ Settings saved', {
    duration: 2000,
  });
};

export const toastSettingsError = () => {
  return toast.error('⚙️ Failed to save settings', {
    duration: 3000,
  });
};

/**
 * Data Sync Notifications
 */
export const toastSyncingData = () => {
  return toast.loading('🔄 Syncing data...', {
    duration: Infinity,
  });
};

export const toastSyncSuccess = () => {
  return toast.success('✅ Data synced', {
    duration: 2000,
  });
};

export const toastSyncError = () => {
  return toast.error('🔄 Sync failed - Will retry automatically', {
    duration: 3000,
  });
};

/**
 * Achievement/Milestone Notifications
 */
export const toastAchievement = (title: string, description: string) => {
  return toast.success(`🎉 ${title} - ${description}`, {
    duration: 5000,
  });
};

export const toastSavingsMilestone = (amount: number) => {
  return toast.success(`🎯 Milestone Reached! You've saved £${amount} this year!`, {
    duration: 5000,
  });
};

/**
 * General Notifications
 */
export const toastInfo = (message: string, description?: string) => {
  const fullMessage = description ? `${message} - ${description}` : message;
  return toast(fullMessage, {
    icon: 'ℹ️',
    duration: 4000,
  });
};

export const toastWarning = (message: string, description?: string) => {
  const fullMessage = description ? `${message} - ${description}` : message;
  return toast(fullMessage, {
    icon: '⚠️',
    duration: 4000,
    style: {
      background: 'linear-gradient(to right, #fef3c7, #fde68a)',
      color: '#92400e',
      border: '1px solid #fbbf24',
    },
  });
};

/**
 * Custom toast with custom options
 */
export const toastCustom = (
  message: string, 
  options?: {
    icon?: string;
    description?: string;
    duration?: number;
    type?: 'success' | 'error' | 'loading' | 'default';
  }
) => {
  const { type = 'default', ...rest } = options || {};
  
  switch (type) {
    case 'success':
      return toast.success(message, rest);
    case 'error':
      return toast.error(message, rest);
    case 'loading':
      return toast.loading(message, rest);
    default:
      return toast(message, rest);
  }
};

/**
 * Dismiss specific toast
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};

/**
 * Promise-based toast (for async operations)
 */
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    {
      success: {
        duration: 3000,
      },
      error: {
        duration: 4000,
      },
    }
  );
};
