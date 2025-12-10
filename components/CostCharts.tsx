/**
 * SIMPLE COST CHARTS
 * 
 * Easy-to-understand visualizations for everyday users
 * Shows patterns, comparisons, and trends clearly
 * 
 * @module components/CostCharts
 */

'use client';

import { useMemo } from 'react';

// ============================================
// TEMPERATURE VS COST CHART
// ============================================

interface TempCostPoint {
  temp: number;
  cost: number;
  day: string;
}

export function TemperatureCostChart({ data }: { data: TempCostPoint[] }) {
  const maxCost = Math.max(...data.map(d => d.cost));
  const minTemp = Math.min(...data.map(d => d.temp));
  const maxTemp = Math.max(...data.map(d => d.temp));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        🌡️ Temperature vs Energy Cost
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        See how temperature affects your heating bill
      </p>

      <div className="space-y-3">
        {data.map((point, i) => {
          const costPercent = (point.cost / maxCost) * 100;
          const tempColor = point.temp < 10 ? 'bg-blue-500' : point.temp < 15 ? 'bg-green-500' : 'bg-amber-500';
          
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{point.day}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400">{point.temp}°C</span>
                  <span className="font-semibold text-gray-900 dark:text-white">£{point.cost.toFixed(2)}</span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${tempColor} transition-all duration-500`}
                  style={{ width: `${costPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-900 dark:text-blue-300">
          <span className="font-semibold">💡 Insight:</span> Colder days = higher heating costs. 
          Keep your home at 18-19°C to stay comfortable while saving money!
        </p>
      </div>
    </div>
  );
}

// ============================================
// COST COMPARISON BAR
// ============================================

interface CostComparisonProps {
  yourCost: number;
  ukAverage: number;
  regionAverage: number;
  homeType: string;
}

export function CostComparisonBar({ yourCost, ukAverage, regionAverage, homeType }: CostComparisonProps) {
  const maxValue = Math.max(yourCost, ukAverage, regionAverage) * 1.1;
  
  const getColor = (cost: number) => {
    if (cost < 3.50) return 'bg-green-500';
    if (cost < 4.50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLabel = (cost: number) => {
    if (cost < 3.50) return '🌟 Excellent';
    if (cost < 4.50) return '👍 Good';
    return '⚠️ High';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 How You Compare
      </h3>
      
      <div className="space-y-6">
        {/* Your Cost */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Your Daily Cost
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              £{yourCost.toFixed(2)}
            </span>
          </div>
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div 
              className={`h-full ${getColor(yourCost)} flex items-center justify-end pr-3 transition-all duration-500`}
              style={{ width: `${(yourCost / maxValue) * 100}%` }}
            >
              <span className="text-xs font-semibold text-white">{getLabel(yourCost)}</span>
            </div>
          </div>
        </div>

        {/* UK Average */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              UK Average
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              £{ukAverage.toFixed(2)}
            </span>
          </div>
          <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-500"
              style={{ width: `${(ukAverage / maxValue) * 100}%` }}
            />
          </div>
        </div>

        {/* Region Average */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Your Area Average
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              £{regionAverage.toFixed(2)}
            </span>
          </div>
          <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div 
              className="h-full bg-gray-400 dark:bg-gray-500 transition-all duration-500"
              style={{ width: `${(regionAverage / maxValue) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Savings Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
        {yourCost < ukAverage ? (
          <div>
            <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
              🎉 You're saving £{((ukAverage - yourCost) * 365).toFixed(0)}/year vs UK average!
            </p>
            <p className="text-xs text-green-800 dark:text-green-400">
              That's {Math.round(((ukAverage - yourCost) / ukAverage) * 100)}% less than average. Great job!
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
              💰 You could save £{((yourCost - ukAverage) * 365).toFixed(0)}/year
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-400">
              Let's get your costs down to the UK average! Check our tips below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// WEEKLY COST TREND
// ============================================

interface WeeklyCostData {
  day: string;
  cost: number;
  temp: number;
}

export function WeeklyCostTrend({ data }: { data: WeeklyCostData[] }) {
  const avgCost = data.reduce((sum, d) => sum + d.cost, 0) / data.length;
  const maxCost = Math.max(...data.map(d => d.cost));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📈 Your Week at a Glance
      </h3>

      <div className="flex items-end justify-between gap-2 h-48 mb-4">
        {data.map((day, i) => {
          const heightPercent = (day.cost / maxCost) * 100;
          const isAboveAvg = day.cost > avgCost;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                £{day.cost.toFixed(2)}
              </div>
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 ${
                  isAboveAvg ? 'bg-red-400' : 'bg-green-400'
                }`}
                style={{ height: `${heightPercent}%` }}
                title={`${day.day}: £${day.cost.toFixed(2)} (${day.temp}°C)`}
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {day.day.substring(0, 3)}
              </div>
              <div className="text-xs text-gray-500">
                {day.temp}°C
              </div>
            </div>
          );
        })}
      </div>

      {/* Average Line Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span>Below average</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-400" />
          <span>Above average</span>
        </div>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Average:</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">£{avgCost.toFixed(2)}/day</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Weekly Total:</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            £{(avgCost * 7).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ENERGY EFFICIENCY GAUGE
// ============================================

export function EfficiencyGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getMessage = () => {
    if (score >= 80) return '🌟 Excellent! Your home is very efficient!';
    if (score >= 60) return '👍 Good! Room for small improvements.';
    return '💡 Big savings opportunity! Let\'s improve this!';
  };

  const rotation = (score / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
        ⚡ Your Efficiency Score
      </h3>

      {/* Gauge Visual */}
      <div className="relative w-48 h-24 mx-auto mb-4">
        {/* Background Arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Red section (0-40) */}
          <path
            d="M 20 90 A 80 80 0 0 1 67 32"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            opacity="0.5"
          />
          {/* Amber section (40-70) */}
          <path
            d="M 67 32 A 80 80 0 0 1 133 32"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="20"
            opacity="0.5"
          />
          {/* Green section (70-100) */}
          <path
            d="M 133 32 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            opacity="0.5"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={`${getColor()} transition-transform duration-1000`}
            style={{ transformOrigin: '100px 90px', transform: `rotate(${rotation}deg)` }}
          />
          <circle cx="100" cy="90" r="8" className={`${getColor()} fill-current`} />
        </svg>
      </div>

      {/* Score Display */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${getColor()}`}>
          {score}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          out of 100
        </div>
      </div>

      {/* Message */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-center text-gray-700 dark:text-gray-300">
          {getMessage()}
        </p>
      </div>

      {/* Progress Indicators */}
      <div className="mt-4 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>❌ Poor</span>
        <span>👍 Good</span>
        <span>⭐ Excellent</span>
      </div>
    </div>
  );
}

// ============================================
// SIMPLE SAVINGS CALCULATOR
// ============================================

export function SavingsCalculator({ 
  currentDailyCost,
  targetDailyCost 
}: { 
  currentDailyCost: number;
  targetDailyCost: number;
}) {
  const dailySavings = currentDailyCost - targetDailyCost;
  const weeklySavings = dailySavings * 7;
  const monthlySavings = dailySavings * 30;
  const yearlySavings = dailySavings * 365;

  const equivalents = [
    { amount: 4, item: '☕ coffees' },
    { amount: 15, item: '🎬 cinema tickets' },
    { amount: 50, item: '🍕 pizzas' },
    { amount: 100, item: '📱 months of streaming' },
    { amount: 300, item: '✈️ short holidays' },
  ];

  const bestEquivalent = equivalents.find(e => yearlySavings >= e.amount) || equivalents[0];
  const equivalentCount = Math.floor(yearlySavings / bestEquivalent.amount);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
      <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4 text-center">
        💰 Your Potential Savings
      </h3>

      {dailySavings > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{dailySavings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">per day</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{weeklySavings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">per week</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{monthlySavings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">per month</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{yearlySavings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">per year</div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              That's enough for <span className="font-bold text-green-600 dark:text-green-400">{equivalentCount} {bestEquivalent.item}</span> a year!
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-green-900 dark:text-green-300 font-semibold mb-2">
            🌟 You're already at a great cost level!
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Keep up the good work maintaining your energy efficiency!
          </p>
        </div>
      )}
    </div>
  );
}
