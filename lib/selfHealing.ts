/**
 * SELF-HEALING PATTERNS
 * 
 * Automatic recovery mechanisms for common failures:
 * - Component state recovery
 * - Data refresh on staleness
 * - Automatic retry for failed operations
 * - Local cache fallback
 * - Session recovery
 * 
 * @module lib/selfHealing
 */

import * as Sentry from "@sentry/nextjs";
import { apiClient } from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

interface HealthCheckResult {
  healthy: boolean;
  issues: string[];
  recoveryActions: string[];
}

interface ComponentState {
  lastUpdate: number;
  errorCount: number;
  data: any;
}

// ============================================================================
// COMPONENT STATE MANAGER
// ============================================================================

class ComponentStateManager {
  private states: Map<string, ComponentState> = new Map();
  private readonly staleThreshold = 30 * 60 * 1000; // 30 minutes
  private readonly maxErrors = 3;
  
  registerComponent(id: string, initialData: any): void {
    this.states.set(id, {
      lastUpdate: Date.now(),
      errorCount: 0,
      data: initialData,
    });
  }
  
  updateState(id: string, data: any): void {
    const state = this.states.get(id);
    if (state) {
      state.data = data;
      state.lastUpdate = Date.now();
      state.errorCount = 0;
      this.states.set(id, state);
    }
  }
  
  recordError(id: string): boolean {
    const state = this.states.get(id);
    if (!state) return false;
    
    state.errorCount++;
    this.states.set(id, state);
    
    // If too many errors, trigger reset
    if (state.errorCount >= this.maxErrors) {
      Sentry.captureMessage(`Component ${id} exceeded error threshold`, 'warning');
      return true;
    }
    
    return false;
  }
  
  isStale(id: string): boolean {
    const state = this.states.get(id);
    if (!state) return true;
    
    return Date.now() - state.lastUpdate > this.staleThreshold;
  }
  
  getState(id: string): any {
    return this.states.get(id)?.data || null;
  }
  
  resetComponent(id: string): void {
    this.states.delete(id);
  }
}

export const componentStateManager = new ComponentStateManager();

// ============================================================================
// AUTO-REFRESH HOOK
// ============================================================================

export function useAutoRefresh(
  fetchFn: () => Promise<any>,
  componentId: string,
  interval: number = 5 * 60 * 1000 // 5 minutes
) {
  if (typeof window === 'undefined') return;
  
  const refresh = async () => {
    try {
      if (componentStateManager.isStale(componentId)) {
        const data = await fetchFn();
        componentStateManager.updateState(componentId, data);
      }
    } catch (error) {
      const shouldReset = componentStateManager.recordError(componentId);
      if (shouldReset) {
        // Component is broken, try to recover
        setTimeout(() => refresh(), 5000);
      }
    }
  };
  
  // Initial check
  refresh();
  
  // Periodic refresh
  const intervalId = setInterval(refresh, interval);
  
  return () => clearInterval(intervalId);
}

// ============================================================================
// HEALTH CHECKER
// ============================================================================

export async function checkSystemHealth(): Promise<HealthCheckResult> {
  const issues: string[] = [];
  const recoveryActions: string[] = [];
  
  // Check Firebase connection
  try {
    if (typeof window !== 'undefined') {
      const { auth } = await import('@/lib/firebase');
      if (!auth) {
        issues.push('Firebase Auth not initialized');
        recoveryActions.push('Reload page to reinitialize Firebase');
      }
    }
  } catch (error) {
    issues.push('Firebase connection failed');
    recoveryActions.push('Check internet connection and Firebase config');
  }
  
  // Check localStorage availability
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('health_check', 'ok');
      localStorage.removeItem('health_check');
    }
  } catch (error) {
    issues.push('LocalStorage unavailable');
    recoveryActions.push('Clear browser data or use incognito mode');
  }
  
  // Check API connectivity
  try {
    // Simple ping to our own API
    await fetch('/api/health', { method: 'HEAD' }).catch(() => {
      issues.push('API connectivity issues');
      recoveryActions.push('Check network connection');
    });
  } catch (error) {
    issues.push('Network connectivity issues');
    recoveryActions.push('Check internet connection');
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    recoveryActions,
  };
}

