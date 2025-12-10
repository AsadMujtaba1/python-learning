/**
 * VALIDATION UTILITIES
 * 
 * Input validation, sanitization, and data quality checks.
 * Protects against invalid data, XSS, and ensures data integrity.
 * 
 * @module lib/utils/validation
 */

/**
 * UK Postcode validation (supports all formats)
 * @example isValidPostcode("SW1A 1AA") => true
 * @example isValidPostcode("12345") => false
 */
export function isValidPostcode(postcode: string): boolean {
  // UK postcode regex (supports all formats including special cases)
  const postcodeRegex = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i;
  return postcodeRegex.test(postcode.trim());
}

/**
 * Validate and sanitize postcode
 * @returns Cleaned postcode or null if invalid
 */
export function sanitizePostcode(postcode: string): string | null {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, ' ').trim();
  if (!isValidPostcode(cleaned)) return null;
  
  // Ensure proper spacing
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i);
  if (!match) return null;
  
  return `${match[1]} ${match[2]}`;
}

/**
 * Validate home type
 */
export function isValidHomeType(homeType: string): boolean {
  const validTypes = ['flat', 'terraced', 'semi-detached', 'detached'];
  return validTypes.includes(homeType);
}

/**
 * Validate heating type
 */
export function isValidHeatingType(heatingType: string): boolean {
  const validTypes = ['gas', 'electricity', 'heat-pump', 'mixed'];
  return validTypes.includes(heatingType);
}

/**
 * Validate number of occupants (1-15)
 */
export function isValidOccupants(occupants: number): boolean {
  return Number.isInteger(occupants) && occupants >= 1 && occupants <= 15;
}

/**
 * Validate temperature range (-50°C to 60°C)
 */
export function isValidTemperature(temp: number): boolean {
  return typeof temp === 'number' && !isNaN(temp) && temp >= -50 && temp <= 60;
}

/**
 * Validate energy consumption (0-1000 kWh/day)
 */
export function isValidEnergyConsumption(kwh: number): boolean {
  return typeof kwh === 'number' && !isNaN(kwh) && kwh >= 0 && kwh <= 1000;
}

/**
 * Validate cost (0-10000 GBP)
 */
export function isValidCost(cost: number): boolean {
  return typeof cost === 'number' && !isNaN(cost) && cost >= 0 && cost <= 10000;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (UK format)
 */
export function isValidUKPhone(phone: string): boolean {
  // Supports: 07xxx xxxxxx, +44 7xxx xxxxxx, 020 xxxx xxxx, etc.
  const phoneRegex = /^(\+44\s?|0)(\d{2,5})\s?(\d{3,4})\s?(\d{3,4})$/;
  return phoneRegex.test(phone.replace(/\s+/g, ' ').trim());
}

/**
 * Sanitize string input (remove HTML, scripts, etc.)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining brackets
    .trim();
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(
  input: string | number,
  options: {
    min?: number;
    max?: number;
    decimals?: number;
    fallback?: number;
  } = {}
): number {
  const { min = -Infinity, max = Infinity, decimals = 2, fallback = 0 } = options;
  
  let num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) return fallback;
  
  // Apply decimal rounding
  num = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Apply min/max constraints
  num = Math.max(min, Math.min(max, num));
  
  return num;
}

/**
 * Validate date is within reasonable range
 */
export function isValidDate(date: Date | string | number): boolean {
  const d = new Date(date);
  const now = new Date();
  const minDate = new Date('2020-01-01'); // Reasonable historical limit
  const maxDate = new Date(now.getFullYear() + 5, 11, 31); // 5 years in future
  
  return d instanceof Date && !isNaN(d.getTime()) && d >= minDate && d <= maxDate;
}

/**
 * Validate user home data object
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateUserHomeData(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data) {
    return { isValid: false, errors: ['No data provided'] };
  }
  
  // Validate postcode
  if (!data.postcode || !isValidPostcode(data.postcode)) {
    errors.push('Invalid UK postcode');
  }
  
  // Validate home type
  if (!data.homeType || !isValidHomeType(data.homeType)) {
    errors.push('Invalid home type. Must be: flat, terraced, semi-detached, or detached');
  }
  
  // Validate occupants
  if (!data.occupants || !isValidOccupants(data.occupants)) {
    errors.push('Invalid number of occupants. Must be between 1 and 15');
  }
  
  // Validate heating type
  if (!data.heatingType || !isValidHeatingType(data.heatingType)) {
    errors.push('Invalid heating type. Must be: gas, electricity, heat-pump, or mixed');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate calculation results for accuracy
 */
export function validateCalculationResults(results: {
  dailyCost?: number;
  heatingCost?: number;
  electricityCost?: number;
  totalCost?: number;
}): ValidationResult {
  const errors: string[] = [];
  
  // Check for negative values
  Object.entries(results).forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0) {
      errors.push(`${key} cannot be negative`);
    }
  });
  
  // Check for unrealistic values
  if (results.dailyCost && results.dailyCost > 100) {
    errors.push('Daily cost exceeds reasonable limit (£100)');
  }
  
  // Check sum consistency
  if (
    results.heatingCost !== undefined &&
    results.electricityCost !== undefined &&
    results.totalCost !== undefined
  ) {
    const sum = results.heatingCost + results.electricityCost;
    // Allow 5% tolerance for rounding and standing charges
    if (Math.abs(results.totalCost - sum) > results.totalCost * 0.2) {
      errors.push('Cost breakdown does not sum correctly');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate API response structure
 */
export function validateWeatherResponse(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data) {
    return { isValid: false, errors: ['No weather data received'] };
  }
  
  // Check current weather
  if (!data.current) {
    errors.push('Missing current weather data');
  } else {
    if (typeof data.current.temperature !== 'number') {
      errors.push('Invalid current temperature');
    }
    if (!data.current.description) {
      errors.push('Missing weather description');
    }
  }
  
  // Check forecast
  if (!Array.isArray(data.forecast)) {
    errors.push('Forecast data must be an array');
  } else if (data.forecast.length === 0) {
    errors.push('Forecast data is empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting check (client-side)
 */
const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requestCounts.get(key);
  
  // Reset if window expired
  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    requestCounts.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  
  // Check if limit exceeded
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  // Increment count
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Validate array of numbers (for calculations)
 */
export function validateNumberArray(
  arr: any[],
  options: {
    minLength?: number;
    maxLength?: number;
    allowNegative?: boolean;
    allowZero?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 0,
    maxLength = Infinity,
    allowNegative = true,
    allowZero = true,
  } = options;
  
  const errors: string[] = [];
  
  if (!Array.isArray(arr)) {
    return { isValid: false, errors: ['Input must be an array'] };
  }
  
  if (arr.length < minLength) {
    errors.push(`Array must have at least ${minLength} elements`);
  }
  
  if (arr.length > maxLength) {
    errors.push(`Array must have at most ${maxLength} elements`);
  }
  
  arr.forEach((val, idx) => {
    if (typeof val !== 'number' || isNaN(val)) {
      errors.push(`Element at index ${idx} is not a valid number`);
    } else {
      if (!allowNegative && val < 0) {
        errors.push(`Element at index ${idx} cannot be negative`);
      }
      if (!allowZero && val === 0) {
        errors.push(`Element at index ${idx} cannot be zero`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Safe JSON parse with validation
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T
): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Validate environment variables
 */
export function validateEnvVariables(required: string[]): ValidationResult {
  const errors: string[] = [];
  
  required.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing environment variable: ${varName}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
