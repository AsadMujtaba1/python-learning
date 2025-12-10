'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  calculateCompleteness, 
  calculateCapabilities, 
  getNextBestActions,
  calculatePotentialSavings 
} from '@/lib/utils/profileAnalysis';
import type { UserProfile } from '@/lib/types/userProfile';
import Button from './Button';
import Badge from './Badge';
import Alert from './Alert';

interface ProfileCompletenessWidgetProps {
  profile: UserProfile;
  showQuickActions?: boolean;
  compact?: boolean;
}

export default function ProfileCompletenessWidget({
  profile,
  showQuickActions = true,
  compact = false
}: ProfileCompletenessWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  
  const completeness = calculateCompleteness(profile);
  const capabilities = calculateCapabilities(profile);
  const nextActions = getNextBestActions(profile);
  const savings = calculatePotentialSavings(profile);
  
  // Color based on completeness
  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    if (percentage < 85) return 'bg-blue-500';
    return 'bg-green-500';
  };
  
  const getTierBadge = (tier: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning'> = {
      basic: 'secondary',
      standard: 'primary',
      advanced: 'warning',
      expert: 'success'
    };
    return variants[tier] || 'secondary';
  };
  
  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Profile Completeness
          </h3>
          <Badge variant={getTierBadge(completeness.tier)} size="sm">
            {completeness.tier.toUpperCase()}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">{completeness.percentage}%</span>
            <span className="text-gray-500 dark:text-gray-500 text-xs">
              +£{savings.withExpert - savings.current} potential
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(completeness.percentage)}`}
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>
        
        {nextActions.length > 0 && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setExpanded(!expanded)}
            className="w-full"
          >
            {expanded ? 'Hide' : 'Add More Info'} ({nextActions.length})
          </Button>
        )}
        
        {expanded && (
          <div className="mt-3 space-y-2">
            {nextActions.slice(0, 3).map((action, index) => (
              <Link
                key={index}
                href="/settings#profile"
                className="block p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {action.action}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                      +{action.savingsPotential}
                    </p>
                  </div>
                  <Badge variant="secondary" size="sm">
                    {action.timeRequired}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Profile Completeness
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            More data = better recommendations & bigger savings
          </p>
        </div>
        <Badge variant={getTierBadge(completeness.tier)} size="lg">
          {completeness.tier.toUpperCase()} TIER
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {completeness.percentage}%
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-1000 ${getProgressColor(completeness.percentage)}`}
            style={{ width: `${completeness.percentage}%` }}
          />
          {/* Tier markers */}
          <div className="absolute inset-0 flex items-center justify-between px-1">
            <div className="text-xs text-white font-bold" style={{ marginLeft: '25%' }}>
              STD
            </div>
            <div className="text-xs text-white font-bold" style={{ marginLeft: '25%' }}>
              ADV
            </div>
            <div className="text-xs text-white font-bold" style={{ marginLeft: '25%' }}>
              EXP
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
          <span>Basic</span>
          <span>Standard</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>
      
      {/* Savings Potential */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            💰 Current Savings Potential
          </h3>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            £{savings.current}/year
          </span>
        </div>
        {savings.current < savings.withExpert && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Unlock up to</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              £{savings.withExpert}/year
            </span>
            <span>by adding more details</span>
          </div>
        )}
      </div>
      
      {/* Recommendations */}
      {completeness.recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            🎯 Quick Wins
          </h3>
          <div className="space-y-2">
            {completeness.recommendations.map((rec, index) => (
              <Alert
                key={index}
                variant="info"
                dismissible={false}
              >
                {rec}
              </Alert>
            ))}
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      {showQuickActions && nextActions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            ⚡ Next Best Actions
          </h3>
          <div className="space-y-3">
            {nextActions.slice(0, 5).map((action, index) => (
              <Link
                key={index}
                href="/settings#profile"
                className="block group"
              >
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all hover:shadow-md border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {action.action}
                        </h4>
                        <Badge variant="secondary" size="sm">
                          {action.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {action.impact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        ⏱️ {action.timeRequired}
                      </span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        💷 {action.savingsPotential}
                      </span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium group-hover:underline">
                      Add now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Missing Fields Summary */}
      {completeness.missingFields.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <details className="group">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-between">
              <span>📋 What's Missing ({completeness.missingFields.length} categories)</span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <div className="mt-3 space-y-3">
              {completeness.missingFields.map((category, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md p-3"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {category.category}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {category.impact}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {category.fields.map((field, idx) => (
                      <Badge key={idx} variant="secondary" size="sm">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
      
      {/* Action Button */}
      <div className="mt-6">
        <Link href="/settings#profile" className="block">
          <Button variant="primary" size="lg" className="w-full">
            Complete Your Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
