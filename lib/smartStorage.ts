/**
 * SMART STORAGE SYSTEM
 * 
 * Robust, self-healing storage with automatic persistence
 * - Multiple fallback layers
 * - Automatic data recovery
 * - Zero configuration needed
 * - Works offline
 * 
 * @module lib/smartStorage
 */

interface StorageEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

interface CostEntry {
  date: string;
  cost: number;
  temperature?: number;
  notes?: string;
}

interface UserPreferences {
  postcode: string;
  homeType: string;
  occupants: number;
  heatingType: string;
  targetDailyCost?: number;
  notificationsEnabled?: boolean;
}

/**
 * Enhanced storage with automatic fallbacks and recovery
 */
export class SmartStorage {
  private static VERSION = '1.0.0';
  private static memoryCache = new Map<string, any>();

  /**
   * Save data with automatic persistence across multiple storage layers
   */
  static save<T>(key: string, data: T): boolean {
    try {
      const entry: StorageEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION,
      };

      // Layer 1: Memory cache (instant access)
      this.memoryCache.set(key, entry);

      // Layer 2: localStorage (persistent)
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(key, JSON.stringify(entry));
        } catch (e) {
          console.warn('localStorage full, using memory only:', e);
        }
      }

      return true;
    } catch (error) {
      console.error('Storage save failed:', error);
      return false;
    }
  }

  /**
   * Load data with automatic fallback recovery
   */
  static load<T>(key: string): T | null {
    try {
      // Layer 1: Try memory cache first
      const memoryData = this.memoryCache.get(key);
      if (memoryData) {
        return memoryData.data as T;
      }

      // Layer 2: Try localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: StorageEntry<T> = JSON.parse(stored);
          
          // Restore to memory cache
          this.memoryCache.set(key, entry);
          
          return entry.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Storage load failed:', error);
      return null;
    }
  }

  /**
   * Delete data from all layers
   */
  static delete(key: string): boolean {
    try {
      this.memoryCache.delete(key);
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
      
      return true;
    } catch (error) {
      console.error('Storage delete failed:', error);
      return false;
    }
  }

  /**
   * Clear all data (useful for reset)
   */
  static clear(): boolean {
    try {
      this.memoryCache.clear();
      
      if (typeof window !== 'undefined' && window.localStorage) {
        // Only clear app-specific keys
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cost_') || key.startsWith('user_')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  }
}

/**
 * Cost tracking system with automatic persistence
 */
export class CostTracker {
  private static STORAGE_KEY = 'cost_history';
  private static MAX_ENTRIES = 365; // Keep 1 year of data

  /**
   * Add a cost entry for today
   */
  static addEntry(cost: number, temperature?: number, notes?: string): boolean {
    try {
      const history = this.getHistory();
      const today = new Date().toISOString().split('T')[0];

      // Update or add today's entry
      const existingIndex = history.findIndex(e => e.date === today);
      const entry: CostEntry = { date: today, cost, temperature, notes };

      if (existingIndex >= 0) {
        history[existingIndex] = entry;
      } else {
        history.push(entry);
      }

      // Sort by date (newest first) and limit entries
      history.sort((a, b) => b.date.localeCompare(a.date));
      const trimmed = history.slice(0, this.MAX_ENTRIES);

      return SmartStorage.save(this.STORAGE_KEY, trimmed);
    } catch (error) {
      console.error('Failed to add cost entry:', error);
      return false;
    }
  }

  /**
   * Get cost history
   */
  static getHistory(): CostEntry[] {
    return SmartStorage.load<CostEntry[]>(this.STORAGE_KEY) || [];
  }

  /**
   * Get today's cost
   */
  static getTodayCost(): number | null {
    const history = this.getHistory();
    const today = new Date().toISOString().split('T')[0];
    const entry = history.find(e => e.date === today);
    return entry ? entry.cost : null;
  }

  /**
   * Get last N days of costs
   */
  static getRecentCosts(days: number = 7): CostEntry[] {
    const history = this.getHistory();
    return history.slice(0, days);
  }

  /**
   * Calculate average cost for last N days
   */
  static getAverageCost(days: number = 30): number {
    const recent = this.getRecentCosts(days);
    if (recent.length === 0) return 0;
    
    const sum = recent.reduce((acc, entry) => acc + entry.cost, 0);
    return sum / recent.length;
  }

  /**
   * Get weekly comparison (this week vs last week)
   */
  static getWeeklyComparison(): { thisWeek: number; lastWeek: number; change: number } {
    const history = this.getHistory();
    
    const today = new Date();
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    const thisWeekCosts = history.filter(e => {
      const date = new Date(e.date);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });

    const lastWeekCosts = history.filter(e => {
      const date = new Date(e.date);
      const end = new Date(thisWeekStart);
      end.setDate(end.getDate() - 1);
      return date >= lastWeekStart && date <= end;
    });

    const thisWeekAvg = thisWeekCosts.length > 0 
      ? thisWeekCosts.reduce((acc, e) => acc + e.cost, 0) / thisWeekCosts.length 
      : 0;

    const lastWeekAvg = lastWeekCosts.length > 0 
      ? lastWeekCosts.reduce((acc, e) => acc + e.cost, 0) / lastWeekCosts.length 
      : 0;

    const change = lastWeekAvg > 0 
      ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 
      : 0;

    return {
      thisWeek: thisWeekAvg,
      lastWeek: lastWeekAvg,
      change: Math.round(change * 10) / 10,
    };
  }

  /**
   * Export data as CSV
   */
  static exportCSV(): string {
    const history = this.getHistory();
    const rows = [
      'Date,Cost,Temperature,Notes',
      ...history.map(e => 
        `${e.date},${e.cost},${e.temperature || ''},${e.notes || ''}`
      ),
    ];
    return rows.join('\n');
  }

  /**
   * Import data from CSV
   */
  static importCSV(csvText: string): boolean {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return false;

      const entries: CostEntry[] = [];
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const [date, cost, temperature, notes] = lines[i].split(',');
        if (date && cost) {
          entries.push({
            date: date.trim(),
            cost: parseFloat(cost.trim()),
            temperature: temperature ? parseFloat(temperature.trim()) : undefined,
            notes: notes?.trim() || undefined,
          });
        }
      }

      if (entries.length > 0) {
        return SmartStorage.save(this.STORAGE_KEY, entries);
      }

      return false;
    } catch (error) {
      console.error('CSV import failed:', error);
      return false;
    }
  }
}

