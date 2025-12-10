/**
 * SmartRecommendationsCard Component
 * 
 * Priority-ranked actionable recommendations based on user data and analysis.
 * Shows clear savings potential and provides one-click actions.
 * 
 * @module components/dashboard/SmartRecommendationsCard
 */

'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Zap, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  savings: number;
  priority: 'high' | 'medium' | 'low';
  urgency?: string;
  actionLabel: string;
  actionLink: string;
  icon?: 'switch' | 'efficiency' | 'timing' | 'tariff';
}

interface SmartRecommendationsCardProps {
  recommendations?: Recommendation[];
  loading?: boolean;
}

const defaultRecommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Switch to Better Tariff',
    description: 'Your current tariff expires in 45 days. Switch now to lock in savings.',
    savings: 120,
    priority: 'high',
    urgency: '45 days left',
    actionLabel: 'Compare Tariffs',
    actionLink: '/tariffs',
    icon: 'switch',
  },
  {
    id: '2',
    title: 'Optimize Peak Usage',
    description: 'Shift 30% of usage to off-peak hours and save significantly.',
    savings: 85,
    priority: 'medium',
    actionLabel: 'View Schedule',
    actionLink: '/dashboard-new',
    icon: 'timing',
  },
  {
    id: '3',
    title: 'Improve Home Efficiency',
    description: 'Your usage is 15% above similar homes. Small changes can save money.',
    savings: 65,
    priority: 'medium',
    actionLabel: 'Get Tips',
    actionLink: '/dashboard-new',
    icon: 'efficiency',
  },
];

const priorityConfig = {
  high: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-800 dark:text-red-300',
    badge: 'bg-red-600 dark:bg-red-500',
  },
  medium: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-300 dark:border-orange-700',
    text: 'text-orange-800 dark:text-orange-300',
    badge: 'bg-orange-600 dark:bg-orange-500',
  },
  low: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-800 dark:text-blue-300',
    badge: 'bg-blue-600 dark:bg-blue-500',
  },
};

const iconMap: Record<string, React.ElementType> = {
  switch: TrendingUp,
  efficiency: Zap,
  timing: Clock,
  tariff: Sparkles,
  sparkles: Sparkles,
};

export default function SmartRecommendationsCard({
  recommendations = defaultRecommendations,
  loading = false,
}: SmartRecommendationsCardProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Sort by priority (high > medium > low) and savings
  const sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.savings - a.savings;
  });

  const topThree = sortedRecs.slice(0, 3);
  const totalPotentialSavings = topThree.reduce((sum, rec) => sum + rec.savings, 0);

  return (
    <Card className="shadow-xl border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Smart Recommendations</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Save up to <span className="font-bold text-purple-600 dark:text-purple-400">£{totalPotentialSavings}/year</span> with these actions
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {topThree.map((rec, index) => {
          const Icon = iconMap[rec.icon || 'sparkles'] || Sparkles;
          const config = priorityConfig[rec.priority];

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 ${config.border} ${config.bg} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
              onClick={() => router.push(rec.actionLink)}
            >
              {/* Priority Badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {rec.urgency && (
                  <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600">
                    ⏰ {rec.urgency}
                  </span>
                )}
                <span className={`${config.badge} text-white text-xs font-bold px-2 py-1 rounded-full uppercase`}>
                  #{index + 1}
                </span>
              </div>

              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.description}
                  </p>

                  {/* Savings & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        £{rec.savings}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/year</span>
                    </div>

                    <Button
                      size="sm"
                      className="group/btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(rec.actionLink);
                      }}
                    >
                      {rec.actionLabel}
                      <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
