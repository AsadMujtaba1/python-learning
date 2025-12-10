/**
 * MOCK USER JOURNEYS FOR TESTING
 * 
 * Simulates different user personas to test app flow and UX
 * Tests if the app is intuitive or too complex/time-consuming
 */

import { UserProfile } from './userProfile';
import { BillData } from './billOCR';

/**
 * User Personas for Testing
 */
export const MOCK_USERS = {
  // Persona 1: Busy Parent - Wants quick wins, no time to waste
  busyParent: {
    profile: {
      uid: 'mock-user-1',
      email: 'sarah.jones@example.com',
      displayName: 'Sarah Jones',
      homeType: 'semi',
      occupants: 4,
      hasGas: true,
      hasElectricity: true,
      hasSolar: false,
      postcode: 'M1 1AA',
      monthlyBudget: 250,
      savingsGoal: 50,
      isPremium: false,
      createdAt: new Date('2024-12-01'),
      lastLoginAt: new Date(),
    } as any,
    
    billData: {
      supplier: 'British Gas',
      accountNumber: '123456789',
      billingPeriod: { from: '01/11/2024', to: '30/11/2024' },
      electricityUsage: { kwh: 350, rate: 24.5, cost: 85.75 },
      gasUsage: { kwh: 1200, rate: 6.04, cost: 72.48 },
      standingCharge: { electricity: 0.60, gas: 0.30 },
      totalCost: 185.23,
      extractionDate: new Date().toISOString(),
      confidence: 'high' as const,
    } as BillData,
    
    expectations: {
      maxTimeToValue: '2 minutes', // How fast they want results
      primaryGoal: 'Quick savings tips',
      frustrations: [
        'Too many clicks to see savings',
        'Complex jargon',
        'Needing to sign up before seeing value',
      ],
      idealFlow: [
        '1. Upload bill (30 seconds)',
        '2. See immediate savings (instant)',
        '3. Get 3 actionable tips (10 seconds to read)',
        '4. Total time: < 2 minutes',
      ],
    },
  },

  // Persona 2: Tech-Savvy Student - Wants data, analytics, optimization
  techStudent: {
    profile: {
      uid: 'mock-user-2',
      email: 'alex.tech@example.com',
      displayName: 'Alex Chen',
      homeType: 'flat',
      occupants: 1,
      hasGas: false,
      hasElectricity: true,
      hasSolar: false,
      postcode: 'E1 6AN',
      monthlyBudget: 80,
      savingsGoal: 20,
      isPremium: true,
      premiumSince: new Date('2024-11-15'),
      createdAt: new Date('2024-11-15'),
      lastLoginAt: new Date(),
    } as any,
    
    billData: {
      supplier: 'Octopus Energy',
      accountNumber: '987654321',
      billingPeriod: { from: '15/11/2024', to: '14/12/2024' },
      electricityUsage: { kwh: 180, rate: 22.5, cost: 40.50 },
      standingCharge: { electricity: 0.48 },
      totalCost: 54.90,
      extractionDate: new Date().toISOString(),
      confidence: 'high' as const,
    } as BillData,
    
    expectations: {
      maxTimeToValue: '5-10 minutes',
      primaryGoal: 'Deep analytics and optimization',
      frustrations: [
        'Not enough data visualization',
        'Missing advanced features',
        'Can\'t export data',
      ],
      idealFlow: [
        '1. Upload bill',
        '2. See detailed breakdown with charts',
        '3. Compare with similar households',
        '4. Get personalized recommendations',
        '5. Track over time',
      ],
    },
  },

  // Persona 3: Elderly User - Needs simplicity, clear instructions
  elderlyUser: {
    profile: {
      uid: 'mock-user-3',
      email: 'mary.smith@example.com',
      displayName: 'Mary Smith',
      homeType: 'detached',
      occupants: 2,
      hasGas: true,
      hasElectricity: true,
      hasSolar: false,
      postcode: 'BS1 1AA',
      monthlyBudget: 200,
      savingsGoal: 30,
      isPremium: false,
      createdAt: new Date('2024-12-05'),
      lastLoginAt: new Date(),
    } as any,
    
    billData: {
      supplier: 'EDF Energy',
      accountNumber: '555666777',
      billingPeriod: { from: '01/11/2024', to: '30/11/2024' },
      electricityUsage: { kwh: 400, rate: 25.0, cost: 100.00 },
      gasUsage: { kwh: 1500, rate: 6.20, cost: 93.00 },
      standingCharge: { electricity: 0.65, gas: 0.35 },
      totalCost: 223.00,
      extractionDate: new Date().toISOString(),
      confidence: 'medium' as const,
    } as BillData,
    
    expectations: {
      maxTimeToValue: '3 minutes',
      primaryGoal: 'Understand bill and get simple tips',
      frustrations: [
        'Small text',
        'Too many options/buttons',
        'Technical language',
        'Hidden features',
      ],
      idealFlow: [
        '1. Large "Start Here" button',
        '2. Step-by-step wizard',
        '3. Plain English explanations',
        '4. One clear action at a time',
      ],
    },
  },

  // Persona 4: Price-Conscious Renter - Wants immediate savings, no commitment
  renter: {
    profile: {
      uid: 'mock-user-4',
      email: 'james.wilson@example.com',
      displayName: 'James Wilson',
      homeType: 'flat',
      occupants: 2,
      hasGas: true,
      hasElectricity: true,
      hasSolar: false,
      postcode: 'G1 1AA',
      monthlyBudget: 120,
      savingsGoal: 40,
      isPremium: false,
      createdAt: new Date('2024-12-06'),
      lastLoginAt: new Date(),
    } as any,
    
    billData: {
      supplier: 'OVO Energy',
      accountNumber: '111222333',
      billingPeriod: { from: '01/12/2024', to: '07/12/2024' },
      electricityUsage: { kwh: 85, rate: 24.0, cost: 20.40 },
      gasUsage: { kwh: 280, rate: 6.00, cost: 16.80 },
      standingCharge: { electricity: 0.55, gas: 0.28 },
      totalCost: 43.01,
      extractionDate: new Date().toISOString(),
      confidence: 'high' as const,
    } as BillData,
    
    expectations: {
      maxTimeToValue: '1 minute',
      primaryGoal: 'Find cheaper tariff ASAP',
      frustrations: [
        'Having to create account',
        'Asking for too much info',
        'Not showing savings upfront',
        'Pushy premium upsells',
      ],
      idealFlow: [
        '1. Upload bill (no signup)',
        '2. See cheaper tariffs immediately',
        '3. Click to switch',
        '4. Done in 1 minute',
      ],
    },
  },
};

