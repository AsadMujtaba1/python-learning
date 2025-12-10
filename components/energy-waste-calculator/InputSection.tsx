/**
 * INPUT SECTION COMPONENT
 * 
 * UX/UI Team Implementation
 * Manual input fields with smart validation and tooltips
 * Accessible, mobile-optimized, user-friendly
 */

'use client';

import { useState } from 'react';
import { WasteCalculatorInput } from '@/lib/energyWasteCalculator';

interface InputSectionProps {
  onInputChange: (input: Partial<WasteCalculatorInput>) => void;
  initialValues?: Partial<WasteCalculatorInput>;
  errors?: string[];
}

export default function InputSection({ onInputChange, initialValues = {}, errors = [] }: InputSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [values, setValues] = useState<Partial<WasteCalculatorInput>>(initialValues);

  const handleChange = (field: keyof WasteCalculatorInput, value: any) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);
    onInputChange(newValues);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          📊 Enter Your Bill Details
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Takes 30 seconds</span>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        {/* Monthly Bill */}
        <div>
          <label htmlFor="monthlyBill" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monthly Bill Amount *
            <Tooltip text="The total amount you paid on your last energy bill" />
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">£</span>
            <input
              type="number"
              id="monthlyBill"
              value={values.monthlyBill || ''}
              onChange={(e) => handleChange('monthlyBill', parseFloat(e.target.value))}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="135.00"
              step="0.01"
              min="0"
              aria-label="Monthly bill amount in pounds"
              aria-describedby={errors.length > 0 ? "input-errors" : undefined}
            />
          </div>
        </div>

        {/* Unit Rate */}
        <div>
          <label htmlFor="unitRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit Rate *
            <Tooltip text="Cost per kilowatt-hour (kWh) of electricity you use. Find this on your bill under 'unit rate' or 'price per kWh'" />
          </label>
          <div className="relative">
            <input
              type="number"
              id="unitRate"
              value={values.unitRate || ''}
              onChange={(e) => handleChange('unitRate', parseFloat(e.target.value))}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="24.5"
              step="0.1"
              min="0"
              aria-label="Unit rate in pence per kilowatt-hour"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">p/kWh</span>
          </div>
        </div>

        {/* Standing Charge */}
        <div>
          <label htmlFor="standingCharge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Standing Charge *
            <Tooltip text="Fixed daily charge you pay regardless of usage. Look for 'standing charge' or 'daily charge' on your bill" />
          </label>
          <div className="relative">
            <input
              type="number"
              id="standingCharge"
              value={values.standingCharge || ''}
              onChange={(e) => handleChange('standingCharge', parseFloat(e.target.value))}
              className="w-full pr-12 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="60.1"
              step="0.1"
              min="0"
              aria-label="Standing charge in pence per day"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">p/day</span>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div id="input-errors" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-red-800 dark:text-red-300">Please fix the following:</p>
              <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full text-left text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center justify-between py-2"
        aria-expanded={showAdvanced}
      >
        <span>{showAdvanced ? '▼' : '▶'} Optional: Add more details for better accuracy</span>
      </button>

      {/* Advanced Fields */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
          {/* Property Type */}
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Property Type
            </label>
            <select
              id="propertyType"
              value={values.propertyType || ''}
              onChange={(e) => handleChange('propertyType', e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Select property type"
            >
              <option value="">Select...</option>
              <option value="flat">Flat / Apartment</option>
              <option value="terraced">Terraced House</option>
              <option value="semi">Semi-Detached</option>
              <option value="detached">Detached House</option>
            </select>
          </div>

          {/* Occupants */}
          <div>
            <label htmlFor="occupants" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Occupants
            </label>
            <input
              type="number"
              id="occupants"
              value={values.occupants || ''}
              onChange={(e) => handleChange('occupants', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="2"
              min="1"
              max="15"
              aria-label="Number of people living in property"
            />
          </div>

          {/* Annual Usage */}
          <div>
            <label htmlFor="annualUsage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yearly Electricity Usage (if known)
            </label>
            <div className="relative">
              <input
                type="number"
                id="annualUsage"
                value={values.annualUsage || ''}
                onChange={(e) => handleChange('annualUsage', parseInt(e.target.value))}
                className="w-full pr-16 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="2700"
                min="0"
                aria-label="Annual electricity usage in kilowatt-hours"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">kWh/year</span>
            </div>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-blue-600 dark:text-blue-400 mr-2">💡</span>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Tip:</strong> Find these values on your latest energy bill. Look for the "charges" or "costs" section.
          </p>
        </div>
      </div>
    </div>
  );
}

// Tooltip Component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="inline-block ml-1 group relative">
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full cursor-help">
        ?
      </span>
      <span className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-lg -left-28 top-full">
        {text}
      </span>
    </span>
  );
}
