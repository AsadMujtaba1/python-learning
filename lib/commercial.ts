/**
 * COMMERCIAL FOUNDATIONS
 * 
 * Infrastructure for monetization:
 * - Affiliate link management
 * - Commission tracking
 * - Partner integrations
 * - Offer management
 * - Conversion tracking
 * 
 * @module lib/commercial
 */

import { analytics, trackAffiliateClick } from './analytics';

// ============================================================================
// TYPES
// ============================================================================

export interface AffiliateLink {
  id: string;
  provider: string;
  productType: 'energy' | 'broadband' | 'insurance' | 'travel' | 'subscription';
  url: string;
  commissionRate?: number;
  trackingParams?: Record<string, string>;
}

export interface Offer {
  id: string;
  provider: string;
  productType: string;
  title: string;
  description: string;
  savingsAmount: number;
  features: string[];
  affiliateLink?: AffiliateLink;
  cta: string;
  displayPriority: number;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  productTypes: string[];
  commissionStructure: {
    type: 'cpa' | 'cps' | 'hybrid';
    value: number;
  };
  apiEndpoint?: string;
  apiKey?: string;
}

// ============================================================================
// AFFILIATE LINK GENERATOR
// ============================================================================

export class AffiliateLinkManager {
  private partners: Map<string, Partner> = new Map();
  
  /**
   * Register a partner
   */
  registerPartner(partner: Partner) {
    this.partners.set(partner.id, partner);
  }
  
