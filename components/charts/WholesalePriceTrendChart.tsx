/**
 * WHOLESALE PRICE TREND CHART
 * 
 * Visualizes wholesale energy price trends over time.
 * Shows historical and projected prices to help users understand market movements.
 * 
 * @module components/charts/WholesalePriceTrendChart
 */

'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { WholesaleTrendData } from '@/hooks/useBenchmarkData';

interface WholesalePriceTrendProps {
  data?: WholesaleTrendData[];
  userData?: { actualCost?: number; period?: string }[]; // User's actual costs over time
  className?: string;
}

// Placeholder data - used as fallback if no data provided
const PLACEHOLDER_DATA: WholesaleTrendData[] = [
  { period: 'Jan', price: 0.245, forecast: false },
  { period: 'Feb', price: 0.252, forecast: false },
  { period: 'Mar', price: 0.238, forecast: false },
  { period: 'Apr', price: 0.221, forecast: false },
  { period: 'May', price: 0.205, forecast: false },
  { period: 'Jun', price: 0.198, forecast: false },
  { period: 'Jul', price: 0.215, forecast: true },
  { period: 'Aug', price: 0.228, forecast: true },
  { period: 'Sep', price: 0.241, forecast: true },
  { period: 'Oct', price: 0.265, forecast: true },
  { period: 'Nov', price: 0.282, forecast: true },
  { period: 'Dec', price: 0.279, forecast: true },
];

export default function WholesalePriceTrendChart({
  data: propData,
  userData,
  className = '',
}: WholesalePriceTrendProps) {
  // Use provided data or fallback to placeholder
  const chartData = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Transform data for chart (convert to display format with price and forecast keys)
  const data = chartData.map((d, idx) => {
    const userDataPoint = userData?.find(u => u.period === d.period);
    return {
      month: d.period,
      price: d.forecast ? null : d.price * 100, // Convert to pence for display
      forecast: d.forecast ? d.price * 100 : null,
      userCost: userDataPoint?.actualCost ? userDataPoint.actualCost * 100 : null, // User's actual cost
    };
  });
  
  const historicalData = chartData.filter(d => !d.forecast);
  const currentPrice = (historicalData[historicalData.length - 1]?.price || 0.212) * 100;
  const previousPrice = (historicalData[0]?.price || 0.198) * 100;
  const trend = currentPrice > previousPrice ? 'up' : 'down';
  const changePercent = Math.abs(((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-orange-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-600" />
              )}
              Wholesale Price Trend
            </CardTitle>
            <CardDescription>Energy market prices over time</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">£{currentPrice.toFixed(2)}</p>
            <p className={`text-sm flex items-center gap-1 ${trend === 'up' ? 'text-orange-600' : 'text-green-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {changePercent}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
            <XAxis 
              dataKey="month" 
              stroke="currentColor" 
              opacity={0.5}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="currentColor" 
              opacity={0.5}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `£${Number(value).toFixed(1)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: any) => [`£${Number(value).toFixed(2)}`, '']}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorPrice)"
              name="Historical Price"
              connectNulls
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorForecast)"
              name="Forecast"
              connectNulls
            />
            {userData && (
              <Line 
                type="monotone" 
                dataKey="userCost" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                name="Your Actual Cost"
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {userData && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
              📊 Your Actual Costs vs Market
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Green line shows your actual costs. Compare with wholesale trends to identify savings opportunities.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 Wholesale prices are trending {trend}. Consider {trend === 'up' ? 'fixing your tariff now' : 'switching to a variable tariff'}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
