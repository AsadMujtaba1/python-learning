/**
 * FORMATTING UTILITIES
 * 
 * Centralized formatting functions for consistent display throughout the app.
 * Handles currency, numbers, dates, percentages, and unit conversions.
 * 
 * @module lib/utils/formatting
 */

/**
 * Format a number as UK currency (GBP)
 * @example formatCurrency(12.5) => "£12.50"
 * @example formatCurrency(1234.56) => "£1,234.56"
 */
export function formatCurrency(
  amount: number,
  options: { 
    showSymbol?: boolean;
    decimals?: number;
    showZero?: boolean;
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = 2,
    showZero = true
  } = options;

  if (amount === 0 && !showZero) return showSymbol ? '£0' : '0';

  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return showSymbol ? formatted : formatted.replace('£', '');
}

/**
 * Format a number with thousand separators
 * @example formatNumber(1234.56) => "1,234.56"
 * @example formatNumber(1234.56, 0) => "1,235"
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-GB'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage with proper rounding
 * @example formatPercentage(0.1234) => "12.3%"
 * @example formatPercentage(0.1234, 1) => "12.3%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  includeSymbol: boolean = true
): string {
  const percentage = (value * 100).toFixed(decimals);
  return includeSymbol ? `${percentage}%` : percentage;
}

/**
 * Format energy consumption in kWh
 * @example formatEnergy(12.345) => "12.3 kWh"
 * @example formatEnergy(1234.5) => "1,234.5 kWh"
 */
export function formatEnergy(kwh: number, decimals: number = 1): string {
  return `${formatNumber(kwh, decimals)} kWh`;
}

/**
 * Format temperature with degree symbol
 * @example formatTemperature(12.3) => "12.3°C"
 * @example formatTemperature(12.3, 'F') => "12.3°F"
 */
export function formatTemperature(
  temp: number,
  unit: 'C' | 'F' = 'C',
  decimals: number = 1
): string {
  return `${temp.toFixed(decimals)}°${unit}`;
}

/**
 * Format date in UK format
 * @example formatDate(new Date('2025-12-05')) => "5 December 2025"
 * @example formatDate(new Date(), 'short') => "05/12/2025"
 */
export function formatDate(
  date: Date | string | number,
  format: 'long' | 'short' | 'medium' = 'long'
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  if (format === 'medium') {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format time in 12-hour or 24-hour format
 * @example formatTime(new Date('2025-12-05T14:30:00')) => "2:30 PM"
 * @example formatTime(new Date(), true) => "14:30"
 */
export function formatTime(
  date: Date | string | number,
  use24Hour: boolean = false
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour,
  }).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) => "1 hour ago"
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
  
  return formatDate(d, 'medium');
}

/**
 * Format duration in human-readable format
 * @example formatDuration(3665) => "1h 1m 5s"
 * @example formatDuration(90) => "1m 30s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format file size in human-readable format
 * @example formatFileSize(1024) => "1 KB"
 * @example formatFileSize(1536000) => "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format large numbers in compact form
 * @example formatCompactNumber(1234) => "1.2K"
 * @example formatCompactNumber(1234567) => "1.2M"
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format change value with arrow indicator
 * @example formatChange(12.5) => "↑ 12.5%"
 * @example formatChange(-5.2) => "↓ 5.2%"
 */
export function formatChange(
  value: number,
  options: {
    isPercentage?: boolean;
    showZero?: boolean;
    decimals?: number;
  } = {}
): string {
  const { isPercentage = true, showZero = true, decimals = 1 } = options;

  if (value === 0 && !showZero) return '—';

  const arrow = value > 0 ? '↑' : value < 0 ? '↓' : '→';
  const absValue = Math.abs(value);
  const formatted = isPercentage
    ? formatPercentage(absValue / 100, decimals)
    : formatNumber(absValue, decimals);

  return `${arrow} ${formatted}`;
}

/**
 * Truncate text with ellipsis
 * @example truncate("Hello World", 8) => "Hello..."
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

/**
 * Pluralize a word based on count
 * @example pluralize(1, 'item') => "1 item"
 * @example pluralize(5, 'item') => "5 items"
 * @example pluralize(1, 'child', 'children') => "1 child"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  const word = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${word}`;
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 * @example formatOrdinal(1) => "1st"
 * @example formatOrdinal(22) => "22nd"
 */
export function formatOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Format carbon emissions
 * @example formatCarbon(12.5) => "12.5 kg CO₂"
 * @example formatCarbon(1234.5) => "1.2 tonnes CO₂"
 */
export function formatCarbon(kgCO2: number): string {
  if (kgCO2 < 1000) {
    return `${formatNumber(kgCO2, 1)} kg CO₂`;
  }
  return `${formatNumber(kgCO2 / 1000, 1)} tonnes CO₂`;
}

/**
 * Format UK postcode consistently
 * @example formatPostcode("sw1a1aa") => "SW1A 1AA"
 */
export function formatPostcode(postcode: string): string {
  const clean = postcode.toUpperCase().replace(/\s+/g, '');
  if (clean.length < 5 || clean.length > 7) return postcode;
  
  // Insert space before last 3 characters
  return clean.slice(0, -3) + ' ' + clean.slice(-3);
}
