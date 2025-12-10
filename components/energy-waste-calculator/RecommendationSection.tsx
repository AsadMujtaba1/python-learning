/**
 * RECOMMENDATION SECTION COMPONENT
 * 
 * Product & UX Team Implementation
 * Actionable recommendations based on calculation results
 */

'use client';

import { WasteCalculatorResult } from '@/lib/energyWasteCalculator';

interface RecommendationSectionProps {
  result: WasteCalculatorResult;
}

export default function RecommendationSection({ result }: RecommendationSectionProps) {
  const quickWins = [
    {
      icon: '🌡️',
      title: 'Turn thermostat down 1°C',
      saving: '£80/year',
      effort: 'Takes 10 seconds',
    },
    {
      icon: '💡',
      title: 'Switch to LED bulbs',
      saving: '£35/year per bulb',
      effort: 'One-time change',
    },
    {
      icon: '🔌',
      title: 'Unplug devices on standby',
      saving: '£45/year',
      effort: 'Daily habit',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">💡</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Your Personalized Recommendations
          </h3>
        </div>

        <div className="space-y-4">
          {result.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <span className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 text-xl">
                {idx + 1}
              </span>
              <p className="text-gray-800 dark:text-gray-200 flex-1">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-2">⚡</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Quick Wins You Can Do Today
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {quickWins.map((win, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl mb-2">{win.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                {win.title}
              </h4>
              <p className="text-green-600 dark:text-green-400 font-bold text-sm mb-1">
                {win.saving}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {win.effort}
              </p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          💡 <strong>Combine all three</strong> and save up to £160/year with zero switching!
        </p>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          How You Compare to Average UK Household
        </h3>

        <div className="space-y-4">
          {/* Standing Charge Comparison */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Standing Charge</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {result.standingChargeWaste.percentageOfBill.toFixed(1)}% of bill
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  result.standingChargeWaste.isHigherThanAverage
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(result.standingChargeWaste.percentageOfBill, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Unit Rate Comparison */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Unit Rate vs UK Average</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {result.unitRateWaste.yourRate}p vs {result.unitRateWaste.typicalRate}p
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
              <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-400 dark:bg-gray-500"></div>
              <div
                className={`h-full rounded-full ${
                  result.unitRateWaste.isHigherThanAverage
                    ? 'bg-red-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min((result.unitRateWaste.yourRate / result.unitRateWaste.typicalRate) * 50, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Middle line = UK average
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
