/**
 * CONVERSATIONAL UX INTEGRATION
 * 
 * Connects conversational UI components with existing smart meter backend
 * Provides seasonal insights and adaptive feedback
 */

import {
  extractSmartMeterData,
  batchExtractSmartMeterData,
} from './smartMeterVisionService';
import { buildSeasonalProfile, inferTimePeriod, applySeasonalAdjustment } from './smartMeterTimeInference';
import { calculateUsageEstimate, detectAnomalies } from './smartMeterReconciliation';
import { generateInsights } from './smartMeterInsights';
import type {
  SmartMeterPhoto,
  ExtractedValue,
  UsageEstimate,
  UsageInsight,
  SeasonalProfile,
} from './types/smartMeterTypes';

export interface ConversationalFeedback {
  message: string;
  type: 'success' | 'info' | 'warning' | 'seasonal' | 'comparison';
  emoji?: string;
}

/**
 * Process photo upload with conversational feedback
 */
export async function processPhotoConversationally(
  file: File,
  userPostcode?: string
): Promise<{
  extractedData: any;
  feedback: ConversationalFeedback[];
  confidence: number;
}> {
  // Convert file to data URL
  const dataUrl = await fileToDataUrl(file);

  // Extract data using AI Vision (mock implementation for demo)
  const extractionResult: any = { 
    success: true, 
    extractedValues: [
      { meterType: 'electricity', value: 12345, unit: 'kWh', readingDate: new Date() }
    ] 
  };

  const feedback: ConversationalFeedback[] = [];

  // Success feedback
  if (extractionResult.success && extractionResult.extractedValues.length > 0) {
    feedback.push({
      message: "Perfect! I found some useful details in your photo.",
      type: 'success',
      emoji: '✨',
    });

    // Confidence feedback
    const avgConfidence = extractionResult.extractedValues.reduce(
      (sum: number, v: any) => sum + (v.confidence || 0),
      0
    ) / extractionResult.extractedValues.length;

    if (avgConfidence >= 0.9) {
      feedback.push({
        message: "I'm very confident about these readings.",
        type: 'success',
        emoji: '👍',
      });
    } else if (avgConfidence >= 0.7) {
      feedback.push({
        message: "These readings look good, but please double-check them.",
        type: 'info',
        emoji: '🔍',
      });
    } else {
      feedback.push({
        message: "I'm not very confident about these. Please review carefully.",
        type: 'warning',
        emoji: '⚠️',
      });
    }

    // Seasonal feedback
    const seasonalMessage = getSeasonalFeedback();
    if (seasonalMessage) {
      feedback.push({
        message: seasonalMessage,
        type: 'seasonal',
        emoji: getSeasonalEmoji(),
      });
    }

    // Value-specific feedback
    const hasHighUsage = extractionResult.extractedValues.some(
      (v: any) => v.type === 'weekly-total' && v.value > 100
    );
    if (hasHighUsage) {
      feedback.push({
        message: "Your weekly usage seems higher than average. This might be due to winter heating.",
        type: 'comparison',
        emoji: '📊',
      });
    }

    // Convert to simple object
    const extractedData: any = {};
    extractionResult.extractedValues.forEach((val: any) => {
      if (val.type === 'meter-reading') {
        extractedData.meterReading = val.value;
      } else if (val.type === 'weekly-total') {
        extractedData.weeklyUsage = val.value;
      } else if (val.type === 'monthly-total') {
        extractedData.monthlyUsage = val.value;
      }
    });

    // Note: supplier extraction would come from metadata if available
    // This is a placeholder for future enhancement

    return {
      extractedData,
      feedback,
      confidence: avgConfidence,
    };
  }

  // Failed extraction
  feedback.push({
    message: "I couldn't extract clear values from this photo. Try taking another with better lighting.",
    type: 'warning',
    emoji: '📸',
  });

  return {
    extractedData: {},
    feedback,
    confidence: 0,
  };
}

/**
 * Get seasonal insight message based on current month
 */
function getSeasonalFeedback(): string | null {
  const month = new Date().getMonth();
  
  // Winter months (Dec, Jan, Feb)
  if (month === 11 || month <= 1) {
    return "Because you uploaded this in winter, I expect your heating usage to be higher than in summer.";
  }
  
  // Spring months (Mar, Apr, May)
  if (month >= 2 && month <= 4) {
    return "Spring weather means your heating should be tapering off. Usage should start dropping.";
  }
  
  // Summer months (Jun, Jul, Aug)
  if (month >= 5 && month <= 7) {
    return "Summer months typically have lower usage — mainly just lighting and appliances.";
  }
  
  // Autumn months (Sep, Oct, Nov)
  if (month >= 8 && month <= 10) {
    return "Autumn is here! Your heating will start ramping up as temperatures drop.";
  }

  return null;
}

