/**
 * DashboardSummary Component
 * 
 * Provides a concise, user-friendly summary of key insights at the top of the dashboard.
 * Updates dynamically based on user data availability and regional comparisons.
 * 
 * @module components/dashboard/DashboardSummary
 */

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingDown, TrendingUp, Lightbulb, MapPin } from 'lucide-react';

interface DashboardSummaryProps {
  userCost?: number;
  regionalAverage?: number;
  nationalAverage?: number;
  region?: string;
  hasUserData?: boolean;
  className?: string;
}

export default function DashboardSummary({
  userCost = 3.85,
  regionalAverage = 4.20,
  nationalAverage = 4.50,
  region = 'West Midlands',
  hasUserData = false,
  className = '',
}: DashboardSummaryProps) {
  // Calculate comparisons
  const vsRegional = regionalAverage - userCost;
  const vsNational = nationalAverage - userCost;
  const annualSavingsVsRegional = vsRegional * 365;
  const annualSavingsVsNational = vsNational * 365;
  
  const isBelowRegional = userCost < regionalAverage;
  const isBelowNational = userCost < nationalAverage;

  // Generate comprehensive insights summary
  const insights = [];

  if (hasUserData) {
    // User has provided data - comprehensive dashboard summary
    insights.push({
      icon: Sparkles,
      color: 'text-blue-600 dark:text-blue-400',
      text: `Your current daily energy cost is £${userCost.toFixed(2)}, which works out to around £${(userCost * 30).toFixed(0)}/month or £${(userCost * 365).toFixed(0)}/year.`,
    });

    if (isBelowRegional && isBelowNational) {
      insights.push({
        icon: TrendingDown,
        color: 'text-green-600 dark:text-green-400',
        text: `Great news! You're already saving money - your costs are lower than both ${region} (£${regionalAverage.toFixed(2)}/day) and UK (£${nationalAverage.toFixed(2)}/day) averages.`,
      });
    } else if (!isBelowRegional) {
      insights.push({
        icon: TrendingUp,
        color: 'text-orange-600 dark:text-orange-400',
        text: `You're spending £${Math.abs(vsRegional).toFixed(2)}/day more than the ${region} average. That's about £${Math.abs(annualSavingsVsRegional).toFixed(0)}/year you could potentially save.`,
      });
    } else {
      insights.push({
        icon: TrendingDown,
        color: 'text-green-600 dark:text-green-400',
        text: `You're doing well compared to ${region} - saving £${Math.abs(vsRegional).toFixed(2)}/day (£${Math.abs(annualSavingsVsRegional).toFixed(0)}/year) versus the regional average.`,
      });
    }

    insights.push({
      icon: MapPin,
      color: 'text-indigo-600 dark:text-indigo-400',
      text: `The UK regional map below shows ${region} has ${regionalAverage > nationalAverage ? 'higher' : 'lower'} costs than the national average. Northern Ireland (£3.88) and London (£4.68) have the biggest price gap.`,
    });

    insights.push({
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400',
      text: `Our smart recommendations analyze your tariff, usage patterns, and market rates to find you the best switching opportunities and efficiency improvements.`,
    });

    insights.push({
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      text: `Keep your data updated and check back regularly - we track wholesale prices, weather patterns, and new tariffs to help you save throughout the year.`,
    });
  } else {
    // No user data - overview of dashboard features
    insights.push({
      icon: Sparkles,
      color: 'text-blue-600 dark:text-blue-400',
      text: `This dashboard shows energy costs across the UK. ${region} averages £${regionalAverage.toFixed(2)}/day (£${(regionalAverage * 365).toFixed(0)}/year) while the UK average is £${nationalAverage.toFixed(2)}/day.`,
    });
    
    insights.push({
      icon: MapPin,
      color: 'text-indigo-600 dark:text-indigo-400',
      text: `The regional map below reveals big differences - Northern Ireland has the lowest costs (£3.88/day) while London is the most expensive (£4.68/day).`,
    });
    
    insights.push({
      icon: Lightbulb,
      color: 'text-amber-600 dark:text-amber-400',
      text: `We analyze wholesale prices, tariff durations, standing charges, and weather impacts to identify the best times to switch and ways to reduce usage.`,
    });
    
    insights.push({
      icon: TrendingDown,
      color: 'text-green-600 dark:text-green-400',
      text: `Add your details to unlock personalized recommendations - see exactly how much you could save by switching tariffs or improving efficiency.`,
    });

    insights.push({
      icon: Sparkles,
      color: 'text-purple-600 dark:text-purple-400',
      text: `Get forecasts for demand spikes, price cap changes, and seasonal patterns tailored to your usage. Track your actual savings over time!`,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="shadow-lg border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {hasUserData ? 'Your Energy Summary' : 'Quick Overview'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasUserData ? 'Based on your data' : 'Regional insights'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight.text}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {hasUserData && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                💡 Tip: Keep updating your data to get the most accurate insights and savings recommendations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
