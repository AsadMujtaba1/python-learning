/**
 * AREA CHART COMPONENT
 * 
 * Reusable area chart for visualizing trends with filled areas.
 * Perfect for forecast data and cumulative values.
 * 
 * @module components/charts/AreaChart
 */

'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UI } from '@/lib/utils/constants';

interface AreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
    stackId?: string;
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

export default function AreaChart({
  data,
  areas,
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
}: AreaChartProps) {
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
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            {areas.map((area, index) => {
              const color = area.color || defaultColors[index % defaultColors.length];
              return (
                <linearGradient key={`gradient-${area.dataKey}`} id={`color-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              );
            })}
          </defs>
          
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
            />
          )}
          
          {areas.map((area, index) => {
            const color = area.color || defaultColors[index % defaultColors.length];
            return (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color-${area.dataKey})`}
                animationDuration={500}
                stackId={area.stackId}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