// ============================================================================
// AUTO-RECOVERY WRAPPER
// ============================================================================

export async function withAutoRecovery<T>(
  fn: () => Promise<T>,
  fallback: T,
  componentId?: string
): Promise<T> {
  try {
    const result = await fn();
    if (componentId) {
      componentStateManager.updateState(componentId, result);
    }
    return result;
  } catch (error) {
    console.warn('Operation failed, attempting recovery:', error);
    
    if (componentId) {
      // Try to use cached state
      const cachedState = componentStateManager.getState(componentId);
      if (cachedState) {
        console.log('Using cached state for recovery');
        return cachedState;
      }
    }
    
    // Check if we can recover
    const health = await checkSystemHealth();
    
    if (!health.healthy) {
      Sentry.captureMessage('System health check failed', {
        level: 'warning',
        extra: {
          issues: health.issues,
          recoveryActions: health.recoveryActions,
        },
      });
    }
    
    // Return fallback
    return fallback;
  }
}

// ============================================================================
// SESSION RECOVERY
// ============================================================================

export function recoverSession(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if we have session data
    const sessionData = localStorage.getItem('user_session');
    if (!sessionData) return false;
    
    // Validate session data
    const session = JSON.parse(sessionData);
    if (!session.userId || !session.timestamp) return false;
    
    // Check if session is recent (within 24 hours)
    const sessionAge = Date.now() - session.timestamp;
    if (sessionAge > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('user_session');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session recovery failed:', error);
    return false;
  }
}

// ============================================================================
// DATA RECOVERY
// ============================================================================

export async function recoverData(dataKey: string): Promise<any | null> {
  // Try multiple sources
  const sources = [
    // 1. Memory cache
    () => {
      if (typeof window === 'undefined') return null;
      const cached = (window as any).__dataCache?.[dataKey];
      return cached;
    },
    
    // 2. LocalStorage
    () => {
      if (typeof window === 'undefined') return null;
      const stored = localStorage.getItem(`data_${dataKey}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 60 * 60 * 1000) {
            return parsed.data;
          }
        } catch {}
      }
      return null;
    },
    
    // 3. IndexedDB (future enhancement)
    async () => {
      // TODO: Implement IndexedDB fallback
      return null;
    },
  ];
  
  for (const source of sources) {
    try {
      const data = await source();
      if (data !== null) {
        console.log(`Recovered data for ${dataKey} from fallback source`);
        return data;
      }
    } catch (error) {
      continue;
    }
  }
  
  return null;
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

export function saveToCache(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Memory cache
    if (!(window as any).__dataCache) {
      (window as any).__dataCache = {};
    }
    (window as any).__dataCache[key] = data;
    
    // LocalStorage cache
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`data_${key}`, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

// ============================================================================
// AUTOMATIC ERROR RECOVERY
// ============================================================================

export class ErrorRecoveryManager {
  private errorCounts: Map<string, number> = new Map();
  private readonly maxRetries = 3;
  
  async attemptRecovery(
    operation: string,
    retryFn: () => Promise<any>,
    fallback: any
  ): Promise<any> {
    const currentCount = this.errorCounts.get(operation) || 0;
    
    if (currentCount >= this.maxRetries) {
      console.warn(`Max retries exceeded for ${operation}, using fallback`);
      this.errorCounts.delete(operation);
      return fallback;
    }
    
    try {
      const result = await retryFn();
      this.errorCounts.delete(operation);
      return result;
    } catch (error) {
      this.errorCounts.set(operation, currentCount + 1);
      
      // Exponential backoff
      const delay = Math.pow(2, currentCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return this.attemptRecovery(operation, retryFn, fallback);
    }
  }
}

export const errorRecoveryManager = new ErrorRecoveryManager();

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  componentStateManager,
  checkSystemHealth,
  withAutoRecovery,
  recoverSession,
  recoverData,
  saveToCache,
  errorRecoveryManager,
};
