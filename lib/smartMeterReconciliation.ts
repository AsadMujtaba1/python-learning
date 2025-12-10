/**
 * SMART METER VALUE RECONCILIATION & USAGE ESTIMATION
 * 
 * Reconciles conflicting values from multiple photos
 * Estimates daily/weekly/monthly/yearly usage from partial data
 * Provides confidence-weighted recommendations
 */

import {
  ExtractedValue,
  ConsumptionRecord,
  ValueReconciliation,
  UsageEstimate,
  SeasonalProfile,
} from './types/smartMeterTypes';
import { applySeasonalAdjustment, estimateAnnualConsumption } from './smartMeterTimeInference';

/**
 * Reconcile conflicting values from multiple photos
 */
export async function reconcileValues(
  values: ExtractedValue[],
  seasonalProfile?: SeasonalProfile
): Promise<ValueReconciliation> {
  if (values.length === 0) {
    return {
      conflictingValues: [],
      recommendedValue: 0,
      confidence: 0,
      reasoning: 'No values to reconcile',
      requiresUserConfirmation: false,
    };
  }

  if (values.length === 1) {
    return {
      conflictingValues: values,
      recommendedValue: values[0].value,
      confidence: values[0].confidence,
      reasoning: 'Single value, no conflict',
      requiresUserConfirmation: values[0].confidence < 70,
    };
  }

  // Sort by confidence
  const sorted = [...values].sort((a, b) => b.confidence - a.confidence);

  // Check if values are similar (within 10%)
  const highestValue = Math.max(...values.map(v => v.value));
  const lowestValue = Math.min(...values.map(v => v.value));
  const variance = (highestValue - lowestValue) / highestValue;

  if (variance < 0.1) {
    // Values are similar - use weighted average
    const weightedSum = values.reduce((sum, v) => sum + v.value * v.confidence, 0);
    const totalWeight = values.reduce((sum, v) => sum + v.confidence, 0);
    const weightedAverage = weightedSum / totalWeight;

    return {
      conflictingValues: values,
      recommendedValue: Math.round(weightedAverage * 100) / 100,
      confidence: Math.max(...values.map(v => v.confidence)),
      reasoning: `All values are within 10% - using weighted average of ${values.length} readings`,
      requiresUserConfirmation: false,
    };
  }

  // Significant variance - apply reconciliation logic
  return reconcileConflictingValues(values, seasonalProfile);
}

/**
 * Reconcile significantly different values
 */
function reconcileConflictingValues(
  values: ExtractedValue[],
  seasonalProfile?: SeasonalProfile
): ValueReconciliation {
  const strategies = [
    // Strategy 1: Prefer direct meter readings over calculated values
    () => preferDirectReadings(values),
    
    // Strategy 2: Prefer more recent photos
    () => preferRecentValues(values),
    
    // Strategy 3: Prefer higher confidence values
    () => preferHighConfidence(values),
    
    // Strategy 4: Check for seasonal patterns
    () => seasonalProfile ? checkSeasonalConsistency(values, seasonalProfile) : null,
  ];

  for (const strategy of strategies) {
    const result = strategy();
    if (result) return result;
  }

  // Fallback: Use highest confidence value but require confirmation
  const highestConfidence = values.reduce((best, v) => 
    v.confidence > best.confidence ? v : best
  );

  return {
    conflictingValues: values,
    recommendedValue: highestConfidence.value,
    confidence: highestConfidence.confidence,
    reasoning: 'Significant variance detected - using highest confidence value. Please confirm.',
    requiresUserConfirmation: true,
  };
}

/**
 * Prefer direct meter readings
 */
function preferDirectReadings(values: ExtractedValue[]): ValueReconciliation | null {
  const directReadings = values.filter(v => v.valueType === 'meter-reading');
  
  if (directReadings.length > 0 && directReadings.length < values.length) {
    const avgReading = directReadings.reduce((sum, v) => sum + v.value, 0) / directReadings.length;
    const avgConfidence = directReadings.reduce((sum, v) => sum + v.confidence, 0) / directReadings.length;

    return {
      conflictingValues: values,
      recommendedValue: Math.round(avgReading * 100) / 100,
      confidence: avgConfidence,
      reasoning: `Preferring ${directReadings.length} direct meter reading(s) over calculated values`,
      requiresUserConfirmation: directReadings.length === 1 && avgConfidence < 75,
    };
  }

  return null;
}

/**
 * Prefer more recent values
 */
function preferRecentValues(values: ExtractedValue[]): ValueReconciliation | null {
  // Sort by creation date (most recent first)
  const sorted = [...values].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  const mostRecent = sorted[0];
  const daysDiff = (Date.now() - sorted[sorted.length - 1].createdAt.getTime()) / (1000 * 60 * 60 * 24);

  // Only apply if there's significant time difference (>7 days)
  if (daysDiff > 7 && mostRecent.confidence > 60) {
    return {
      conflictingValues: values,
      recommendedValue: mostRecent.value,
      confidence: mostRecent.confidence,
      reasoning: `Using most recent reading (${Math.round(daysDiff)} days newer than oldest)`,
      requiresUserConfirmation: mostRecent.confidence < 75,
    };
  }

  return null;
}

