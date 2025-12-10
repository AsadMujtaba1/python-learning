'use client';

import { AlertTriangle, TrendingUp, Info, Lightbulb, DollarSign, BarChart3, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UsageInsight } from '@/lib/types/smartMeterTypes';

interface InsightsListProps {
  insights: UsageInsight[];
  compact?: boolean;
  onViewAll?: () => void;
}

export default function InsightsList({ insights, compact = false, onViewAll }: InsightsListProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No insights available yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Upload more photos to get personalized recommendations
        </p>
      </div>
    );
  }

  const getIcon = (type: UsageInsight['type']) => {
    switch (type) {
      case 'seasonal-comparison':
        return BarChart3;
      case 'trend-alert':
        return TrendingUp;
      case 'anomaly-detection':
        return AlertTriangle;
      case 'benchmark-comparison':
        return BarChart3;
      case 'cost-prediction':
        return DollarSign;
      case 'efficiency-tip':
        return Lightbulb;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: UsageInsight['severity']) => {
    switch (severity) {
      case 'alert':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (severity: UsageInsight['severity']) => {
    switch (severity) {
      case 'alert':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const Icon = getIcon(insight.type);
        const severityColor = getSeverityColor(insight.severity);
        const iconColor = getIconColor(insight.severity);

        return (
          <Card key={insight.id} className={`${severityColor} border-2`}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    {insight.potentialSavings && (
                      <div className="flex-shrink-0 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Save £{insight.potentialSavings}/yr
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {insight.description}
                  </p>

                  {!compact && (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        {insight.detailedExplanation}
                      </p>

                      {/* Supporting Data */}
                      {insight.supportingData.length > 0 && (
                        <div className="bg-white p-3 rounded-lg mb-4">
                          <div className="grid grid-cols-2 gap-3">
                            {insight.supportingData.map((data, idx) => (
                              <div key={idx}>
                                <p className="text-xs text-gray-500">{data.metric}</p>
                                <p className="font-semibold text-gray-900">
                                  {data.value.toFixed(0)}
                                  {data.comparison && (
                                    <span className="text-gray-500 font-normal text-sm ml-1">
                                      vs {data.comparison.toFixed(0)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Actions */}
                      {insight.actionable && insight.suggestedActions.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-2">
                            Recommended Actions:
                          </p>
                          <ul className="space-y-1">
                            {insight.suggestedActions.map((action, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {compact && onViewAll && insights.length > 5 && (
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          View All {insights.length} Insights
        </Button>
      )}
    </div>
  );
}
