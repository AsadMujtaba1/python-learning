/**
 * WEATHER IMPACT CHART
 * 
 * Shows correlation between weather conditions and energy costs.
 * Helps users understand temperature-driven usage patterns.
 * 
 * @module components/charts/WeatherImpactChart
 */

'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, Sun, Snowflake } from 'lucide-react';
import { WeatherForecast } from '@/hooks/useBenchmarkData';

interface WeatherImpactProps {
  data?: WeatherForecast[];
  userData?: { actualCosts?: { date: string; cost: number }[] }; // User's actual daily costs
  className?: string;
}

// Placeholder data - will be replaced with real data via props
const PLACEHOLDER_DATA: WeatherForecast[] = [
  { date: 'Mon', temperature: 8, estimatedCost: 4.20, usage: 28 },
  { date: 'Tue', temperature: 10, estimatedCost: 3.85, usage: 25 },
  { date: 'Wed', temperature: 12, estimatedCost: 3.50, usage: 22 },
  { date: 'Thu', temperature: 9, estimatedCost: 4.10, usage: 27 },
  { date: 'Fri', temperature: 7, estimatedCost: 4.50, usage: 30 },
  { date: 'Sat', temperature: 6, estimatedCost: 4.85, usage: 32 },
  { date: 'Sun', temperature: 11, estimatedCost: 3.70, usage: 24 },
];

const TEMPERATURE_BANDS = [
  { range: 'Below 5°C', avgCost: 5.20, impact: 'Very High', color: 'bg-red-500' },
  { range: '5-10°C', avgCost: 4.10, impact: 'High', color: 'bg-orange-500' },
  { range: '10-15°C', avgCost: 3.20, impact: 'Moderate', color: 'bg-yellow-500' },
  { range: '15-20°C', avgCost: 2.50, impact: 'Low', color: 'bg-green-500' },
  { range: 'Above 20°C', avgCost: 2.10, impact: 'Very Low', color: 'bg-blue-500' },
];

export default function WeatherImpactChart({
  data: propData,
  className = '',
}: WeatherImpactProps) {
  const data = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Convert data for chart display
  const chartData = data.map(item => ({
    day: item.date,
    temp: item.temperature,
    cost: item.estimatedCost,
    usage: item.usage
  }));
  
  const currentTemp = chartData[0]?.temp || 10;
  const avgCost = chartData.reduce((sum, d) => sum + d.cost, 0) / chartData.length;
  
  const getWeatherIcon = () => {
    if (currentTemp < 8) return <Snowflake className="w-5 h-5 text-blue-600" />;
    if (currentTemp > 15) return <Sun className="w-5 h-5 text-yellow-600" />;
    return <CloudRain className="w-5 h-5 text-gray-600" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getWeatherIcon()}
              Weather Impact
            </CardTitle>
            <CardDescription>Temperature vs Energy Cost</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentTemp}°C</p>
            <p className="text-xs text-gray-500">Current</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            7-Day Temperature & Cost Correlation
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Cost (£)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'cost') return [`£${value}`, 'Cost'];
                  if (name === 'temp') return [`${value}°C`, 'Temperature'];
                  if (name === 'usage') return [`${value} kWh`, 'Usage'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Daily Cost" />
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="temp" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#colorTemp)"
                name="Temperature"
              />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="usage" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Usage (kWh)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Temperature Impact Bands */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Cost by Temperature Range
          </h4>
          <div className="space-y-2">
            {TEMPERATURE_BANDS.map((band, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${band.color}`} />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{band.range}</span>
                  <span className="text-sm font-semibold">£{band.avgCost}</span>
                </div>
                <span className="text-xs text-gray-500 w-20 text-right">{band.impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Coldest Day</p>
            <p className="text-lg font-bold">6°C</p>
            <p className="text-xs text-red-600">£4.85</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Warmest Day</p>
            <p className="text-lg font-bold">12°C</p>
            <p className="text-xs text-green-600">£3.50</p>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Per 1°C Drop</p>
            <p className="text-lg font-bold">+£0.15</p>
            <p className="text-xs text-gray-500">avg cost</p>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm">
            💡 <span className="font-semibold">Tip:</span> When temperature drops below 10°C, your heating costs rise by ~15%. 
            Lower your thermostat by 1°C to save £80/year without losing comfort.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