/**
 * Prefer higher confidence values
 */
function preferHighConfidence(values: ExtractedValue[]): ValueReconciliation | null {
  const sorted = [...values].sort((a, b) => b.confidence - a.confidence);
  const highest = sorted[0];
  const secondHighest = sorted[1];

  // Only apply if confidence difference is significant (>20 points)
  if (highest.confidence - secondHighest.confidence > 20) {
    return {
      conflictingValues: values,
      recommendedValue: highest.value,
      confidence: highest.confidence,
      reasoning: `Using highest confidence value (${highest.confidence}% vs ${secondHighest.confidence}%)`,
      requiresUserConfirmation: highest.confidence < 80,
    };
  }

  return null;
}

/**
 * Check seasonal consistency
 */
function checkSeasonalConsistency(
  values: ExtractedValue[],
  profile: SeasonalProfile
): ValueReconciliation | null {
  // Normalize all values to annual baseline using seasonal adjustment
  const normalized = values.map(v => {
    const { adjustedValue } = applySeasonalAdjustment(
      v.value,
      v.inferredStartDate,
      profile
    );
    return { ...v, normalizedValue: adjustedValue };
  });

  // Find values that are consistent after normalization
  const avgNormalized = normalized.reduce((sum, v) => sum + v.normalizedValue, 0) / normalized.length;
  const consistent = normalized.filter(v => 
    Math.abs(v.normalizedValue - avgNormalized) / avgNormalized < 0.15
  );

  if (consistent.length >= values.length * 0.6) {
    // Majority are seasonally consistent
    const avgValue = consistent.reduce((sum, v) => sum + v.value, 0) / consistent.length;
    const avgConfidence = consistent.reduce((sum, v) => sum + v.confidence, 0) / consistent.length;

    return {
      conflictingValues: values,
      recommendedValue: Math.round(avgValue * 100) / 100,
      confidence: avgConfidence,
      reasoning: `${consistent.length} of ${values.length} values are seasonally consistent - using their average`,
      requiresUserConfirmation: false,
    };
  }

  return null;
}

/**
 * Calculate comprehensive usage estimate
 */
export async function calculateUsageEstimate(
  records: ConsumptionRecord[],
  seasonalProfile: SeasonalProfile,
  currentTariff?: { electricityRate: number; gasRate: number }
): Promise<UsageEstimate> {
  if (records.length === 0) {
    return {
      userId: seasonalProfile.userId,
      estimatedAt: new Date(),
      dailyAverage: 0,
      weeklyAverage: 0,
      monthlyAverage: 0,
      yearlyTotal: 0,
      yearlyMin: 0,
      yearlyMax: 0,
      trendDirection: 'stable',
      trendPercentage: 0,
      confidence: 0,
      dataQuality: 'poor',
      basedOnPhotos: 0,
      basedOnReadings: 0,
      dateRangeCovered: { start: new Date(), end: new Date() },
      estimatedAnnualCost: 0,
      costMin: 0,
      costMax: 0,
    };
  }

  // Calculate annual estimate
  const annualEstimate = estimateAnnualConsumption(records, seasonalProfile);

  // Calculate averages
  const dailyAverage = annualEstimate.estimate / 365;
  const weeklyAverage = dailyAverage * 7;
  const monthlyAverage = annualEstimate.estimate / 12;

  // Calculate trend
  const trend = calculateTrend(records);

  // Determine data quality
  const quality = determineDataQuality(records, seasonalProfile);

  // Calculate date range
  const dates = records.map(r => r.startDate);
  const dateRange = {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime()))),
  };

  // Count sources
  const photoIds = new Set(records.flatMap(r => r.sourcePhotoIds));
  const readings = records.filter(r => r.dataSource === 'photo-extraction').length;

  // Calculate costs
  const defaultRate = 0.245; // £0.245/kWh typical UK rate
  const electricityRate = currentTariff?.electricityRate || defaultRate;
  
  const annualCost = annualEstimate.estimate * electricityRate;
  const costMin = annualEstimate.min * electricityRate;
  const costMax = annualEstimate.max * electricityRate;

  return {
    userId: seasonalProfile.userId,
    estimatedAt: new Date(),
    dailyAverage: Math.round(dailyAverage * 100) / 100,
    weeklyAverage: Math.round(weeklyAverage * 100) / 100,
    monthlyAverage: Math.round(monthlyAverage * 100) / 100,
    yearlyTotal: annualEstimate.estimate,
    yearlyMin: annualEstimate.min,
    yearlyMax: annualEstimate.max,
    trendDirection: trend.direction,
    trendPercentage: trend.percentage,
    confidence: annualEstimate.confidence,
    dataQuality: quality,
    basedOnPhotos: photoIds.size,
    basedOnReadings: readings,
    dateRangeCovered: dateRange,
    estimatedAnnualCost: Math.round(annualCost * 100) / 100,
    costMin: Math.round(costMin * 100) / 100,
    costMax: Math.round(costMax * 100) / 100,
  };
}

