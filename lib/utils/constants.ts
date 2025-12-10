/**
 * CONSTANTS
 * 
 * Centralized constants for the entire application.
 * All magic numbers, configuration values, and business rules defined here.
 * 
 * @module lib/utils/constants
 */

// ==========================================
// ENERGY PRICING (UK 2025 Averages)
// ==========================================

export const ENERGY_RATES = {
  // Standard rates (£/kWh)
  ELECTRICITY_STANDARD: 0.28,
  GAS_STANDARD: 0.07,
  
  // Economy tariffs
  ELECTRICITY_PEAK: 0.32,
  ELECTRICITY_OFF_PEAK: 0.18,
  ELECTRICITY_NIGHT: 0.12,
  
  // Standing charges (£/day)
  STANDING_CHARGE_ELECTRIC: 0.60,
  STANDING_CHARGE_GAS: 0.53,
  STANDING_CHARGE_DUAL: 0.80,
} as const;

// ==========================================
// HEATING CALCULATIONS
// ==========================================

export const HEATING = {
  // Base temperature for degree-day calculation (°C)
  BASE_TEMPERATURE: 15.5,
  
  // Heating demand by home type (kWh per degree-day)
  DEMAND_FLAT: 0.8,
  DEMAND_TERRACED: 1.1,
  DEMAND_SEMI_DETACHED: 1.4,
  DEMAND_DETACHED: 1.8,
  
  // Insulation multipliers
  INSULATION_POOR: 1.4,
  INSULATION_AVERAGE: 1.0,
  INSULATION_GOOD: 0.7,
  INSULATION_EXCELLENT: 0.5,
  
  // System efficiency (COP - Coefficient of Performance)
  EFFICIENCY_GAS_BOILER: 0.90,
  EFFICIENCY_ELECTRIC_HEATER: 1.0,
  EFFICIENCY_HEAT_PUMP: 3.0,
  EFFICIENCY_MIXED: 0.95,
  
  // Seasonal adjustment factors
  SEASONAL_WINTER: 1.3,  // Dec, Jan, Feb
  SEASONAL_SPRING: 0.8,  // Mar, Apr, May
  SEASONAL_SUMMER: 0.3,  // Jun, Jul, Aug
  SEASONAL_AUTUMN: 0.9,  // Sep, Oct, Nov
} as const;

// ==========================================
// BASE CONSUMPTION
// ==========================================

export const BASE_CONSUMPTION = {
  // Daily base consumption by home type (kWh/day)
  FLAT: 8.5,
  TERRACED: 11.0,
  SEMI_DETACHED: 13.5,
  DETACHED: 16.0,
  
  // Occupant multiplier (per additional person after first)
  OCCUPANT_FACTOR: 0.12,
  
  // Appliance consumption (average kWh/day)
  FRIDGE: 0.4,
  FREEZER: 0.5,
  WASHING_MACHINE: 0.6,
  DISHWASHER: 0.5,
  TV: 0.3,
  COMPUTER: 0.4,
  LIGHTING: 1.2,
  COOKING: 1.5,
  HOT_WATER: 2.5,
} as const;

// ==========================================
// UK AVERAGES (For Comparison)
// ==========================================

export const UK_AVERAGES = {
  // Average daily cost by home type (£/day)
  DAILY_COST_FLAT: 3.50,
  DAILY_COST_TERRACED: 4.00,
  DAILY_COST_SEMI_DETACHED: 4.50,
  DAILY_COST_DETACHED: 5.50,
  
  // Average monthly bills
  MONTHLY_ELECTRIC: 95,
  MONTHLY_GAS: 85,
  MONTHLY_DUAL: 140,
  
  // Average annual consumption
  ANNUAL_ELECTRIC_KWH: 2900,
  ANNUAL_GAS_KWH: 12000,
  
  // Carbon intensity (kg CO₂ per kWh)
  CARBON_ELECTRIC: 0.233, // UK grid average
  CARBON_GAS: 0.185,
} as const;

// ==========================================
// VALIDATION LIMITS
// ==========================================

export const VALIDATION = {
  // Temperature limits (°C)
  MIN_TEMPERATURE: -50,
  MAX_TEMPERATURE: 60,
  
  // Consumption limits
  MIN_KWH_DAILY: 0,
  MAX_KWH_DAILY: 1000,
  
  // Cost limits
  MIN_COST: 0,
  MAX_COST_DAILY: 100,
  MAX_COST_MONTHLY: 1000,
  
  // Household limits
  MIN_OCCUPANTS: 1,
  MAX_OCCUPANTS: 15,
  
  // Postcode length
  MIN_POSTCODE_LENGTH: 5,
  MAX_POSTCODE_LENGTH: 8,
} as const;

// ==========================================
// API CONFIGURATION
// ==========================================

