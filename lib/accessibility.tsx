/**
 * Accessibility utilities for the dashboard
 * Ensures WCAG 2.1 AA compliance and keyboard navigation
 */

import { useEffect, useCallback } from 'react';

/**
 * Skip to main content for keyboard navigation
 */
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
};

/**
 * Keyboard navigation hook for tab components
 */
export function useKeyboardNavigation(
  items: string[],
  currentIndex: number,
  onChange: (index: number) => void
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          onChange(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          onChange(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
          break;
        case 'Home':
          event.preventDefault();
          onChange(0);
          break;
        case 'End':
          event.preventDefault();
          onChange(items.length - 1);
          break;
      }
    },
    [items.length, currentIndex, onChange]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const focusableElements = document.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [enabled]);
}

/**
 * Announce content changes to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export function useAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Chart accessibility wrapper
 */
export interface ChartA11yProps {
  title: string;
  description: string;
  dataPoints?: Array<{ label: string; value: number }>;
}

export function getChartAriaProps(props: ChartA11yProps) {
  const { title, description, dataPoints } = props;
  
  let longDescription = description;
  if (dataPoints && dataPoints.length > 0) {
    const max = Math.max(...dataPoints.map(d => d.value));
    const min = Math.min(...dataPoints.map(d => d.value));
    const maxPoint = dataPoints.find(d => d.value === max);
    const minPoint = dataPoints.find(d => d.value === min);
    
    longDescription += ` The chart shows values ranging from ${min} to ${max}.`;
    if (maxPoint) longDescription += ` Highest value: ${maxPoint.label} at ${maxPoint.value}.`;
    if (minPoint) longDescription += ` Lowest value: ${minPoint.label} at ${minPoint.value}.`;
  }

  return {
    role: 'img',
    'aria-label': title,
    'aria-describedby': `chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`,
    'aria-roledescription': 'chart',
    tabIndex: 0,
  };
}

/**
 * Reduced motion detection
 */
export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * High contrast mode detection
 */
export function useHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Windows High Contrast Mode
  const windowsHC = window.matchMedia('(prefers-contrast: high)').matches;
  
  return windowsHC;
}

/**
 * Color contrast utilities
 */
export function getLuminance(hexColor: string): number {
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(hex1: string, hex2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(hex1, hex2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Keyboard shortcuts hook
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Screen reader only text component
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

/**
 * Visually hidden but focusable component
 */
export const VisuallyHidden: React.FC<{ 
  children: React.ReactNode;
  focusable?: boolean;
}> = ({ children, focusable = false }) => {
  return (
    <span className={focusable ? 'sr-only focus:not-sr-only' : 'sr-only'}>
      {children}
    </span>
  );
};
