/**
 * LINE CHART COMPONENT
 * 
 * Reusable line chart for visualizing trends over time.
 * Supports multiple data series, tooltips, and customization.
 * 
 * @module components/charts/LineChart
 */

'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UI } from '@/lib/utils/constants';

interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
    strokeWidth?: number;
  }>;
  xAxisKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
  formatTooltip?: (value: any, name: string) => string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
}

export default function LineChart({
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisLabel,
  yAxisLabel,
  className = '',
  formatTooltip,
  formatXAxis,
  formatYAxis,
}: LineChartProps) {
  const defaultColors = [
    UI.COLORS.PRIMARY,
    UI.COLORS.SUCCESS,
    UI.COLORS.WARNING,
    UI.COLORS.DANGER,
    UI.COLORS.INFO,
  ];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            stroke="currentColor"
            opacity={0.5}
            tick={{ fontSize: 12 }}
            tickFormatter={formatXAxis}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
          />
          
          <YAxis
            stroke="currentColor"
            opacity={0.5}
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                marginBottom: '4px',
              }}
              itemStyle={{
                color: 'hsl(var(--muted-foreground))',
              }}
              formatter={formatTooltip}
            />
          )}
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="line"
            />
          )}
          
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || defaultColors[index % defaultColors.length]}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