/**
 * User Journey Test Results
 * Evaluates current app flow against user expectations
 */
export const JOURNEY_ANALYSIS = {
  
  // Test 1: Homepage to First Value
  homepageToValue: {
    currentSteps: [
      '1. Land on homepage (instant)',
      '2. Read hero section (5-10s)',
      '3. Scroll to upload widget (3s)',
      '4. Upload bill (10-30s depending on PDF/image)',
      '5. Wait for extraction (5-20s for OCR)',
      '6. See results (instant)',
      'TOTAL: 23-63 seconds',
    ],
    
    issues: [
      '⚠️ OCR extraction takes 5-20s (feels slow)',
      '⚠️ Too much content before upload widget',
      '⚠️ No progress indicator during upload',
      '✅ No signup required (good!)',
      '✅ Immediate results after extraction',
    ],
    
    improvements: [
      'Move bill upload widget higher',
      'Add progress bar during OCR',
      'Pre-load Tesseract.js worker',
      'Show "Processing..." with tips while waiting',
    ],
  },

  // Test 2: Bill Upload to Actionable Insight
  uploadToInsight: {
    currentSteps: [
      '1. Upload bill',
      '2. Extract data',
      '3. See basic stats (supplier, usage, cost)',
      '4. Click "Compare Tariffs"',
      '5. Wait for page load (2-3s)',
      '6. See recommendations',
      'TOTAL: ~30-45 seconds',
    ],
    
    issues: [
      '⚠️ Results don\'t show immediate savings estimate',
      '⚠️ Have to click through to see tariff comparison',
      '⚠️ No quick win tips on results screen',
      '✅ Data extraction works well',
    ],
    
    improvements: [
      'Show savings estimate on upload results',
      'Add "Quick Wins" section to results',
      'Inline tariff preview (top 3)',
      'Pre-calculate savings before user clicks',
    ],
  },

  // Test 3: Dashboard Complexity
  dashboardUsability: {
    currentComponents: [
      'Welcome Tour',
      'Quick Actions',
      'Bill Upload',
      'Energy Breakdown',
      'Savings Tips',
      'Product Recommendations',
      'AI Insights',
      'Charts/Graphs',
      'News Feed',
      'Profile Settings',
    ],
    
    issues: [
      '⚠️ Too many components for first-time users',
      '⚠️ No clear "Start Here" flow',
      '⚠️ Important actions buried in sidebar',
      '⚠️ Premium features not clearly marked',
      '✅ Welcome tour helps (if users don\'t skip it)',
    ],
    
    improvements: [
      'Progressive disclosure - show 3-4 key things first',
      'Clear primary CTA button',
      'Collapse/hide advanced features initially',
      'Add "Getting Started" checklist',
    ],
  },

  // Test 4: Information Overload
  cognitiveLoad: {
    homepageElements: 15, // Hero, upload, features, blog, news, testimonials, etc.
    dashboardElements: 20, // All widgets and components
    averageDecisionPoints: 8, // Number of choices user faces
    
    recommendation: 'HIGH COGNITIVE LOAD',
    
    issues: [
      '🔴 Too much content on homepage',
      '🔴 Dashboard overwhelming for new users',
      '🔴 Multiple competing CTAs',
      '⚠️ Too many navigation options',
      '✅ Visual hierarchy is good',
    ],
    
    improvements: [
      'Simplify homepage - focus on ONE primary action',
      'Use tabs/accordion on dashboard',
      'Show 3 things max at a time',
      'Add "Simple Mode" toggle',
    ],
  },

  // Test 5: Time to Complete Key Tasks
  timeToComplete: {
    tasks: {
      'Upload first bill': {
        current: '30-60s',
        ideal: '20-30s',
        status: '⚠️ ACCEPTABLE',
      },
      'See savings recommendation': {
        current: '45-90s',
        ideal: '30s',
        status: '🔴 TOO SLOW',
      },
      'Compare tariffs': {
        current: '60-120s',
        ideal: '45s',
        status: '⚠️ ACCEPTABLE',
      },
      'Find energy-efficient product': {
        current: '30-60s',
        ideal: '20s',
        status: '✅ GOOD',
      },
      'Complete onboarding': {
        current: '3-5 minutes',
        ideal: '2 minutes',
        status: '⚠️ TOO LONG',
      },
    },
  },
};

