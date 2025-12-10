/**
 * INTERACTIVE WELCOME TOUR
 * 
 * First-time user guidance system with:
 * - Step-by-step walkthrough
 * - Tooltips on important features
 * - Skip/restart options
 * - Progress tracking
 * 
 * Designed for non-technical users
 * 
 * @module components/WelcomeTour
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '.welcome-hero',
    title: '👋 Welcome to Cost Saver!',
    description: "We'll help you save money on your energy bills - it takes just 2 minutes to see your potential savings!",
    position: 'bottom',
  },
  {
    target: '.cta-button',
    title: '🚀 Start Here',
    description: "Click this button to tell us about your home. We'll then show you exactly how much you can save.",
    position: 'bottom',
  },
  {
    target: '.features-section',
    title: '✨ What We Do',
    description: "We analyze your home's energy usage and give you simple tips to reduce your bills - no technical knowledge needed!",
    position: 'top',
  },
];

const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    target: '.dashboard-header',
    title: '📊 Your Personal Dashboard',
    description: "This is your command center! Everything here is about YOUR home and YOUR potential savings.",
    position: 'bottom',
  },
  {
    target: '.daily-cost-card',
    title: '💰 Your Daily Energy Cost',
    description: "This shows how much you're spending on energy TODAY. Lower is better! We'll help you bring this number down.",
    position: 'right',
  },
  {
    target: '.savings-potential-card',
    title: '🎯 Your Savings Goal',
    description: "This is how much money you could save each year by following our tips. That's real money back in your pocket!",
    position: 'left',
  },
  {
    target: '.recommendations-section',
    title: '💡 Easy Money-Saving Tips',
    description: "These are simple actions you can take RIGHT NOW to start saving. Each tip shows how much you'll save!",
    position: 'top',
  },
  {
    target: '.settings-button',
    title: '⚙️ Add More Details (Optional)',
    description: "The more you tell us about your home, the better tips we can give you. But even basic info helps!",
    position: 'left',
  },
];

interface WelcomeTourProps {
  tourType: 'homepage' | 'dashboard' | 'onboarding';
  onComplete?: () => void;
}

export default function WelcomeTour({ tourType, onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  const steps = tourType === 'dashboard' ? DASHBOARD_TOUR_STEPS : TOUR_STEPS;

  useEffect(() => {
    // Check if user has seen tour
    const tourKey = `tour_seen_${tourType}`;
    const seen = localStorage.getItem(tourKey);
    
    if (!seen) {
      // Show tour after a brief delay
      setTimeout(() => {
        setIsVisible(true);
      }, 500);
    } else {
      setHasSeenTour(true);
    }
  }, [tourType]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem(`tour_seen_${tourType}`, 'true');
    if (onComplete) onComplete();
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsVisible(true);
    setHasSeenTour(false);
  };

  if (hasSeenTour && !isVisible) {
    // Show "Restart Tour" button in corner
    return (
      <button
        onClick={restartTour}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center gap-2"
      >
        <span>❓</span>
        <span className="text-sm">Help</span>
      </button>
    );
  }

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Spotlight effect on target element */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.7)',
          }}
        />

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border-2 border-blue-500">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Action Button (if exists) */}
            {step.action && (
              <button
                onClick={step.action.onClick}
                className="w-full mb-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
              >
                {step.action.label}
              </button>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handleSkip}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Got it! ✓
                  </>
                )}
              </button>
            </div>

            {/* Hint */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              💡 You can restart this tour anytime from the Help button
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Helper component for inline tooltips
export function HelpTooltip({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 text-blue-500 hover:text-blue-600 transition-colors"
      >
        <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl z-50"
        >
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2">
            <div className="border-8 border-transparent border-t-gray-900" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
