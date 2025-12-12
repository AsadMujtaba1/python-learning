// DEPRECATED: This onboarding route is deprecated in favor of /onboarding-conversational.
// Redirecting to canonical onboarding.
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingSmartPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-conversational');
  }, [router]);
  return null;
/**
 * Smart Onboarding Page
 * Quick 30-second setup for new users
 */

import SmartOnboarding from '@/components/SmartOnboarding';

export default function OnboardingPage() {
  return <SmartOnboarding />;
}
