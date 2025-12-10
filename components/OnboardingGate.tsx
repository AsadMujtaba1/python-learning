'use client';

/**
 * ONBOARDING GATE COMPONENT
 * 
 * Smart gate that redirects users with incomplete profiles to onboarding
 * Checks profile completeness and ensures quality data before allowing dashboard access
 * 
 * Team Decision: Place gate at component level (not middleware) for flexibility
 * - Allows different completeness thresholds per feature
 * - Maintains client-side routing performance
 * - Easy to test and maintain
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { calculateCompleteness } from '@/lib/utils/profileAnalysis';
import type { UserProfile } from '@/lib/types/userProfile';

interface OnboardingGateProps {
  children: React.ReactNode;
  /** Minimum completeness percentage required (default: 30%) */
  minCompleteness?: number;
  /** Routes that bypass the gate check */
  exemptRoutes?: string[];
  /** Show loading state while checking */
  showLoading?: boolean;
}

export default function OnboardingGate({ 
  children, 
  minCompleteness = 30,
  exemptRoutes = ['/onboarding-conversational', '/onboarding', '/sign-in', '/sign-up', '/', '/about', '/blog', '/faq', '/contact'],
  showLoading = true
}: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [pathname]);

  const checkOnboardingStatus = async () => {
    try {
      // Skip check for exempt routes
      if (exemptRoutes.some(route => pathname === route || pathname.startsWith(route))) {
        setHasAccess(true);
        setIsChecking(false);
        return;
      }

      // Check localStorage for user data (quick check)
      const storedData = localStorage.getItem('userHomeData');
      
      if (!storedData) {
        // No data at all - redirect to onboarding
        router.push('/onboarding-conversational');
        return;
      }

      // Parse and analyze completeness
      const parsedData = JSON.parse(storedData);
      
      // Build minimal profile for completeness check
      const profile: Partial<UserProfile> = {
        postcode: parsedData.postcode,
        homeType: parsedData.homeType,
        occupants: parsedData.occupants,
        heatingType: parsedData.heatingType,
        bedrooms: parsedData.bedrooms,
        electricityProvider: parsedData.supplier,
        annualElectricityUsage: parsedData.usage,
        hasSmartMeter: parsedData.hasSmartMeter,
      };

      // Calculate completeness
      const completeness = calculateCompleteness(profile as UserProfile);

      // Check threshold
      if (completeness.percentage < minCompleteness) {
        console.log(`Profile completeness: ${completeness.percentage}% (minimum: ${minCompleteness}%)`);
        console.log('Redirecting to complete onboarding...');
        
        // Store current route to return after completion
        sessionStorage.setItem('returnAfterOnboarding', pathname);
        
        router.push('/onboarding-conversational');
        return;
      }

      // All checks passed
      setHasAccess(true);
    } catch (error) {
      console.error('Onboarding gate error:', error);
      // On error, allow access (fail open for better UX)
      setHasAccess(true);
    } finally {
      setIsChecking(false);
    }
  };

  // Loading state
  if (isChecking && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // Render children if access granted
  return hasAccess ? <>{children}</> : null;
}
