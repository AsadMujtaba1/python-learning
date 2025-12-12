// DEPRECATED: This onboarding route is deprecated in favor of /onboarding-conversational.
// Redirecting to canonical onboarding.
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingV2Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-conversational');
  }, [router]);
  return null;
/**
 * Enhanced Onboarding Page with Firebase Integration
 * Saves data to both localStorage and Firestore
 * Uses anonymous authentication for MVP
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserHomeData } from '@/types';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { showToast } from '@/components/Toast';
import { auth, db } from '@/lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function EnhancedOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserHomeData>({
    postcode: '',
    homeType: 'terraced',
    occupants: 2,
    heatingType: 'gas',
  });

  const handleNext = () => {
    if (!isStepValid()) {
      showToast('Please complete this step before continuing', 'warning');
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage (immediate access)
      localStorage.setItem('userHomeData', JSON.stringify(formData));
      
      // Authenticate anonymously and save to Firebase
      if (auth && db) {
        try {
          const userCredential = await signInAnonymously(auth);
          const userId = userCredential.user.uid;
          
          // Save to Firestore
          await setDoc(doc(db, 'users', userId), {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          
          // Store user ID for future use
          localStorage.setItem('userId', userId);
          showToast('Your data has been saved!', 'success');
        } catch (firebaseError) {
          console.warn('Firebase save failed, using localStorage only:', firebaseError);
          showToast('Saved locally (Firebase unavailable)', 'info');
        }
      } else {
        showToast('Saved locally', 'info');
      }
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard-new');
      }, 500);
      
    } catch (error) {
      console.error('Error saving data:', error);
      showToast('Error saving data. Please try again.', 'error');
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof UserHomeData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.postcode.length >= 5;
      case 2:
        return formData.homeType.length > 0;
      case 3:
        return formData.occupants >= 1;
      case 4:
        return formData.heatingType.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 py-8 pt-20">
      <div className="max-w-2xl w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Let's Get Started
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Just a few questions to personalize your energy insights
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Step {step} of 4
            </span>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {Math.round((step / 4) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Postcode */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                📍 What's your postcode?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We'll use this to get accurate weather data for your area
              </p>
            </div>
            <Input
              type="text"
              value={formData.postcode}
              onChange={(e) => updateFormData('postcode', e.target.value.toUpperCase())}
              placeholder="e.g., SW1A 1AA"
              label="UK Postcode"
              helperText="Enter your postcode without spaces or with spaces"
              className="text-lg"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Home Type */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                🏠 What type of home do you live in?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Different home types have different energy needs
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'flat', label: 'Flat', emoji: '🏢', desc: 'Apartment or flat' },
                { value: 'terraced', label: 'Terraced', emoji: '🏘️', desc: 'Attached on both sides' },
                { value: 'semi-detached', label: 'Semi-Detached', emoji: '🏠', desc: 'Attached on one side' },
                { value: 'detached', label: 'Detached', emoji: '🏡', desc: 'Standalone house' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData('homeType', type.value)}
                  className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                    formData.homeType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Occupants */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                👨‍👩‍👧‍👦 How many people live in your home?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                More occupants typically means higher energy usage
              </p>
            </div>
            <div className="text-center mb-6">
              <div className="text-7xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {formData.occupants}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {formData.occupants === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => updateFormData('occupants', Math.max(1, formData.occupants - 1))}
                variant="secondary"
                size="lg"
                className="flex-1 text-2xl"
              >
                −
              </Button>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.occupants}
                onChange={(e) => updateFormData('occupants', parseInt(e.target.value))}
                className="flex-1"
              />
              <Button
                onClick={() => updateFormData('occupants', Math.min(10, formData.occupants + 1))}
                variant="secondary"
                size="lg"
                className="flex-1 text-2xl"
              >
                +
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Heating Type */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                🔥 What type of heating do you use?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This helps us calculate accurate energy costs
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'gas', label: 'Gas', emoji: '🔥', desc: 'Gas boiler' },
                { value: 'electricity', label: 'Electric', emoji: '⚡', desc: 'Electric heating' },
                { value: 'heat-pump', label: 'Heat Pump', emoji: '♨️', desc: 'Air/ground source' },
                { value: 'mixed', label: 'Mixed', emoji: '🔄', desc: 'Gas + electric' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData('heatingType', type.value)}
                  className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                    formData.heatingType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mt-10">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="lg"
              className="flex-1"
              disabled={loading}
            >
              ← Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!isStepValid()}
            isLoading={loading}
            fullWidth={step === 1}
          >
            {step === 4 ? '✓ Complete Setup' : 'Continue →'}
          </Button>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
