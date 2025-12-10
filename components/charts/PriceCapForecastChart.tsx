/**
 * PRICE CAP FORECAST CHART
 * 
 * Tracks and forecasts Ofgem's energy price cap changes.
 * Helps users understand regulatory price movements and plan tariff decisions.
 * 
 * @module components/charts/PriceCapForecastChart
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { PriceCapForecast } from '@/hooks/useBenchmarkData';

interface PriceCapForecastProps {
  data?: PriceCapForecast[];
  userData?: { tariffType?: 'fixed' | 'variable'; fixedUntil?: string }; // User's tariff strategy
  className?: string;
}

// Placeholder data - will be replaced with real data via props
const PLACEHOLDER_DATA: PriceCapForecast[] = [
  { quarter: 'Q1 2024', cap: 1928, actual: true },
  { quarter: 'Q2 2024', cap: 1690, actual: true },
  { quarter: 'Q3 2024', cap: 1568, actual: true },
  { quarter: 'Q4 2024', cap: 1717, actual: true },
  { quarter: 'Q1 2025', cap: 1842, actual: false },
  { quarter: 'Q2 2025', cap: 1795, actual: false },
  { quarter: 'Q3 2025', cap: 1650, actual: false },
  { quarter: 'Q4 2025', cap: 1780, actual: false },
];

const RATE_BREAKDOWN = [
  { component: 'Electricity Unit Rate', current: 24.5, forecast: 26.8, change: 9 },
  { component: 'Gas Unit Rate', current: 6.24, forecast: 6.89, change: 10 },
  { component: 'Electricity Standing', current: 52.97, forecast: 55.23, change: 4 },
  { component: 'Gas Standing', current: 29.11, forecast: 30.42, change: 4 },
];

const QUARTERLY_CHANGES = [
  { period: 'Apr - Jun 2025', change: -2.6, status: 'decrease' },
  { period: 'Jul - Sep 2025', change: -8.1, status: 'decrease' },
  { period: 'Oct - Dec 2025', change: +7.9, status: 'increase' },
];

export default function PriceCapForecastChart({
  data: propData,
  className = '',
}: PriceCapForecastProps) {
  const data = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Find current and next quarter
  const actualData = data.filter(d => d.actual);
  const forecastData = data.filter(d => !d.actual);
  
  const currentCap = actualData.length > 0 ? actualData[actualData.length - 1].cap : data[0].cap;
  const forecastCap = forecastData.length > 0 ? forecastData[0].cap : data[data.length - 1].cap;
  const changePercent = ((forecastCap - currentCap) / currentCap * 100).toFixed(1);
  const trend = forecastCap > currentCap ? 'up' : 'down';

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Ofgem Price Cap Forecast
            </CardTitle>
            <CardDescription>Quarterly price cap predictions</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Quarter</p>
            <p className="text-2xl font-bold">£{forecastCap}</p>
            <p className={`text-sm flex items-center gap-1 ${trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trend === 'up' ? '+' : ''}{changePercent}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Trend Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Price Cap History & Forecast (Annual typical usage)
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCapActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCapForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="quarter" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Annual £', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string, props: any) => {
                  const type = props.payload.actual ? 'Actual' : 'Forecast';
                  return [`£${value}`, type];
                }}
              />
              <Legend />
              <ReferenceLine 
                y={currentCap} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
                label={{ value: 'Current Cap', position: 'right', fill: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="cap" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#colorCapActual)"
                name="Price Cap"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Rate Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Rate Component Forecast
          </h4>
          <div className="space-y-2">
            {RATE_BREAKDOWN.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.component}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.change > 0 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                  }`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Current</p>
                    <p className="font-bold">{item.current}{item.component.includes('Unit') ? 'p' : 'p/day'}</p>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Q1 2025</p>
                    <p className="font-bold text-orange-600">{item.forecast}{item.component.includes('Unit') ? 'p' : 'p/day'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quarterly Change Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Upcoming Changes
          </h4>
          <div className="space-y-2">
            {QUARTERLY_CHANGES.map((quarter, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  quarter.status === 'decrease'
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    quarter.status === 'decrease' 
                      ? 'bg-green-100 dark:bg-green-900/50'
                      : 'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    {quarter.status === 'decrease' ? (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {quarter.period}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {quarter.status === 'decrease' ? 'Price decrease' : 'Price increase'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    quarter.status === 'decrease' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {quarter.change > 0 ? '+' : ''}{quarter.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                About the Price Cap
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                The Ofgem price cap is updated quarterly (Jan, Apr, Jul, Oct) and sets the maximum suppliers can charge 
                per unit. Fixed tariffs aren't bound by the cap, so shop around when it's falling.
              </p>
            </div>
          </div>
        </div>

        {/* Strategy Recommendation */}
        {trend === 'up' ? (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              💡 Strategy: Fix Your Rate Now
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Prices are forecast to rise. Lock in a fixed tariff before Q1 2025 to avoid the {changePercent}% increase.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              💡 Strategy: Stay on Variable
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Prices are forecast to fall. Avoid fixing now—wait until Q3 2025 when the cap drops to £{data[6]?.cap || '1650'}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
