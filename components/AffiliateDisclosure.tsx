'use client';

import { compliance } from '@/lib/complianceService';
import type { AffiliateDisclosure } from '@/lib/complianceService';

interface AffiliateDisclosureBannerProps {
  context: AffiliateDisclosure['context'];
  prominence?: 'high' | 'medium' | 'low';
  className?: string;
}

export default function AffiliateDisclosureBanner({ 
  context, 
  prominence = 'high',
  className = ''
}: AffiliateDisclosureBannerProps) {
  const disclosureText = compliance.getAffiliateDisclosure(context);
  
  // High prominence: Large banner at top of page
  if (prominence === 'high') {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
              💰 Affiliate Disclosure
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {disclosureText}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Medium prominence: Inline notice
  if (prominence === 'medium') {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        <span className="font-medium text-gray-900 dark:text-gray-200">ℹ️ Note:</span> {disclosureText}
      </div>
    );
  }
  
  // Low prominence: Small inline text
  return (
    <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      💡 {disclosureText}
    </p>
  );
}

// Specific disclosure components for each context
export function ProductAffiliateDisclosure({ className }: { className?: string }) {
  return (
    <AffiliateDisclosureBanner 
      context="product" 
      prominence="medium"
      className={className}
    />
  );
}

export function TariffAffiliateDisclosure({ className }: { className?: string }) {
  return (
    <AffiliateDisclosureBanner 
      context="tariff" 
      prominence="high"
      className={className}
    />
  );
}

export function SolarAffiliateDisclosure({ className }: { className?: string }) {
  return (
    <AffiliateDisclosureBanner 
      context="solar" 
      prominence="high"
      className={className}
    />
  );
}

export function HeatPumpAffiliateDisclosure({ className }: { className?: string }) {
  return (
    <AffiliateDisclosureBanner 
      context="heat-pump" 
      prominence="high"
      className={className}
    />
  );
}
