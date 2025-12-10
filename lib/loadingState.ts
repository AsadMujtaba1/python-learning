/**
 * Loading State Manager for Dashboard
 * Provides optimized loading states, skeleton loaders, and progressive loading
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Track performance metric (lightweight version)
 */
function trackPerformance(name: string, value: number): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ Performance: ${name} = ${value}ms`);
  }
  
  // In production, send to analytics
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', 'performance', { metric: name, value });
  }
}

export interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  stage: 'idle' | 'fetching' | 'processing' | 'rendering' | 'complete' | 'error';
  message?: string;
  error?: Error;
}

/**
 * Enhanced loading hook with progress tracking
 */
export function useLoadingState(initialState: Partial<LoadingState> = {}) {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    stage: 'idle',
    ...initialState,
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      progress: 0,
      stage: 'fetching',
      message,
      error: undefined,
    });
  }, []);

  const updateProgress = useCallback((progress: number, stage?: LoadingState['stage'], message?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      stage: stage || prev.stage,
      message: message || prev.message,
    }));
  }, []);

  const completeLoading = useCallback(() => {
    setState({
      isLoading: false,
      progress: 100,
      stage: 'complete',
      error: undefined,
    });
  }, []);

  const setError = useCallback((error: Error, message?: string) => {
    setState({
      isLoading: false,
      progress: 0,
      stage: 'error',
      message: message || error.message,
      error,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      progress: 0,
      stage: 'idle',
      error: undefined,
    });
  }, []);

  return {
    ...state,
    startLoading,
    updateProgress,
    completeLoading,
    setError,
    reset,
  };
}

/**
 * Progressive data loader with performance tracking
 */
export async function loadWithProgress<T>(
  loadFn: () => Promise<T>,
  options: {
    name: string;
    onProgress?: (progress: number, message?: string) => void;
    stages?: Array<{ progress: number; message: string }>;
  }
): Promise<T> {
  const startTime = performance.now();
  const { name, onProgress, stages = [] } = options;

  try {
    // Report initial progress
    onProgress?.(0, `Loading ${name}...`);

    // Simulate progress updates for stages
    const stageInterval = stages.length > 0 ? setInterval(() => {
      const elapsed = performance.now() - startTime;
      const estimatedTotal = 2000; // 2 seconds estimate
      const progress = Math.min(90, (elapsed / estimatedTotal) * 100);
      
      const currentStage = stages.find(s => progress >= s.progress);
      onProgress?.(progress, currentStage?.message);
    }, 100) : null;

    // Execute the actual loading function
    const result = await loadFn();

    // Clear interval and complete
    if (stageInterval) clearInterval(stageInterval);
    onProgress?.(100, `${name} loaded`);

    // Track performance
    const loadTime = performance.now() - startTime;
    trackPerformance(`${name}_load_time`, loadTime);

    return result;
  } catch (error) {
    onProgress?.(0, `Failed to load ${name}`);
    throw error;
  }
}

/**
 * Batch loader for multiple resources
 */
export async function loadBatch<T extends Record<string, () => Promise<any>>>(
  loaders: T,
  onProgress?: (loaded: number, total: number, currentKey: string) => void
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const keys = Object.keys(loaders);
  const total = keys.length;
  const results: any = {};

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    onProgress?.(i, total, key);
    
    try {
      results[key] = await loaders[key as keyof T]();
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      results[key] = null;
    }
  }

  onProgress?.(total, total, 'complete');
  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}

/**
 * Adaptive loading based on network conditions
 */
export function useAdaptiveLoading() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (!connection) return;

    const updateQuality = () => {
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          setQuality('low');
          break;
        case '3g':
          setQuality('medium');
          break;
        case '4g':
        default:
          setQuality('high');
          break;
      }
    };

    updateQuality();
    connection.addEventListener('change', updateQuality);

    return () => {
      connection.removeEventListener('change', updateQuality);
    };
  }, []);

  return quality;
}

/**
 * Lazy component loader with retry logic
 */
export function loadComponentWithRetry<T extends React.ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  retries: number = 3,
  delay: number = 1000
): Promise<{ default: T }> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attemptLoad = () => {
      attempts++;
      
      loader()
        .then(resolve)
        .catch((error) => {
          if (attempts >= retries) {
            reject(error);
          } else {
            console.warn(`Component load failed (attempt ${attempts}/${retries}), retrying...`);
            setTimeout(attemptLoad, delay * attempts);
          }
        });
    };

    attemptLoad();
  });
}

/**
 * Preload critical resources
 */
export function preloadResources(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    } else if (url.endsWith('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      ...options,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

/**
 * Debounced loading state
 */
export function useDebouncedLoading(isLoading: boolean, delay: number = 300) {
  const [debouncedLoading, setDebouncedLoading] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      // Show loading immediately when starting
      setDebouncedLoading(true);
    } else {
      // Delay hiding to prevent flashing
      const timer = setTimeout(() => {
        setDebouncedLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isLoading, delay]);

  return debouncedLoading;
}
