/**
 * DEMAND SPIKE FORECAST CHART
 * 
 * Predicts peak demand periods based on historical patterns and weather forecasts.
 * Helps users plan usage to avoid expensive peak times.
 * 
 * @module components/charts/DemandSpikeForecastChart
 */

'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { DemandForecast } from '@/hooks/useBenchmarkData';

interface DemandSpikeForecastProps {
  data?: DemandForecast[];
  userData?: { preferredUsageTimes?: string[] }; // User's typical usage patterns
  className?: string;
}

// Placeholder data - will be replaced with real data via props
const PLACEHOLDER_DATA: DemandForecast[] = [
  { hour: '00:00', demand: 35, price: 18.2, spike: false },
  { hour: '02:00', demand: 30, price: 16.5, spike: false },
  { hour: '04:00', demand: 28, price: 15.8, spike: false },
  { hour: '06:00', demand: 45, price: 22.5, spike: false },
  { hour: '08:00', demand: 75, price: 32.8, spike: true },
  { hour: '10:00', demand: 68, price: 28.4, spike: false },
  { hour: '12:00', demand: 65, price: 26.9, spike: false },
  { hour: '14:00', demand: 62, price: 25.5, spike: false },
  { hour: '16:00', demand: 70, price: 29.2, spike: false },
  { hour: '18:00', demand: 88, price: 38.5, spike: true },
  { hour: '20:00', demand: 82, price: 35.1, spike: true },
  { hour: '22:00', demand: 55, price: 24.2, spike: false },
];

const DAILY_FORECAST = [
  { day: 'Today', peakHour: '18:00', peakDemand: 88, avgPrice: 26.5 },
  { day: 'Tomorrow', peakHour: '18:30', peakDemand: 92, avgPrice: 28.2 },
  { day: 'Wed', peakHour: '17:45', peakDemand: 85, avgPrice: 25.8 },
  { day: 'Thu', peakHour: '18:15', peakDemand: 90, avgPrice: 27.5 },
  { day: 'Fri', peakHour: '19:00', peakDemand: 95, avgPrice: 29.8 },
];

const OPTIMAL_WINDOWS = [
  { period: 'Early Morning', time: '02:00 - 06:00', savings: '35%', icon: '🌙' },
  { period: 'Mid Morning', time: '10:00 - 12:00', savings: '15%', icon: '☀️' },
  { period: 'Late Night', time: '23:00 - 01:00', savings: '25%', icon: '🌃' },
];

export default function DemandSpikeForecastChart({
  data: propData,
  className = '',
}: DemandSpikeForecastProps) {
  const data = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Find next spike
  const nextSpikeItem = data.find(d => d.spike) || data[0];
  const nextSpike = { time: nextSpikeItem.hour, hours: 6 };
  const currentDemand = data[0]?.demand || 45;
  const peakDemand = Math.max(...data.map(d => d.demand));

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Demand Spike Forecast
            </CardTitle>
            <CardDescription>Peak usage predictions for next 24 hours</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Spike</p>
            <p className="text-xl font-bold text-orange-600">{nextSpike.time}</p>
            <p className="text-xs text-gray-500">in {nextSpike.hours}h</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 24-Hour Demand Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Hourly Demand & Price Forecast
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="hour" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                yAxisId="left"
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Demand (%)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Price (p/kWh)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'demand') return [`${value}%`, 'Demand'];
                  if (name === 'price') return [`${value}p/kWh`, 'Price'];
                  return [value, name];
                }}
              />
              <Legend />
              <ReferenceLine 
                yAxisId="left" 
                y={70} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label={{ value: 'High Demand', position: 'right', fill: '#ef4444' }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="demand" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                fill="url(#colorDemand)"
                name="Grid Demand"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="price" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#colorPrice)"
                name="Unit Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Peak Times */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Daily Peak Forecast
          </h4>
          <div className="space-y-2">
            {DAILY_FORECAST.map((day, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  idx === 0 
                    ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {idx === 0 ? '⚠️' : '📅'}
                    </p>
                    <p className="text-sm font-semibold">{day.day}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Peak: {day.peakHour}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {day.peakDemand}% demand • {day.avgPrice}p avg
                    </p>
                  </div>
                </div>
                {day.peakDemand > 90 && (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Usage Windows */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Best Times to Use Energy
          </h4>
          <div className="space-y-2">
            {OPTIMAL_WINDOWS.map((window, idx) => (
              <div 
                key={idx}
                className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3"
              >
                <div className="text-2xl">{window.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {window.period}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {window.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{window.savings}</p>
                  <p className="text-xs text-gray-500">cheaper</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status Banner */}
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          currentDemand > 70 
            ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
        }`}>
          {currentDemand > 70 ? (
            <>
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  High demand period approaching
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Delay heavy usage (washing, charging, heating) for 6 hours to save 30%.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Good time to use energy
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Demand is low. Perfect for running dishwasher, laundry, or charging EVs.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
