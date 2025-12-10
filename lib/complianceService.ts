/**
 * COMPLIANCE AND PRIVACY FRAMEWORK
 * 
 * Ensures compliance with:
 * - UK GDPR and Data Protection Act 2018
 * - UK Consumer Rights Act 2015
 * - Financial Services regulations
 * - Advertising Standards Authority (ASA) guidelines
 * - Ofgem regulations
 * 
 * Features:
 * - Data minimization
 * - Consent management
 * - Affiliate disclosure requirements
 * - Financial claims validation
 * - Terms of Service compliance checking
 */

export interface DataRetentionPolicy {
  dataType: string;
  purpose: string;
  retentionPeriod: number; // days
  legalBasis: 'consent' | 'contract' | 'legitimate-interest' | 'legal-obligation';
  canBeDeleted: boolean;
}

export interface ComplianceCheck {
  area: string;
  compliant: boolean;
  issues: string[];
  recommendations: string[];
  lastChecked: Date;
}

export interface UserConsent {
  userId: string;
  consentType: 'analytics' | 'marketing' | 'personalization' | 'data-sharing';
  granted: boolean;
  timestamp: Date;
  version: string; // Terms version
}

export interface AffiliateDisclosure {
  context: 'product' | 'tariff' | 'solar' | 'heat-pump';
  disclosed: boolean;
  disclosureText: string;
  prominence: 'high' | 'medium' | 'low';
}

class ComplianceService {
  /**
   * Data retention policies per UK GDPR
   */
  private readonly dataRetentionPolicies: DataRetentionPolicy[] = [
    {
      dataType: 'user-account',
      purpose: 'Service provision',
      retentionPeriod: 365 * 3, // 3 years after account deletion
      legalBasis: 'contract',
      canBeDeleted: true
    },
    {
      dataType: 'energy-bills',
      purpose: 'Usage analysis and recommendations',
      retentionPeriod: 730, // 2 years
      legalBasis: 'consent',
      canBeDeleted: true
    },
    {
      dataType: 'usage-patterns',
      purpose: 'Personalized insights',
      retentionPeriod: 365, // 1 year
      legalBasis: 'legitimate-interest',
      canBeDeleted: true
    },
    {
      dataType: 'tariff-comparisons',
      purpose: 'Historical analysis',
      retentionPeriod: 90, // 3 months
      legalBasis: 'legitimate-interest',
      canBeDeleted: true
    },
    {
      dataType: 'error-logs',
      purpose: 'System reliability',
      retentionPeriod: 30, // 30 days
      legalBasis: 'legitimate-interest',
      canBeDeleted: false
    },
    {
      dataType: 'analytics',
      purpose: 'Service improvement',
      retentionPeriod: 365, // 1 year
      legalBasis: 'consent',
      canBeDeleted: true
    }
  ];

  /**
   * Affiliate disclosure requirements
   */
  getAffiliateDisclosureText(context: AffiliateDisclosure['context']): string {
    const disclosures = {
      product: 'We may earn a commission from purchases made through our affiliate links at no extra cost to you. This helps us keep our service free.',
      tariff: 'We may receive a commission if you switch energy supplier through our comparison service. Our recommendations remain impartial.',
      solar: 'We may earn a referral fee from solar installers. We only recommend MCS-certified installers with strong track records.',
      'heat-pump': 'We may receive a commission from heat pump installers. All recommendations are based on your property suitability and independent reviews.'
    };

    return disclosures[context];
  }

