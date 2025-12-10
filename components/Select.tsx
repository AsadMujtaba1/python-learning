/**
 * Select Component
 * 
 * Accessible dropdown select with custom styling
 * Features:
 * - Keyboard navigation
 * - Label and helper text
 * - Error states
 * - Disabled state
 * - Custom icons
 * - Dark mode support
 */

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  helperText,
  error,
  disabled = false,
  required = false,
  className = '',
  icon,
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const hasError = Boolean(error);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 
            ${icon ? 'pl-10' : ''}
            appearance-none
            bg-white dark:bg-gray-800
            border-2 rounded-lg
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
            }
          `}
        >
          {placeholder && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
 * <Select
 *   label="Home Type"
 *   value={homeType}
 *   onChange={setHomeType}
 *   options={[
 *     { value: 'flat', label: 'Flat' },
 *     { value: 'terraced', label: 'Terraced House' },
 *     { value: 'semi-detached', label: 'Semi-Detached' },
 *     { value: 'detached', label: 'Detached House' },
 *   ]}
 *   helperText="Select the type of property you live in"
 *   required
 * />
 */
