/**
 * ACCOUNT & PROFILE TYPES
 * 
 * Type definitions for user account, profile, settings, and GDPR compliance
 */

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UserProfile {
  userId: string;
  postcode: string;
  homeType: 'flat' | 'terraced' | 'semi-detached' | 'detached';
  occupants: number;
  heatingType: 'gas' | 'electricity' | 'heat-pump' | 'mixed';
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postcode: string;
  };
  
  // Energy details
  supplier?: string;
  tariffName?: string;
  tariffType?: 'fixed' | 'variable' | 'tracker';
  dayRate?: number; // pence per kWh
  nightRate?: number; // pence per kWh (if applicable)
  standingCharge?: number; // pence per day
  paymentMethod?: 'direct-debit' | 'prepayment' | 'standard-credit';
  smartMeterType?: 'SMETS1' | 'SMETS2' | 'traditional' | 'none';
  
  // Usage
  estimatedAnnualUsage?: number; // kWh
  hasElectricVehicle?: boolean;
  hasSolarPanels?: boolean;
  hasHeatPump?: boolean;
  
  // Metadata
  profileCompleteness: number; // 0-100%
  lastUpdated: Date;
  dataSource: Record<string, 'manual' | 'bill' | 'photo' | 'onboarding'>;
}

export interface UserSettings {
  userId: string;
  
  // Notifications
  notifications: {
    monthlyUsageSummary: boolean;
    costAlerts: boolean;
    newCheapestTariff: boolean;
    winterHeatingAdvice: boolean;
    overconsumptionAlert: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  
  // Privacy
  privacy: {
    dataRetentionDays: number; // 0 = indefinite, or 30/90/365
    allowAnonymousAnalytics: boolean;
    deletePhotosAfterExtraction: boolean;
    shareDataForResearch: boolean;
  };
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    currency: 'GBP';
    units: 'metric' | 'imperial';
    language: 'en-GB';
  };
}

export interface SubscriptionTier {
  tier: 'free' | 'premium' | 'pro';
  name: string;
  price: number; // pence per month
  features: string[];
  limits: {
    photoUploads: number; // per month, -1 = unlimited
    comparisons: number; // per month, -1 = unlimited
    insights: boolean;
    prioritySupport: boolean;
    customAlerts: boolean;
  };
}

export interface UserSubscription {
  userId: string;
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  renewalDate?: Date;
  cancelledAt?: Date;
  paymentMethod?: string;
}

export interface ReferralProgram {
  userId: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  earnedRewards: {
    type: 'premium-month' | 'credit' | 'feature-unlock';
    amount: number;
    earnedAt: Date;
  }[];
  totalCredits: number; // pence
}

export interface UploadHistory {
  id: string;
  userId: string;
  uploadDate: Date;
  fileType: 'photo' | 'bill-pdf' | 'bill-image';
  photoType?: string;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedValues: {
    field: string;
    value: any;
    confidence: number;
  }[];
  userConfirmed: boolean;
  confirmationDate?: Date;
  deleted: boolean;
  deletedAt?: Date;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  format: 'json' | 'csv' | 'pdf';
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestDate: Date;
  scheduledDate: Date; // 30 days after request per GDPR
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scope: 'profile' | 'photos' | 'all';
  confirmationToken: string;
}

export interface ConsentRecord {
  userId: string;
  consentType: 'data-processing' | 'photo-analysis' | 'marketing' | 'analytics';
  granted: boolean;
  grantedAt: Date;
  revokedAt?: Date;
  version: string; // Terms version
}

export interface AuditLog {
  id: string;
  userId: string;
  action: 'profile-update' | 'data-access' | 'data-export' | 'data-deletion' | 'consent-change' | 'photo-upload' | 'photo-deletion';
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Conversational editing types
export interface ProfileEditSession {
  userId: string;
  field: keyof UserProfile;
  currentValue: any;
  newValue?: any;
  started: Date;
  completed: boolean;
  cancelled: boolean;
}

export interface EditableField {
  key: string;
  label: string;
  category: 'personal' | 'energy' | 'household';
  type: 'text' | 'select' | 'number' | 'postcode' | 'email' | 'phone';
  required: boolean;
  gdprSensitive: boolean;
  extractableFrom: Array<'bill' | 'photo' | 'onboarding'>;
  conversationalPrompt: {
    question: string;
    secondaryText?: string;
    skipText?: string;
  };
  options?: Array<{
    value: string;
    label: string;
    icon?: string;
    description?: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidation?: string;
  };
}

// Legal compliance types
export interface GDPRCompliance {
  userId: string;
  dataMinimisation: {
    onlyEssentialData: boolean;
    justification: Record<string, string>;
  };
  lawfulBasis: {
    type: 'consent' | 'contract' | 'legitimate-interest';
    description: string;
  };
  retentionPolicy: {
    photos: number; // days
    extractedData: number; // days
    accountData: number; // days after deletion request
  };
  userRights: {
    canAccess: boolean;
    canCorrect: boolean;
    canDelete: boolean;
    canExport: boolean;
    canObjectToProcessing: boolean;
  };
  lastReviewed: Date;
}

export interface LegalDisclaimer {
  type: 'savings-estimate' | 'tariff-comparison' | 'usage-prediction' | 'general';
  text: string;
  version: string;
  mandatory: boolean;
  userAcknowledged: boolean;
  acknowledgedAt?: Date;
}
