/**
 * SMART METER TIME INFERENCE & SEASONAL ADJUSTMENT ENGINE
 * 
 * Intelligently infers time periods from photos and applies seasonal adjustments
 * for accurate consumption estimation across incomplete datasets
 */

import {
  ExtractedValue,
  SeasonalProfile,
  ConsumptionRecord,
  TimeGranularity,
} from './types/smartMeterTypes';

// UK Regions with different climate characteristics
const UK_REGIONS = {
  'Scotland': { heatingIntensity: 1.25, coolingNeed: 0.7 },
  'Northern Ireland': { heatingIntensity: 1.15, coolingNeed: 0.75 },
  'North East': { heatingIntensity: 1.20, coolingNeed: 0.8 },
  'North West': { heatingIntensity: 1.15, coolingNeed: 0.85 },
  'Yorkshire': { heatingIntensity: 1.10, coolingNeed: 0.85 },
  'East Midlands': { heatingIntensity: 1.05, coolingNeed: 0.9 },
  'West Midlands': { heatingIntensity: 1.05, coolingNeed: 0.9 },
  'East': { heatingIntensity: 1.0, coolingNeed: 0.95 },
  'London': { heatingIntensity: 0.95, coolingNeed: 1.0 },
  'South East': { heatingIntensity: 0.95, coolingNeed: 1.0 },
  'South West': { heatingIntensity: 0.90, coolingNeed: 0.95 },
  'Wales': { heatingIntensity: 1.10, coolingNeed: 0.85 },
  'Default': { heatingIntensity: 1.0, coolingNeed: 0.9 },
};

// Seasonal factors for UK energy consumption
const SEASONAL_FACTORS = {
  winter: {
    months: [11, 0, 1, 2], // Nov, Dec, Jan, Feb, Mar (0-indexed)
    electricityFactor: 1.35, // 35% higher in winter
    gasFactor: 2.1, // 110% higher for heating
  },
  spring: {
    months: [3, 4], // Apr, May
    electricityFactor: 0.95,
    gasFactor: 1.2,
  },
  summer: {
    months: [5, 6, 7], // Jun, Jul, Aug
    electricityFactor: 0.85, // Lower heating, possible AC
    gasFactor: 0.4, // Minimal gas usage
  },
  autumn: {
    months: [8, 9, 10], // Sep, Oct
    electricityFactor: 1.0,
    gasFactor: 1.1,
  },
};

/**
 * Build or update seasonal profile for a user
 */
export async function buildSeasonalProfile(
  userId: string,
  postcode: string,
  consumptionRecords: ConsumptionRecord[]
): Promise<SeasonalProfile> {
  const region = inferRegionFromPostcode(postcode);
  const regionalSettings = UK_REGIONS[region as keyof typeof UK_REGIONS] || UK_REGIONS.Default;

  // Calculate average consumption by month
  const monthlyAverages: { [month: number]: number[] } = {};

  consumptionRecords.forEach(record => {
    if (record.granularity === 'monthly' || record.granularity === 'daily') {
      const month = record.startDate.getMonth();
      if (!monthlyAverages[month]) {
        monthlyAverages[month] = [];
      }

      // Normalize to daily average
      const days = getDaysBetween(record.startDate, record.endDate);
      const dailyAvg = record.electricityImport / days;
      monthlyAverages[month].push(dailyAvg);
    }
  });

  // Calculate seasonal factors
  const winterMonths = [11, 0, 1, 2];
  const summerMonths = [5, 6, 7];

  const winterAvg = calculateAverage(
    winterMonths.flatMap(m => monthlyAverages[m] || [])
  );
  const summerAvg = calculateAverage(
    summerMonths.flatMap(m => monthlyAverages[m] || [])
  );
  const yearAvg = calculateAverage(
    Object.values(monthlyAverages).flat()
  );

  // If we have data, use it; otherwise use defaults
  const winterFactor = winterAvg > 0 && yearAvg > 0
    ? winterAvg / yearAvg
    : SEASONAL_FACTORS.winter.electricityFactor;

  const summerFactor = summerAvg > 0 && yearAvg > 0
    ? summerAvg / yearAvg
    : SEASONAL_FACTORS.summer.electricityFactor;

  const profile: SeasonalProfile = {
    userId,
    postcode,
    region,
    winterFactor: winterFactor * regionalSettings.heatingIntensity,
    springFactor: SEASONAL_FACTORS.spring.electricityFactor,
    summerFactor: summerFactor * regionalSettings.coolingNeed,
    autumnFactor: SEASONAL_FACTORS.autumn.electricityFactor,
    heatingDegreeDays: estimateHeatingDegreeDays(region),
    coolingDegreeDay: estimateCoolingDegreeDays(region),
    dataPoints: consumptionRecords.length,
    confidence: calculateProfileConfidence(consumptionRecords),
    lastUpdated: new Date(),
  };

  return profile;
}

