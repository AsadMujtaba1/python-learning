/**
 * HOUSEHOLD USAGE BENCHMARK CHART
 * 
 * Compares user's energy usage against regional and national averages.
 * Helps users understand their consumption relative to similar households.
 * 
 * @module components/charts/HouseholdUsageBenchmarkChart
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Award } from 'lucide-react';
import { UsageBenchmark } from '@/hooks/useBenchmarkData';

interface HouseholdUsageBenchmarkProps {
  data?: UsageBenchmark[];
  userData?: { actualUsage?: number; breakdown?: { [key: string]: number } }; // User's actual usage data
  className?: string;
}

// Placeholder data - used as fallback if no data provided
const PLACEHOLDER_DATA: UsageBenchmark[] = [
  { category: 'Your Home', userValue: 285, regionalAvg: 320, nationalAvg: 342, similarHomes: 295 },
  { category: 'Heating', userValue: 145, regionalAvg: 165, nationalAvg: 175, similarHomes: 150 },
  { category: 'Hot Water', userValue: 48, regionalAvg: 55, nationalAvg: 62, similarHomes: 52 },
  { category: 'Lighting', userValue: 35, regionalAvg: 42, nationalAvg: 48, similarHomes: 38 },
  { category: 'Appliances', userValue: 57, regionalAvg: 65, nationalAvg: 72, similarHomes: 60 },
];

export default function HouseholdUsageBenchmarkChart({
  data: propData,
  userData,
  className = '',
}: HouseholdUsageBenchmarkProps) {
  // Use provided data or fallback to placeholder
  const benchmarkData = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  const mainComparison = benchmarkData[0]; // First item is the overall comparison
  const breakdownData = benchmarkData.slice(1); // Rest are breakdowns
  
  // Use actual user data if provided, otherwise use benchmark's userValue
  const actualUserUsage = userData?.actualUsage || mainComparison.userValue;
  
  const data = [
    { category: 'Your Home', usage: actualUserUsage, color: '#10b981' }, // Green for user
    { category: 'Regional Avg', usage: mainComparison.regionalAvg, color: '#8b5cf6' },
    { category: 'National Avg', usage: mainComparison.nationalAvg, color: '#6b7280' },
    { category: 'Similar Homes', usage: mainComparison.similarHomes, color: '#3b82f6' },
  ];
  
  const BREAKDOWN_DATA = breakdownData.map(b => ({
    appliance: b.category,
    you: userData?.breakdown?.[b.category] || b.userValue,
    average: b.nationalAvg,
  }));
  
  const yourUsage = actualUserUsage;
  const nationalAverage = mainComparison.nationalAvg;
  const regionalAverage = mainComparison.regionalAvg;
  const savingsPercent = Math.round(((nationalAverage - yourUsage) / nationalAverage) * 100);
  const vsRegionalPercent = Math.round(((regionalAverage - yourUsage) / regionalAverage) * 100);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Usage Benchmark
            </CardTitle>
            <CardDescription>How you compare to others</CardDescription>
          </div>
          {savingsPercent > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                {savingsPercent}% better
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Comparison */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Monthly Usage (kWh)
          </h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="category" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(0)} kWh`, '']}
              />
              <Bar dataKey="usage" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown Comparison */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Usage by Category
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={BREAKDOWN_DATA} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis type="number" stroke="currentColor" opacity={0.5} tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="appliance" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(0)} kWh`, '']}
              />
              <Legend />
              <Bar dataKey="you" fill="#10b981" radius={[0, 4, 4, 0]} name="You" />
              <Bar dataKey="average" fill="#9ca3af" radius={[0, 4, 4, 0]} name="National Avg" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Insights */}
        {userData && (
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
              📊 Your Usage Comparison
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">vs National:</span>
                <span className={`ml-1 font-bold ${savingsPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {savingsPercent > 0 ? `${savingsPercent}% better` : `${Math.abs(savingsPercent)}% worse`}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">vs Regional:</span>
                <span className={`ml-1 font-bold ${vsRegionalPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {vsRegionalPercent > 0 ? `${vsRegionalPercent}% better` : `${Math.abs(vsRegionalPercent)}% worse`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Position</p>
            <p className="text-lg font-bold text-blue-600">Top 25%</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Annual Saving</p>
            <p className="text-lg font-bold text-green-600">£{Math.round((nationalAverage - yourUsage) * 12 * 0.25)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
