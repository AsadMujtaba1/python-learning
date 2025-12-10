/**
 * REFERRALS PAGE
 * 
 * Complete referral system dashboard
 * - Display referral code
 * - Share via social media, email, copy
 * - Track referrals and rewards
 * - Show progress to free premium
 * 
 * @page /referrals
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile } from '@/lib/userProfile';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ReferralsPage() {
  return (
    <ProtectedRoute>
      <ReferralsContent />
    </ProtectedRoute>
  );
}

function ReferralsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaEmail = () => {
    if (!profile) return;
    const subject = encodeURIComponent('Save money on your energy bills!');
    const body = encodeURIComponent(
      `I've been using Cost Saver to reduce my energy bills and thought you might find it useful too!\n\nSign up with my referral code to get started: ${getReferralUrl()}\n\nYou'll get personalized tips to save money, and I'll get premium features when you join. Win-win!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = () => {
    if (!profile) return;
    const text = encodeURIComponent(
      `Save money on energy bills! Sign up with my referral code: ${getReferralUrl()}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTwitter = () => {
    if (!profile) return;
    const text = encodeURIComponent(
      `I'm saving money on energy bills with @CostSaverApp! Join me: ${getReferralUrl()}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(getReferralUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const getReferralUrl = (): string => {
    if (!profile) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/sign-up?ref=${profile.referralCode}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="error">
          Failed to load referral data
        </Alert>
      </div>
    );
  }

  const referralsNeeded = Math.max(0, 3 - profile.referralCount);
  const progress = Math.min(100, (profile.referralCount / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard-new" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎁 Referral Program
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">
              Earn Free Premium Access!
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Share Cost Saver with friends and unlock premium features for free
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-2xl font-bold">
                Refer 3 friends = 1 month free Premium
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Progress
            </h3>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.referralCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Referrals
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {profile.referralRewards}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Rewards Earned
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {referralsNeeded}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Until Next Reward
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress to Next Reward
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {profile.referralCount % 3}/3
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                  style={{ width: `${(profile.referralCount % 3) * 33.33}%` }}
                />
              </div>
            </div>

            {/* Motivation Message */}
            {referralsNeeded > 0 && (
              <Alert variant="info" className="mt-4">
                <p className="font-semibold">
                  🎯 Almost there! Just {referralsNeeded} more {referralsNeeded === 1 ? 'referral' : 'referrals'} to unlock 30 days of Premium!
                </p>
              </Alert>
            )}

            {referralsNeeded === 0 && (
              <Alert variant="success" className="mt-4">
                <p className="font-semibold">
                  🎉 Congratulations! You've earned a free month of Premium access!
                </p>
              </Alert>
            )}
          </div>

          {/* Rewards Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Rewards
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xl">
                  1️⃣
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    First Referral
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thank you!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl">
                  3️⃣
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    3 Referrals
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    1 month Premium FREE
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xl">
                  6️⃣
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    6 Referrals
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    2 months Premium FREE
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-xl">
                  9️⃣
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    9 Referrals
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3 months Premium FREE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Your Referral Code
          </h3>
          
          {/* Code Display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Share this code or link
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-wider">
                {profile.referralCode}
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {getReferralUrl()}
                </p>
              </div>
              <Button
                onClick={() => copyToClipboard(getReferralUrl())}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={shareViaEmail}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <span>📧</span>
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <span>💬</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={shareViaTwitter}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <span>🐦</span>
              <span className="hidden sm:inline">Twitter</span>
            </button>
            <button
              onClick={shareViaFacebook}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
            >
              <span>📘</span>
              <span className="hidden sm:inline">Facebook</span>
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Share Your Link
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send your unique referral link to friends via email, social media, or messaging apps
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                They Sign Up
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When your friends create an account using your link, you get credit
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Earn Rewards
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get 1 month of Premium FREE for every 3 successful referrals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