/**
 * Recommended UX Improvements (Priority Order)
 */
export const PRIORITY_IMPROVEMENTS = [
  {
    priority: 'HIGH',
    issue: 'OCR extraction too slow (5-20s)',
    impact: 'Users abandon during wait',
    solution: [
      'Pre-load Tesseract.js worker on homepage',
      'Show engaging progress messages',
      'Display money-saving tips while waiting',
      'Add "Why it takes a moment" explanation',
    ],
    effort: 'Low',
    estimatedTime: '1 hour',
  },
  
  {
    priority: 'HIGH',
    issue: 'No immediate savings shown after upload',
    impact: 'Users don\'t see value quickly',
    solution: [
      'Calculate estimated savings immediately',
      'Show "You could save £X/year" prominently',
      'Display top 3 quick win tips on results',
      'Add visual progress indicator',
    ],
    effort: 'Medium',
    estimatedTime: '2 hours',
  },
  
  {
    priority: 'HIGH',
    issue: 'Homepage too busy/overwhelming',
    impact: 'Users don\'t know where to start',
    solution: [
      'Simplify to: Hero + Upload + 3 Features only',
      'Move blog/news to separate pages',
      'Single prominent CTA',
      'Lazy load below-fold content',
    ],
    effort: 'Medium',
    estimatedTime: '2 hours',
  },
  
  {
    priority: 'MEDIUM',
    issue: 'Tariff comparison requires page navigation',
    impact: 'Extra clicks, slower flow',
    solution: [
      'Show top 3 tariffs inline on results',
      'Add "See More" to expand full list',
      'Pre-fetch tariff data during upload',
      'Modal overlay instead of new page',
    ],
    effort: 'Medium',
    estimatedTime: '3 hours',
  },
  
  {
    priority: 'MEDIUM',
    issue: 'Dashboard has too many components',
    impact: 'Cognitive overload, confusion',
    solution: [
      'Add progressive disclosure',
      'Show only 4 widgets initially',
      'Add "Show More" sections',
      'Create "Simple View" toggle',
    ],
    effort: 'High',
    estimatedTime: '4 hours',
  },
  
  {
    priority: 'LOW',
    issue: 'Onboarding takes 3-5 minutes',
    impact: 'Users skip it',
    solution: [
      'Make onboarding optional',
      'Collect info progressively',
      'Allow "Skip for now" on all steps',
      'Save partial progress',
    ],
    effort: 'Medium',
    estimatedTime: '2 hours',
  },
];

