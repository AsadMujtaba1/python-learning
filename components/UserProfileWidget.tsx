/**
 * USER PROFILE WIDGET
 * 
 * Displays user profile information and premium status
 * Shows profile completeness and referral stats
 * 
 * @module components/UserProfileWidget
 */

'use client';

import { UserProfile, isPremiumActive } from '@/lib/userProfile';
import Link from 'next/link';
import Button from './Button';

interface UserProfileWidgetProps {
  profile: UserProfile | null;
  showCompactView?: boolean;
}

/**
 * Main Profile Widget Component
 */
export default function UserProfileWidget({ 
  profile,
  showCompactView = false,
}: UserProfileWidgetProps) {
  if (!profile) {
    return null;
  }

  if (showCompactView) {
    return <CompactProfileView profile={profile} />;
  }

  const isPremium = isPremiumActive(profile);
  const daysUntilExpiry = profile.premiumExpiresAt 
    ? Math.ceil((profile.premiumExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {profile.displayName || 'User'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {profile.email}
          </p>
        </div>
        <PremiumTierBadge tier={profile.premiumTier} />
      </div>

      {/* Premium Status */}
      {isPremium && profile.premiumTier !== 'lifetime' && daysUntilExpiry && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            ⭐ Premium active • <span className="font-semibold">{daysUntilExpiry} days remaining</span>
          </p>
        </div>
      )}

      {!isPremium && (
        <div className="mb-4">
          <PremiumUpsellCard referralCount={profile.referralCount} />
        </div>
      )}

      {/* Profile Completeness */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Completeness
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {profile.profileCompleteness}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              profile.profileCompleteness === 100
                ? 'bg-green-500'
                : profile.profileCompleteness >= 60
                ? 'bg-blue-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${profile.profileCompleteness}%` }}
          />
        </div>
        {profile.profileCompleteness < 100 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Complete your profile to unlock better recommendations
          </p>
        )}
      </div>

      {/* Referral Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          🎁 Referral Program
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Referrals</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.referralCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Rewards</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.referralRewards}
            </p>
          </div>
        </div>
        <Link href="/referrals" className="block mt-3">
          <Button variant="secondary" size="sm" className="w-full">
            Share Your Code: {profile.referralCode}
          </Button>
        </Link>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
          Get 3 friends to join → Earn 1 month free Premium!
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <Link href="/settings">
          <Button variant="secondary" size="sm" className="w-full">
            Edit Profile Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Compact Profile View for Header/Nav
 */
function CompactProfileView({ profile }: { profile: UserProfile }) {
  const isPremium = isPremiumActive(profile);

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {profile.displayName || 'User'}
        </p>
        <div className="flex items-center justify-end gap-1">
          <PremiumTierBadge tier={profile.premiumTier} compact />
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {(profile.displayName?.[0] || profile.email[0]).toUpperCase()}
      </div>
    </div>
  );
}

/**
 * Premium Tier Badge
 */
interface PremiumTierBadgeProps {
  tier: 'free' | 'premium' | 'lifetime';
  compact?: boolean;
}

function PremiumTierBadge({ tier, compact = false }: PremiumTierBadgeProps) {
  const styles = {
    free: {
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-700 dark:text-gray-300',
      label: 'Free',
      icon: '👤',
    },
    premium: {
      bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      text: 'text-white',
      label: 'Premium',
      icon: '⭐',
    },
    lifetime: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
      text: 'text-white',
      label: 'Lifetime',
      icon: '💎',
    },
  };

  const style = styles[tier];

  if (compact) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
        {style.icon}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
      {style.icon} {style.label}
    </span>
  );
}

/**
 * Premium Upsell Card (for free users)
 */
function PremiumUpsellCard({ referralCount }: { referralCount: number }) {
  const referralsNeeded = Math.max(0, 3 - referralCount);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <div className="text-2xl">⭐</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Unlock Premium Features
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get AI insights, advanced analytics, solar calculators, and more
          </p>
          {referralsNeeded > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
              💡 Refer {referralsNeeded} more {referralsNeeded === 1 ? 'friend' : 'friends'} to get 1 month FREE!
            </p>
          )}
          <Link href="/premium">
            <Button variant="primary" size="sm" className="w-full">
              View Premium Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Progress Indicator (standalone)
 */
export function ProfileProgressIndicator({ completeness }: { completeness: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="text-3xl">
          {completeness === 100 ? '✅' : completeness >= 60 ? '📊' : '📝'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Setup
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {completeness}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                completeness === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