/**
 * Infer complete time period from extracted value and context
 */
export function inferTimePeriod(
  extractedValue: ExtractedValue,
  uploadTimestamp: Date,
  photoType: string
): { startDate: Date; endDate: Date; confidence: number } {
  // If we have explicit date, use it
  if (extractedValue.extractedDate) {
    return inferFromExplicitDate(
      extractedValue.extractedDate,
      extractedValue.timeGranularity,
      uploadTimestamp
    );
  }

  // Otherwise, infer from photo type and upload time
  return inferFromPhotoType(photoType, uploadTimestamp, extractedValue.timeGranularity);
}

/**
 * Infer from explicit date in photo
 */
function inferFromExplicitDate(
  extractedDate: Date,
  granularity: TimeGranularity,
  uploadTimestamp: Date
): { startDate: Date; endDate: Date; confidence: number } {
  let startDate = new Date(extractedDate);
  let endDate = new Date(extractedDate);
  let confidence = 90;

  switch (granularity) {
    case 'daily':
      // Same day
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'weekly':
      // Week containing the date
      startDate = getWeekStart(extractedDate);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      confidence = 85;
      break;

    case 'monthly':
      // Month containing the date
      startDate.setDate(1);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of month
      confidence = 80;
      break;

    case 'yearly':
      // Year containing the date
      startDate = new Date(extractedDate.getFullYear(), 0, 1);
      endDate = new Date(extractedDate.getFullYear(), 11, 31);
      confidence = 75;
      break;
  }

  return { startDate, endDate, confidence };
}

/**
 * Infer from photo type and upload timestamp
 */
function inferFromPhotoType(
  photoType: string,
  uploadTimestamp: Date,
  granularity: TimeGranularity
): { startDate: Date; endDate: Date; confidence: number } {
  const now = new Date(uploadTimestamp);
  let startDate = new Date(now);
  let endDate = new Date(now);
  let confidence = 60; // Lower confidence for inferred dates

  if (photoType.includes('weekly')) {
    // Assume last 7 days
    startDate.setDate(startDate.getDate() - 7);
    confidence = 65;
  } else if (photoType.includes('monthly')) {
    // Assume last 30 days or previous month
    startDate.setMonth(startDate.getMonth() - 1);
    confidence = 60;
  } else if (photoType.includes('yearly')) {
    // Assume last 12 months
    startDate.setFullYear(startDate.getFullYear() - 1);
    confidence = 55;
  } else if (photoType.includes('meter-reading')) {
    // Current reading - assume it's for today
    confidence = 70;
  } else {
    // Generic - assume last month
    startDate.setMonth(startDate.getMonth() - 1);
    confidence = 50;
  }

  return { startDate, endDate, confidence };
}

/**
 * Apply seasonal adjustment to consumption value
 */
export function applySeasonalAdjustment(
  value: number,
  date: Date,
  profile: SeasonalProfile,
  targetSeason?: 'winter' | 'spring' | 'summer' | 'autumn'
): { adjustedValue: number; factor: number } {
  const month = date.getMonth();
  const currentSeason = getSeasonForMonth(month);
  const currentFactor = getSeasonalFactor(currentSeason, profile);

  // If no target season, normalize to annual average
  if (!targetSeason) {
    return {
      adjustedValue: value / currentFactor,
      factor: 1 / currentFactor,
    };
  }

  // Adjust from current season to target season
  const targetFactor = getSeasonalFactor(targetSeason, profile);
  const adjustmentFactor = targetFactor / currentFactor;

  return {
    adjustedValue: value * adjustmentFactor,
    factor: adjustmentFactor,
  };
}

/**
 * Get seasonal factor for a season
 */
function getSeasonalFactor(
  season: 'winter' | 'spring' | 'summer' | 'autumn',
  profile: SeasonalProfile
): number {
  switch (season) {
    case 'winter':
      return profile.winterFactor;
    case 'spring':
      return profile.springFactor;
    case 'summer':
      return profile.summerFactor;
    case 'autumn':
      return profile.autumnFactor;
    default:
      return 1.0;
  }
}