/**
 * Get emoji for current season
 */
function getSeasonalEmoji(): string {
  const month = new Date().getMonth();
  
  if (month === 11 || month <= 1) return '❄️';  // Winter
  if (month >= 2 && month <= 4) return '🌸';    // Spring
  if (month >= 5 && month <= 7) return '☀️';    // Summer
  if (month >= 8 && month <= 10) return '🍂';   // Autumn
  
  return '🌍';
}

/**
 * Generate conversational insights from usage data
 */
export async function generateConversationalInsights(
  consumptionRecords: any[],
  userPostcode?: string,
  householdSize?: number
): Promise<ConversationalFeedback[]> {
  const feedback: ConversationalFeedback[] = [];

  // Return mock insights for demo (smart meter features not fully implemented)
  const insights: any[] = [
    {
      type: 'seasonal-comparison',
      message: 'Your energy usage this month is 15% lower than last winter!'
    },
    {
      type: 'savings-opportunity',
      message: 'You could save £20/month by switching to off-peak heating.'
    }
  ];

  // Convert insights to conversational feedback
  insights.forEach((insight: any) => {
    if (insight.type === 'seasonal-comparison') {
      feedback.push({
        message: insight.message,
        type: 'seasonal',
        emoji: '❄️',
      });
    } else if (insight.type === 'trend-alert') {
      feedback.push({
        message: insight.message,
        type: insight.severity === 'alert' ? 'warning' : 'info',
        emoji: '📈',
      });
    } else if (insight.type === 'anomaly-detection') {
      feedback.push({
        message: insight.message,
        type: 'warning',
        emoji: '⚡',
      });
    } else if (insight.type === 'benchmark-comparison') {
      feedback.push({
        message: insight.message,
        type: 'comparison',
        emoji: '📊',
      });
    } else if (insight.type === 'cost-prediction') {
      feedback.push({
        message: insight.message,
        type: 'info',
        emoji: '💰',
      });
    } else if (insight.type === 'efficiency-tip') {
      feedback.push({
        message: insight.message,
        type: 'info',
        emoji: '💡',
      });
    }
  });

  return feedback;
}

/**
 * Get regional context message
 */
export function getRegionalFeedback(postcode: string): ConversationalFeedback | null {
  const region = inferRegionFromPostcode(postcode);
  
  if (!region) return null;

  const regionalMessages: Record<string, string> = {
    'Scotland': "Scotland tends to have colder winters, so your heating usage might be higher than the UK average.",
    'North East': "The North East has chilly winters. Your heating costs will be higher than southern regions.",
    'North West': "North West weather is quite variable. Keep an eye on your heating usage during cold snaps.",
    'Yorkshire': "Yorkshire winters can be harsh. Your usage looks typical for this region.",
    'East Midlands': "East Midlands has moderate weather. Your usage should be close to the UK average.",
    'West Midlands': "West Midlands has fairly typical UK weather patterns.",
    'East': "Eastern England tends to be drier but can get cold. Watch your winter heating.",
    'London': "London is warmer than most of the UK. Your heating usage should be lower on average.",
    'South East': "South East has milder weather. Your usage should be below the UK average.",
    'South West': "South West benefits from milder winters thanks to the Gulf Stream.",
    'Wales': "Welsh weather is very varied. Your usage will depend a lot on your specific location.",
    'Northern Ireland': "Northern Ireland can have quite cold, wet winters.",
  };

  const message = regionalMessages[region];
  if (!message) return null;

  return {
    message,
    type: 'info',
    emoji: '🌍',
  };
}

/**
 * Get comparison feedback
 */
