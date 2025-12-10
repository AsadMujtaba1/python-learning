/**
 * Radio Component
 * 
 * Accessible radio button group
 * Features:
 * - Keyboard navigation
 * - Custom styling
 * - Horizontal/vertical layout
 * - Description text
 * - Icons
 * - Dark mode support
 */

import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name: string;
  layout?: 'horizontal' | 'vertical';
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export default function RadioGroup({
  label,
  value,
  onChange,
  options,
  name,
  layout = 'vertical',
  error,
  helperText,
  required = false,
  className = '',
}: RadioGroupProps) {
  const hasError = Boolean(error);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`${layout === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-3'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${value === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }
              ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${layout === 'horizontal' ? 'flex-1 min-w-[150px]' : ''}
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={option.disabled}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="text-xl">{option.icon}</span>
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {option.label}
                </span>
              </div>
              {option.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {(helperText || error) && (
        <p className={`mt-2 text-sm ${hasError ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Usage Example:
 * 
 * <RadioGroup
 *   label="Heating Type"
 *   name="heating"
 *   value={heatingType}
 *   onChange={setHeatingType}
 *   options={[
 *     { value: 'gas', label: 'Gas Central Heating', icon: '🔥', description: 'Most common in UK homes' },
 *     { value: 'electricity', label: 'Electric Heating', icon: '⚡', description: 'No gas supply' },
 *     { value: 'heat-pump', label: 'Heat Pump', icon: '♨️', description: 'Most efficient option' },
 *   ]}
 *   layout="vertical"
 *   required
 * />
 */
