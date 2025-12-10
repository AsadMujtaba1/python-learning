/**
 * DAILY COST INPUT WIDGET
 * 
 * Simple, fast way to log daily energy costs
 * Automatically saves to storage
 * 
 * @module components/DailyCostInput
 */

'use client';

import { useState, useEffect } from 'react';
import { CostTracker } from '@/lib/smartStorage';
import Button from './Button';
import Input from './Input';

interface DailyCostInputProps {
  onCostSaved?: (cost: number) => void;
  compact?: boolean;
}

export default function DailyCostInput({ onCostSaved, compact = false }: DailyCostInputProps) {
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [todayCost, setTodayCost] = useState<number | null>(null);

  useEffect(() => {
    // Check if cost already logged today
    const existing = CostTracker.getTodayCost();
    setTodayCost(existing);
    if (existing) {
      setCost(existing.toString());
    }
  }, []);

  const handleSave = async () => {
    const costValue = parseFloat(cost);
    
    if (isNaN(costValue) || costValue < 0) {
      alert('Please enter a valid cost amount');
      return;
    }

    setSaving(true);
    
    // Save to storage
    const success = CostTracker.addEntry(costValue, undefined, notes);
    
    if (success) {
      setSaved(true);
      setTodayCost(costValue);
      onCostSaved?.(costValue);
      
      // Show success message briefly
      setTimeout(() => setSaved(false), 2000);
    }
    
    setSaving(false);
  };

  const handleQuickAdd = (amount: number) => {
    const current = parseFloat(cost) || 0;
    setCost((current + amount).toFixed(2));
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            💰 Today's Cost
          </h3>
          {todayCost !== null && (
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              £{todayCost.toFixed(2)}
            </span>
          )}
        </div>

        {todayCost === null ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">£</span>
              <Input
                type="number"
                step="0.01"
                placeholder="4.50"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSave}
                disabled={saving || !cost}
                size="sm"
                className="whitespace-nowrap"
              >
                {saving ? 'Saving...' : saved ? '✓ Saved' : 'Log'}
              </Button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleQuickAdd(1)}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                +£1
              </button>
              <button
                onClick={() => handleQuickAdd(5)}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                +£5
              </button>
              <button
                onClick={() => handleQuickAdd(10)}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                +£10
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cost logged for today ✓
            </p>
            <button
              onClick={() => setTodayCost(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Update cost
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            💰 Log Today's Cost
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-GB', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        {todayCost !== null && (
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              £{todayCost.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-800 dark:text-green-200 text-sm font-medium">
            ✓ Cost saved successfully!
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Today's Energy Cost
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl text-gray-500 dark:text-gray-400">£</span>
            <Input
              type="number"
              step="0.01"
              placeholder="4.50"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="text-xl font-semibold"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Check your smart meter or energy app
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleQuickAdd(1)}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            +£1
          </button>
          <button
            onClick={() => handleQuickAdd(5)}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            +£5
          </button>
          <button
            onClick={() => handleQuickAdd(10)}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            +£10
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <Input
            type="text"
            placeholder="e.g., Had heating on all day"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !cost}
          className="w-full"
          size="lg"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved Successfully' : 'Save Today\'s Cost'}
        </Button>

        {todayCost !== null && todayCost !== parseFloat(cost) && (
          <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
            ⚠️ This will update your existing cost for today
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">7-Day Average</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              £{CostTracker.getAverageCost(7).toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">30-Day Average</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              £{CostTracker.getAverageCost(30).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for sidebar or quick access
 */
export function QuickCostInput({ onCostSaved }: { onCostSaved?: (cost: number) => void }) {
  return <DailyCostInput onCostSaved={onCostSaved} compact={true} />;
}
