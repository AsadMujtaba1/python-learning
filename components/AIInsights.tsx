/**
 * AI INSIGHTS MODULE
 * 
 * Generate AI-powered insights for user energy consumption
 * Premium feature only
 * 
 * @module components/AIInsights
 */

'use client';

import { useState, useEffect } from 'react';
import { UserProfile, isPremiumActive } from '@/lib/userProfile';
import { CostTracker } from '@/lib/smartStorage';
import FeatureGate from './FeatureGate';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface AIInsightsProps {
  profile: UserProfile | null;
  postcode: string;
  homeType: string;
  occupants: number;
  dailyCost: number;
}

interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'saving' | 'efficiency' | 'alert' | 'tip';
  potentialSavings?: number;
}

export default function AIInsights({ profile, postcode, homeType, occupants, dailyCost }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile && isPremiumActive(profile)) {
      generateInsights();
    }
  }, [profile, dailyCost]);

  const generateInsights = async () => {
    setLoading(true);
    setError('');

    try {
      // In production, this would call your AI service (OpenAI, etc.)
      // For now, generating rule-based insights
      const generatedInsights = analyzeUserData({
        postcode,
        homeType,
        occupants,
        dailyCost,
        history: CostTracker.getRecentCosts(30),
      });

      setInsights(generatedInsights);
    } catch (err) {
      setError('Failed to generate insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FeatureGate featureId="ai_insights" profile={profile}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🤖</span> AI-Powered Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Personalized recommendations based on your usage patterns
            </p>
          </div>
          <Button
            onClick={generateInsights}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? '🔄 Analyzing...' : '🔄 Refresh'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p>No insights available yet. Check back after tracking more data.</p>
              </div>
            ) : (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            )}
          </div>
        )}
      </div>
    </FeatureGate>
  );
}

/**
 * Individual Insight Card
 */
function InsightCard({ insight }: { insight: Insight }) {
  const priorityColors = {
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    low: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🔵',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${priorityColors[insight.priority]}`}>
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{insight.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white">{insight.title}</h4>
            <span className="text-sm">{priorityIcons[insight.priority]}</span>
            {insight.potentialSavings && (
              <span className="ml-auto text-sm font-semibold text-green-600 dark:text-green-400">
                Save £{insight.potentialSavings}/year
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Analyze user data and generate insights
 * In production, this would call an AI API
 */
function analyzeUserData(data: {
  postcode: string;
  homeType: string;
  occupants: number;
  dailyCost: number;
  history: Array<{ date: string; cost: number }>;
}): Insight[] {
  const insights: Insight[] = [];

  // High usage detection
  const avgCost = data.history.reduce((sum, item) => sum + item.cost, 0) / data.history.length;
  if (avgCost > 5) {
    insights.push({
      id: 'high-usage',
      icon: '⚠️',
      title: 'High Energy Usage Detected',
      description: 'Your daily costs are above the UK average. Consider reviewing your heating settings and switching off appliances when not in use.',
      priority: 'high',
      category: 'alert',
      potentialSavings: 250,
    });
  }

  // Weekend vs weekday pattern
  const recentCosts = data.history.slice(0, 7);
  if (recentCosts.length >= 7) {
    const weekdayAvg = (recentCosts[0].cost + recentCosts[1].cost + recentCosts[2].cost + recentCosts[3].cost + recentCosts[4].cost) / 5;
    const weekendAvg = (recentCosts[5].cost + recentCosts[6].cost) / 2;

    if (weekendAvg > weekdayAvg * 1.3) {
      insights.push({
        id: 'weekend-spike',
        icon: '📅',
        title: 'Weekend Usage Spike',
        description: 'Your energy costs are 30% higher on weekends. Try using delayed start on appliances during off-peak hours.',
        priority: 'medium',
        category: 'efficiency',
        potentialSavings: 120,
      });
    }
  }

  // Seasonal advice
  const month = new Date().getMonth();
  if (month >= 10 || month <= 2) { // Winter months
    insights.push({
      id: 'winter-heating',
      icon: '🥶',
      title: 'Winter Heating Optimization',
      description: 'Lower your thermostat by 1°C to save around 10% on heating costs. Wear warmer clothing indoors and use draft excluders.',
      priority: 'high',
      category: 'saving',
      potentialSavings: 180,
    });
  } else if (month >= 6 && month <= 8) { // Summer months
    insights.push({
      id: 'summer-cooling',
      icon: '☀️',
      title: 'Summer Energy Savings',
      description: 'Use fans instead of air conditioning when possible. Open windows in the evening to cool your home naturally.',
      priority: 'low',
      category: 'tip',
      potentialSavings: 50,
    });
  }

  // Smart meter recommendation
  insights.push({
    id: 'smart-meter',
    icon: '📱',
    title: 'Get a Smart Meter',
    description: 'Smart meters provide real-time energy usage data, helping you identify and reduce wastage. They\'re free from your energy supplier.',
    priority: 'medium',
    category: 'tip',
    potentialSavings: 75,
  });

  // Tariff comparison
  insights.push({
    id: 'tariff-switch',
    icon: '💷',
    title: 'Compare Energy Tariffs',
    description: 'UK households save an average of £300/year by switching energy suppliers. Compare tariffs to find better deals.',
    priority: 'high',
    category: 'saving',
    potentialSavings: 300,
  });

  // Appliance-specific tips
  if (data.occupants >= 3) {
    insights.push({
      id: 'appliance-efficiency',
      icon: '🔌',
      title: 'Optimize Large Appliances',
      description: 'Run dishwasher and washing machine only when full. Use eco modes and wash clothes at 30°C to reduce energy consumption.',
      priority: 'medium',
      category: 'efficiency',
      potentialSavings: 90,
    });
  }

  // LED bulbs recommendation
  insights.push({
    id: 'led-bulbs',
    icon: '💡',
    title: 'Switch to LED Bulbs',
    description: 'LED bulbs use 75% less energy than traditional bulbs and last 25x longer. Replace your most-used lights first.',
    priority: 'low',
    category: 'tip',
    potentialSavings: 40,
  });

  // Standby power
  insights.push({
    id: 'standby-power',
    icon: '🔋',
    title: 'Eliminate Standby Power Waste',
    description: 'Devices on standby can cost £30-50/year. Use smart plugs or power strips to completely turn off devices when not in use.',
    priority: 'medium',
    category: 'efficiency',
    potentialSavings: 45,
  });

  // Sort by priority
  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
