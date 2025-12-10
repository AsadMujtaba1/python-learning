/**
 * TARIFF DURATION CHART
 * 
 * Visualizes fixed tariff expiry dates and shows when users should review deals.
 * Helps prevent rolling onto expensive default tariffs.
 * 
 * @module components/charts/TariffDurationChart
 */

'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { TariffDuration } from '@/hooks/useBenchmarkData';

interface TariffDurationProps {
  data?: TariffDuration[];
  userData?: { currentTariff?: string; currentRate?: number; expiryDate?: string; daysLeft?: number }; // User's current tariff info
  className?: string;
}

// Placeholder data - will be replaced with real data via props
const PLACEHOLDER_DATA: TariffDuration[] = [
  { type: 'Fixed Rate', unitRate: 0.245, daysRemaining: 180, expiryDate: '2025-06-10' },
  { type: 'Standard Variable', unitRate: 0.289, daysRemaining: 0 },
  { type: 'Best Fixed', unitRate: 0.232, daysRemaining: 730, expiryDate: '2027-12-10' },
];



export default function TariffDurationChart({
  data: propData,
  userData,
  className = '',
}: TariffDurationProps) {
  const data = propData && propData.length > 0 ? propData : PLACEHOLDER_DATA;
  
  // Use user data if provided
  const actualUserRate = userData?.currentRate || data.find(d => d.daysRemaining > 0)?.unitRate || data[0].unitRate;
  const actualDaysLeft = userData?.daysLeft !== undefined ? userData.daysLeft : data.find(d => d.daysRemaining > 0)?.daysRemaining || data[0].daysRemaining;
  
  // Create timeline data for chart
  const timelineData = data.map((item, idx) => ({
    month: item.type,
    rate: item.unitRate * 100,
    userRate: userData ? actualUserRate * 100 : null,
    status: item.daysRemaining > 0 ? 'current' : 'standard'
  }));
  
  const fixedTariff = data.find(d => d.daysRemaining > 0) || data[0];
  const standardTariff = data.find(d => d.type.toLowerCase().includes('standard')) || data[1];
  const bestTariff = data.find(d => d.type.toLowerCase().includes('best')) || data[2];
  
  const daysRemaining = actualDaysLeft;
  const currentRate = actualUserRate * 100;
  const standardRate = standardTariff.unitRate * 100;
  const bestRate = bestTariff?.unitRate * 100 || currentRate * 0.95;
  const increasePercent = ((standardRate - currentRate) / currentRate * 100).toFixed(0);
  const annualIncrease = ((standardRate - currentRate) * 365 / 100).toFixed(0);
  const vsBestPercent = ((currentRate - bestRate) / bestRate * 100).toFixed(0);

  const getBarColor = (status: string) => {
    if (status === 'current') return '#10b981'; // Green
    if (status === 'standard') return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const getStatusInfo = (daysLeft: number) => {
    if (daysLeft > 180) return { label: 'Safe', color: 'text-green-600', icon: '✓' };
    if (daysLeft > 60) return { label: 'Review Soon', color: 'text-yellow-600', icon: '⚠️' };
    if (daysLeft > 0) return { label: 'Urgent', color: 'text-orange-600', icon: '🔔' };
    return { label: 'Expired', color: 'text-red-600', icon: '❌' };
  };

  const status = getStatusInfo(daysRemaining);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Tariff Duration & Renewal
            </CardTitle>
            <CardDescription>Track your fixed rate period</CardDescription>
          </div>
          <div className="text-right">
            <p className={`text-xl font-bold ${status.color}`}>
              {status.icon} {daysRemaining} days
            </p>
            <p className="text-xs text-gray-500">until renewal</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Chart */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Rate Timeline (p/kWh)
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={timelineData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="month" 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="currentColor" 
                opacity={0.5}
                tick={{ fontSize: 12 }}
                label={{ value: 'Pence/kWh', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(2)}p/kWh`, '']}
              />
              <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                {timelineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Rate Comparison
          </h4>
          <div className="space-y-2">
            {data.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border ${
                  item.daysRemaining > 100 
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : item.daysRemaining === 0
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.type}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.daysRemaining > 0 ? `${item.daysRemaining} days remaining` : 'Variable rate'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{(item.unitRate * 100).toFixed(1)}p</p>
                    <p className="text-xs text-gray-500">per kWh</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Contract End</p>
            </div>
            <p className="text-sm font-bold">
              {new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400">Review From</p>
            </div>
            <p className="text-sm font-bold">
              {new Date(Date.now() + (daysRemaining - 49) * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* User Comparison */}
        {userData && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
              📊 Your Tariff vs Market
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Your Rate:</span>
                <span className="ml-1 font-bold text-blue-600">{currentRate.toFixed(1)}p/kWh</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">vs Best Available:</span>
                <span className={`ml-1 font-bold ${parseFloat(vsBestPercent) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {parseFloat(vsBestPercent) > 0 ? `${vsBestPercent}% higher` : `${Math.abs(parseFloat(vsBestPercent))}% better`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        {daysRemaining < 90 && (
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Your rate increases by {increasePercent}% in {daysRemaining} days
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  This means an extra £{annualIncrease}/year. Start comparing tariffs now to avoid the standard rate.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
