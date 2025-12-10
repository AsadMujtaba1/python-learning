/**
 * SMART METER INSIGHTS GENERATION SYSTEM
 * 
 * Automatically generates actionable insights from consumption data
 * Compares against benchmarks, identifies trends, suggests improvements
 */

import {
  UsageInsight,
  ConsumptionRecord,
  SeasonalProfile,
  UsageEstimate,
  SmartMeterAnalytics,
} from './types/smartMeterTypes';
import { detectAnomalies } from './smartMeterReconciliation';

// UK Average household consumption (Ofgem 2024)
const UK_AVERAGES = {
  electricityAnnual: 2700, // kWh/year
  electricityDaily: 7.4, // kWh/day
  gasAnnual: 11500, // kWh/year equivalent
  smallHousehold: 2000, // 1-2 people
  mediumHousehold: 2900, // 3-4 people
  largeHousehold: 4300, // 5+ people
};

/**
 * Generate all insights for a user
 */
export async function generateInsights(
  userId: string,
  usageEstimate: UsageEstimate,
  records: ConsumptionRecord[],
  seasonalProfile: SeasonalProfile,
  analytics: SmartMeterAnalytics,
  householdSize?: number
): Promise<UsageInsight[]> {
  const insights: UsageInsight[] = [];

  // 1. Seasonal comparison insights
  insights.push(...generateSeasonalInsights(userId, records, seasonalProfile));

  // 2. Trend alerts
  insights.push(...generateTrendInsights(userId, usageEstimate, records));

  // 3. Anomaly detection insights
  insights.push(...generateAnomalyInsights(userId, records, seasonalProfile));

  // 4. Benchmark comparisons
  insights.push(...generateBenchmarkInsights(userId, usageEstimate, householdSize));

  // 5. Cost prediction insights
  insights.push(...generateCostInsights(userId, usageEstimate, analytics));

  // 6. Efficiency tips
  insights.push(...generateEfficiencyTips(userId, usageEstimate, seasonalProfile, records));

  // Sort by priority
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate seasonal comparison insights
 */
function generateSeasonalInsights(
  userId: string,
  records: ConsumptionRecord[],
  profile: SeasonalProfile
): UsageInsight[] {
  const insights: UsageInsight[] = [];

  // Calculate average by season
  const winterRecords = records.filter(r => [11, 0, 1, 2].includes(r.startDate.getMonth()));
  const summerRecords = records.filter(r => [5, 6, 7].includes(r.startDate.getMonth()));

  if (winterRecords.length > 0 && summerRecords.length > 0) {
    const winterAvg = winterRecords.reduce((sum, r) => sum + r.electricityImport, 0) / winterRecords.length;
    const summerAvg = summerRecords.reduce((sum, r) => sum + r.electricityImport, 0) / summerRecords.length;
    const percentDiff = ((winterAvg - summerAvg) / summerAvg) * 100;

    if (percentDiff > 50) {
      insights.push({
        id: `seasonal-${userId}-${Date.now()}`,
        userId,
        type: 'seasonal-comparison',
        severity: percentDiff > 100 ? 'warning' : 'info',
        priority: 7,
        title: 'High Winter Usage Detected',
        description: `Your winter energy usage is ${Math.round(percentDiff)}% higher than summer.`,
        detailedExplanation: `Winter consumption averages ${Math.round(winterAvg)} kWh per period, compared to ${Math.round(summerAvg)} kWh in summer. This significant increase is likely due to heating. Consider improving insulation or switching to a more efficient heating system.`,
        supportingData: [
          { metric: 'Winter Average', value: Math.round(winterAvg), comparison: Math.round(summerAvg), percentageDiff: percentDiff },
          { metric: 'Seasonal Factor', value: profile.winterFactor, comparison: profile.summerFactor },
        ],
        actionable: true,
        suggestedActions: [
          'Check loft insulation - should be at least 270mm deep',
          'Seal draughts around windows and doors',
          'Consider upgrading to a heat pump for efficient heating',
          'Use a smart thermostat to optimize heating schedules',
          'Check radiator efficiency and bleed if necessary',
        ],
        potentialSavings: Math.round((winterAvg - summerAvg) * 0.245 * 4), // 4 winter months
        viewed: false,
        dismissed: false,
        createdAt: new Date(),
      });
    }
  }

  return insights;
}

/**
 * Generate trend alert insights
 */
function generateTrendInsights(
  userId: string,
  estimate: UsageEstimate,
  records: ConsumptionRecord[]
): UsageInsight[] {
  const insights: UsageInsight[] = [];

  if (estimate.trendDirection === 'increasing' && estimate.trendPercentage > 10) {
    insights.push({
      id: `trend-${userId}-${Date.now()}`,
      userId,
      type: 'trend-alert',
      severity: estimate.trendPercentage > 20 ? 'alert' : 'warning',
      priority: 8,
      title: 'Rising Energy Usage Trend',
      description: `Your energy usage is increasing by ${estimate.trendPercentage}% over time.`,
      detailedExplanation: `Based on ${records.length} readings, your consumption has been steadily rising. This could be due to changes in occupancy, new appliances, or decreased efficiency of existing equipment. Investigating the cause could lead to significant savings.`,
      supportingData: [
        { metric: 'Trend Rate', value: estimate.trendPercentage },
        { metric: 'Current Daily Average', value: estimate.dailyAverage },
        { metric: 'Projected Annual Increase', value: Math.round(estimate.yearlyTotal * (estimate.trendPercentage / 100)) },
      ],
      actionable: true,
      suggestedActions: [
        'Check for recently added appliances or electronics',
        'Review thermostat settings - small changes make big differences',
        'Inspect for faulty appliances running inefficiently',
        'Consider an energy audit to identify the source',
        'Monitor daily usage to pinpoint when the increase occurs',
      ],
      potentialSavings: Math.round(estimate.estimatedAnnualCost * (estimate.trendPercentage / 100)),
      viewed: false,
      dismissed: false,
      createdAt: new Date(),
    });
  } else if (estimate.trendDirection === 'decreasing' && estimate.trendPercentage > 10) {
    insights.push({
      id: `trend-${userId}-${Date.now()}`,
      userId,
      type: 'trend-alert',
      severity: 'info',
      priority: 5,
      title: '✓ Energy Usage Decreasing',
      description: `Great news! Your usage is down ${estimate.trendPercentage}% over time.`,
      detailedExplanation: `You've successfully reduced your energy consumption. Keep up the good work! This downward trend will save you approximately £${Math.round(estimate.estimatedAnnualCost * (estimate.trendPercentage / 100))} per year.`,
      supportingData: [
        { metric: 'Reduction Rate', value: estimate.trendPercentage },
        { metric: 'Current Daily Average', value: estimate.dailyAverage },
        { metric: 'Annual Savings', value: Math.round(estimate.estimatedAnnualCost * (estimate.trendPercentage / 100)) },
      ],
      actionable: false,
      suggestedActions: [
        'Continue your current energy-saving practices',
        'Share your success story to help others',
      ],
      potentialSavings: Math.round(estimate.estimatedAnnualCost * (estimate.trendPercentage / 100)),
      viewed: false,
      dismissed: false,
      createdAt: new Date(),
    });
  }

  return insights;
}

/**
 * Generate anomaly detection insights
 */
function generateAnomalyInsights(
  userId: string,
  records: ConsumptionRecord[],
  profile: SeasonalProfile
): UsageInsight[] {
  const insights: UsageInsight[] = [];
  const anomalies = detectAnomalies(records, profile);

  // Report significant anomalies
  anomalies.slice(0, 3).forEach((anomaly, idx) => {
    if (anomaly.severity === 'severe' || anomaly.severity === 'moderate') {
      const dateStr = anomaly.record.startDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

      insights.push({
        id: `anomaly-${userId}-${idx}`,
        userId,
        type: 'anomaly-detection',
        severity: anomaly.severity === 'severe' ? 'alert' : 'warning',
        priority: anomaly.severity === 'severe' ? 9 : 6,
        title: `Unusual Usage in ${dateStr}`,
        description: `Your usage was ${anomaly.deviation}% ${anomaly.record.electricityImport > anomaly.expectedValue ? 'higher' : 'lower'} than expected.`,
        detailedExplanation: `In ${dateStr}, you used ${Math.round(anomaly.record.electricityImport)} kWh, compared to an expected ${Math.round(anomaly.expectedValue)} kWh. This ${anomaly.deviation}% difference warrants investigation.`,
        supportingData: [
          { metric: 'Actual Usage', value: Math.round(anomaly.record.electricityImport) },
          { metric: 'Expected Usage', value: Math.round(anomaly.expectedValue) },
          { metric: 'Deviation', value: anomaly.deviation },
        ],
        actionable: true,
        suggestedActions: [
          ...anomaly.possibleCauses.map(cause => `Check: ${cause}`),
          'Review meter reading photo to confirm accuracy',
          'Compare with supplier bill if available',
        ],
        potentialSavings: anomaly.record.electricityImport > anomaly.expectedValue
          ? Math.round((anomaly.record.electricityImport - anomaly.expectedValue) * 0.245)
          : undefined,
        viewed: false,
        dismissed: false,
        createdAt: new Date(),
      });
    }
  });

  return insights;
}

/**
 * Generate benchmark comparison insights
 */
function generateBenchmarkInsights(
  userId: string,
  estimate: UsageEstimate,
  householdSize?: number
): UsageInsight[] {
  const insights: UsageInsight[] = [];

  // Compare to UK average
  const ukAverage = UK_AVERAGES.electricityAnnual;
  const percentDiff = ((estimate.yearlyTotal - ukAverage) / ukAverage) * 100;

  if (Math.abs(percentDiff) > 15) {
    const isHigher = estimate.yearlyTotal > ukAverage;

    insights.push({
      id: `benchmark-uk-${userId}`,
      userId,
      type: 'benchmark-comparison',
      severity: isHigher ? 'warning' : 'info',
      priority: isHigher ? 7 : 4,
      title: isHigher
        ? 'Above UK Average Usage'
        : 'Below UK Average Usage',
      description: `Your estimated usage is ${Math.abs(Math.round(percentDiff))}% ${isHigher ? 'higher' : 'lower'} than the UK average.`,
      detailedExplanation: `The average UK household uses around ${ukAverage} kWh per year. Your estimated consumption is ${estimate.yearlyTotal} kWh. ${isHigher ? 'There may be opportunities to reduce your usage and save money.' : 'You\'re doing well compared to the national average!'}`,
      supportingData: [
        { metric: 'Your Estimate', value: estimate.yearlyTotal, comparison: ukAverage, percentageDiff: percentDiff },
        { metric: 'UK Average', value: ukAverage },
      ],
      actionable: isHigher,
      suggestedActions: isHigher ? [
        'Compare appliance efficiency ratings',
        'Review heating and hot water settings',
        'Consider upgrading old appliances',
        'Use energy monitor to identify high-usage periods',
      ] : [
        'Share your energy-saving tips with others',
        'Maintain your efficient habits',
      ],
      potentialSavings: isHigher
        ? Math.round((estimate.yearlyTotal - ukAverage) * 0.245)
        : undefined,
      viewed: false,
      dismissed: false,
      createdAt: new Date(),
    });
  }

  // Compare to household size average if provided
  if (householdSize) {
    const sizeAverage = householdSize <= 2
      ? UK_AVERAGES.smallHousehold
      : householdSize <= 4
      ? UK_AVERAGES.mediumHousehold
      : UK_AVERAGES.largeHousehold;

    const sizeDiff = ((estimate.yearlyTotal - sizeAverage) / sizeAverage) * 100;

    if (sizeDiff > 20) {
      insights.push({
        id: `benchmark-size-${userId}`,
        userId,
        type: 'benchmark-comparison',
        severity: 'warning',
        priority: 8,
        title: 'Higher Than Similar Households',
        description: `Your usage is ${Math.round(sizeDiff)}% above average for ${householdSize}-person households.`,
        detailedExplanation: `Similar households (${householdSize} people) typically use around ${sizeAverage} kWh/year. Your usage of ${estimate.yearlyTotal} kWh suggests room for improvement.`,
        supportingData: [
          { metric: 'Your Usage', value: estimate.yearlyTotal, comparison: sizeAverage, percentageDiff: sizeDiff },
          { metric: 'Similar Households Average', value: sizeAverage },
        ],
        actionable: true,
        suggestedActions: [
          'Review your heating schedule - is it on when nobody\'s home?',
          'Check for vampire power - devices on standby',
          'Consider your water heating - is it set too high?',
          'Evaluate appliance usage patterns',
        ],
        potentialSavings: Math.round((estimate.yearlyTotal - sizeAverage) * 0.245 * 0.5), // Assume 50% reduction possible
        viewed: false,
        dismissed: false,
        createdAt: new Date(),
      });
    }
  }

  return insights;
}

/**
 * Generate cost prediction insights
 */
function generateCostInsights(
  userId: string,
  estimate: UsageEstimate,
  analytics: SmartMeterAnalytics
): UsageInsight[] {
  const insights: UsageInsight[] = [];

  // High cost alert
  if (estimate.estimatedAnnualCost > 800) {
    insights.push({
      id: `cost-high-${userId}`,
      userId,
      type: 'cost-prediction',
      severity: 'warning',
      priority: 9,
      title: 'High Annual Cost Predicted',
      description: `Your estimated annual electricity cost is £${estimate.estimatedAnnualCost.toFixed(2)}.`,
      detailedExplanation: `Based on current usage patterns and typical tariff rates, you're on track to spend £${estimate.estimatedAnnualCost.toFixed(2)} per year on electricity (range: £${estimate.costMin.toFixed(2)} - £${estimate.costMax.toFixed(2)}). This is above the UK average of around £660. Reducing consumption or switching tariffs could save you money.`,
      supportingData: [
        { metric: 'Estimated Annual Cost', value: estimate.estimatedAnnualCost },
        { metric: 'UK Average Annual Cost', value: 660, comparison: estimate.estimatedAnnualCost, percentageDiff: ((estimate.estimatedAnnualCost - 660) / 660) * 100 },
        { metric: 'Potential Cost Range', value: estimate.costMin, comparison: estimate.costMax },
      ],
      actionable: true,
      suggestedActions: [
        'Compare your current tariff with others using our tariff comparison tool',
        'Consider switching to a time-of-use tariff if you can shift usage',
        'Implement energy-saving measures to reduce consumption',
        'Check if you qualify for any energy bill support schemes',
      ],
      potentialSavings: Math.round((estimate.estimatedAnnualCost - 660) * 0.3), // Assume 30% savings possible
      viewed: false,
      dismissed: false,
      createdAt: new Date(),
    });
  }

  // Tariff optimization opportunity
  insights.push({
    id: `cost-tariff-${userId}`,
    userId,
    type: 'cost-prediction',
    severity: 'info',
    priority: 6,
    title: 'Tariff Optimization Opportunity',
    description: 'Switching to the right tariff could save you money.',
    detailedExplanation: `Your usage pattern suggests you could benefit from comparing tariffs. Our tariff comparison tool analyzes your consumption and finds the best deals for your situation.`,
    supportingData: [
      { metric: 'Current Estimated Cost', value: estimate.estimatedAnnualCost },
      { metric: 'Average Switching Savings', value: 200 }, // Industry average
    ],
    actionable: true,
    suggestedActions: [
      'Visit our Tariff Comparison page',
      'Review your current supplier contract end date',
      'Consider fixed vs variable rate tariffs',
      'Check for dual fuel discounts',
    ],
    potentialSavings: 200,
    viewed: false,
    dismissed: false,
    createdAt: new Date(),
  });

  return insights;
}

/**
 * Generate efficiency tips based on usage patterns
 */
function generateEfficiencyTips(
  userId: string,
  estimate: UsageEstimate,
  profile: SeasonalProfile,
  records: ConsumptionRecord[]
): UsageInsight[] {
  const insights: UsageInsight[] = [];

  // High winter usage tip
  if (profile.winterFactor > 1.4) {
    insights.push({
      id: `tip-heating-${userId}`,
      userId,
      type: 'efficiency-tip',
      severity: 'info',
      priority: 5,
      title: 'Heating Efficiency Tips',
      description: 'Your winter heating costs are high. Here\'s how to reduce them.',
      detailedExplanation: 'Heating accounts for the majority of your winter energy use. Small changes to your heating habits and home insulation can lead to significant savings without sacrificing comfort.',
      supportingData: [
        { metric: 'Winter Factor', value: profile.winterFactor },
        { metric: 'Heating Savings Potential', value: 30 }, // Percentage
      ],
      actionable: true,
      suggestedActions: [
        'Turn down thermostat by 1°C - saves ~£80/year',
        'Bleed radiators for better heat distribution',
        'Close curtains at dusk to retain heat',
        'Only heat rooms you\'re using',
        'Service your boiler annually',
        'Install thermostatic radiator valves (TRVs)',
      ],
      potentialSavings: 150,
      viewed: false,
      dismissed: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
  }

  // General efficiency tip
  insights.push({
    id: `tip-general-${userId}`,
    userId,
    type: 'efficiency-tip',
    severity: 'info',
    priority: 3,
    title: 'Quick Energy Saving Tips',
    description: 'Simple actions that can reduce your bills today.',
    detailedExplanation: 'These proven energy-saving tips require little to no investment but can collectively save £100-300 per year.',
    supportingData: [
      { metric: 'Potential Annual Savings', value: 200 },
    ],
    actionable: true,
    suggestedActions: [
      'Switch to LED bulbs - save £40/year',
      'Turn off devices at the wall - save £45/year',
      'Wash clothes at 30°C - save £25/year',
      'Use lids on pans when cooking - save £14/year',
      'Fill the kettle with only what you need - save £10/year',
      'Take shorter showers - save £70/year on hot water',
    ],
    potentialSavings: 200,
    viewed: false,
    dismissed: false,
    createdAt: new Date(),
  });

  return insights;
}
