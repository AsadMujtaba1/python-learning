/**
 * InsightCard Component
 * 
 * Displays energy insights with visual indicators for performance.
 * Shows comparisons against benchmarks with color-coded indicators.
 * 
 * @module components/dashboard/InsightCard
 */

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { ReactNode } from 'react';

export type InsightType = 'success' | 'warning' | 'info' | 'neutral';
export type ComparisonDirection = 'up' | 'down' | 'neutral';

interface InsightCardProps {
  title: string;
  value: string | number;
  comparison?: {
    value: string | number;
    direction: ComparisonDirection;
    label: string;
  };
  description: string;
  type?: InsightType;
  icon?: ReactNode;
  className?: string;
}

export default function InsightCard({
  title,
  value,
  comparison,
  description,
  type = 'neutral',
  icon,
  className = '',
}: InsightCardProps) {
  
  // Get color scheme based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-200 dark:border-green-800',
          bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
          iconColor: 'text-green-600 dark:text-green-400',
          valueColor: 'text-green-700 dark:text-green-300',
        };
      case 'warning':
        return {
          border: 'border-orange-200 dark:border-orange-800',
          bg: 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50',
          iconColor: 'text-orange-600 dark:text-orange-400',
          valueColor: 'text-orange-700 dark:text-orange-300',
        };
      case 'info':
        return {
          border: 'border-blue-200 dark:border-blue-800',
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          valueColor: 'text-blue-700 dark:text-blue-300',
        };
      default:
        return {
          border: 'border-gray-200 dark:border-gray-700',
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50',
          iconBg: 'bg-gray-100 dark:bg-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          valueColor: 'text-gray-900 dark:text-gray-100',
        };
    }
  };

  // Get comparison icon based on direction
  const getComparisonIcon = () => {
    if (!comparison) return null;
    
    switch (comparison.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  // Get comparison color based on type and direction
  const getComparisonColor = () => {
    if (!comparison) return '';
    
    // For success type, down is good (e.g., cost reduction)
    // For warning type, up is bad (e.g., cost increase)
    if (type === 'success' || type === 'info') {
      return comparison.direction === 'down' ? 'text-green-600 dark:text-green-400' : 
             comparison.direction === 'up' ? 'text-red-600 dark:text-red-400' : 
             'text-gray-600 dark:text-gray-400';
    } else if (type === 'warning') {
      return comparison.direction === 'up' ? 'text-red-600 dark:text-red-400' : 
             comparison.direction === 'down' ? 'text-green-600 dark:text-green-400' : 
             'text-gray-600 dark:text-gray-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  // Get default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getTypeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={className}
    >
      <Card className={`group ${styles.bg} ${styles.border} border-2 shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden relative h-full`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`${styles.iconBg} ${styles.iconColor} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
              {icon || getDefaultIcon()}
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {title}
              </CardTitle>
              {comparison && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-sm font-semibold ${getComparisonColor()}`}>
                  {getComparisonIcon()}
                  <span>{comparison.value}</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">{comparison.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <div className={`text-4xl font-bold tracking-tight ${styles.valueColor}`}>
          {value}
        </div>
        <CardDescription className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
    </motion.div>
  );
}

// Pre-configured insight card variants for common use cases
export function SuccessInsightCard(props: Omit<InsightCardProps, 'type'>) {
  return <InsightCard {...props} type="success" />;
}

export function WarningInsightCard(props: Omit<InsightCardProps, 'type'>) {
  return <InsightCard {...props} type="warning" />;
}

export function InfoInsightCard(props: Omit<InsightCardProps, 'type'>) {
  return <InsightCard {...props} type="info" />;
}

export function NeutralInsightCard(props: Omit<InsightCardProps, 'type'>) {
  return <InsightCard {...props} type="neutral" />;
}
