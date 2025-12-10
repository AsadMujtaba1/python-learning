/**
 * SMART METER SERVICE - Main Orchestrator
 * 
 * Coordinates all smart meter photo analysis functionality
 * Handles photo upload, extraction, reconciliation, and insights
 */

import {
  SmartMeterPhoto,
  ExtractedValue,
  ConsumptionRecord,
  SeasonalProfile,
  UsageEstimate,
  SmartMeterAnalytics,
  UsageInsight,
  PhotoExtractionRequest,
  PhotoType,
} from './types/smartMeterTypes';
import { extractSmartMeterData, batchExtractSmartMeterData } from './smartMeterVisionService';
import { buildSeasonalProfile, inferTimePeriod, estimateAnnualConsumption } from './smartMeterTimeInference';
import { reconcileValues, calculateUsageEstimate, detectAnomalies } from './smartMeterReconciliation';
import { generateInsights } from './smartMeterInsights';

/**
 * Process uploaded photo - full pipeline
 */
export async function processSmartMeterPhoto(
  photoId: string,
  userId: string,
  fileUrl: string,
  uploadTimestamp: Date,
  userPostcode?: string
): Promise<{
  photo: SmartMeterPhoto;
  extractedValues: ExtractedValue[];
  warnings: string[];
}> {
  console.log(`📸 Processing smart meter photo ${photoId} for user ${userId}`);

  // Step 1: Extract data using AI Vision
  const request: PhotoExtractionRequest = {
    photoId,
    userId,
    fileUrl,
    uploadTimestamp,
    userPostcode,
  };

  const extractionResult = await extractSmartMeterData(request);

  // Step 2: Create photo record
  const photo: SmartMeterPhoto = {
    id: photoId,
    userId,
    uploadTimestamp,
    filePath: fileUrl,
    fileUrl,
    fileSize: 0, // Updated by storage service
    mimeType: 'image/jpeg', // Updated by storage service
    photoType: extractionResult.detectedPhotoType || 'unknown',
    extractionStatus: extractionResult.success ? 'completed' : 'failed',
    extractionConfidence: extractionResult.confidence,
    extractionError: extractionResult.errors.length > 0 ? extractionResult.errors.join('; ') : undefined,
    userConfirmed: false,
    userEditedValues: false,
  };

  // Step 3: Create extracted value records
  const extractedValues: ExtractedValue[] = extractionResult.extractedValues.map((ev, idx) => {
    // Infer time period
    const timePeriod = inferTimePeriod(
      {
        extractedDate: extractionResult.detectedDateRange?.start,
        timeGranularity: determineGranularity(photo.photoType),
        inferredStartDate: extractionResult.detectedDateRange?.start || uploadTimestamp,
        inferredEndDate: extractionResult.detectedDateRange?.end || uploadTimestamp,
      } as ExtractedValue,
      uploadTimestamp,
      photo.photoType
    );

    return {
      id: `${photoId}-value-${idx}`,
      photoId,
      userId,
      value: ev.value,
      unit: ev.unit as any,
      valueType: ev.type,
      extractedDate: extractionResult.detectedDateRange?.start,
      inferredStartDate: timePeriod.startDate,
      inferredEndDate: timePeriod.endDate,
      timeGranularity: determineGranularity(photo.photoType),
      dateConfidence: timePeriod.confidence,
      extractionMethod: 'ai-vision',
      confidence: ev.confidence,
      sourcePhotoRegion: ev.location,
      validated: false,
      anomaly: false,
      relatedValues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  return {
    photo,
    extractedValues,
    warnings: extractionResult.warnings,
  };
}

/**
 * Build consumption records from extracted values
 */
export async function buildConsumptionRecords(
  userId: string,
  extractedValues: ExtractedValue[],
  seasonalProfile?: SeasonalProfile
): Promise<ConsumptionRecord[]> {
  // Group values by time period
  const grouped: { [key: string]: ExtractedValue[] } = {};

  extractedValues.forEach(value => {
    const key = `${value.inferredStartDate.toISOString()}-${value.timeGranularity}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(value);
  });

  // Create consumption records
  const records: ConsumptionRecord[] = [];

  for (const [key, values] of Object.entries(grouped)) {
    // Reconcile if multiple values for same period
    const reconciliation = await reconcileValues(values, seasonalProfile);

    const avgConfidence = values.reduce((sum, v) => sum + v.confidence, 0) / values.length;

    records.push({
      id: `consumption-${userId}-${Date.now()}-${Math.random()}`,
      userId,
      startDate: values[0].inferredStartDate,
      endDate: values[0].inferredEndDate,
      granularity: values[0].timeGranularity,
      electricityImport: reconciliation.recommendedValue,
      dataSource: 'photo-extraction',
      confidence: avgConfidence,
      isEstimated: false,
      seasonallyAdjusted: false,
      sourcePhotoIds: [...new Set(values.map(v => v.photoId))],
      extractedValueIds: values.map(v => v.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return records;
}

/**
 * Generate complete analytics for user
 */
export async function generateAnalytics(
  userId: string,
  photos: SmartMeterPhoto[],
  records: ConsumptionRecord[],
  postcode: string,
  householdSize?: number
): Promise<{
  analytics: SmartMeterAnalytics;
  estimate: UsageEstimate;
  insights: UsageInsight[];
}> {
  console.log(`📊 Generating analytics for user ${userId}`);

  // Build seasonal profile
  const seasonalProfile = await buildSeasonalProfile(userId, postcode, records);

  // Calculate usage estimate
  const estimate = await calculateUsageEstimate(records, seasonalProfile);

  // Build time series data
  const dailyUsage = buildDailyTimeSeries(records);
  const weeklyUsage = buildWeeklyTimeSeries(records);
  const monthlyUsage = buildMonthlyTimeSeries(records);

  // Detect anomalies
  const anomalies = detectAnomalies(records, seasonalProfile);

  // Calculate date range
  const dates = records.map(r => r.startDate);
  const dateRange = dates.length > 0 ? {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime()))),
  } : { start: new Date(), end: new Date() };

  // Calculate data completeness
  const daysCovered = dates.length > 0
    ? (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    : 0;
  const expectedDataPoints = Math.ceil(daysCovered / 7); // Weekly readings
  const dataCompleteness = records.length > 0 && expectedDataPoints > 0
    ? Math.min(100, (records.length / expectedDataPoints) * 100)
    : 0;

  // Build analytics
  const analytics: SmartMeterAnalytics = {
    userId,
    generatedAt: new Date(),
    dailyUsage,
    weeklyUsage,
    monthlyUsage,
    totalPhotos: photos.length,
    totalReadings: records.length,
    dateRangeCoverage: dateRange,
    dataCompleteness: Math.round(dataCompleteness),
    currentTrend: estimate.trendDirection,
    trendConfidence: estimate.confidence,
    changeRate: estimate.trendPercentage * estimate.monthlyAverage / 100,
    winterAverage: calculateSeasonalAverage(records, [11, 0, 1, 2]),
    summerAverage: calculateSeasonalAverage(records, [5, 6, 7]),
    seasonalVariation: calculateSeasonalVariation(records),
    detectedAnomalies: anomalies.map(a => ({
      date: a.record.startDate,
      value: a.record.electricityImport,
      expectedValue: a.expectedValue,
      severity: a.severity,
      possibleCauses: a.possibleCauses,
    })),
    estimatedAnnualCost: estimate.estimatedAnnualCost,
    costTrend: estimate.trendDirection,
    potentialSavings: calculatePotentialSavings(estimate, seasonalProfile),
  };

  // Generate insights
  const insights = await generateInsights(
    userId,
    estimate,
    records,
    seasonalProfile,
    analytics,
    householdSize
  );

  return {
    analytics,
    estimate,
    insights,
  };
}

/**
 * Get summary for user dashboard
 */
export async function getSmartMeterSummary(
  userId: string,
  photos: SmartMeterPhoto[],
  records: ConsumptionRecord[]
): Promise<{
  totalPhotos: number;
  latestReading?: number;
  estimatedMonthly: number;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
}> {
  const latestRecord = records.length > 0
    ? records.sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0]
    : undefined;

  const trend = records.length >= 3 ? determineTrend(records) : 'stable';
  
  const avgMonthly = records.length > 0
    ? records.reduce((sum, r) => sum + r.electricityImport, 0) / records.length
    : 0;

  return {
    totalPhotos: photos.length,
    latestReading: latestRecord?.electricityImport,
    estimatedMonthly: Math.round(avgMonthly),
    trend,
    needsAttention: photos.some(p => !p.userConfirmed && p.extractionStatus === 'completed'),
  };
}

// Helper functions

function determineGranularity(photoType: PhotoType): 'daily' | 'weekly' | 'monthly' | 'yearly' {
  if (photoType.includes('weekly')) return 'weekly';
  if (photoType.includes('monthly')) return 'monthly';
  if (photoType.includes('yearly')) return 'yearly';
  return 'daily';
}

function buildDailyTimeSeries(records: ConsumptionRecord[]) {
  const daily: Array<{ date: Date; kWh: number; cost?: number }> = [];

  records.forEach(record => {
    if (record.granularity === 'daily') {
      daily.push({
        date: record.startDate,
        kWh: record.electricityImport,
        cost: record.electricityCost,
      });
    }
  });

  return daily.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function buildWeeklyTimeSeries(records: ConsumptionRecord[]) {
  const weekly: Array<{ weekStart: Date; kWh: number; cost?: number }> = [];

  records.forEach(record => {
    if (record.granularity === 'weekly') {
      weekly.push({
        weekStart: record.startDate,
        kWh: record.electricityImport,
        cost: record.electricityCost,
      });
    }
  });

  return weekly.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
}

function buildMonthlyTimeSeries(records: ConsumptionRecord[]) {
  const monthly: Array<{ month: Date; kWh: number; cost?: number }> = [];

  records.forEach(record => {
    if (record.granularity === 'monthly') {
      monthly.push({
        month: record.startDate,
        kWh: record.electricityImport,
        cost: record.electricityCost,
      });
    }
  });

  return monthly.sort((a, b) => a.month.getTime() - b.month.getTime());
}

function calculateSeasonalAverage(records: ConsumptionRecord[], months: number[]): number {
  const seasonal = records.filter(r => months.includes(r.startDate.getMonth()));
  if (seasonal.length === 0) return 0;

  const total = seasonal.reduce((sum, r) => {
    const days = getDaysBetween(r.startDate, r.endDate);
    return sum + r.electricityImport / days;
  }, 0);

  return total / seasonal.length;
}

function calculateSeasonalVariation(records: ConsumptionRecord[]): number {
  const winter = calculateSeasonalAverage(records, [11, 0, 1, 2]);
  const summer = calculateSeasonalAverage(records, [5, 6, 7]);

  if (summer === 0) return 0;
  return Math.round(((winter - summer) / summer) * 100);
}

function calculatePotentialSavings(estimate: UsageEstimate, profile: SeasonalProfile): number {
  // Estimate 10-20% savings potential based on data quality
  const savingsRate = estimate.confidence > 75 ? 0.15 : 0.10;
  return Math.round(estimate.estimatedAnnualCost * savingsRate);
}

function determineTrend(records: ConsumptionRecord[]): 'up' | 'down' | 'stable' {
  const sorted = [...records].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const third = Math.floor(sorted.length / 3);

  const firstThird = sorted.slice(0, third);
  const lastThird = sorted.slice(-third);

  const firstAvg = firstThird.reduce((sum, r) => sum + r.electricityImport, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, r) => sum + r.electricityImport, 0) / lastThird.length;

  const diff = (lastAvg - firstAvg) / firstAvg;

  if (diff > 0.1) return 'up';
  if (diff < -0.1) return 'down';
  return 'stable';
}

function getDaysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
