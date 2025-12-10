'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { SmartMeterAnalytics, UsageEstimate } from '@/lib/types/smartMeterTypes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UsageChartProps {
  analytics: SmartMeterAnalytics;
  estimate: UsageEstimate | null;
  showDetailed?: boolean;
}

export default function UsageChart({ analytics, estimate, showDetailed = false }: UsageChartProps) {
  const monthlyChartData = useMemo(() => {
    const data = analytics.monthlyUsage || [];
    
    return {
      labels: data.map(d => d.month.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })),
      datasets: [
        {
          label: 'Monthly Usage (kWh)',
          data: data.map(d => d.kWh),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [analytics.monthlyUsage]);

  const weeklyChartData = useMemo(() => {
    const data = analytics.weeklyUsage || [];
    
    return {
      labels: data.map(d => d.weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Weekly Usage (kWh)',
          data: data.map(d => d.kWh),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  }, [analytics.weeklyUsage]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kWh',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Usage Trend</CardTitle>
          <CardDescription>
            Your energy consumption over time
            {analytics.dataCompleteness < 80 && (
              <span className="ml-2 text-yellow-600">
                ({analytics.dataCompleteness}% data completeness)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={monthlyChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {showDetailed && (
        <>
          {/* Weekly Trend */}
          {analytics.weeklyUsage.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Usage</CardTitle>
                <CardDescription>
                  Detailed weekly breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={weeklyChartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seasonal Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Comparison</CardTitle>
              <CardDescription>
                How your usage varies by season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">❄️ Winter</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.winterAverage.toFixed(1)} kWh
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per day</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">🌸 Spring</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(estimate?.dailyAverage || 0).toFixed(1)} kWh
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per day</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">☀️ Summer</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.summerAverage.toFixed(1)} kWh
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per day</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">🍂 Autumn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(estimate?.dailyAverage || 0).toFixed(1)} kWh
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per day</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Seasonal Variation: {analytics.seasonalVariation}%
                </p>
                <p className="text-sm text-gray-600">
                  Your winter usage is {analytics.seasonalVariation}% higher than summer. 
                  This is typical for UK households due to heating needs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {analytics.detectedAnomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Unusual Usage Detected</CardTitle>
                <CardDescription>
                  Periods with significantly different consumption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.detectedAnomalies.slice(0, 3).map((anomaly, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {anomaly.date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Used {anomaly.value.toFixed(0)} kWh (expected ~{anomaly.expectedValue.toFixed(0)} kWh)
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Possible causes: {anomaly.possibleCauses.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded text-xs font-semibold ${
                        anomaly.severity === 'severe' ? 'bg-red-100 text-red-700' :
                        anomaly.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {anomaly.severity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
