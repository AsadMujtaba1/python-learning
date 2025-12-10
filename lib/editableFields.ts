/**
 * EDITABLE FIELDS CONFIGURATION
 * 
 * Defines all editable profile fields with conversational prompts
 * and GDPR compliance metadata
 */

import { EditableField } from './types/accountTypes';

export const EDITABLE_FIELDS: EditableField[] = [
  // Personal Information
  {
    key: 'name',
    label: 'Name',
    category: 'personal',
    type: 'text',
    required: true,
    gdprSensitive: true,
    extractableFrom: [],
    conversationalPrompt: {
      question: "What would you like us to call you?",
      secondaryText: "We'll use this to personalise your experience.",
      skipText: "Keep current name",
    },
  },
  {
    key: 'email',
    label: 'Email Address',
    category: 'personal',
    type: 'email',
    required: true,
    gdprSensitive: true,
    extractableFrom: [],
    conversationalPrompt: {
      question: "What's your email address?",
      secondaryText: "We'll use this for important account updates.",
    },
    validation: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
  },
  {
    key: 'phone',
    label: 'Phone Number',
    category: 'personal',
    type: 'phone',
    required: false,
    gdprSensitive: true,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "Want to add your phone number?",
      secondaryText: "Optional — we can send usage alerts via SMS.",
      skipText: "Skip for now",
    },
  },
  {
    key: 'postcode',
    label: 'Postcode',
    category: 'household',
    type: 'postcode',
    required: true,
    gdprSensitive: true,
    extractableFrom: ['bill', 'onboarding'],
    conversationalPrompt: {
      question: "What's your postcode?",
      secondaryText: "We use this for regional pricing and weather data.",
    },
    validation: {
      pattern: '^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$',
    },
  },

  // Household Information
  {
    key: 'homeType',
    label: 'Home Type',
    category: 'household',
    type: 'select',
    required: true,
    gdprSensitive: false,
    extractableFrom: ['onboarding'],
    conversationalPrompt: {
      question: "What type of home do you live in?",
      secondaryText: "This helps us estimate your energy usage.",
    },
    options: [
      { value: 'flat', label: 'Flat', icon: '🏢', description: 'Apartment or flat' },
      { value: 'terraced', label: 'Terraced', icon: '🏘️', description: 'Attached on both sides' },
      { value: 'semi-detached', label: 'Semi-Detached', icon: '🏠', description: 'Attached on one side' },
      { value: 'detached', label: 'Detached', icon: '🏡', description: 'Standalone house' },
    ],
  },
  {
    key: 'occupants',
    label: 'Number of Occupants',
    category: 'household',
    type: 'number',
    required: true,
    gdprSensitive: false,
    extractableFrom: ['onboarding'],
    conversationalPrompt: {
      question: "How many people live in your home?",
      secondaryText: "More people typically means higher usage.",
    },
    validation: {
      min: 1,
      max: 20,
    },
  },
  {
    key: 'heatingType',
    label: 'Heating Type',
    category: 'household',
    type: 'select',
    required: true,
    gdprSensitive: false,
    extractableFrom: ['bill', 'onboarding'],
    conversationalPrompt: {
      question: "What type of heating do you have?",
      secondaryText: "Different heating systems have different costs.",
    },
    options: [
      { value: 'gas', label: 'Gas', icon: '🔥', description: 'Gas boiler' },
      { value: 'electricity', label: 'Electric', icon: '⚡', description: 'Electric heating' },
      { value: 'heat-pump', label: 'Heat Pump', icon: '♨️', description: 'Air/ground source' },
      { value: 'mixed', label: 'Mixed', icon: '🔄', description: 'Gas + electric' },
    ],
  },

  // Energy Details
  {
    key: 'supplier',
    label: 'Energy Supplier',
    category: 'energy',
    type: 'select',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill', 'photo'],
    conversationalPrompt: {
      question: "Who's your energy supplier?",
      secondaryText: "We can find better deals for you.",
      skipText: "I'll add this later",
    },
    options: [
      { value: 'octopus', label: 'Octopus Energy', icon: '🐙' },
      { value: 'british-gas', label: 'British Gas', icon: '🔥' },
      { value: 'edf', label: 'EDF Energy', icon: '⚡' },
      { value: 'eon', label: 'E.ON', icon: '💡' },
      { value: 'scottish-power', label: 'Scottish Power', icon: '⚡' },
      { value: 'ovo', label: 'OVO Energy', icon: '🌟' },
      { value: 'bulb', label: 'Bulb', icon: '💡' },
      { value: 'shell', label: 'Shell Energy', icon: '🐚' },
      { value: 'other', label: 'Other', icon: '📋' },
    ],
  },
  {
    key: 'tariffName',
    label: 'Tariff Name',
    category: 'energy',
    type: 'text',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "What's your tariff called?",
      secondaryText: "e.g., 'Flexible Octopus' or 'Fixed 12 Month'",
      skipText: "I'm not sure",
    },
  },
  {
    key: 'dayRate',
    label: 'Day Rate (p/kWh)',
    category: 'energy',
    type: 'number',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "What's your unit rate?",
      secondaryText: "Check your bill — it's in pence per kWh.",
      skipText: "Skip for now",
    },
    validation: {
      min: 1,
      max: 100,
    },
  },
  {
    key: 'nightRate',
    label: 'Night Rate (p/kWh)',
    category: 'energy',
    type: 'number',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "Do you have a cheaper night rate?",
      secondaryText: "Some tariffs have Economy 7 or similar.",
      skipText: "No night rate",
    },
    validation: {
      min: 1,
      max: 100,
    },
  },
  {
    key: 'standingCharge',
    label: 'Standing Charge (p/day)',
    category: 'energy',
    type: 'number',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "What's your daily standing charge?",
      secondaryText: "This is the fixed daily fee on your bill.",
      skipText: "Skip for now",
    },
    validation: {
      min: 0,
      max: 200,
    },
  },
  {
    key: 'paymentMethod',
    label: 'Payment Method',
    category: 'energy',
    type: 'select',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill'],
    conversationalPrompt: {
      question: "How do you pay for energy?",
      secondaryText: "Different payment methods have different rates.",
      skipText: "Skip this",
    },
    options: [
      { value: 'direct-debit', label: 'Direct Debit', icon: '💳', description: 'Usually cheapest' },
      { value: 'prepayment', label: 'Prepayment Meter', icon: '🔑', description: 'Pay as you go' },
      { value: 'standard-credit', label: 'Standard Credit', icon: '💷', description: 'Pay after use' },
    ],
  },
  {
    key: 'smartMeterType',
    label: 'Smart Meter Type',
    category: 'energy',
    type: 'select',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['photo'],
    conversationalPrompt: {
      question: "What type of meter do you have?",
      secondaryText: "We can give you better insights with smart meter data.",
      skipText: "Not sure",
    },
    options: [
      { value: 'SMETS2', label: 'SMETS2', icon: '📱', description: 'Latest smart meter' },
      { value: 'SMETS1', label: 'SMETS1', icon: '📲', description: 'Older smart meter' },
      { value: 'traditional', label: 'Traditional Meter', icon: '🔢', description: 'Standard meter' },
      { value: 'none', label: 'No Meter Access', icon: '❌', description: "Can't access meter" },
    ],
  },
  {
    key: 'estimatedAnnualUsage',
    label: 'Estimated Annual Usage (kWh)',
    category: 'energy',
    type: 'number',
    required: false,
    gdprSensitive: false,
    extractableFrom: ['bill', 'photo'],
    conversationalPrompt: {
      question: "Know your annual usage?",
      secondaryText: "Check your bill or we can estimate for you.",
      skipText: "Let you estimate",
    },
    validation: {
      min: 500,
      max: 50000,
    },
  },

  // Additional Features
  {
    key: 'hasElectricVehicle',
    label: 'Electric Vehicle',
    category: 'household',
    type: 'select',
    required: false,
    gdprSensitive: false,
    extractableFrom: [],
    conversationalPrompt: {
      question: "Do you have an electric vehicle?",
      secondaryText: "We can recommend EV-friendly tariffs.",
      skipText: "No EV",
    },
    options: [
      { value: 'true', label: 'Yes', icon: '🚗' },
      { value: 'false', label: 'No', icon: '❌' },
      { value: 'planning', label: 'Planning to get one', icon: '🔮' },
    ],
  },
  {
    key: 'hasSolarPanels',
    label: 'Solar Panels',
    category: 'household',
    type: 'select',
    required: false,
    gdprSensitive: false,
    extractableFrom: [],
    conversationalPrompt: {
      question: "Do you have solar panels?",
      secondaryText: "We can factor in your generation.",
      skipText: "No solar",
    },
    options: [
      { value: 'true', label: 'Yes', icon: '☀️' },
      { value: 'false', label: 'No', icon: '❌' },
    ],
  },
];

