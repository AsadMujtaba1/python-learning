/**
 * Enhanced Settings Page
 * Complete profile management with progressive disclosure
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserSavingsProfile } from '@/types/UserSavingsProfile';
import type { ExpertProfile, ProfileSection } from '@/lib/types/userProfile';
import { PROFILE_SECTIONS } from '@/lib/types/userProfile';
import { calculateCompleteness, calculatePotentialSavings } from '@/lib/utils/profileAnalysis';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Radio from '@/components/Radio';
import Checkbox from '@/components/Checkbox';
import Badge from '@/components/Badge';
import Alert from '@/components/Alert';
import BillUpload from '@/components/BillUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, updateUserProfile, UserProfile as FirebaseUserProfile } from '@/lib/userProfile';
import UserProfileWidget from '@/components/UserProfileWidget';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserSavingsProfile>>({});
  const [userProfile, setUserProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setUserProfile).catch(console.error);
    }
  }, [user]);

  const loadProfile = () => {
    try {
      const storedData = localStorage.getItem('userSavingsProfile') || localStorage.getItem('userHomeData');
      if (storedData) {
        setProfile(JSON.parse(storedData));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Save canonical profile to localStorage
      localStorage.setItem('userSavingsProfile', JSON.stringify(profile));
      localStorage.setItem('userHomeData', JSON.stringify(profile));

      // Save to Firestore if user is logged in
      if (user && userProfile) {
        await updateUserProfile(user.uid, {
          savingsProfileV1: profile,
          postcode: profile.household?.postcode,
          homeType: profile.household?.homeType,
          occupants: profile.household?.occupants,
          onboardingCompleted: true,
          profileCompleteness: 100,
          lastCompleted: new Date().toISOString(),
        });
        // Reload user profile
        const updated = await getUserProfile(user.uid);
        if (updated) setUserProfile(updated);
      }

      setSaveMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof ExpertProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completeness = calculateCompleteness(profile as ExpertProfile);
  const savings = calculatePotentialSavings(profile as ExpertProfile);
  const sortedSections = [...PROFILE_SECTIONS].sort((a, b) => b.priority - a.priority);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                ⚙️ Profile Settings
                <Badge variant={completeness.tier === 'expert' ? 'success' : 'primary'} size="sm">
                  {completeness.tier.toUpperCase()} • {completeness.percentage}%
                </Badge>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                More details = Better recommendations & bigger savings
              </p>
            </div>
            <div className="flex gap-2">
              {userProfile && <UserProfileWidget profile={userProfile} showCompactView />}
              <Link href="/dashboard-new">
                <Button variant="secondary" size="sm">
                  ← Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with User Profile */}
          <div className="lg:col-span-1">
            {userProfile && <UserProfileWidget profile={userProfile} />}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Save Message */}
            {saveMessage && (
              <Alert 
                variant={saveMessage.type === 'success' ? 'success' : 'error'}
                dismissible
                onDismiss={() => setSaveMessage(null)}
                className="mb-6"
              >
                {saveMessage.text}
              </Alert>
            )}

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Profile Completeness
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {completeness.percentage}% complete • {completeness.missingFields.length} categories remaining
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                £{savings.withExpert}/year
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Maximum savings potential
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-4">
          {sortedSections.map((section) => {
            const sectionFields = section.fields.filter(f => {
              if (f.dependsOn) {
                return profile[f.dependsOn.field as keyof typeof profile] === f.dependsOn.value;
              }
              return true;
            });
            
            const completedFields = sectionFields.filter(f => 
              profile[f.key] !== undefined && 
              profile[f.key] !== null &&
              profile[f.key] !== ''
            ).length;
            
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div 
                key={section.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{section.icon}</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          completedFields === sectionFields.length
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : completedFields > 0
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {completedFields}/{sectionFields.length} complete
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{section.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Section Fields */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sectionFields.map((field) => {
                        const value = profile[field.key];
                        
                        return (
                          <div 
                            key={field.key}
                            className={field.type === 'boolean' ? 'md:col-span-2' : ''}
                          >
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {field.label}
                              {!field.validation?.required && (
                                <span className="text-gray-400 text-xs ml-2">(optional)</span>
                              )}
                            </label>
                            
                            {field.type === 'text' && (
                              <input
                                type="text"
                                value={(value as string) || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                placeholder={field.placeholder}
                              />
                            )}
                            
                            {field.type === 'number' && (
              <input
                                type="number"
                                value={(value as number) || ''}
                                onChange={(e) => updateField(field.key, parseFloat(e.target.value))}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                                placeholder={field.placeholder}
                              />
                            )}
                            
                            {field.type === 'select' && field.options && (
                              <select
                                value={(value as string) || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                              >
                                <option value="">Select...</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                            
                            {field.type === 'boolean' && (
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(value as boolean) || false}
                                  onChange={(e) => updateField(field.key, e.target.checked)}
                                  className="w-5 h-5 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {field.placeholder || 'Enable this feature'}
                                </span>
                              </label>
                            )}
                            
                            {field.type === 'date' && (
                              <input
                                type="date"
                                value={(value as string) || ''}
                                onChange={(e) => updateField(field.key, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {section.unlocks && section.unlocks.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                          Completing this section unlocks:
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                          {section.unlocks.map((unlock, i) => (
                            <li key={i}>• {unlock}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bill Upload Section */}
        <div className="mt-4">
          <BillUpload onBillExtracted={(bill) => console.log('Bill extracted:', bill)} />
        </div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-4 mt-8">
          <button
            onClick={saveProfile}
            disabled={saving}
            className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <>Save Profile</>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            {completeness.percentage}% complete • {savings.current} current savings • £{savings.withExpert} potential
          </p>
        </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