/**
 * Get season for a month
 */
function getSeasonForMonth(month: number): 'winter' | 'spring' | 'summer' | 'autumn' {
  if ([11, 0, 1, 2].includes(month)) return 'winter';
  if ([3, 4].includes(month)) return 'spring';
  if ([5, 6, 7].includes(month)) return 'summer';
  return 'autumn';
}

/**
 * Estimate annual consumption from partial data
 */
export function estimateAnnualConsumption(
  records: ConsumptionRecord[],
  profile: SeasonalProfile
): {
  estimate: number;
  min: number;
  max: number;
  confidence: number;
  method: string;
} {
  if (records.length === 0) {
    return {
      estimate: 0,
      min: 0,
      max: 0,
      confidence: 0,
      method: 'no-data',
    };
  }

  // Group records by month
  const monthlyData: { [month: number]: number[] } = {};
  records.forEach(record => {
    const month = record.startDate.getMonth();
    const days = getDaysBetween(record.startDate, record.endDate);
    const dailyAvg = record.electricityImport / days;

    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }
    monthlyData[month].push(dailyAvg);
  });

  // Calculate monthly averages
  const monthlyAverages: { [month: number]: number } = {};
  Object.keys(monthlyData).forEach(month => {
    const m = parseInt(month);
    monthlyAverages[m] = calculateAverage(monthlyData[m]);
  });

  // Fill missing months using seasonal adjustment
  for (let month = 0; month < 12; month++) {
    if (!monthlyAverages[month]) {
      // Find closest month with data
      const closestMonth = findClosestMonthWithData(month, monthlyAverages);
      if (closestMonth !== null) {
        const closestValue = monthlyAverages[closestMonth];
        const closestSeason = getSeasonForMonth(closestMonth);
        const targetSeason = getSeasonForMonth(month);

        const adjustment = applySeasonalAdjustment(
          closestValue,
          new Date(2024, closestMonth, 15),
          profile,
          targetSeason
        );

        monthlyAverages[month] = adjustment.adjustedValue;
      } else {
        // Use seasonal average
        const season = getSeasonForMonth(month);
        const factor = getSeasonalFactor(season, profile);
        monthlyAverages[month] = 10 * factor; // Default baseline
      }
    }
  }

  // Calculate annual estimate
  const daysInYear = 365;
  const dailyEstimates = Object.values(monthlyAverages);
  const avgDaily = calculateAverage(dailyEstimates);
  const annualEstimate = avgDaily * daysInYear;

  // Calculate confidence based on data coverage
  const monthsCovered = Object.keys(monthlyData).length;
  const confidence = Math.min(95, 40 + (monthsCovered / 12) * 60);

  // Calculate range (±15% for sparse data, ±5% for complete data)
  const uncertainty = 0.20 - (monthsCovered / 12) * 0.15;
  const min = annualEstimate * (1 - uncertainty);
  const max = annualEstimate * (1 + uncertainty);

  return {
    estimate: Math.round(annualEstimate),
    min: Math.round(min),
    max: Math.round(max),
    confidence: Math.round(confidence),
    method: monthsCovered >= 6 ? 'interpolation' : 'seasonal-estimation',
  };
}

/**
 * Infer UK region from postcode
 */