/**
 * Get field configuration by key
 */
export function getFieldConfig(key: string): EditableField | undefined {
  return EDITABLE_FIELDS.find(f => f.key === key);
}

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: 'personal' | 'energy' | 'household'): EditableField[] {
  return EDITABLE_FIELDS.filter(f => f.category === category);
}

/**
 * Get GDPR-sensitive fields
 */
export function getGDPRSensitiveFields(): EditableField[] {
  return EDITABLE_FIELDS.filter(f => f.gdprSensitive);
}

/**
 * Get extractable fields
 */
export function getExtractableFields(): EditableField[] {
  return EDITABLE_FIELDS.filter(f => f.extractableFrom.length > 0);
}

/**
 * Check if field value is valid
 */
export function validateFieldValue(field: EditableField, value: any): { valid: boolean; error?: string } {
  if (field.required && !value) {
    return { valid: false, error: 'This field is required' };
  }

  if (field.validation) {
    const { min, max, pattern } = field.validation;

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return { valid: false, error: `Minimum value is ${min}` };
      }
      if (max !== undefined && value > max) {
        return { valid: false, error: `Maximum value is ${max}` };
      }
    }

    if (typeof value === 'string' && pattern) {
      const regex = new RegExp(pattern);
      if (!regex.test(value)) {
        return { valid: false, error: 'Invalid format' };
      }
    }
  }

  return { valid: true };
}
