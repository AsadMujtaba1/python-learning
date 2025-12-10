/**
 * STANDING CHARGE COMPARISON CHART
 * 
 * Compares standing charges across different suppliers and regions.
 * Helps users identify if they're paying too much in fixed daily fees.
 * 
 * @module components/charts/StandingChargeComparisonChart
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { StandingCharge } from '@/hooks/useBenchmarkData';

interface StandingChargeComparisonProps {
  data?: StandingCharge[];
  userData?: { currentSupplier?: string; electricityCharge?: number; gasCharge?: number }; // User's current charges
  className?: string;
}

// Placeholder data - will be replaced with real data via props
const PLACEHOLDER_DATA: StandingCharge[] = [
  { supplier: 'Your Current', electricity: 0.525, gas: 0.287, isCurrent: true },
  { supplier: 'Octopus Energy', electricity: 0.382, gas: 0.241 },
  { supplier: 'British Gas', electricity: 0.458, gas: 0.275 },
  { supplier: 'EDF Energy', electricity: 0.415, gas: 0.253 },
  { supplier: 'E.ON', electricity: 0.489, gas: 0.289 },
  { supplier: 'OVO Energy', electricity: 0.397, gas: 0.248 },
  { supplier: 'Regional Avg', electricity: 0.443, gas: 0.275 },
];

const DUAL_FUEL_DATA = [
  { type: 'Electricity', yourCharge: 52.5, average: 44.3, bestAvailable: 38.2 },
  { type: 'Gas', yourCharge: 28.7, average: 27.5, bestAvailable: 24.1 },
];

export default function StandingChargeComparisonChart({
  data: propData,
  userData,
  className = '',
}: StandingChargeComparisonProps) {
  const data = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Use actual user data if provided
  const actualUserCharge = userData?.electricityCharge || data.find(d => d.isCurrent)?.electricity || data[0].electricity;
  
  // Convert data for chart display (pounds to pence)
  const chartData = data.map(item => ({
    supplier: item.supplier,
    charge: (item.electricity * 100),
    highlight: userData ? (item.supplier === userData.currentSupplier || item.isCurrent) : item.isCurrent || false
  }));
  
  const yourCharge = actualUserCharge * 100; // Convert to pence
  const bestCharge = Math.min(...chartData.filter(d => !d.highlight).map(d => d.charge));
  const regionalAvgCharge = chartData.find(d => d.supplier.includes('Regional'))?.charge || chartData[1].charge;
  const annualSavings = ((yourCharge - bestCharge) / 100) * 365;
  const vsRegionalPercent = ((yourCharge - regionalAvgCharge) / regionalAvgCharge * 100).toFixed(0);

  const getBarColor = (entry: any) => {
    if (entry.highlight) return '#ef4444'; // Red for current
    if (entry.charge < 40) return '#10b981'; // Green for best deals
    return '#6b7280'; // Gray for others
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Standing Charge Comparison
            </CardTitle>
            <CardDescription>Daily fixed charges by supplier</CardDescription>
          </div>
          {annualSavings > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Saving</p>
              <p className="text-2xl font-bold text-green-600">£{annualSavings.toFixed(0)}</p>
              <p className="text-xs text-gray-500">per year</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Comparison */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Daily Standing Charge (pence)
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="supplier" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Pence/day', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)}p/day`, '']}
              />
              <Bar dataKey="charge" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
                <LabelList dataKey="charge" position="top" formatter={(value: any) => `${Number(value).toFixed(1)}p`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Dual Fuel Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Dual Fuel Breakdown
          </h4>
          <div className="space-y-3">
            {DUAL_FUEL_DATA.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{item.type}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.yourCharge > item.bestAvailable ? '⚠️ Overpaying' : '✓ Good rate'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">You</p>
                    <p className="font-bold text-red-600">{item.yourCharge}p</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Average</p>
                    <p className="font-bold">{item.average}p</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Best</p>
                    <p className="font-bold text-green-600">{item.bestAvailable}p</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Comparison */}
        {userData && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
              📊 Your Standing Charge Analysis
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">vs Regional Avg:</span>
                <span className={`ml-1 font-bold ${parseFloat(vsRegionalPercent) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(vsRegionalPercent) < 0 ? `${Math.abs(parseFloat(vsRegionalPercent))}% better` : `${vsRegionalPercent}% higher`}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">vs Best Rate:</span>
                <span className="ml-1 font-bold text-orange-600">
                  {((yourCharge - bestCharge) / bestCharge * 100).toFixed(0)}% higher
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                You're paying {((yourCharge - bestCharge) / bestCharge * 100).toFixed(0)}% more than the best available rate
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Switching could save you £{annualSavings.toFixed(0)}/year on standing charges alone.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
