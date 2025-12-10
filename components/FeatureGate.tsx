/**
 * FEATURE GATE COMPONENT
 * 
 * Wraps features to control access based on user tier
 * Shows upgrade prompts for locked features
 * 
 * @module components/FeatureGate
 */

'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/userProfile';
import { hasFeatureAccess, getUpgradeMessage } from '@/lib/featureGating';
import Button from './Button';

interface FeatureGateProps {
  featureId: string;
  profile: UserProfile | null;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Feature Gate Component
 * Conditionally renders content based on feature access
 */
export default function FeatureGate({
  featureId,
  profile,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const hasAccess = hasFeatureAccess(profile, featureId);

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state with upgrade prompt
  if (showUpgrade) {
    return (
      <UpgradePrompt featureId={featureId} />
    );
  }

  return null;
}

/**
 * Upgrade Prompt Component
 */
function UpgradePrompt({ featureId }: { featureId: string }) {
  const message = getUpgradeMessage(featureId);

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div className="filter blur-sm pointer-events-none select-none opacity-40">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-8 space-y-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Premium Feature
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          <Link href="/premium">
            <Button variant="primary" size="lg" className="w-full">
              Upgrade to Premium
            </Button>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Starting at £4.99/month
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Premium Badge Component
 * Shows "Premium" badge on locked features
 */
export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white ${className}`}>
      ⭐ Premium
    </span>
  );
}

/**
 * Feature List Item with Lock Icon
 */
interface FeatureListItemProps {
  icon: string;
  title: string;
  description: string;
  locked?: boolean;
  onClick?: () => void;
}

export function FeatureListItem({
  icon,
  title,
  description,
  locked = false,
  onClick,
}: FeatureListItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={locked && !onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        locked
          ? 'border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-80'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            {locked && <PremiumBadge />}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {locked && (
          <div className="text-gray-400">
            🔒
          </div>
        )}
      </div>
    </button>
  );
}

/**
 * Compact Premium Upsell Banner
 */
export function PremiumUpsellBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">
            ⭐ Unlock Premium Features
          </h3>
          <p className="text-blue-100 text-sm">
            Get AI insights, advanced analytics, and save even more money
          </p>
        </div>
        <Link href="/premium">
          <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap">
            Learn More →
          </Button>
        </Link>
      </div>
    </div>
  );
}
