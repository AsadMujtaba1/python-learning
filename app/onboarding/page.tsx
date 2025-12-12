// DEPRECATED: This onboarding route is deprecated in favor of /onboarding-conversational.
// Redirecting to canonical onboarding.
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding-conversational');
  }, [router]);
  return null;
      // Save to localStorage for MVP (replace with Firebase later)
      localStorage.setItem('userHomeData', JSON.stringify(formData));
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateFormData = (field: keyof UserHomeData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.postcode.length >= 5;
      case 1:
        return formData.homeType.length > 0;
      case 2:
        return formData.occupants > 0;
      case 3:
        return formData.heatingType.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {step} of 4
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round((step / 4) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Postcode */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                What's your postcode?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We'll use this to provide accurate energy insights for your area.
              </p>
            </div>
            <input
              type="text"
              placeholder="e.g., SW1A 1AA"
              value={formData.postcode}
              onChange={(e) => updateFormData('postcode', e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
              maxLength={8}
            />
          </div>
        )}

        {/* Step 2: Home Type */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                What type of home do you live in?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This helps us estimate your energy usage accurately.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'flat', label: 'Flat', icon: '🏢' },
                { value: 'terraced', label: 'Terraced', icon: '🏘️' },
                { value: 'semi-detached', label: 'Semi-Detached', icon: '🏡' },
                { value: 'detached', label: 'Detached', icon: '🏠' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('homeType', option.value)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.homeType === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Occupants */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                How many people live in your home?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                More people typically means higher energy usage.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={() => updateFormData('occupants', Math.max(1, formData.occupants - 1))}
                className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 text-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 min-w-[100px] text-center">
                {formData.occupants}
              </div>
              <button
                onClick={() => updateFormData('occupants', Math.min(10, formData.occupants + 1))}
                className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 text-2xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Heating Type */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                What type of heating do you use?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Different heating systems have different costs.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'gas', label: 'Gas Heating', icon: '🔥' },
                { value: 'electricity', label: 'Electric Heating', icon: '⚡' },
                { value: 'heat-pump', label: 'Heat Pump', icon: '♨️' },
                { value: 'mixed', label: 'Mixed', icon: '🔄' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFormData('heatingType', option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center ${
                    formData.heatingType === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <span className="text-3xl mr-4">{option.icon}</span>
                  <span className="font-semibold text-lg text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              step === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              isStepValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step === 4 ? 'Get My Dashboard' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
