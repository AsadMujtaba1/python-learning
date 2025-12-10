/**
 * SMART METER MULTI-PHOTO ANALYSIS TYPES
 * 
 * Comprehensive type definitions for intelligent energy usage tracking
 * Supports unlimited photo uploads with AI-powered extraction
 */

export type PhotoType = 
  | 'smart-meter-reading'
  | 'weekly-chart'
  | 'monthly-chart'
  | 'yearly-chart'
  | 'supplier-app-screenshot'
  | 'in-home-display'
  | 'paper-bill'
  | 'usage-summary'
  | 'consumption-table'
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'unknown';

export type MeterReadingType = 'import' | 'export' | 'day' | 'night' | 'total';

export type DataValueType =
  | 'meter-reading'
  | 'weekly-total'
  | 'monthly-total'
  | 'yearly-total'
  | 'daily-average'
  | 'chart-data-point'
  | 'cost-value'
  | 'tariff-rate';

export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SmartMeterPhoto {
  id: string;
  userId: string;
  uploadTimestamp: Date;
  filePath: string; // Firebase Storage path
  fileUrl?: string; // Temporary download URL
  fileSize: number; // bytes
  mimeType: string;
  photoType: PhotoType;
  
  // Extraction status
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'confirmed' | 'rejected';
  extractionConfidence: number; // 0-100
  extractionError?: string;
  
  // User confirmation
  userConfirmed: boolean;
  userEditedValues: boolean;
  confirmationTimestamp?: Date;
  
  // Metadata
  deviceInfo?: string;
  location?: string; // GPS if available
  notes?: string;
}

export interface ExtractedValue {
  id: string;
  photoId: string;
  userId: string;
  
  // The extracted number and its context
  value: number;
  unit: 'kWh' | 'm³' | 'GBP' | 'pence' | 'percentage' | 'other';
  valueType: DataValueType;
  meterReadingType?: MeterReadingType;
  
  // Time context
  extractedDate?: Date; // Explicit date from photo
  inferredStartDate: Date; // Calculated start of period
  inferredEndDate: Date; // Calculated end of period
  timeGranularity: TimeGranularity;
  dateConfidence: number; // 0-100
  
  // Source tracking
  extractionMethod: 'ocr' | 'ai-vision' | 'manual' | 'chart-parsing';
  confidence: number; // 0-100
  sourcePhotoRegion?: { x: number; y: number; width: number; height: number };
  
  // Validation
  validated: boolean;
  anomaly: boolean;
  anomalyReason?: string;
  