/**
 * Calculate usage trend
 */
function calculateTrend(records: ConsumptionRecord[]): {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
} {
  if (records.length < 3) {
    return { direction: 'stable', percentage: 0 };
  }

  // Sort by date
  const sorted = [...records].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );

  // Compare first third to last third
  const segmentSize = Math.floor(sorted.length / 3);
  const firstSegment = sorted.slice(0, segmentSize);
  const lastSegment = sorted.slice(-segmentSize);

  const firstAvg = firstSegment.reduce((sum, r) => sum + r.electricityImport, 0) / firstSegment.length;
  const lastAvg = lastSegment.reduce((sum, r) => sum + r.electricityImport, 0) / lastSegment.length;

  const percentageChange = ((lastAvg - firstAvg) / firstAvg) * 100;

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(percentageChange) < 5) {
    direction = 'stable';
  } else if (percentageChange > 0) {
    direction = 'increasing';
  } else {
    direction = 'decreasing';
  }

  return {
    direction,
    percentage: Math.round(Math.abs(percentageChange) * 10) / 10,
  };
}

/**
 * Determine data quality
 */
function determineDataQuality(
  records: ConsumptionRecord[],
  profile: SeasonalProfile
): 'excellent' | 'good' | 'fair' | 'poor' {
  const avgConfidence = records.reduce((sum, r) => sum + r.confidence, 0) / records.length;
  const monthsCovered = new Set(records.map(r => r.startDate.getMonth())).size;

  if (avgConfidence > 85 && monthsCovered >= 10) return 'excellent';
  if (avgConfidence > 70 && monthsCovered >= 6) return 'good';
  if (avgConfidence > 50 && monthsCovered >= 3) return 'fair';
  return 'poor';
}

/**
 * Detect anomalies in consumption data
 */
export function detectAnomalies(
  records: ConsumptionRecord[],
  seasonalProfile: SeasonalProfile
): Array<{
  record: ConsumptionRecord;
  severity: 'minor' | 'moderate' | 'severe';
  expectedValue: number;
  deviation: number;
  possibleCauses: string[];
}> {
  if (records.length < 5) return []; // Need enough data for statistical analysis

  const anomalies: Array<{
    record: ConsumptionRecord;
    severity: 'minor' | 'moderate' | 'severe';
    expectedValue: number;
    deviation: number;
    possibleCauses: string[];
  }> = [];

  // Calculate expected values using seasonal adjustment
  records.forEach(record => {
    // Normalize to daily average
    const days = getDaysBetween(record.startDate, record.endDate);
    const dailyValue = record.electricityImport / days;

    // Get seasonally adjusted baseline
    const { adjustedValue } = applySeasonalAdjustment(
      dailyValue,
      record.startDate,
      seasonalProfile
    );

    // Calculate expected value from all other records
    const otherRecords = records.filter(r => r.id !== record.id);
    const avgOthers = otherRecords.reduce((sum, r) => {
      const d = getDaysBetween(r.startDate, r.endDate);
      return sum + r.electricityImport / d;
    }, 0) / otherRecords.length;

    // Calculate deviation
    const deviation = Math.abs(dailyValue - avgOthers) / avgOthers;

    // Flag as anomaly if deviation > 30%
    if (deviation > 0.3) {
      const severity: 'minor' | 'moderate' | 'severe' = 
        deviation > 0.7 ? 'severe' :
        deviation > 0.5 ? 'moderate' : 'minor';

      const possibleCauses = inferAnomalyCauses(deviation, record, seasonalProfile);

      anomalies.push({
        record,
        severity,
        expectedValue: Math.round(avgOthers * days * 100) / 100,
        deviation: Math.round(deviation * 100),
        possibleCauses,
      });
    }
  });

  return anomalies.sort((a, b) => b.deviation - a.deviation);
}

/**
 * Infer possible causes of anomalies
 */
function inferAnomalyCauses(
  deviation: number,
  record: ConsumptionRecord,
  profile: SeasonalProfile
): string[] {
  const causes: string[] = [];
  const month = record.startDate.getMonth();

  // High usage causes
  if (deviation > 0) {
    if ([11, 0, 1, 2].includes(month)) {
      causes.push('Unusually cold weather requiring extra heating');
    }
    if ([5, 6, 7].includes(month)) {
      causes.push('Possible use of air conditioning or fans');
    }
    causes.push('Additional occupancy or guests');
    causes.push('New electrical appliances in use');
    causes.push('Possible faulty appliance or insulation issue');
  } else {
    // Low usage causes
    causes.push('Property unoccupied during this period');
    causes.push('Conscious energy-saving efforts');
    causes.push('Milder weather than usual');
    if (record.confidence < 70) {
      causes.push('Possible data extraction error - please verify reading');
    }
  }

  return causes;
}

// Helper function
function getDaysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
