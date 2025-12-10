/**
 * CACHING UTILITIES
 * 
 * Intelligent caching layer with TTL, invalidation, and storage strategies.
 * Supports in-memory cache and persistent browser storage.
 * 
 * @module lib/utils/caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persistent?: boolean; // Use localStorage for persistence
  prefix?: string; // Cache key prefix
}

/**
 * Simple in-memory cache with TTL
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = 30 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

/**
 * Persistent cache using localStorage
 */
class PersistentCache {
  private prefix: string;

  constructor(prefix: string = 'cache_') {
    this.prefix = prefix;
  }

  /**
   * Get value from localStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Set value in localStorage
   */
  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        key,
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      // Storage might be full - try to clear old entries
      this.cleanup();
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all cache with this prefix
   */
  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const entry: CacheEntry<any> = JSON.parse(item);
            if (now - entry.timestamp > entry.ttl) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid entry - remove it
          localStorage.removeItem(key);
        }
      }
    });
  }
}

/**
 * Unified cache manager
 */
export class CacheManager {
  private memoryCache: MemoryCache;
  private persistentCache: PersistentCache;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.persistentCache = new PersistentCache();
  }

  /**
   * Get value from cache (checks memory first, then persistent)
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { persistent = false } = options;
    
    // Check memory cache first
    const memoryValue = this.memoryCache.get<T>(key);
    if (memoryValue !== null) {
      return memoryValue;
    }
    
    // Check persistent cache if enabled
    if (persistent) {
      const persistentValue = this.persistentCache.get<T>(key);
      if (persistentValue !== null) {
        // Populate memory cache
        this.memoryCache.set(key, persistentValue, options.ttl);
        return persistentValue;
      }
    }
    
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 30 * 60 * 1000, // 30 minutes default
      persistent = false,
    } = options;
    
    // Always set in memory cache
    this.memoryCache.set(key, data, ttl);
    
    // Set in persistent cache if enabled
    if (persistent) {
      this.persistentCache.set(key, data, ttl);
    }
  }

  /**
   * Delete specific key from both caches
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
  }

  /**
   * Get or compute value (cache-aside pattern)
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }
    
    // Compute value
    const value = await computeFn();
    
    // Store in cache
    await this.set(key, value, options);
    
    return value;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    // Invalidate memory cache
    const memoryKeys = this.memoryCache.keys();
    memoryKeys.forEach(key => {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    });
    
    // Invalidate persistent cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (regex.test(key)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// ==========================================
// CONVENIENCE FUNCTIONS
// ==========================================

/**
 * Cache weather data (30 minutes TTL)
 */
export async function cacheWeather<T>(
  postcode: string,
  data: T
): Promise<void> {
  await cacheManager.set(`weather:${postcode}`, data, {
    ttl: 30 * 60 * 1000,
    persistent: true,
  });
}

/**
 * Get cached weather data
 */
export async function getCachedWeather<T>(
  postcode: string
): Promise<T | null> {
  return await cacheManager.get(`weather:${postcode}`, {
    persistent: true,
  });
}

/**
 * Cache tariff data (24 hours TTL)
 */
export async function cacheTariff<T>(
  key: string,
  data: T
): Promise<void> {
  await cacheManager.set(`tariff:${key}`, data, {
    ttl: 24 * 60 * 60 * 1000,
    persistent: true,
  });
}

/**
 * Get cached tariff data
 */
export async function getCachedTariff<T>(
  key: string
): Promise<T | null> {
  return await cacheManager.get(`tariff:${key}`, {
    persistent: true,
  });
}

/**
 * Cache calculation results (5 minutes TTL)
 */
export async function cacheCalculation<T>(
  key: string,
  data: T
): Promise<void> {
  await cacheManager.set(`calc:${key}`, data, {
    ttl: 5 * 60 * 1000,
    persistent: false, // Memory only for calculations
  });
}

/**
 * Get cached calculation
 */
export async function getCachedCalculation<T>(
  key: string
): Promise<T | null> {
  return await cacheManager.get(`calc:${key}`);
}

/**
 * Cache postcode data (7 days TTL)
 */
export async function cachePostcode<T>(
  postcode: string,
  data: T
): Promise<void> {
  await cacheManager.set(`postcode:${postcode}`, data, {
    ttl: 7 * 24 * 60 * 60 * 1000,
    persistent: true,
  });
}

/**
 * Get cached postcode data
 */
export async function getCachedPostcode<T>(
  postcode: string
): Promise<T | null> {
  return await cacheManager.get(`postcode:${postcode}`, {
    persistent: true,
  });
}

/**
 * Invalidate all weather caches
 */
export function invalidateWeatherCache(): void {
  cacheManager.invalidateByPattern(/^weather:/);
}

/**
 * Invalidate all calculation caches
 */
export function invalidateCalculationCache(): void {
  cacheManager.invalidateByPattern(/^calc:/);
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  cacheManager.clear();
}

/**
 * Generic cache function with automatic key generation
 */
export async function cache<T>(
  fn: () => Promise<T> | T,
  options: {
    key: string;
    ttl?: number;
    persistent?: boolean;
  }
): Promise<T> {
  return await cacheManager.getOrCompute(
    options.key,
    fn,
    {
      ttl: options.ttl,
      persistent: options.persistent,
    }
  );
}

// Export the main cache manager for advanced usage
export { cacheManager };

// Default export
export default {
  cacheWeather,
  getCachedWeather,
  cacheTariff,
  getCachedTariff,
  cacheCalculation,
  getCachedCalculation,
  cachePostcode,
  getCachedPostcode,
  invalidateWeatherCache,
  invalidateCalculationCache,
  clearAllCaches,
  cache,
};