function inferRegionFromPostcode(postcode: string): string {
  const prefix = postcode.toUpperCase().substring(0, 2);

  const regionMap: { [key: string]: string } = {
    'AB': 'Scotland', 'DD': 'Scotland', 'DG': 'Scotland', 'EH': 'Scotland',
    'FK': 'Scotland', 'G': 'Scotland', 'HS': 'Scotland', 'IV': 'Scotland',
    'KA': 'Scotland', 'KW': 'Scotland', 'KY': 'Scotland', 'ML': 'Scotland',
    'PA': 'Scotland', 'PH': 'Scotland', 'TD': 'Scotland', 'ZE': 'Scotland',
    'BT': 'Northern Ireland',
    'NE': 'North East', 'SR': 'North East', 'DH': 'North East', 'TS': 'North East',
    'BB': 'North West', 'BL': 'North West', 'CA': 'North West', 'CH': 'North West',
    'FY': 'North West', 'L': 'North West', 'LA': 'North West', 'M': 'North West',
    'OL': 'North West', 'PR': 'North West', 'SK': 'North West', 'WA': 'North West',
    'WN': 'North West',
    'BD': 'Yorkshire', 'DN': 'Yorkshire', 'HD': 'Yorkshire', 'HG': 'Yorkshire',
    'HU': 'Yorkshire', 'HX': 'Yorkshire', 'LS': 'Yorkshire', 'S': 'Yorkshire',
    'WF': 'Yorkshire', 'YO': 'Yorkshire',
    'DE': 'East Midlands', 'LE': 'East Midlands', 'LN': 'East Midlands',
    'NG': 'East Midlands', 'NN': 'East Midlands',
    'B': 'West Midlands', 'CV': 'West Midlands', 'DY': 'West Midlands',
    'HR': 'West Midlands', 'SY': 'West Midlands', 'TF': 'West Midlands',
    'WR': 'West Midlands', 'WS': 'West Midlands', 'WV': 'West Midlands',
    'CB': 'East', 'CM': 'East', 'CO': 'East', 'IP': 'East', 'NR': 'East',
    'PE': 'East', 'SG': 'East',
    'E': 'London', 'EC': 'London', 'N': 'London', 'NW': 'London',
    'SE': 'London', 'SW': 'London', 'W': 'London', 'WC': 'London',
    'BR': 'South East', 'BN': 'South East', 'CR': 'South East', 'CT': 'South East',
    'DA': 'South East', 'GU': 'South East', 'HP': 'South East', 'KT': 'South East',
    'ME': 'South East', 'MK': 'South East', 'OX': 'South East', 'PO': 'South East',
    'RG': 'South East', 'RH': 'South East', 'SL': 'South East', 'SM': 'South East',
    'SN': 'South East', 'SO': 'South East', 'SP': 'South East', 'TN': 'South East',
    'TW': 'South East', 'UB': 'South East',
    'BA': 'South West', 'BH': 'South West', 'BS': 'South West', 'DT': 'South West',
    'EX': 'South West', 'GL': 'South West', 'PL': 'South West', 'TA': 'South West',
    'TQ': 'South West', 'TR': 'South West',
    'CF': 'Wales', 'LD': 'Wales', 'LL': 'Wales', 'NP': 'Wales', 'SA': 'Wales',
  };

  return regionMap[prefix] || 'Default';
}

// Helper functions

function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getDaysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function findClosestMonthWithData(
  targetMonth: number,
  monthlyData: { [month: number]: number }
): number | null {
  const months = Object.keys(monthlyData).map(m => parseInt(m));
  if (months.length === 0) return null;

  let closest = months[0];
  let minDiff = Math.abs(targetMonth - closest);

  months.forEach(month => {
    const diff = Math.abs(targetMonth - month);
    if (diff < minDiff) {
      minDiff = diff;
      closest = month;
    }
  });

  return closest;
}

function calculateProfileConfidence(records: ConsumptionRecord[]): number {
  if (records.length === 0) return 0;
  if (records.length < 4) return 30;
  if (records.length < 12) return 50 + (records.length / 12) * 30;
  return 80 + Math.min(20, records.length - 12);
}

function estimateHeatingDegreeDays(region: string): { [month: string]: number } {
  // Simplified HDD estimates for UK regions
  const baseHDD: { [month: string]: number } = {
    'Jan': 350, 'Feb': 320, 'Mar': 280, 'Apr': 200,
    'May': 120, 'Jun': 50, 'Jul': 20, 'Aug': 25,
    'Sep': 90, 'Oct': 180, 'Nov': 270, 'Dec': 330,
  };

  const regionalMultiplier = UK_REGIONS[region as keyof typeof UK_REGIONS]?.heatingIntensity || 1.0;

  const adjusted: { [month: string]: number } = {};
  Object.entries(baseHDD).forEach(([month, value]) => {
    adjusted[month] = Math.round(value * regionalMultiplier);
  });

  return adjusted;
}

function estimateCoolingDegreeDays(region: string): { [month: string]: number } {
  // Simplified CDD estimates for UK (generally low)
  const baseCDD: { [month: string]: number } = {
    'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0,
    'May': 5, 'Jun': 20, 'Jul': 35, 'Aug': 30,
    'Sep': 10, 'Oct': 0, 'Nov': 0, 'Dec': 0,
  };

  const regionalMultiplier = UK_REGIONS[region as keyof typeof UK_REGIONS]?.coolingNeed || 0.9;

  const adjusted: { [month: string]: number } = {};
  Object.entries(baseCDD).forEach(([month, value]) => {
    adjusted[month] = Math.round(value * regionalMultiplier);
  });

  return adjusted;
}
