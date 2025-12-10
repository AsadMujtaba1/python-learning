/**
 * BAR CHART COMPONENT
 * 
 * Reusable bar chart for comparing values across categories.
 * Supports stacked bars, multiple series, and customization.
 * 
 * @module components/charts/BarChart
 */

'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { UI } from '@/lib/utils/constants';

interface BarChartProps {
  data: any[];
  bars: Array<{
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
  colorByValue?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export default function BarChart({
  data,
  bars,
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
  colorByValue = false,
  layout = 'horizontal',
}: BarChartProps) {
  const defaultColors = [
    UI.COLORS.PRIMARY,
    UI.COLORS.SUCCESS,
    UI.COLORS.WARNING,
    UI.COLORS.DANGER,
    UI.COLORS.INFO,
  ];

  const getColorForValue = (value: number, index: number) => {
    if (!colorByValue) return defaultColors[index % defaultColors.length];
    
    if (value < 0) return UI.COLORS.DANGER;
    if (value > 10) return UI.COLORS.SUCCESS;
    return UI.COLORS.PRIMARY;
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          )}
          
          {layout === 'horizontal' ? (
            <>
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis}
              />
              <YAxis
                dataKey={xAxisKey}
                type="category"
                stroke="currentColor"
                opacity={0.5}
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxis}
              />
            </>
          )}
          
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
          
          {showLegend && bars.length > 1 && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
            />
          )}
          
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || defaultColors[index % defaultColors.length]}
              radius={[4, 4, 0, 0]}
              animationDuration={500}
              stackId={bar.stackId}
            >
              {colorByValue && (
                data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={getColorForValue(entry[bar.dataKey], index)} />
                ))
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
