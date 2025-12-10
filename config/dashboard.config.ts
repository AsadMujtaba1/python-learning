/**
 * Production Dashboard Configuration
 * Centralized configuration for dashboard features, API endpoints, and settings
 */

export const DASHBOARD_CONFIG = {
  // Feature Flags
  features: {
    demoMode: true,
    animations: true,
    toastNotifications: true,
    darkMode: true,
    mobileResponsive: true,
    chartInteractions: true,
    exportData: false, // Coming soon
    shareData: false, // Coming soon
  },

  // API Configuration
  api: {
    endpoints: {
      weather: '/api/weather',
      tariffs: '/api/tariffs',
      ons: '/api/ons',
      bills: '/api/bills',
      meterReadings: '/api/meter-readings',
    },
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000,
  },

  // Loading States
  loading: {
    minimumDisplayTime: 300, // ms - prevent flashing
    skeletonFadeIn: 200, // ms
    progressUpdateInterval: 100, // ms
    estimatedLoadTime: 2000, // ms
  },

  // Animation Settings
  animations: {
    enabled: true,
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: [0.4, 0.0, 0.2, 1], // Tailwind's ease-in-out
      spring: { type: 'spring', stiffness: 300, damping: 30 },
    },
    stagger: {
      cards: 0.1,
      charts: 0.15,
      items: 0.05,
    },
    reducedMotion: 'prefers-reduced-motion: reduce',
  },

  // Toast Configuration
  toast: {
    position: 'top-right' as const,
    duration: 4000,
    maxToasts: 3,
    toastGap: 8,
    reverseOrder: false,
    containerClassName: 'z-50',
  },

  // Chart Settings
  charts: {
    colors: {
      primary: 'hsl(217, 91%, 60%)', // Blue
      secondary: 'hsl(142, 71%, 45%)', // Green
      warning: 'hsl(45, 93%, 47%)', // Yellow
      danger: 'hsl(0, 84%, 60%)', // Red
      neutral: 'hsl(215, 20%, 65%)', // Gray
      benchmark: 'hsl(217, 91%, 60%)',
      user: 'hsl(142, 71%, 45%)',
    },
    grid: {
      stroke: 'hsl(215, 20%, 85%)',
      strokeDasharray: '3 3',
    },
    tooltip: {
      cursor: { stroke: 'hsl(215, 20%, 65%)', strokeWidth: 1 },
      contentStyle: {
        backgroundColor: 'hsl(0, 0%, 100%)',
        border: '1px solid hsl(215, 20%, 85%)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
    responsive: {
      desktop: {
        height: 300,
        margin: { top: 5, right: 30, left: 0, bottom: 5 },
      },
      mobile: {
        height: 250,
        margin: { top: 5, right: 10, left: 0, bottom: 5 },
      },
    },
  },

  // Demo Mode Settings
  demoMode: {
    enabled: true,
    showBanner: true,
    bannerMessage: 'Viewing benchmark data. Upload your bill to see personalized insights.',
    exitPrompt: 'Upload your first bill to get started',
    dataRefreshInterval: null, // Auto-refresh disabled in demo
  },

  // Accessibility
  accessibility: {
    skipToContent: true,
    keyboardNavigation: true,
    screenReaderAnnouncements: true,
    highContrastMode: true,
    focusVisible: true,
    ariaLabels: true,
  },

  // Performance
  performance: {
    enableTracking: true,
    lazyLoading: true,
    imageOptimization: true,
    codeSplitting: true,
    memoization: true,
    virtualization: false, // Enable for large datasets
  },

  // Error Handling
  errorHandling: {
    showErrorDetails: process.env.NODE_ENV === 'development',
    enableErrorBoundary: true,
    enableRetry: true,
    fallbackUI: true,
    errorReporting: process.env.NODE_ENV === 'production',
  },

  // Data Refresh
  dataRefresh: {
    auto: true,
    interval: 300000 as number, // 5 minutes
    onFocus: true,
    onReconnect: true,
  },

  // Mobile Settings
  mobile: {
    tabNavigation: true,
    swipeGestures: false, // Coming soon
    touchOptimized: true,
    collapsibleSections: true,
  },

  // Export/Share (Coming Soon)
  export: {
    formats: ['csv', 'json', 'pdf'],
    includeCharts: true,
    includeInsights: true,
  },

  // Limits
  limits: {
    maxBillUploads: 10,
    maxMeterReadings: 100,
    maxChartDataPoints: 365,
    maxToastsShown: 3,
  },

  // Timeouts
  timeouts: {
    api: 10000,
    upload: 30000,
    processing: 60000,
  },
} as const;

// Type exports
export type DashboardConfig = typeof DASHBOARD_CONFIG;
export type FeatureFlags = typeof DASHBOARD_CONFIG.features;
export type ChartColors = typeof DASHBOARD_CONFIG.charts.colors;

// Environment-specific overrides
export function getDashboardConfig(): DashboardConfig {
  if (process.env.NODE_ENV === 'development') {
    return {
      ...DASHBOARD_CONFIG,
      errorHandling: {
        ...DASHBOARD_CONFIG.errorHandling,
        showErrorDetails: true,
        errorReporting: false,
      },
      dataRefresh: {
        ...DASHBOARD_CONFIG.dataRefresh,
        interval: 60000, // 1 minute in dev
      },
    };
  }

  return DASHBOARD_CONFIG;
}

// Feature flag checker
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getDashboardConfig().features[feature];
}

// Chart color getter with theme support
export function getChartColor(
  colorKey: keyof ChartColors,
  theme: 'light' | 'dark' = 'light'
): string {
  const baseColor = DASHBOARD_CONFIG.charts.colors[colorKey];
  
  // Adjust colors for dark mode
  if (theme === 'dark') {
    // Lighten colors slightly for dark mode visibility
    return baseColor; // TODO: Implement color adjustment
  }
  
  return baseColor;
}

// Responsive chart settings getter
export function getChartSettings(isMobile: boolean) {
  return isMobile
    ? DASHBOARD_CONFIG.charts.responsive.mobile
    : DASHBOARD_CONFIG.charts.responsive.desktop;
}