export const API = {
  // Cache TTL (milliseconds)
  CACHE_WEATHER: 30 * 60 * 1000,      // 30 minutes
  CACHE_TARIFF: 24 * 60 * 60 * 1000,  // 24 hours
  CACHE_POSTCODE: 7 * 24 * 60 * 60 * 1000, // 7 days
  CACHE_EPC: 30 * 24 * 60 * 60 * 1000, // 30 days
  
  // Request timeouts (milliseconds)
  TIMEOUT_WEATHER: 10000,   // 10 seconds
  TIMEOUT_TARIFF: 15000,    // 15 seconds
  TIMEOUT_DEFAULT: 5000,    // 5 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,        // 1 second
  RETRY_BACKOFF: 2,         // Exponential backoff multiplier
  
  // Rate limiting
  RATE_LIMIT_WEATHER: 60,   // requests per hour
  RATE_LIMIT_CALCULATE: 100, // calculations per hour
  
  // External API endpoints
  EXTERNAL_APIS: {
    CARBON_INTENSITY: 'https://api.carbonintensity.org.uk',
    POSTCODES_IO: 'https://api.postcodes.io',
  },
} as const;

// ==========================================
// UI CONFIGURATION
// ==========================================

export const UI = {
  // Toast notification duration (milliseconds)
  TOAST_DURATION_SUCCESS: 3000,
  TOAST_DURATION_ERROR: 5000,
  TOAST_DURATION_WARNING: 4000,
  TOAST_DURATION_INFO: 3000,
  
  // Animation durations (milliseconds)
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  
  // Debounce delays (milliseconds)
  DEBOUNCE_INPUT: 300,
  DEBOUNCE_SEARCH: 500,
  DEBOUNCE_RESIZE: 200,
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  MAX_PAGE_BUTTONS: 7,
  
  // Chart colors
  COLORS: {
    PRIMARY: '#3b82f6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#6366f1',
    HEATING: '#f97316',
    ELECTRIC: '#0ea5e9',
    CARBON: '#22c55e',
  },
} as const;

// ==========================================
// TIME PERIODS
// ==========================================

export const TIME_PERIODS = {
  // Economy 7 hours (UK standard)
  ECONOMY_7_START: 0,  // Midnight
  ECONOMY_7_END: 7,    // 7 AM
  
  // Peak hours (typical)
  PEAK_START_MORNING: 7,   // 7 AM
  PEAK_END_MORNING: 9,     // 9 AM
  PEAK_START_EVENING: 17,  // 5 PM
  PEAK_END_EVENING: 19,    // 7 PM
  
  // Days in periods
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30.5,
  DAYS_IN_YEAR: 365.25,
  
  // Months per season
  WINTER_MONTHS: [11, 0, 1], // Dec, Jan, Feb
  SPRING_MONTHS: [2, 3, 4],  // Mar, Apr, May
  SUMMER_MONTHS: [5, 6, 7],  // Jun, Jul, Aug
  AUTUMN_MONTHS: [8, 9, 10], // Sep, Oct, Nov
} as const;

// ==========================================
// SAVING OPPORTUNITIES
// ==========================================

export const SAVINGS = {
  // Percentage savings by action
  THERMOSTAT_1C_REDUCTION: 0.10,    // 10% saving
  INSULATION_UPGRADE: 0.25,          // 25% saving
  HEAT_PUMP_UPGRADE: 0.40,           // 40% saving
  LED_LIGHTING: 0.75,                // 75% saving on lighting
  DRAFT_PROOFING: 0.15,              // 15% saving
  SMART_THERMOSTAT: 0.12,            // 12% saving
  TIME_OF_USE_TARIFF: 0.08,          // 8% saving
  SOLAR_PANELS: 0.50,                // 50% saving on electric
  
  // Typical upgrade costs (£)
  COST_LOFT_INSULATION: 500,
  COST_CAVITY_WALL: 1000,
  COST_HEAT_PUMP: 10000,
  COST_SOLAR_PANELS: 6000,
  COST_SMART_THERMOSTAT: 200,
  COST_DRAFT_PROOFING: 150,
  
  // Payback periods (years)
  PAYBACK_INSULATION: 3,
  PAYBACK_HEAT_PUMP: 7,
  PAYBACK_SOLAR: 10,
  PAYBACK_SMART_THERMOSTAT: 2,
} as const;

// ==========================================
// CARBON CALCULATIONS
// ==========================================

export const CARBON = {
  // UK grid carbon intensity by time of day (kg CO₂/kWh)
  INTENSITY_PEAK: 0.280,
  INTENSITY_STANDARD: 0.233,
  INTENSITY_OFF_PEAK: 0.180,
  
  // Carbon by energy source
  INTENSITY_GAS: 0.185,
  INTENSITY_ELECTRIC: 0.233,
  INTENSITY_HEAT_PUMP: 0.078, // More efficient
  INTENSITY_RENEWABLE: 0.0,
  
  // UK targets
  TARGET_2025: 0.150,  // kg CO₂/kWh
  TARGET_2030: 0.050,
  TARGET_2050: 0.0,    // Net zero
} as const;

