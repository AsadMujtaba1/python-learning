import type { Meta, StoryObj } from '@storybook/react';
import ConversationalProfileEditor from './ConversationalProfileEditor';
import { EditableField, UserProfile } from '@/lib/types/accountTypes';

const meta = {
  title: 'Features/Conversational Onboarding',
  component: ConversationalProfileEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConversationalProfileEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUserProfile: UserProfile = {
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'John Doe',
  tier: 'free',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const mockTextField: EditableField = {
  key: 'displayName',
  label: 'What should we call you?',
  type: 'text',
  description: 'This helps us personalize your experience',
  placeholder: 'Enter your name',
  required: true,
};

const mockNumberField: EditableField = {
  key: 'monthlyBudget',
  label: 'What\'s your monthly energy budget?',
  type: 'number',
  description: 'We\'ll help you stay within this amount',
  placeholder: '£150',
  required: false,
};

const mockSelectField: EditableField = {
  key: 'propertyType',
  label: 'What type of property do you live in?',
  type: 'select',
  description: 'This helps us provide better recommendations',
  options: [
    { value: 'flat', label: '🏢 Flat/Apartment' },
    { value: 'terraced', label: '🏘️ Terraced House' },
    { value: 'semi', label: '🏡 Semi-Detached' },
    { value: 'detached', label: '🏠 Detached House' },
  ],
  required: true,
};

export const DefaultState: Story = {
  args: {
    field: mockTextField,
    currentValue: '',
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: false,
  },
};

export const LoadingState: Story = {
  args: {
    field: mockTextField,
    currentValue: 'John',
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: true,
  },
};

export const WithExistingValue: Story = {
  args: {
    field: mockTextField,
    currentValue: 'John Doe',
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: false,
  },
};

export const NumberField: Story = {
  args: {
    field: mockNumberField,
    currentValue: 150,
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: false,
  },
};

export const SelectField: Story = {
  args: {
    field: mockSelectField,
    currentValue: '',
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: false,
  },
};

export const SelectFieldWithValue: Story = {
  args: {
    field: mockSelectField,
    currentValue: 'semi',
    userProfile: mockUserProfile,
    onSave: (fieldKey: string, newValue: any) => {
      console.log('Save:', fieldKey, newValue);
    },
    onCancel: () => {
      console.log('Cancelled');
    },
    saving: false,
  },
};