/**
 * A/B Test Recommendations
 */
export const AB_TEST_IDEAS = [
  {
    test: 'Homepage Simplification',
    variant_a: 'Current (15+ elements)',
    variant_b: 'Minimal (Hero + Upload + 3 features only)',
    hypothesis: 'Simpler homepage will increase upload rate by 30%',
    metrics: ['Upload rate', 'Time to first upload', 'Bounce rate'],
  },
  
  {
    test: 'Results Page Inline Tariffs',
    variant_a: 'Button to tariff page',
    variant_b: 'Top 3 tariffs shown inline',
    hypothesis: 'Inline tariffs will increase comparison rate by 50%',
    metrics: ['Tariff comparison rate', 'Time to compare', 'Conversion'],
  },
  
  {
    test: 'Upload Button Position',
    variant_a: 'Below hero section',
    variant_b: 'In hero section (above fold)',
    hypothesis: 'Above-fold upload will increase conversion by 40%',
    metrics: ['Upload rate', 'Scroll depth', 'Time to upload'],
  },
];

/**
 * Summary Report
 */
export const UX_SUMMARY = {
  overallAssessment: '⚠️ GOOD FOUNDATION, NEEDS SIMPLIFICATION',
  
  strengths: [
    '✅ Clean, modern design',
    '✅ Clear value proposition',
    '✅ No forced signup',
    '✅ Privacy-focused',
    '✅ Comprehensive features',
  ],
  
  weaknesses: [
    '🔴 Information overload',
    '🔴 Too many steps to value',
    '⚠️ OCR wait time feels long',
    '⚠️ Dashboard complexity',
    '⚠️ Too many navigation options',
  ],
  
  targetUsers: {
    busyParent: {
      currentExperience: '6/10',
      issues: ['Too much to read', 'Slow extraction'],
      improvements: 'Simplify, speed up',
    },
    techStudent: {
      currentExperience: '8/10',
      issues: ['Missing data export', 'Limited analytics'],
      improvements: 'Add premium features',
    },
    elderlyUser: {
      currentExperience: '5/10',
      issues: ['Too complex', 'Small text', 'Overwhelming'],
      improvements: 'Add simple mode',
    },
    renter: {
      currentExperience: '7/10',
      issues: ['Extra clicks to savings', 'Slow initial flow'],
      improvements: 'Inline results',
    },
  },
  
  recommendation: 'Implement HIGH priority improvements first. Focus on speed and simplicity.',
};