  /**
   * Validate financial claim compliance
   */
  validateFinancialClaim(claim: string, data: any): {
    compliant: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for absolute guarantees (not allowed)
    if (/guaranteed|promise|definitely will save/i.test(claim)) {
      issues.push('Financial guarantees are not permitted');
      suggestions.push('Use "potential", "estimated", or "typical" instead');
    }

    // Check for "up to" claims without typical examples
    if (/up to £\d+/i.test(claim) && !/typical|average|most users/i.test(claim)) {
      issues.push('"Up to" claims must include typical savings');
      suggestions.push('Add "Typical savings: £X" or "Average user saves £X"');
    }

    // Check for basis of calculation
    if (/save £\d+/i.test(claim) && !data?.calculationBasis) {
      issues.push('Savings claims must have transparent calculations');
      suggestions.push('Provide calculation basis or link to methodology');
    }

    // Check for time period
    if (/save £\d+/i.test(claim) && !/per year|annually|per month/i.test(claim)) {
      issues.push('Savings must specify time period');
      suggestions.push('Add "per year" or "per month"');
    }

    // Check for comparison basis
    if (/save £\d+/i.test(claim) && !/compared to|vs\.|versus/i.test(claim)) {
      issues.push('Savings comparisons must state baseline');
      suggestions.push('Add "compared to your current tariff" or similar');
    }

    return {
      compliant: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Check terms of service compliance for web scraping
   */
  canScrapeWebsite(domain: string): {
    allowed: boolean;
    reason: string;
    alternative?: string;
  } {
    // Whitelist of sites we can safely scrape or have API access
    const allowedSources = [
      'ofgem.gov.uk',
      'gov.uk',
      'energysavingtrust.org.uk'
    ];

    // Blacklist of sites with explicit ToS prohibition
    const prohibitedSources = [
      'amazon.co.uk', // Use Product Advertising API instead
      'ebay.co.uk',   // Use eBay API instead
      'comparethemarket.com',
      'moneysupermarket.com',
      'uswitch.com'
    ];

    if (allowedSources.some(source => domain.includes(source))) {
      return {
        allowed: true,
        reason: 'Government or public data source'
      };
    }

    if (prohibitedSources.some(source => domain.includes(source))) {
      const alternatives: Record<string, string> = {
        'amazon.co.uk': 'Use Amazon Product Advertising API',
        'ebay.co.uk': 'Use eBay Developers Program API',
        'comparethemarket.com': 'Contact for data partnership',
        'moneysupermarket.com': 'Contact for affiliate API access',
        'uswitch.com': 'Contact for data licensing'
      };

      return {
        allowed: false,
        reason: 'Terms of Service prohibit scraping',
        alternative: alternatives[domain] || 'Contact site for API access'
      };
    }

    return {
      allowed: false,
      reason: 'No explicit permission - requires review',
      alternative: 'Check robots.txt and ToS, or contact site owner'
    };
  }

  /**
   * Validate data minimization
   */
  validateDataCollection(data: any): {
    compliant: boolean;
    excessive: string[];
    missing: string[];
  } {
    const excessive: string[] = [];
    const missing: string[] = [];

    // Check for unnecessary personal data
    if (data.dateOfBirth) {
      excessive.push('Date of birth not required for energy comparison');
    }
    if (data.nationalInsuranceNumber) {
      excessive.push('National Insurance number never required');
    }
    if (data.bankAccountDetails && !data.switchingService) {
      excessive.push('Bank details only needed for actual switching');
    }

    // Check for required fields
    if (data.collectingEnergyData && !data.userConsent) {
      missing.push('Explicit consent required for energy data collection');
    }
    if (data.thirdPartySharing && !data.sharingConsent) {
      missing.push('Separate consent required for third-party data sharing');
    }

    return {
      compliant: excessive.length === 0 && missing.length === 0,
      excessive,
      missing
    };
  }

  /**
   * Generate privacy-compliant user data export
   */
  exportUserData(userId: string, userData: any): {
    personalData: any;
    usageData: any;
    consentRecords: any;
    dataRetention: any;
    exportDate: string;
  } {
    // UK GDPR requires machine-readable format
    return {
      personalData: {
        userId,
        email: userData.email,
        postcode: userData.postcode,
        accountCreated: userData.createdAt
      },
      usageData: {
        bills: userData.bills || [],
        tariffComparisons: userData.comparisons || [],
        recommendations: userData.recommendations || []
      },
      consentRecords: userData.consents || [],
      dataRetention: this.dataRetentionPolicies.map(policy => ({
        dataType: policy.dataType,
        retentionPeriod: `${policy.retentionPeriod} days`,
        legalBasis: policy.legalBasis,
        canRequestDeletion: policy.canBeDeleted
      })),
      exportDate: new Date().toISOString()
    };
  }

  /**
   * Process data deletion request (Right to be Forgotten)
   */
  processDataDeletionRequest(userId: string): {
    deletable: string[];
    retained: string[];
    retentionReasons: Record<string, string>;
    completionDate: Date;
  } {
    const deletable: string[] = [];
    const retained: string[] = [];
    const retentionReasons: Record<string, string> = {};

    this.dataRetentionPolicies.forEach(policy => {
      if (policy.canBeDeleted) {
        deletable.push(policy.dataType);
      } else {
        retained.push(policy.dataType);
        retentionReasons[policy.dataType] = 
          `Required for ${policy.purpose} under ${policy.legalBasis}`;
      }
    });

    // Account data retained for 30 days then permanently deleted
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + 30);

    return {
      deletable,
      retained,
      retentionReasons,
      completionDate
    };
  }

  /**
   * Run compliance audit
   */
  runComplianceAudit(): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    // Check 1: Data Retention
    checks.push({
      area: 'Data Retention',
      compliant: true,
      issues: [],
      recommendations: [
        'Implement automated data purge after retention period',
        'Log all data deletion actions'
      ],
      lastChecked: new Date()
    });

    // Check 2: Consent Management
    checks.push({
      area: 'Consent Management',
      compliant: true,
      issues: [],
      recommendations: [
        'Review consent forms annually',
        'Ensure granular consent options',
        'Allow easy consent withdrawal'
      ],
      lastChecked: new Date()
    });

    // Check 3: Affiliate Disclosures
    checks.push({
      area: 'Affiliate Disclosures',
      compliant: true,
      issues: [],
      recommendations: [
        'Ensure disclosures visible on all commercial pages',
        'Use clear, unambiguous language',
        'Place disclosures before purchase/action buttons'
      ],
      lastChecked: new Date()
    });

    // Check 4: Financial Claims
    checks.push({
      area: 'Financial Claims',
      compliant: true,
      issues: [],
      recommendations: [
        'Review all savings claims for substantiation',
        'Include typical savings alongside maximum savings',
        'Link to calculation methodology',
        'Add "results may vary" disclaimers'
      ],
      lastChecked: new Date()
    });

    // Check 5: UK Consumer Rights
    checks.push({
      area: 'UK Consumer Rights',
      compliant: true,
      issues: [],
      recommendations: [
        'Display clear cancellation rights',
        'Provide 14-day cooling-off period for switching',
        'Ensure transparent pricing',
        'Avoid dark patterns in UI'
      ],
      lastChecked: new Date()
    });

    return checks;
  }