  /**
   * Generate affiliate link with tracking parameters
   */
  generateLink(
    partnerId: string,
    productType: string,
    userId?: string
  ): string {
    const partner = this.partners.get(partnerId);
    if (!partner) {
      console.error(`Partner ${partnerId} not found`);
      return '#';
    }
    
    // Base URL would come from partner config
    const baseUrl = partner.apiEndpoint || `https://partner.com/${partnerId}`;
    
    // Add tracking parameters
    const params = new URLSearchParams({
      source: 'cost-saver-app',
      product: productType,
      ref: userId || 'anonymous',
      timestamp: Date.now().toString(),
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  /**
   * Track affiliate click
   */
  trackClick(link: AffiliateLink, userId?: string) {
    trackAffiliateClick(
      link.provider,
      link.productType,
      link.commissionRate
    );
    
    // Store in localStorage for attribution
    if (typeof window !== 'undefined') {
      try {
        const clicks = JSON.parse(localStorage.getItem('affiliate_clicks') || '[]');
        clicks.push({
          linkId: link.id,
          provider: link.provider,
          productType: link.productType,
          timestamp: Date.now(),
          userId,
        });
        
        // Keep last 50 clicks
        localStorage.setItem('affiliate_clicks', JSON.stringify(clicks.slice(-50)));
      } catch (error) {
        console.warn('Failed to store affiliate click:', error);
      }
    }
  }
}

export const affiliateLinkManager = new AffiliateLinkManager();

// ============================================================================
// OFFER ENGINE
// ============================================================================

export class OfferEngine {
  private offers: Offer[] = [];
  
  /**
   * Add offer to the system
   */
  addOffer(offer: Offer) {
    this.offers.push(offer);
    this.offers.sort((a, b) => b.displayPriority - a.displayPriority);
  }
  
  /**
   * Get relevant offers for user
   */
  getOffers(productType?: string, userProfile?: any): Offer[] {
    let filtered = this.offers;
    
    if (productType) {
      filtered = filtered.filter(o => o.productType === productType);
    }
    
    // TODO: Add personalization based on user profile
    
    return filtered.slice(0, 5); // Return top 5 offers
  }
  
  /**
   * Get offer by ID
   */
  getOffer(id: string): Offer | undefined {
    return this.offers.find(o => o.id === id);
  }
}

export const offerEngine = new OfferEngine();

// ============================================================================
// COMMISSION TRACKING
// ============================================================================

export class CommissionTracker {
  /**
   * Track potential commission
   */
  trackPotentialCommission(
    partnerId: string,
    amount: number,
    productType: string
  ) {
    analytics.track('affiliate_link_clicked', {
      partnerId,
      potentialCommission: amount,
      productType,
    });
  }
  
  /**
   * Track confirmed commission (would be called from webhook)
   */
  trackConfirmedCommission(
    partnerId: string,
    amount: number,
    orderId: string
  ) {
    analytics.conversion('commission_confirmed', amount);
    
    // Store in database
    if (typeof window !== 'undefined') {
      try {
        const commissions = JSON.parse(localStorage.getItem('commissions') || '[]');
        commissions.push({
          partnerId,
          amount,
          orderId,
          timestamp: Date.now(),
          status: 'confirmed',
        });
        localStorage.setItem('commissions', JSON.stringify(commissions));
      } catch (error) {
        console.warn('Failed to store commission:', error);
      }
    }
  }
}

export const commissionTracker = new CommissionTracker();

// ============================================================================
// PARTNER API CLIENT
// ============================================================================

export class PartnerAPIClient {
  /**
   * Fetch offers from partner API
   */
  async fetchOffers(partnerId: string, userLocation?: string): Promise<Offer[]> {
    try {
      const response = await fetch(`/api/partners/${partnerId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: userLocation }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch partner offers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Partner API error:', error);
      return [];
    }
  }
  
  /**
   * Track conversion with partner
   */
  async notifyConversion(partnerId: string, conversionData: any) {
    try {
      await fetch(`/api/partners/${partnerId}/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversionData),
      });
    } catch (error) {
      console.error('Failed to notify partner:', error);
    }
  }
}

export const partnerAPIClient = new PartnerAPIClient();

// ============================================================================
// EXAMPLE PARTNERS & OFFERS (PLACEHOLDERS)
// ============================================================================

// Register example partners
affiliateLinkManager.registerPartner({
  id: 'octopus-energy',
  name: 'Octopus Energy',
  logo: '/partners/octopus.svg',
  productTypes: ['energy'],
  commissionStructure: {
    type: 'cpa',
    value: 50, // £50 per sign-up
  },
});

affiliateLinkManager.registerPartner({
  id: 'uswitch',
  name: 'Uswitch',
  logo: '/partners/uswitch.svg',
  productTypes: ['energy', 'broadband', 'insurance'],
  commissionStructure: {
    type: 'cpa',
    value: 30,
  },
});

// Add example offers
offerEngine.addOffer({
  id: 'offer-001',
  provider: 'Octopus Energy',
  productType: 'energy',
  title: 'Save up to £300/year on energy',
  description: '100% renewable energy with no exit fees',
  savingsAmount: 300,
  features: [
    '100% renewable energy',
    'No exit fees',
    '24/7 customer support',
    'Smart meter included',
  ],
  cta: 'Switch Now',
  displayPriority: 10,
});

offerEngine.addOffer({
  id: 'offer-002',
  provider: 'British Gas',
  productType: 'energy',
  title: 'Save £250 with smart tariff',
  description: 'Intelligent pricing based on your usage',
  savingsAmount: 250,
  features: [
    'Smart tariff pricing',
    'Free smart meter',
    'Mobile app control',
    'Boiler cover available',
  ],
  cta: 'Get Quote',
  displayPriority: 8,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate affiliate link with click tracking
 */
export function getTrackedAffiliateLink(
  partnerId: string,
  productType: string,
  userId?: string
): string {
  const link = affiliateLinkManager.generateLink(partnerId, productType, userId);
  
  // Return link with click handler
  return link;
}

/**
 * Handle affiliate link click
 */
export function handleAffiliateLinkClick(
  link: AffiliateLink,
  userId?: string
) {
  affiliateLinkManager.trackClick(link, userId);
}

/**
 * Get personalized offers
 */
export function getPersonalizedOffers(
  productType: string,
  userSavings: number
): Offer[] {
  const offers = offerEngine.getOffers(productType);
  
  // Sort by relevance (savings amount similar to user's potential)
  return offers.sort((a, b) => {
    const aDiff = Math.abs(a.savingsAmount - userSavings);
    const bDiff = Math.abs(b.savingsAmount - userSavings);
    return aDiff - bDiff;
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  affiliateLinkManager,
  offerEngine,
  commissionTracker,
  partnerAPIClient,
  getTrackedAffiliateLink,
  handleAffiliateLinkClick,
  getPersonalizedOffers,
};
