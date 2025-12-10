/**
 * SMART ONBOARDING WIZARD
 * 
 * Quick, friendly onboarding that gets users started in 30 seconds
 * Progressive disclosure - only essential questions first
 * 
 * @module components/SmartOnboarding
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPrefs } from '@/lib/smartStorage';
import { formatPostcode, isValidPostcode } from '@/lib/postcodeGeocoding';
import Button from './Button';
import Input from './Input';

interface OnboardingData {
  postcode: string;
  homeType: string;
  occupants: number;
  heatingType: string;
}

interface StepProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack?: () => void;
}

/**
 * Step 1: Postcode (most important for weather/benchmarks)
 */
function PostcodeStep({ data, onUpdate, onNext }: StepProps) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.postcode) {
      setError('Please enter your postcode');
      return;
    }

    if (!isValidPostcode(data.postcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }

    setError('');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">📍</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          What's your postcode?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We'll use this to show local weather and compare your costs
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Input
          type="text"
          placeholder="SW1A 1AA"
          value={data.postcode || ''}
          onChange={(e) => {
            const formatted = formatPostcode(e.target.value);
            onUpdate({ postcode: formatted });
            setError('');
          }}
          className="text-center text-xl"
          autoFocus
        />
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2 text-center">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Don't worry - your data stays on your device
        </p>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleNext} size="lg" className="px-12">
          Next →
        </Button>
      </div>
    </div>
  );
}

/**
 * Step 2: Home Type (affects typical costs)
 */
function HomeTypeStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const homeTypes = [
    { value: 'flat', label: '🏢 Flat', description: 'Apartment or flat' },
    { value: 'terraced', label: '🏘️ Terraced', description: 'Terraced house' },
    { value: 'semi-detached', label: '🏡 Semi-Detached', description: 'Semi-detached house' },
    { value: 'detached', label: '🏠 Detached', description: 'Detached house' },
  ];

  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.homeType) {
      setError('Please select your home type');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          What type of home?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us compare your costs with similar homes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {homeTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              onUpdate({ homeType: type.value });
              setError('');
            }}
            className={`p-6 rounded-lg border-2 transition-all ${
              data.homeType === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-4xl mb-2">{type.label.split(' ')[0]}</div>
            <div className="font-semibold text-gray-900 dark:text-white mb-1">
              {type.label.split(' ').slice(1).join(' ')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {type.description}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="secondary" size="lg">
          ← Back
        </Button>
        <Button onClick={handleNext} size="lg" className="px-12">
          Next →
        </Button>
      </div>
    </div>
  );
}

/**
 * Step 3: Quick Details (occupants and heating)
 */
function DetailsStep({ data, onUpdate, onNext, onBack }: StepProps) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.occupants || data.occupants < 1) {
      setError('Please enter number of people in your home');
      return;
    }
    if (!data.heatingType) {
      setError('Please select your heating type');
      return;
    }
    setError('');
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Just a couple more things...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us give you personalized tips
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            How many people live in your home?
          </label>
          <Input
            type="number"
            min="1"
            placeholder="2"
            value={data.occupants || ''}
            onChange={(e) => {
              onUpdate({ occupants: parseInt(e.target.value) || 0 });
              setError('');
            }}
            className="text-center text-xl"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What heating do you have?
          </label>
          <select
            value={data.heatingType || ''}
            onChange={(e) => {
              onUpdate({ heatingType: e.target.value });
              setError('');
            }}
            className="w-full px-4 py-3 appearance-none bg-white dark:bg-gray-800 border-2 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 text-lg"
          >
            <option value="">Select heating type...</option>
            <option value="gas_boiler">🔥 Gas Boiler</option>
            <option value="electric">⚡ Electric Heating</option>
            <option value="heat_pump">♨️ Heat Pump</option>
            <option value="oil">🛢️ Oil Heating</option>
            <option value="other">❓ Other</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </p>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="secondary" size="lg">
          ← Back
        </Button>
        <Button onClick={handleNext} size="lg" className="px-12">
          Finish →
        </Button>
      </div>
    </div>
  );
}

/**
 * Main Onboarding Component
 */
export default function SmartOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [saving, setSaving] = useState(false);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData({ ...data, ...newData });
  };

  const handleFinish = async () => {
    setSaving(true);

    // Save to storage
    const success = UserPrefs.save({
      postcode: data.postcode!,
      homeType: data.homeType!,
      occupants: data.occupants!,
      heatingType: data.heatingType!,
    });

    if (success) {
      // Also save to localStorage for backward compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('userHomeData', JSON.stringify({
          postcode: data.postcode,
          homeType: data.homeType,
          occupants: data.occupants,
          heatingType: data.heatingType,
        }));
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard-new');
      }, 500);
    } else {
      alert('Failed to save your data. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 3
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {step === 1 && (
            <PostcodeStep
              data={data}
              onUpdate={updateData}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <HomeTypeStep
              data={data}
              onUpdate={updateData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <DetailsStep
              data={data}
              onUpdate={updateData}
              onNext={handleFinish}
              onBack={() => setStep(2)}
            />
          )}

          {saving && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin text-6xl mb-4">⚙️</div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Setting everything up...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/dashboard-new')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </div>
  );
}