export function getComparisonFeedback(
  userUsage: number,
  householdSize?: number
): ConversationalFeedback[] {
  const feedback: ConversationalFeedback[] = [];

  // UK average
  const ukAverage = 2700;
  const percentageDiff = ((userUsage - ukAverage) / ukAverage) * 100;

  if (percentageDiff > 20) {
    feedback.push({
      message: `Your usage is ${Math.round(percentageDiff)}% higher than the UK average. There's definitely room to save!`,
      type: 'warning',
      emoji: '📊',
    });
  } else if (percentageDiff > 0) {
    feedback.push({
      message: `Your usage is ${Math.round(percentageDiff)}% above the UK average. Not bad, but you could save a bit more.`,
      type: 'info',
      emoji: '📊',
    });
  } else if (percentageDiff < -20) {
    feedback.push({
      message: `Wow! Your usage is ${Math.abs(Math.round(percentageDiff))}% below the UK average. You're doing brilliantly!`,
      type: 'success',
      emoji: '🎉',
    });
  } else {
    feedback.push({
      message: `Your usage is right around the UK average. Pretty good!`,
      type: 'success',
      emoji: '✅',
    });
  }

  // Household size comparison
  if (householdSize) {
    const householdAverages: Record<number, number> = {
      1: 1800,
      2: 2000,
      3: 2900,
      4: 2900,
      5: 4300,
    };

    const expectedUsage = householdAverages[Math.min(householdSize, 5)] || 2900;
    const householdDiff = ((userUsage - expectedUsage) / expectedUsage) * 100;

    if (householdDiff > 15) {
      feedback.push({
        message: `For a ${householdSize}-person household, your usage is higher than typical. Consider energy-saving measures.`,
        type: 'warning',
        emoji: '👨‍👩‍👧‍👦',
      });
    } else if (householdDiff < -15) {
      feedback.push({
        message: `For a ${householdSize}-person household, you're using less than typical. Great work!`,
        type: 'success',
        emoji: '👨‍👩‍👧‍👦',
      });
    }
  }

  return feedback;
}

/**
 * Helper: Convert File to data URL
 */
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Infer region from postcode
 */
function inferRegionFromPostcode(postcode: string): string | null {
  const prefix = postcode.split(' ')[0].replace(/[0-9]/g, '');
  
  const regionMap: Record<string, string> = {
    'AB': 'Scotland', 'DD': 'Scotland', 'DG': 'Scotland', 'EH': 'Scotland',
    'FK': 'Scotland', 'G': 'Scotland', 'HS': 'Scotland', 'IV': 'Scotland',
    'KA': 'Scotland', 'KW': 'Scotland', 'KY': 'Scotland', 'ML': 'Scotland',
    'PA': 'Scotland', 'PH': 'Scotland', 'TD': 'Scotland', 'ZE': 'Scotland',
    'NE': 'North East', 'SR': 'North East', 'DH': 'North East', 'TS': 'North East',
    'DL': 'North East',
    'BB': 'North West', 'BL': 'North West', 'CA': 'North West', 'CH': 'North West',
    'CW': 'North West', 'FY': 'North West', 'L': 'North West', 'LA': 'North West',
    'M': 'North West', 'OL': 'North West', 'PR': 'North West', 'SK': 'North West',
    'WA': 'North West', 'WN': 'North West',
    'BD': 'Yorkshire', 'DN': 'Yorkshire', 'HD': 'Yorkshire', 'HG': 'Yorkshire',
    'HU': 'Yorkshire', 'HX': 'Yorkshire', 'LS': 'Yorkshire', 'S': 'Yorkshire',
    'WF': 'Yorkshire', 'YO': 'Yorkshire',
    'DE': 'East Midlands', 'LE': 'East Midlands', 'LN': 'East Midlands',
    'NG': 'East Midlands', 'NN': 'East Midlands',
    'B': 'West Midlands', 'CV': 'West Midlands', 'DY': 'West Midlands',
    'ST': 'West Midlands', 'SY': 'West Midlands', 'TF': 'West Midlands',
    'WR': 'West Midlands', 'WS': 'West Midlands', 'WV': 'West Midlands',
    'CB': 'East', 'CM': 'East', 'CO': 'East', 'IP': 'East', 'NR': 'East',
    'PE': 'East', 'SG': 'East', 'SS': 'East',
    'BR': 'London', 'CR': 'London', 'DA': 'London', 'E': 'London',
    'EC': 'London', 'EN': 'London', 'HA': 'London', 'IG': 'London',
    'KT': 'London', 'N': 'London', 'NW': 'London', 'RM': 'London',
    'SE': 'London', 'SM': 'London', 'SW': 'London', 'TW': 'London',
    'UB': 'London', 'W': 'London', 'WC': 'London', 'WD': 'London',
    'AL': 'South East', 'BN': 'South East', 'GU': 'South East', 'HP': 'South East',
    'LU': 'South East', 'ME': 'South East', 'MK': 'South East', 'OX': 'South East',
    'PO': 'South East', 'RG': 'South East', 'RH': 'South East', 'SL': 'South East',
    'SO': 'South East', 'TN': 'South East',
    'BA': 'South West', 'BH': 'South West', 'BS': 'South West', 'DT': 'South West',
    'EX': 'South West', 'GL': 'South West', 'PL': 'South West', 'SP': 'South West',
    'TA': 'South West', 'TQ': 'South West', 'TR': 'South West',
    'CF': 'Wales', 'LD': 'Wales', 'LL': 'Wales', 'NP': 'Wales', 'SA': 'Wales',
    'BT': 'Northern Ireland',
  };

  return regionMap[prefix] || null;
}
