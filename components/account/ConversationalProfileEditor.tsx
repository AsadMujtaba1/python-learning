'use client';

import { useState, useEffect } from 'react';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatBubble } from '@/components/conversational/ChatBubble';
import { SelectableCard } from '@/components/conversational/SelectableCard';
import { TypingIndicator } from '@/components/conversational/TypingIndicator';
import { EditableField, UserProfile } from '@/lib/types/accountTypes';
import { validateFieldValue } from '@/lib/editableFields';

interface ConversationalProfileEditorProps {
  field: EditableField;
  currentValue: any;
  userProfile: UserProfile;
  onSave: (fieldKey: string, newValue: any) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function ConversationalProfileEditor({
  field,
  currentValue,
  userProfile,
  onSave,
  onCancel,
  saving = false,
}: ConversationalProfileEditorProps) {
  const [showTyping, setShowTyping] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [value, setValue] = useState<any>(currentValue || '');
  const [error, setError] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Show typing indicator for 800ms
    const typingTimer = setTimeout(() => {
      setShowTyping(false);
      setShowQuestion(true);
    }, 800);

    return () => clearTimeout(typingTimer);
  }, []);

  const handleSubmit = () => {
    // Validate
    const validation = validateFieldValue(field, value);
    if (!validation.valid) {
      setError(validation.error || 'Invalid value');
      return;
    }

    setError('');
    setShowConfirmation(true);

    // Save after 1 second
    setTimeout(() => {
      onSave(field.key, value);
    }, 1000);
  };

  const handleSkip = () => {
    onCancel();
  };

  const renderInput = () => {
    if (field.type === 'select' && field.options) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {field.options.map((option) => (
              <SelectableCard
                key={option.value}
                value={option.value}
                label={option.label}
                description={option.description}
                icon={option.icon}
                selected={value === option.value}
                onSelect={() => setValue(option.value)}
              />
            ))}
          </div>
          {error && (
            <div className="text-sm text-red-500 mt-2">{error}</div>
          )}
        </div>
      );
    }

    if (field.type === 'number') {
      return (
        <div className="space-y-2">
          <Input
            type="number"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value))}
            placeholder={field.conversationalPrompt.secondaryText}
            className="text-lg"
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {field.validation && (
            <div className="text-xs text-gray-500">
              {field.validation.min !== undefined && field.validation.max !== undefined
                ? `Between ${field.validation.min} and ${field.validation.max}`
                : field.validation.min !== undefined
                ? `Minimum: ${field.validation.min}`
                : field.validation.max !== undefined
                ? `Maximum: ${field.validation.max}`
                : ''}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
        </div>
      );
    }

    // Default to text input
    return (
      <div className="space-y-2">
        <Input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          placeholder={field.conversationalPrompt.secondaryText}
          className="text-lg"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Editing {field.label}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-2xl mx-auto w-full space-y-4">
        {/* Typing Indicator */}
        {showTyping && <TypingIndicator />}

        {/* Question */}
        {showQuestion && (
          <div className="animate-slide-up">
            <ChatBubble
              type="assistant"
              message={field.conversationalPrompt.question}
            />
            {field.conversationalPrompt.secondaryText && (
              <div className="text-sm text-gray-500 mt-2 ml-14">
                {field.conversationalPrompt.secondaryText}
              </div>
            )}
          </div>
        )}

        {/* Current Value Display */}
        {showQuestion && currentValue && (
          <div className="ml-14 p-3 bg-gray-100 rounded-lg text-sm">
            <span className="text-gray-600">Current: </span>
            <span className="font-medium">{formatValue(currentValue, field)}</span>
          </div>
        )}

        {/* Input */}
        {showQuestion && !showConfirmation && (
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            {renderInput()}
          </div>
        )}

        {/* Confirmation */}
        {showConfirmation && (
          <div className="animate-scale-in">
            <ChatBubble
              type="assistant"
              message={`✓ Got it! I've updated your ${field.label.toLowerCase()}.`}
              icon={<Check className="w-5 h-5 text-green-600" />}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showQuestion && !showConfirmation && (
        <div className="max-w-2xl mx-auto w-full mt-6 space-y-3">
          <Button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!value || value === currentValue || saving}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>

          {field.conversationalPrompt.skipText && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full py-6 text-lg"
            >
              <X className="w-5 h-5 mr-2" />
              {field.conversationalPrompt.skipText}
            </Button>
          )}
        </div>
      )}

      {/* GDPR Notice */}
      {field.gdprSensitive && showQuestion && !showConfirmation && (
        <div className="max-w-2xl mx-auto w-full mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800">
            🔒 This information is sensitive and protected under GDPR. We only use it to personalise your experience.
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format value for display
 */
function formatValue(value: any, field: EditableField): string {
  if (field.options) {
    const option = field.options.find(o => o.value === value);
    return option?.label || value;
  }

  if (field.type === 'number') {
    if (field.key === 'dayRate' || field.key === 'nightRate') {
      return `${value}p/kWh`;
    }
    if (field.key === 'standingCharge') {
      return `${value}p/day`;
    }
    if (field.key === 'estimatedAnnualUsage') {
      return `${value} kWh/year`;
    }
    return value.toString();
  }

  return value;
}
