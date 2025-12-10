/**
 * PERFORMANCE MONITORING & OPTIMIZATION
 * 
 * Tools for:
 * - Performance tracking
 * - Code splitting helpers
 * - Lazy loading utilities
 * - Bundle optimization
 * - Image optimization
 * 
 * @module lib/performance
 */

import * as Sentry from "@sentry/nextjs";
import { analytics } from './analytics';

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  /**
   * Start performance measurement
   */
  start(label: string) {
    this.marks.set(label, performance.now());
  }
  
  /**
   * End performance measurement and report
   */
  end(label: string, threshold?: number) {
    const startTime = this.marks.get(label);
    if (!startTime) return;
    
    const duration = performance.now() - startTime;
    this.marks.delete(label);
    
    // Report if slower than threshold
    if (threshold && duration > threshold) {
      analytics.timing('performance', label, duration);
      
      Sentry.captureMessage(`Slow operation: ${label}`, {
        level: 'warning',
        extra: {
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
        },
      });
    }
    
    return duration;
  }
  
  /**
   * Measure function execution time
   */
  async measure<T>(
    label: string,
    fn: () => Promise<T>,
    threshold?: number
  ): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label, threshold);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// WEB VITALS TRACKING
// ============================================================================

export function trackWebVitals() {
  if (typeof window === 'undefined') return;
  
  // Track Core Web Vitals
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          analytics.timing('web-vitals', 'LCP', entry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          const delay = fidEntry.processingStart - fidEntry.startTime;
          analytics.timing('web-vitals', 'FID', delay);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as any;
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
          }
        }
        analytics.timing('web-vitals', 'CLS', clsValue * 1000);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
    } catch (error) {
      console.warn('Web Vitals tracking failed:', error);
    }
  }
}

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

/**
 * Lazy load component with loading state
 */
export function lazyLoadComponent(
  importFn: () => Promise<any>,
  fallback?: React.ReactNode
) {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const React = require('react');
  return React.lazy(importFn);
}

/**
 * Preload component for faster navigation
 */
export function preloadComponent(importFn: () => Promise<any>) {
  if (typeof window !== 'undefined') {
    // Start loading immediately
    importFn();
  }
}

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 75
): string {
  // If using Next.js Image, this is handled automatically
  // For external images, you might use a CDN
  return src;
}

/**
 * Get responsive image sizes
 */
export function getResponsiveSizes(breakpoints: number[]): string {
  return breakpoints
    .map((bp, i) => {
      if (i === breakpoints.length - 1) {
        return `${bp}px`;
      }
      return `(max-width: ${bp}px) ${bp}px`;
    })
    .join(', ');
}

// ============================================================================
// BUNDLE OPTIMIZATION
// ============================================================================

/**
 * Check if code splitting is beneficial
 */
export function shouldCodeSplit(componentSize: number): boolean {
  // Split if component is larger than 50KB
  return componentSize > 50000;
}

/**
 * Dynamically import heavy dependencies
 */
export async function loadHeavyDependency<T>(
  moduleName: string
): Promise<T> {
  const start = performance.now();
  
  try {
    const module = await import(moduleName);
    const loadTime = performance.now() - start;
    
    if (loadTime > 1000) {
      console.warn(`Slow dependency load: ${moduleName} (${loadTime.toFixed(0)}ms)`);
    }
    
    return module.default || module;
  } catch (error) {
    console.error(`Failed to load ${moduleName}:`, error);
    throw error;
  }
}

// ============================================================================
// RESOURCE HINTS
// ============================================================================

/**
 * Prefetch resource for future navigation
 */
export function prefetchResource(url: string, as: string = 'fetch') {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Preconnect to external origin
 */
export function preconnectOrigin(origin: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  document.head.appendChild(link);
}

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

/**
 * Clean up large objects to prevent memory leaks
 */
export function cleanupLargeObject(obj: any) {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    delete obj[key];
  });
}

/**
 * Monitor memory usage
 */
export function getMemoryUsage(): number | null {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }
  
  const memory = (performance as any).memory;
  return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  performanceMonitor,
  trackWebVitals,
  lazyLoadComponent,
  preloadComponent,
  getOptimizedImageUrl,
  getResponsiveSizes,
  loadHeavyDependency,
  prefetchResource,
  preconnectOrigin,
  getMemoryUsage,
};
