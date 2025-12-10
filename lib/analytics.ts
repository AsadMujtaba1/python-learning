/**
 * ANALYTICS & TRACKING SYSTEM
 * 
 * Comprehensive analytics for:
 * - User behavior tracking
 * - Conversion funnels
 * - Feature usage
 * - Error monitoring
 * - Performance metrics
 * - Commercial optimization
 * 
 * @module lib/analytics
 */

import * as Sentry from "@sentry/nextjs";

// ============================================================================
// TYPES
// ============================================================================

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface PageViewProperties {
  path: string;
  title: string;
  referrer?: string;
  [key: string]: any;
}

interface UserProperties {
  userId?: string;
  email?: string;
  accountType?: string;
  signupDate?: string;
  [key: string]: any;
}

type EventName = 
  // User Journey
  | 'page_view'
  | 'signup_started'
  | 'signup_completed'
  | 'signin_completed'
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_abandoned'
  
  // Feature Usage
  | 'dashboard_viewed'
  | 'settings_updated'
  | 'bill_uploaded'
  | 'refresh_data_clicked'
  | 'tooltip_viewed'
  
  // Engagement
  | 'link_clicked'
  | 'cta_clicked'
  | 'faq_expanded'
  | 'contact_submitted'
  
  // Commercial
  | 'affiliate_link_clicked'
  | 'offer_viewed'
  | 'comparison_started'
  | 'switch_initiated'
  
  // Errors
  | 'error_occurred'
  | 'api_failure'
  | 'auth_failure'
  
  // Performance
  | 'slow_page_load'
  | 'api_timeout';

// ============================================================================
// ANALYTICS CLIENT
// ============================================================================

class AnalyticsClient {
  private isInitialized = false;
  private queue: Array<() => void> = [];
  private sessionId: string;
  private userId?: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }
  
  private initialize() {
    if (typeof window === 'undefined') return;
    
    // Initialize Vercel Analytics
    try {
      const { inject } = require('@vercel/analytics');
      inject();
      this.isInitialized = true;
      
      // Process queued events
      this.queue.forEach(fn => fn());
      this.queue = [];
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Set user identity for tracking
   */
  identify(userId: string, properties?: UserProperties) {
    this.userId = userId;
    
    // Set user in Sentry
    Sentry.setUser({
      id: userId,
      ...properties,
    });
    
    // Store in session
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('analytics_user_id', userId);
      } catch {}
    }
  }
  
  /**
   * Track custom event
   */
  track(eventName: EventName, properties?: EventProperties) {
    const event = () => {
      const payload = {
        event: eventName,
        properties: {
          ...properties,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        },
      };
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', eventName, payload.properties);
      }
      
      // Send to analytics services
      this.sendToServices(payload);
      
      // Track in Sentry breadcrumb
      Sentry.addBreadcrumb({
        category: 'analytics',
        message: eventName,
        data: properties,
        level: 'info',
      });
    };
    
    if (this.isInitialized) {
      event();
    } else {
      this.queue.push(event);
    }
  }
  
  /**
   * Track page view
   */
  page(properties?: PageViewProperties) {
    if (typeof window === 'undefined') return;
    
    const pageData: PageViewProperties = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    };
    
    this.track('page_view', pageData);
  }
  
  /**
   * Track conversion event
   */
  conversion(eventName: string, value?: number) {
    this.track(eventName as EventName, {
      conversion: true,
      value: value || 0,
    });
  }
  
  /**
   * Track error
   */
  error(errorName: string, errorDetails?: any) {
    this.track('error_occurred', {
      errorName,
      errorDetails: JSON.stringify(errorDetails),
    });
    
    // Also send to Sentry
    Sentry.captureMessage(errorName, {
      level: 'error',
      extra: errorDetails,
    });
  }
  
  /**
   * Track timing/performance
   */
  timing(category: string, variable: string, timeMs: number) {
    this.track('slow_page_load', {
      category,
      variable,
      timeMs,
    });
    
    // Send to Sentry as measurement
    Sentry.getCurrentScope().setContext('performance', {
      [variable]: timeMs,
    });
  }
  
  /**
   * Send to multiple analytics services
   */
  private sendToServices(payload: any) {
    // 1. Vercel Analytics (already injected)
    
    // 2. Custom backend (optional)
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Fail silently
      });
    }
    
    // 3. LocalStorage backup
    this.storeLocally(payload);
  }
  
  /**
   * Store events locally for analysis
   */
  private storeLocally(payload: any) {
    if (typeof window === 'undefined') return;
    
    try {
      const key = 'analytics_events';
      const stored = localStorage.getItem(key);
      const events = stored ? JSON.parse(stored) : [];
      
      events.push({
        ...payload,
        clientTimestamp: Date.now(),
      });
      
      // Keep only last 100 events
      const trimmed = events.slice(-100);
      
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (error) {
      // Quota exceeded or other error
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const analytics = new AnalyticsClient();

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook to track component mount
 * Note: Use this in client components only
 */
export function useComponentTracking(componentName: string) {
  if (typeof window === 'undefined') return;
  
  // Dynamic import to avoid SSR issues
  import('react').then(({ useEffect }) => {
    useEffect(() => {
      analytics.track('page_view', { component: componentName });
    }, [componentName]);
  });
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(featureName: string) {
  return (action: string, properties?: EventProperties) => {
    analytics.track('link_clicked', {
      feature: featureName,
      action,
      ...properties,
    });
  };
}

// ============================================================================
// FUNNEL TRACKING
// ============================================================================

export class FunnelTracker {
  private funnelName: string;
  private steps: string[] = [];
  private startTime: number;
  
  constructor(funnelName: string, steps: string[]) {
    this.funnelName = funnelName;
    this.steps = steps;
    this.startTime = Date.now();
  }
  
  trackStep(stepName: string, properties?: EventProperties) {
    const stepIndex = this.steps.indexOf(stepName);
    
    analytics.track('onboarding_step_completed', {
      funnel: this.funnelName,
      step: stepName,
      stepIndex,
      timeFromStart: Date.now() - this.startTime,
      ...properties,
    });
  }
  
  trackCompletion(properties?: EventProperties) {
    const duration = Date.now() - this.startTime;
    
    analytics.track('onboarding_completed', {
      funnel: this.funnelName,
      duration,
      stepsCompleted: this.steps.length,
      ...properties,
    });
  }
  
  trackAbandonment(lastStep: string, reason?: string) {
    const duration = Date.now() - this.startTime;
    
    analytics.track('onboarding_abandoned', {
      funnel: this.funnelName,
      lastStep,
      reason,
      duration,
    });
  }
}

// ============================================================================
// COMMERCIAL TRACKING
// ============================================================================

export function trackAffiliateClick(
  provider: string,
  productType: string,
  estimatedCommission?: number
) {
  analytics.track('affiliate_link_clicked', {
    provider,
    productType,
    estimatedCommission,
  });
}

export function trackOfferView(
  offerId: string,
  provider: string,
  savingsAmount: number
) {
  analytics.track('offer_viewed', {
    offerId,
    provider,
    savingsAmount,
  });
}

export function trackSwitchInitiated(
  fromProvider: string,
  toProvider: string,
  productType: string,
  estimatedSavings: number
) {
  analytics.conversion('switch_initiated', estimatedSavings);
  
  analytics.track('switch_initiated', {
    fromProvider,
    toProvider,
    productType,
    estimatedSavings,
  });
}

// ============================================================================
// EXPORT
// ============================================================================

export default analytics;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__analytics = analytics;
}