/**
 * User preferences with automatic persistence
 */
export class UserPrefs {
  private static STORAGE_KEY = 'user_preferences';

  /**
   * Save user preferences
   */
  static save(prefs: Partial<UserPreferences>): boolean {
    try {
      const current = this.load() || {} as UserPreferences;
      const updated = { ...current, ...prefs };
      return SmartStorage.save(this.STORAGE_KEY, updated);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  /**
   * Load user preferences
   */
  static load(): UserPreferences | null {
    return SmartStorage.load<UserPreferences>(this.STORAGE_KEY);
  }

  /**
   * Get specific preference
   */
  static get<K extends keyof UserPreferences>(key: K): UserPreferences[K] | null {
    const prefs = this.load();
    return prefs ? prefs[key] : null;
  }

  /**
   * Check if onboarding is complete
   */
  static isOnboardingComplete(): boolean {
    const prefs = this.load();
    return !!(prefs?.postcode && prefs?.homeType);
  }

  /**
   * Reset all preferences
   */
  static reset(): boolean {
    return SmartStorage.delete(this.STORAGE_KEY);
  }
}

/**
 * Simple hook for reactive storage access
 * Note: Import useState and useCallback from 'react' in your components
 */
export function createStorageHook<T>(key: string, defaultValue: T) {
  return {
    get: () => SmartStorage.load<T>(key) ?? defaultValue,
    set: (value: T) => SmartStorage.save(key, value),
  };
}
