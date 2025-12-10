/**
 * GAUGE CHART COMPONENT
 * 
 * Circular gauge/radial progress chart for displaying scores and percentages.
 * Perfect for efficiency scores, completion rates, and KPIs.
 * 
 * @module components/charts/GaugeChart
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number; // 0-100
  maxValue?: number;
  size?: number;
  thickness?: number;
  showValue?: boolean;
  label?: string;
  colors?: {
    filled: string;
    empty: string;
  };
  className?: string;
}

export default function GaugeChart({
  value,
  maxValue = 100,
  size = 200,
  thickness = 20,
  showValue = true,
  label,
  colors = {
    filled: '#3b82f6',
    empty: '#e5e7eb',
  },
  className = '',
}: GaugeChartProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  
  const data = [
    { value: percentage, color: colors.filled },
    { value: 100 - percentage, color: colors.empty },
  ];

  // Determine color based on value
  const getColor = () => {
    if (percentage >= 80) return '#10b981'; // Green
    if (percentage >= 60) return '#3b82f6'; // Blue
    if (percentage >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const dynamicColor = getColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={`${((size / 2) - thickness)}px`}
            outerRadius={`${(size / 2)}px`}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? dynamicColor : entry.color} 
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: dynamicColor }}>
            {Math.round(value)}
          </div>
          {label && (
            <div className="text-sm text-muted-foreground mt-1">
              {label}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