  // Relationships
  relatedValues: string[]; // IDs of related extracted values
  supersededBy?: string; // If newer, more accurate value exists
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsumptionRecord {
  id: string;
  userId: string;
  
  // Time period
  startDate: Date;
  endDate: Date;
  granularity: TimeGranularity;
  
  // Consumption data
  electricityImport: number; // kWh
  electricityExport?: number; // kWh (for solar)
  gasConsumption?: number; // m³
  
  // Cost (if available)
  electricityCost?: number; // £
  gasCost?: number; // £
  totalCost?: number; // £
  
  // Data quality
  dataSource: 'photo-extraction' | 'manual-entry' | 'api-import' | 'estimated';
  confidence: number; // 0-100
  isEstimated: boolean;
  estimationMethod?: string;
  
  // Seasonal adjustment
  seasonallyAdjusted: boolean;
  rawValue?: number;
  adjustmentFactor?: number;
  
  // Source tracking
  sourcePhotoIds: string[];
  extractedValueIds: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SeasonalProfile {
  userId: string;
  postcode: string;
  region: string;
  
  // Seasonal adjustment factors (multiply by raw usage)
  winterFactor: number; // Jan-Mar, Nov-Dec
  springFactor: number; // Apr-May
  summerFactor: number; // Jun-Aug
  autumnFactor: number; // Sep-Oct
  
  // Historical patterns
  heatingDegreeDays: { [month: string]: number };
  coolingDegreeDay: { [month: string]: number };
  
  // Confidence in profile
  dataPoints: number; // How many photos/readings contributed
  confidence: number; // 0-100
  
  lastUpdated: Date;
}

export interface UsageEstimate {
  userId: string;
  estimatedAt: Date;
  
  // Estimates
  dailyAverage: number; // kWh/day
  weeklyAverage: number; // kWh/week
  monthlyAverage: number; // kWh/month
  yearlyTotal: number; // kWh/year
  
  // Ranges (confidence intervals)
  yearlyMin: number;
  yearlyMax: number;
  
  // Trend
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number; // % change over time
  
  // Confidence
  confidence: number; // 0-100
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Basis
  basedOnPhotos: number;
  basedOnReadings: number;
  dateRangeCovered: { start: Date; end: Date };
  
  // Cost projection
  estimatedAnnualCost: number; // £
  costMin: number;
  costMax: number;
}

export interface UsageInsight {
  id: string;
  userId: string;
  
  type: 'seasonal-comparison' | 'trend-alert' | 'anomaly-detection' | 
        'benchmark-comparison' | 'cost-prediction' | 'efficiency-tip';
  
  severity: 'info' | 'warning' | 'alert';
  priority: number; // 1-10
  
  title: string;
  description: string;
  detailedExplanation: string;
  
  // Data backing the insight
  supportingData: {
    metric: string;
    value: number;
    comparison?: number;
    percentageDiff?: number;
  }[];
  
  // Actionability
  actionable: boolean;
  suggestedActions: string[];
  potentialSavings?: number; // £/year
  
  // Lifecycle
  viewed: boolean;
  dismissed: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PhotoExtractionRequest {
  photoId: string;
  userId: string;
  fileUrl: string;
  photoType?: PhotoType;
  uploadTimestamp: Date;
  userPostcode?: string;
  userRegion?: string;
}

export interface PhotoExtractionResult {
  photoId: string;
  success: boolean;
  confidence: number;
  
  // Detected content
  detectedPhotoType: PhotoType;
  detectedSupplier?: string;
  detectedDateRange?: { start: Date; end: Date };
  
  // Extracted values
  extractedValues: {
    value: number;
    unit: string;
    type: DataValueType;
    confidence: number;
    location: { x: number; y: number; width: number; height: number };
    rawText?: string;
  }[];
  
  // Chart data (if applicable)
  chartData?: {
    dataPoints: Array<{ date: Date; value: number }>;
    chartType: 'bar' | 'line' | 'area' | 'pie';
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  
  // Full OCR text (for debugging)
  fullOcrText?: string;
  
  // Warnings/errors
  warnings: string[];
  errors: string[];
  
  processingTimeMs: number;
}

export interface ValueReconciliation {
  conflictingValues: ExtractedValue[];
  recommendedValue: number;
  confidence: number;
  reasoning: string;
  requiresUserConfirmation: boolean;
}

export interface SmartMeterAnalytics {
  userId: string;
  generatedAt: Date;
  
  // Time series data
  dailyUsage: Array<{ date: Date; kWh: number; cost?: number }>;
  weeklyUsage: Array<{ weekStart: Date; kWh: number; cost?: number }>;
  monthlyUsage: Array<{ month: Date; kWh: number; cost?: number }>;
  
  // Statistics
  totalPhotos: number;
  totalReadings: number;
  dateRangeCoverage: { start: Date; end: Date };
  dataCompleteness: number; // 0-100
  
  // Trends
  currentTrend: 'increasing' | 'decreasing' | 'stable';
  trendConfidence: number;
  changeRate: number; // kWh/month change
  
  // Seasonal analysis
  winterAverage: number; // kWh/day
  summerAverage: number; // kWh/day
  seasonalVariation: number; // %
  
  // Comparisons
  vsRegionalAverage?: {
    userAverage: number;
    regionalAverage: number;
    percentageDiff: number;
  };
  
  vsSimilarHouseholds?: {
    userAverage: number;
    similarAverage: number;
    percentageDiff: number;
  };
  
  // Anomalies
  detectedAnomalies: Array<{
    date: Date;
    value: number;
    expectedValue: number;
    severity: 'minor' | 'moderate' | 'severe';
    possibleCauses: string[];
  }>;
  
  // Cost analysis
  estimatedAnnualCost: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  potentialSavings: number;
}

export interface SmartMeterConfig {
  // Feature toggles
  enablePhotoUpload: boolean;
  enableAIExtraction: boolean;
  enableSeasonalAdjustment: boolean;
  enableInsights: boolean;
  
  // AI Vision settings
  aiVisionProvider: 'openai' | 'google' | 'azure';
  aiVisionModel: string;
  extractionConfidenceThreshold: number; // 0-100
  
  // Storage settings
  maxPhotoSizeMB: number;
  maxPhotosPerUser: number;
  photoRetentionDays: number;
  
  // Processing settings
  autoExtractOnUpload: boolean;
  requireUserConfirmation: boolean;
  enableValueReconciliation: boolean;
  
  // Privacy settings
  storeFullOcrText: boolean;
  anonymizeSupplierNames: boolean;
  gdprCompliant: boolean;
}
