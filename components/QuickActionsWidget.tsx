/**
 * QUICK ACTIONS WIDGET
 * 
 * Easy-to-understand action items for users
 * Shows immediate steps they can take to save money
 * Designed for non-technical users
 * 
 * @module components/QuickActionsWidget
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QUICK_ACTIONS } from '@/lib/plainEnglish';

interface QuickAction {
  title: string;
  savings: string;
  effort: string;
  icon: string;
  description: string;
  completed?: boolean;
}

export default function QuickActionsWidget() {
  const [completedActions, setCompletedActions] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('completed_quick_actions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [expandedAction, setExpandedAction] = useState<number | null>(null);

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedActions(newCompleted);
    localStorage.setItem('completed_quick_actions', JSON.stringify([...newCompleted]));
  };

  const totalSavings = QUICK_ACTIONS.reduce((sum, action) => {
    const amount = parseInt(action.savings.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  const completedSavings = Array.from(completedActions).reduce((sum, index) => {
    const amount = parseInt(QUICK_ACTIONS[index].savings.replace(/[^0-9]/g, ''));
    return sum + amount;
  }, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Wins
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {completedActions.size}/{QUICK_ACTIONS.length} done
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Easy actions you can do RIGHT NOW to start saving money
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
            <span>Your Progress</span>
            <span className="font-semibold text-green-600">
              £{completedSavings} saved / £{totalSavings} possible
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(completedActions.size / QUICK_ACTIONS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        {QUICK_ACTIONS.map((action, index) => {
          const isCompleted = completedActions.has(index);
          const isExpanded = expandedAction === index;

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{ opacity: isCompleted ? 0.6 : 1 }}
              className={`border rounded-lg transition-all ${
                isCompleted 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md'
              }`}
            >
              <button
                onClick={() => setExpandedAction(isExpanded ? null : index)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Icon & Checkbox */}
                  <div className="flex-shrink-0">
                    <div className="text-2xl mb-1">{action.icon}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(index);
                      }}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        isCompleted 
                          ? 'line-through text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {action.title}
                      </h4>
                      {!isCompleted && (
                        <span className="text-green-600 dark:text-green-400 font-bold text-sm whitespace-nowrap">
                          {action.savings}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {action.effort}
                      </span>
                      <span>•</span>
                      <span>Saves {action.savings}/year</span>
                    </div>
                  </div>

                  {/* Expand Arrow */}
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded Description */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {action.description}
                  </p>
                  {!isCompleted && (
                    <button
                      onClick={() => toggleComplete(index)}
                      className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      ✓ Mark as Done
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Celebration Message */}
      {completedActions.size === QUICK_ACTIONS.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white text-center"
        >
          <div className="text-3xl mb-2">🎉</div>
          <h4 className="font-bold text-lg mb-1">Amazing Work!</h4>
          <p className="text-sm">
            You've completed all quick actions and could be saving £{totalSavings}/year!
          </p>
        </motion.div>
      )}

      {/* Helpful Tip */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-900 dark:text-blue-300">
          <span className="font-semibold">💡 Tip:</span> Complete these actions today and you'll see the difference in your next energy bill!
        </p>
      </div>
    </div>
  );
}

// Compact version for dashboard sidebar
export function QuickActionsCompact() {
  const [completedActions, setCompletedActions] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    const saved = localStorage.getItem('completed_quick_actions');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const nextAction = QUICK_ACTIONS.find((_, index) => !completedActions.has(index));

  if (!nextAction) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
        <div className="text-2xl mb-2">🎉</div>
        <h4 className="font-bold mb-1">All Done!</h4>
        <p className="text-sm opacity-90">Great job completing all quick actions!</p>
      </div>
    );
  }

  const index = QUICK_ACTIONS.indexOf(nextAction);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
        ⚡ Next Quick Win
      </h4>
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{nextAction.icon}</div>
        <div>
          <h5 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            {nextAction.title}
          </h5>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            {nextAction.description}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 dark:text-green-400 font-bold">
              {nextAction.savings}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{nextAction.effort}</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          const newCompleted = new Set(completedActions);
          newCompleted.add(index);
          setCompletedActions(newCompleted);
          localStorage.setItem('completed_quick_actions', JSON.stringify([...newCompleted]));
        }}
        className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        Mark as Done ✓
      </button>
    </div>
  );
}