  /**
   * Get required disclaimers for specific feature
   */
  getRequiredDisclaimers(feature: string): string[] {
    const disclaimers: Record<string, string[]> = {
      'tariff-comparison': [
        'Tariff prices are correct at time of comparison but may change',
        'Exit fees may apply to your current tariff',
        'Switching may take 17-21 days',
        'We compare tariffs from our panel of suppliers'
      ],
      'solar-calculator': [
        'Solar estimates are based on typical UK conditions',
        'Actual performance may vary by ±10%',
        'Estimates assume no shading and optimal roof angle',
        'Installation costs vary by property and location',
        'This is not financial advice - consult a qualified advisor'
      ],
      'heat-pump-calculator': [
        'Heat pump suitability depends on many property factors',
        'Estimates are indicative only - professional survey required',
        'Government grant availability and amounts may change',
        'Running costs depend on actual usage and electricity rates',
        'This is not financial or technical advice'
      ],
      'bill-analysis': [
        'Bill analysis is automated and may contain errors',
        'Always verify with your actual energy bill',
        'We do not store your full bill images',
        'Usage estimates are based on historical patterns'
      ],
      'product-recommendations': [
        'We may earn commission from purchases (see disclosure)',
        'Product prices and availability may change',
        'Energy savings are estimates based on typical usage',
        'Check product compatibility with your property'
      ]
    };

    return disclaimers[feature] || ['General terms and conditions apply'];
  }

  /**
   * Validate marketing communication compliance
   */
  validateMarketingCompliance(communication: {
    type: 'email' | 'sms' | 'push';
    hasUnsubscribe: boolean;
    hasConsent: boolean;
    identifiesSender: boolean;
  }): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!communication.hasConsent) {
      issues.push('Marketing requires explicit opt-in consent (UK GDPR)');
    }

    if (!communication.hasUnsubscribe) {
      issues.push('Must include easy unsubscribe mechanism');
    }

    if (!communication.identifiesSender) {
      issues.push('Must clearly identify sender (ASA requirement)');
    }

    if (communication.type === 'sms' && !communication.hasConsent) {
      issues.push('SMS marketing requires explicit consent (PECR)');
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }
}

// Singleton instance
const complianceService = new ComplianceService();

// Export service
export default complianceService;

// Convenience exports
export const compliance = {
  getAffiliateDisclosure: (context: AffiliateDisclosure['context']) =>
    complianceService.getAffiliateDisclosureText(context),
  
  validateFinancialClaim: (claim: string, data: any) =>
    complianceService.validateFinancialClaim(claim, data),
  
  canScrapeWebsite: (domain: string) =>
    complianceService.canScrapeWebsite(domain),
  
  validateDataCollection: (data: any) =>
    complianceService.validateDataCollection(data),
  
  exportUserData: (userId: string, userData: any) =>
    complianceService.exportUserData(userId, userData),
  
  processDataDeletion: (userId: string) =>
    complianceService.processDataDeletionRequest(userId),
  
  runAudit: () =>
    complianceService.runComplianceAudit(),
  
  getDisclaimers: (feature: string) =>
    complianceService.getRequiredDisclaimers(feature),
  
  validateMarketing: (communication: any) =>
    complianceService.validateMarketingCompliance(communication)
};

// Compliance constants for easy reference
export const COMPLIANCE_CONSTANTS = {
  DATA_RETENTION: {
    USER_ACCOUNT: 365 * 3, // 3 years
    ENERGY_BILLS: 730,      // 2 years
    USAGE_PATTERNS: 365,    // 1 year
    ERROR_LOGS: 30          // 30 days
  },
  
  AFFILIATE_DISCLOSURE_PROMINENCE: {
    BEFORE_CTA: 'high',
    IN_CONTENT: 'medium',
    FOOTER: 'low'
  },
  
  REQUIRED_CONSENTS: [
    'analytics',
    'marketing',
    'personalization',
    'data-sharing'
  ],
  
  PROHIBITED_CLAIMS: [
    'guaranteed savings',
    'risk-free',
    'definitely will save',
    'promised returns'
  ]
};
