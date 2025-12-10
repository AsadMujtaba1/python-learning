/**
 * Checkbox Component
 * 
 * Accessible checkbox with custom styling
 * Features:
 * - Indeterminate state
 * - Label and description
 * - Error states
 * - Dark mode support
 */

import React from 'react';

export interface CheckboxProps {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  error?: string;
  className?: string;
}

export default function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  indeterminate = false,
  error,
  className = '',
}: CheckboxProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const hasError = Boolean(error);

  return (
    <div className={`w-full ${className}`}>
      <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className="relative flex items-center">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={`
              w-5 h-5 rounded border-2 
              text-blue-600 
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${hasError 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 dark:border-gray-600'
              }
            `}
          />
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <span className="block font-medium text-gray-900 dark:text-white">
                {label}
              </span>
            )}
            {description && (
              <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 ml-8">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Checkbox Group Component
 */
export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxGroupOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
  helperText,
  error,
  disabled = false,
  className = '',
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={selected.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={disabled}
          />
        ))}
      </div>

      {(helperText || error) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Usage Example:
 * 
 * // Single checkbox
 * <Checkbox
 *   label="I agree to the terms and conditions"
 *   description="By checking this box, you agree to our privacy policy"
 *   checked={agreed}
 *   onChange={setAgreed}
 * />
 * 
 * // Checkbox group
 * <CheckboxGroup
 *   label="Select features to enable"
 *   options={[
 *     { value: 'weather', label: 'Weather forecasts', description: 'Get 7-day weather predictions' },
 *     { value: 'alerts', label: 'Cost alerts', description: 'Receive notifications when costs spike' },
 *     { value: 'tips', label: 'Saving tips', description: 'Daily money-saving recommendations' },
 *   ]}
 *   selected={selectedFeatures}
 *   onChange={setSelectedFeatures}
 * />
 */
