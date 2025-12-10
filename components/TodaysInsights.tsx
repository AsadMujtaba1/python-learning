/**
 * TODAY'S INSIGHTS WIDGET
 * 
 * Shows helpful, actionable information for the current day
 * Uses free APIs and public data
 * 
 * @module components/TodaysInsights
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  FreeWeatherService, 
  UKCostBenchmarks, 
  SmartTipsGenerator,
  DailyInsightsGenerator,
  type WeatherData,
  type CostComparison,
  type EnergyTip,
  type DailyInsight
} from '@/lib/freeDataSources';

interface TodaysInsightsProps {
  postcode: string;
  dailyCost: number;
  homeType: string;
}

export default function TodaysInsights({ postcode, dailyCost, homeType }: TodaysInsightsProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [costComparison, setCostComparison] = useState<CostComparison | null>(null);
  const [tips, setTips] = useState<EnergyTip[]>([]);
  const [insights, setInsights] = useState<DailyInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [postcode, dailyCost]);

  const loadInsights = async () => {
    try {
      // Get weather
      const weatherData = await FreeWeatherService.getWeather(postcode);
      setWeather(weatherData.current);

      // Get cost comparison
      const comparison = UKCostBenchmarks.getCostComparison(dailyCost);
      setCostComparison(comparison);

      // Generate tips
      const todaysTips = SmartTipsGenerator.getTipsForToday(
        weatherData.current,
        dailyCost,
        homeType
      );
      setTips(todaysTips);

      // Generate insights
      const todaysInsights = DailyInsightsGenerator.generateInsights(
        weatherData.current,
        comparison,
        { postcode, dailyCost, homeType }
      );
      setInsights(todaysInsights);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load insights:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const getBgColor = (color: string) => {
    const colors = {
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">☀️ Today's Insights</h2>
        <p className="text-blue-100 text-sm">
          {new Date().toLocaleDateString('en-GB', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Weather Card */}
      {weather && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Right Now
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weather.condition}
              </p>
            </div>
            <div className="text-5xl">{weather.icon}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌡️</span>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather.temperature}°C
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Feels like {weather.feelsLike}°C
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💨</span>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weather.windSpeed} mph
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Wind speed
                </div>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${getBgColor('blue')}`}>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-semibold">💡 Heating Tip:</span> {weather.advice}
            </p>
          </div>
        </div>
      )}

      {/* Cost Status */}
      {costComparison && (
        <div className={`rounded-lg p-6 border ${getBgColor(
          costComparison.percentile < 50 ? 'green' : costComparison.percentile < 75 ? 'amber' : 'red'
        )}`}>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
            📊 Your Cost Status
          </h3>
          <p className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            £{costComparison.yourCost.toFixed(2)}/day
          </p>
          <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">
            {costComparison.message}
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">UK Average: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                £{costComparison.ukAverage.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Your Area: </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                £{costComparison.regionAverage.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Insights */}
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div 
            key={i}
            className={`rounded-lg p-4 border ${getBgColor(insight.color)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {insight.message}
                </p>
                {insight.actionable && (
                  <button className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {insight.actionable.text} →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Tips for Today */}
      {tips.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            💡 Top Tips for Today
          </h3>
          <div className="space-y-3">
            {tips.slice(0, 3).map((tip, i) => (
              <div 
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {tip.title}
                    </h4>
                    <span className="text-green-600 dark:text-green-400 font-bold text-xs whitespace-nowrap">
                      {tip.savings}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {tip.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tip.effort === 'easy' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : tip.effort === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {tip.effort === 'easy' ? '⚡ Easy' : tip.effort === 'medium' ? '⏰ Takes time' : '🎯 One-time'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={() => {
          setLoading(true);
          loadInsights();
        }}
        className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
      >
        🔄 Refresh Insights
      </button>
    </div>
  );
}
