/**
 * API RESILIENCE LAYER
 * 
 * Enterprise-grade API client with:
 * - Automatic retries with exponential backoff
 * - Request caching (memory + localStorage)
 * - Rate limiting and request batching
 * - Circuit breaker pattern
 * - Fallback to cached/mock data
 * - Request deduplication
 * - Timeout handling
 * 
 * @module lib/apiClient
 */

import * as Sentry from "@sentry/nextjs";

// ============================================================================
// TYPES
// ============================================================================

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheTime?: number;
  enableCache?: boolean;
  enableRateLimit?: boolean;
  maxRequestsPerSecond?: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  enableCache?: boolean;
  cacheTime?: number;
  fallbackData?: any;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

class CircuitBreaker {
  private endpoints: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 60000; // 1 minute
  
  check(endpoint: string): boolean {
    const state = this.getState(endpoint);
    
    if (state.state === 'open') {
      const timeSinceFailure = Date.now() - state.lastFailureTime;
      if (timeSinceFailure > this.resetTimeout) {
        state.state = 'half-open';
        this.endpoints.set(endpoint, state);
        return true;
      }
      return false;
    }
    
    return true;
  }
  
  recordSuccess(endpoint: string) {
    const state = this.getState(endpoint);
    state.failures = 0;
    state.state = 'closed';
    this.endpoints.set(endpoint, state);
  }
  
  recordFailure(endpoint: string) {
    const state = this.getState(endpoint);
    state.failures++;
    state.lastFailureTime = Date.now();
    
    if (state.failures >= this.failureThreshold) {
      state.state = 'open';
      Sentry.captureMessage(`Circuit breaker opened for ${endpoint}`, 'warning');
    }
    
    this.endpoints.set(endpoint, state);
  }
  
  private getState(endpoint: string): CircuitBreakerState {
    if (!this.endpoints.has(endpoint)) {
      this.endpoints.set(endpoint, {
        failures: 0,
        lastFailureTime: 0,
        state: 'closed',
      });
    }
    return this.endpoints.get(endpoint)!;
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequestsPerSecond: number;
  
  constructor(maxRequestsPerSecond: number = 10) {
    this.maxRequestsPerSecond = maxRequestsPerSecond;
  }
  
  async throttle(): Promise<void> {
    const now = Date.now();
    
    // Remove requests older than 1 second
    this.requests = this.requests.filter(time => now - time < 1000);
    
    if (this.requests.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.requests[0];
      const waitTime = 1000 - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.throttle();
    }
    
    this.requests.push(now);
  }
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

class CacheManager {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private readonly maxMemoryEntries = 100;
  
  set(key: string, data: any, ttl: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    
    // Memory cache
    this.memoryCache.set(key, entry);
    
    // Prune if too large
    if (this.memoryCache.size > this.maxMemoryEntries) {
      const oldestKey = this.memoryCache.keys().next().value as string | undefined;
      if (oldestKey !== undefined) {
        this.memoryCache.delete(oldestKey);
      }
    }
    
    // LocalStorage cache (with error handling)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`api_cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        // Quota exceeded - clear old entries
        this.clearOldLocalStorageEntries();
      }
    }
  }
  
  get(key: string): any | null {
    // Check memory first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && memEntry.expiresAt > Date.now()) {
      return memEntry.data;
    }
    
    // Check localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`api_cache_${key}`);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          if (entry.expiresAt > Date.now()) {
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            return entry.data;
          }
        }
      } catch (error) {
        // Invalid cache entry
      }
    }
    
    return null;
  }
  
  private clearOldLocalStorageEntries(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(k => k.startsWith('api_cache_'));
    
    // Remove oldest 25%
    const toRemove = Math.ceil(cacheKeys.length * 0.25);
    cacheKeys.slice(0, toRemove).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.filter(k => k.startsWith('api_cache_')).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
}

// ============================================================================
// API CLIENT
// ============================================================================

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;
  private cache: CacheManager;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  
  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      timeout: config.timeout || 10000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      cacheTime: config.cacheTime || 5 * 60 * 1000, // 5 minutes
      enableCache: config.enableCache !== false,
      enableRateLimit: config.enableRateLimit !== false,
      maxRequestsPerSecond: config.maxRequestsPerSecond || 10,
    };
    
    this.circuitBreaker = new CircuitBreaker();
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerSecond);
    this.cache = new CacheManager();
  }
  
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }
  
  async post<T = any>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }
  
  private async request<T>(url: string, options: RequestOptions): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    const cacheKey = this.getCacheKey(fullUrl, options);
    
    // Check circuit breaker
    if (!this.circuitBreaker.check(fullUrl)) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
      if (options.fallbackData) return options.fallbackData;
      throw new Error(`Circuit breaker open for ${fullUrl}`);
    }
    
    // Deduplicate concurrent requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }
    
    // Check cache
    if (options.enableCache !== false && this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }
    
    // Rate limiting
    if (this.config.enableRateLimit) {
      await this.rateLimiter.throttle();
    }
    
    // Create request promise
    const requestPromise = this.executeRequest<T>(fullUrl, options, cacheKey);
    this.pendingRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  private async executeRequest<T>(
    url: string,
    options: RequestOptions,
    cacheKey: string
  ): Promise<T> {
    const retries = options.retries ?? this.config.retries;
    const timeout = options.timeout ?? this.config.timeout;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Success - update circuit breaker
        this.circuitBreaker.recordSuccess(url);
        
        // Cache response
        if (options.enableCache !== false && this.config.enableCache) {
          const cacheTime = options.cacheTime ?? this.config.cacheTime;
          this.cache.set(cacheKey, data, cacheTime);
        }
        
        return data;
        
      } catch (error: any) {
        const isLastAttempt = attempt === retries;
        
        if (isLastAttempt) {
          // Record failure
          this.circuitBreaker.recordFailure(url);
          
          // Log to Sentry
          Sentry.captureException(error, {
            tags: {
              url,
              attempt: attempt + 1,
              retries,
            },
          });
          
          // Try fallback
          const cached = this.cache.get(cacheKey);
          if (cached) {
            console.warn(`Using cached data for ${url} after error:`, error.message);
            return cached;
          }
          
          if (options.fallbackData) {
            console.warn(`Using fallback data for ${url} after error:`, error.message);
            return options.fallbackData;
          }
          
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Request failed after all retries');
  }
  
  private getCacheKey(url: string, options: RequestOptions): string {
    const method = options.method || 'GET';
    const body = options.body || '';
    return `${method}:${url}:${body}`;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient({
  timeout: 10000,
  retries: 3,
  cacheTime: 5 * 60 * 1000,
  maxRequestsPerSecond: 10,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch with automatic retry and fallback
 */
export async function fetchWithResilience<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  return apiClient.get<T>(url, options);
}

/**
 * Batch multiple API calls efficiently
 */
export async function batchFetch<T>(
  requests: Array<{ url: string; options?: RequestOptions }>
): Promise<T[]> {
  return Promise.all(
    requests.map(req => apiClient.get<T>(req.url, req.options))
  );
}
