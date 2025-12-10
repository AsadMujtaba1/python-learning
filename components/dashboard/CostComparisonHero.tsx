/**
 * CostComparisonHero Component
 * 
 * Large hero section showing user's daily cost with immediate comparison
 * to regional and national averages. Clear, actionable, user-friendly.
 * 
 * @module components/dashboard/CostComparisonHero
 */

'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import DataSourceBadge from './DataSourceBadge';
import { Card } from '@/components/ui/card';

interface CostComparisonHeroProps {
  userCost: number;
  regionalAverage: number;
  nationalAverage: number;
  postcode?: string;
  region?: string;
  loading?: boolean;
}

export default function CostComparisonHero({
  userCost,
  regionalAverage,
  nationalAverage,
  postcode,
  region,
  loading = false,
}: CostComparisonHeroProps) {
  // Calculate savings/overspending
  const vsRegional = regionalAverage - userCost;
  const vsNational = nationalAverage - userCost;
  const annualSavings = vsRegional * 365;

  // Determine status
  const isSaving = vsRegional > 0;
  const savingsMessage = isSaving
    ? `You're saving £${Math.abs(Math.round(annualSavings))}/year vs your region!`
    : `You could save £${Math.abs(Math.round(annualSavings))}/year vs your region.`;

  if (loading) {
    return (
      <Card className="p-8 animate-pulse">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 rounded-2xl p-8 shadow-2xl"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-lg font-semibold mb-1">Your Daily Energy Cost</h2>
            {postcode && (
              <p className="text-blue-100 text-sm">
                {postcode} {region && `• ${region}`}
              </p>
            )}
          </div>
          <DataSourceBadge source="user" size="md" className="shadow-lg" />
        </div>

        {/* Main Cost Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-bold text-white">£{userCost.toFixed(2)}</span>
            <span className="text-2xl text-blue-100">/day</span>
          </div>
        </div>

        {/* Status Message */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
            isSaving
              ? 'bg-green-500/20 text-green-100 border border-green-400/30'
              : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
          }`}
        >
          {isSaving ? (
            <TrendingDown className="w-5 h-5" />
          ) : (
            <TrendingUp className="w-5 h-5" />
          )}
          <span className="font-semibold">{savingsMessage}</span>
        </div>

        {/* Comparison Bars */}
        <div className="space-y-4">
          {/* Your Cost */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">You</span>
              <span className="text-sm font-bold text-white">£{userCost.toFixed(2)}</span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userCost / nationalAverage) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              />
            </div>
          </div>

          {/* Regional Average */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-100">Regional Average</span>
                <DataSourceBadge source="regional" size="sm" />
              </div>
              <span className="text-sm font-semibold text-blue-100">£{regionalAverage.toFixed(2)}</span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(regionalAverage / nationalAverage) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute h-full bg-gradient-to-r from-blue-300 to-blue-400 rounded-full opacity-70"
              />
            </div>
          </div>

          {/* National Average */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-100">UK Average</span>
                <DataSourceBadge source="national" size="sm" />
              </div>
              <span className="text-sm font-semibold text-blue-100">£{nationalAverage.toFixed(2)}</span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Monthly Projection */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-blue-100 text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold text-white">£{(userCost * 30).toFixed(0)}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">Annual Estimate</p>
              <p className="text-2xl font-bold text-white">£{(userCost * 365).toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
