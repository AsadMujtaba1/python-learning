/**
 * RESULT CARD COMPONENT
 * 
 * UI Design Team Implementation
 * Display calculation results with visual clarity
 */

'use client';

import { WasteCalculatorResult } from '@/lib/energyWasteCalculator';
import WasteScoreBadge from './WasteScoreBadge';

interface ResultCardProps {
  result: WasteCalculatorResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Result - Hero Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center border-2 border-red-200 dark:border-red-800">
        <div className="inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Energy Waste</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
          £{result.monthlyWaste.toFixed(2)}
          <span className="text-2xl text-gray-600 dark:text-gray-400"> /month</span>
        </h2>
        
        <p className="text-xl text-gray-700 dark:text-gray-300 font-medium">
          That's <span className="text-red-600 dark:text-red-400 font-bold">£{result.annualWaste.toFixed(0)}</span> wasted per year
        </p>

        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="mr-1">💰</span>
            <span>Could save £{result.potentialSavings.realistic}/year</span>
          </div>
        </div>
      </div>

      {/* Waste Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Your Waste Score
        </h3>
        <div className="flex justify-center">
          <WasteScoreBadge score={result.wasteScore} severity={result.severity} />
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Standing Charge Card */}
        <div className={`rounded-xl p-6 border-2 ${
          result.standingChargeWaste.isHigherThanAverage
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
            : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Standing Charge</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fixed daily fee</p>
            </div>
            <span className="text-2xl">
              {result.standingChargeWaste.isHigherThanAverage ? '📊' : '✓'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.standingChargeWaste.yourDailyCost.toFixed(2)}p/day
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">UK average:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.standingChargeWaste.typicalDailyCost.toFixed(2)}p/day
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly cost:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  £{result.standingChargeWaste.monthlyCost.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                That's {result.standingChargeWaste.percentageOfBill.toFixed(1)}% of your bill
              </p>
            </div>
          </div>
        </div>

        {/* Unit Rate Card */}
        <div className={`rounded-xl p-6 border-2 ${
          result.unitRateWaste.isHigherThanAverage
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
            : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Unit Rate</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cost per kWh used</p>
            </div>
            <span className="text-2xl">
              {result.unitRateWaste.isHigherThanAverage ? '⚡' : '✓'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Your rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.unitRateWaste.yourRate}p/kWh
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">UK average:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {result.unitRateWaste.typicalRate}p/kWh
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Est. monthly usage:</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {result.unitRateWaste.estimatedUsage} kWh
                </span>
              </div>
              {result.unitRateWaste.monthlyCostDifference > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Overpaying £{result.unitRateWaste.monthlyCostDifference.toFixed(2)}/month on usage
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Potential Savings Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white text-center">
        <h3 className="text-lg font-bold mb-2">💰 Potential Annual Savings</h3>
        <div className="flex items-center justify-center space-x-6">
          <div>
            <p className="text-sm opacity-90">Realistic Estimate</p>
            <p className="text-3xl font-bold">£{result.potentialSavings.realistic}</p>
          </div>
          <div className="h-12 w-px bg-white opacity-30"></div>
          <div>
            <p className="text-sm opacity-90">Best Case</p>
            <p className="text-3xl font-bold">£{result.potentialSavings.bestCase}</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mt-3">By switching to a competitive tariff</p>
      </div>
    </div>
  );
}