// ==========================================
// ERROR MESSAGES
// ==========================================

export const ERROR_MESSAGES = {
  INVALID_POSTCODE: 'Please enter a valid UK postcode',
  INVALID_HOME_TYPE: 'Please select a valid home type',
  INVALID_OCCUPANTS: 'Number of occupants must be between 1 and 15',
  INVALID_HEATING_TYPE: 'Please select a valid heating type',
  
  API_WEATHER_FAILED: 'Unable to fetch weather data. Using default values.',
  API_TARIFF_FAILED: 'Unable to fetch tariff data. Showing estimates.',
  API_TIMEOUT: 'Request timed out. Please try again.',
  
  CALCULATION_ERROR: 'Error performing calculation. Please check your inputs.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  NO_DATA: 'No data available. Please complete onboarding first.',
  STORAGE_ERROR: 'Unable to save data. Please check browser settings.',
} as const;

// ==========================================
// SUCCESS MESSAGES
// ==========================================

export const SUCCESS_MESSAGES = {
  DATA_SAVED: 'Your data has been saved successfully',
  CALCULATION_COMPLETE: 'Calculation completed',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// ==========================================
// FEATURE FLAGS
// ==========================================

export const FEATURES = {
  ENABLE_CARBON_TRACKING: true,
  ENABLE_TARIFF_COMPARISON: true,
  ENABLE_HISTORICAL_ANALYSIS: false, // Coming soon
  ENABLE_SOLAR_RECOMMENDATIONS: true,
  ENABLE_BROADBAND_MODULE: false,    // Phase 2
  ENABLE_INSURANCE_MODULE: false,    // Phase 2
  ENABLE_AI_RECOMMENDATIONS: false,  // Phase 3
  ENABLE_EXPORT_PDF: false,          // Phase 3
} as const;

// ==========================================
// EXTERNAL API ENDPOINTS
// ==========================================

export const EXTERNAL_APIS = {
  OPENWEATHER: 'https://api.openweathermap.org/data/2.5',
  CARBON_INTENSITY: 'https://api.carbonintensity.org.uk',
  POSTCODES_IO: 'https://api.postcodes.io',
  EPC: 'https://epc.opendatacommunities.org/api/v1',
  OFGEM: 'https://www.ofgem.gov.uk/data-portal/api',
} as const;

// ==========================================
// REGEXPATTERNS
// ==========================================

export const REGEX = {
  UK_POSTCODE: /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UK_PHONE: /^(\+44\s?|0)(\d{2,5})\s?(\d{3,4})\s?(\d{3,4})$/,
  NUMBER_ONLY: /^\d+$/,
  DECIMAL: /^\d+\.?\d*$/,
} as const;

// ==========================================
// HOME TYPE DEFINITIONS
// ==========================================

export const HOME_TYPES = {
  FLAT: {
    id: 'flat',
    label: 'Flat/Apartment',
    icon: '🏢',
    avgSize: 65, // m²
    description: 'Apartment or flat in a building',
  },
  TERRACED: {
    id: 'terraced',
    label: 'Terraced House',
    icon: '🏘️',
    avgSize: 85,
    description: 'House connected to neighbors on both sides',
  },
  SEMI_DETACHED: {
    id: 'semi-detached',
    label: 'Semi-Detached',
    icon: '🏡',
    avgSize: 110,
    description: 'House connected to one neighbor',
  },
  DETACHED: {
    id: 'detached',
    label: 'Detached House',
    icon: '🏠',
    avgSize: 150,
    description: 'Standalone house with no shared walls',
  },
} as const;

// ==========================================
// HEATING TYPE DEFINITIONS
// ==========================================

export const HEATING_TYPES = {
  GAS: {
    id: 'gas',
    label: 'Gas Boiler',
    icon: '🔥',
    efficiency: 90,
    costPerKWh: ENERGY_RATES.GAS_STANDARD,
  },
  ELECTRICITY: {
    id: 'electricity',
    label: 'Electric Heating',
    icon: '⚡',
    efficiency: 100,
    costPerKWh: ENERGY_RATES.ELECTRICITY_STANDARD,
  },
  HEAT_PUMP: {
    id: 'heat-pump',
    label: 'Heat Pump',
    icon: '♻️',
    efficiency: 300, // COP of 3
    costPerKWh: ENERGY_RATES.ELECTRICITY_STANDARD,
  },
  MIXED: {
    id: 'mixed',
    label: 'Mixed/Other',
    icon: '🔀',
    efficiency: 95,
    costPerKWh: (ENERGY_RATES.GAS_STANDARD + ENERGY_RATES.ELECTRICITY_STANDARD) / 2,
  },
} as const;
