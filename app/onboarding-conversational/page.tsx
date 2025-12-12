// Feature flag for future categories
const FEATURE_BROADBAND = false;
const FEATURE_INSURANCE = false;
const FEATURE_FLIGHTS = false;
// Add to UserSavingsProfile type import if not present
// import type { UserSavingsProfile } from '@/types/UserSavingsProfile';
// Add interests to UserSavingsProfile type if not present
// interface UserSavingsProfileV1 { ... interests?: string[]; ... }
'use client';

/**
 * CONVERSATIONAL ONBOARDING PAGE
 * 
 * Modern chat-style onboarding inspired by Monzo, Revolut, Octopus Energy
 * One question at a time, tap-based, minimal typing, adaptive skipping
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateUserProfile } from '@/lib/userProfile';
import type { UserSavingsProfile } from '@/types/UserSavingsProfile';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, SkipForward, Home } from 'lucide-react';
import { ChatBubble, MessageCard } from '@/components/conversational/ChatBubble';
import { SelectableCard, SelectableGrid } from '@/components/conversational/SelectableCard';
import { TypingIndicator } from '@/components/conversational/TypingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ConversationalOnboardingManager,
  ONBOARDING_QUESTIONS,
  OnboardingQuestion,
} from '@/lib/conversationalOnboarding';

const POPULAR_SUPPLIERS = [
  { value: 'octopus', label: 'Octopus Energy', icon: '🐙' },
  { value: 'british-gas', label: 'British Gas', icon: '🔥' },
  { value: 'edf', label: 'EDF Energy', icon: '⚡' },
  { value: 'eon', label: 'E.ON', icon: '💡' },
  { value: 'scottish-power', label: 'Scottish Power', icon: '⚡' },
  { value: 'ovo', label: 'OVO Energy', icon: '🌟' },
];

// If rendered as a route, show as a modal overlay for consistency
import Modal from '@/components/Modal';

export default function ConversationalOnboardingPage({ isPopup = false, onComplete }: { isPopup?: boolean; onComplete?: () => void } = {}) {
  const router = useRouter();
  const [manager] = useState(() => new ConversationalOnboardingManager());
  const [currentQuestion, setCurrentQuestion] = useState<OnboardingQuestion | null>(null);
  const [showTyping, setShowTyping] = useState(true);
  const [messages, setMessages] = useState<Array<{ type: 'assistant' | 'user'; message: string; delay: number }>>([]);
  const [inputValue, setInputValue] = useState('2');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    // Load saved progress
    const saved = localStorage.getItem('onboardingProgress');
    if (saved) {
      const state = JSON.parse(saved);
      // Could restore state here
    }

    // Load first question immediately to show starting message
    loadNextQuestion();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function loadNextQuestion() {
    setShowTyping(true);

    // Simulate thinking delay
    setTimeout(() => {
      const next = manager.getCurrentQuestion();
      setCurrentQuestion(next);
      setShowTyping(false);
      setSelectedValue(null);
      setInputValue('');

      if (next) {
        // Add assistant messages only if not already present anywhere in chat history
        setMessages(prev => {
          const newMessages: Array<{ type: 'assistant' | 'user'; message: string; delay: number }> = [];
          if (next.message) {
            if (!prev.some(m => m.type === 'assistant' && m.message === next.message)) {
              newMessages.push({
                type: 'assistant' as const,
                message: next.message,
                delay: 0,
              });
            }
          }
          if (next.secondaryMessage) {
            if (!prev.some(m => m.type === 'assistant' && m.message === next.secondaryMessage)) {
              newMessages.push({
                type: 'assistant' as const,
                message: next.secondaryMessage,
                delay: 800,
              });
            }
          }
          return [...prev, ...newMessages];
        });

        // Show skip option immediately if skippable
        if (next.skippable) {
          setShowSkipOption(true);
        } else {
          setShowSkipOption(false);
        }
      } else {
        // Onboarding complete
        handleComplete();
      }
    }, 800);
  }

  function isValidUKPostcode(postcode: string): boolean {
    // Accept UK postcodes with or without spaces, and auto-format
    const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
    // UK postcode regex (with or without space)
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return ukPostcodeRegex.test(postcode.trim()) || ukPostcodeRegex.test(cleaned);
  }

  function handleAnswer(answer: any, displayText?: string) {
    if (!currentQuestion) return;

    // Validate postcode
    if (currentQuestion.type === 'postcode') {
      if (!isValidUKPostcode(answer)) {
        setMessages(prev => [
          ...prev,
          {
            type: 'assistant',
            message: "Hmm, that doesn't look like a valid UK postcode. Can you try again? (e.g., SW1A 1AA)",
            delay: 0,
          },
        ]);
        return;
      }
    }
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: displayText || answer.toString(),
        delay: 0,
      },
    ]);

    // Save progress
    saveProgress();

    // Load next question
    setTimeout(() => loadNextQuestion(), 600);
  }

  function handleSkip() {
    if (!currentQuestion?.skippable) return;

    manager.skipQuestion();
    
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: "I'll skip this for now",
        delay: 0,
      },
    ]);

    setShowSkipOption(false);
    setTimeout(() => loadNextQuestion(), 600);
  }

  function handleGoDashboard() {
    saveProgress();
    router.push('/dashboard-new/');
  }

  function saveProgress() {
    const state = manager.getState();
    localStorage.setItem('onboardingProgress', JSON.stringify(state));
    localStorage.setItem('userHomeData', JSON.stringify(manager.getAnswers()));
  }

  // Auth step state
  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [authChoiceMade, setAuthChoiceMade] = useState(false);

  async function handleComplete() {
    // Show auth choice step before finalizing onboarding
    setShowAuthChoice(true);
  }

  // Called after user makes auth choice
  const { user } = useAuth();
  async function finalizeOnboarding() {
    const answers = manager.getAnswers();
    // Canonical UserSavingsProfile v1
    const userSavingsProfile: UserSavingsProfile = {
      version: 1,
      household: {
        occupants: answers.occupants || 1,
        homeType: answers.homeType || '',
        postcode: answers.postcode,
        region: answers.region,
      },
      energy: {
        supplier: answers.supplier,
        tariff: answers.tariff,
        standingCharge: answers.electricityStandingCharge || answers.gasStandingCharge,
        unitRate: answers.electricityUnitRate || answers.gasUnitRate,
        paymentType: answers.paymentType,
        usage: answers.usage,
        cost: answers.cost,
      },
      ev: answers.hasEV !== undefined ? {
        hasEV: !!answers.hasEV,
        chargingPreference: answers.evChargingPreference,
      } : undefined,
      solarInterest: !!answers.solarInterest,
      heatPumpInterest: !!answers.heatPumpInterest,
      interests: answers.interests || [],
    };
      // --- Future-facing step: Broadband/Insurance/Flights ---
      // Only show if any feature flag is true
      const showFutureCategories = FEATURE_BROADBAND || FEATURE_INSURANCE || FEATURE_FLIGHTS;

      // Add to onboarding steps array near the end (before final review/confirm)
      // Example step definition:
      // {
      //   id: 'interests',
      //   type: 'multi-select',
      //   prompt: 'Want to also optimise Broadband or Insurance when it’s ready?',
      //   options: [
      //     ...(FEATURE_BROADBAND ? [{ value: 'broadband', label: 'Broadband' }] : []),
      //     ...(FEATURE_INSURANCE ? [{ value: 'insurance', label: 'Insurance' }] : []),
      //     ...(FEATURE_FLIGHTS ? [{ value: 'flights', label: 'Flights' }] : []),
      //   ],
      //   hidden: !showFutureCategories,
      // },

      // In the onboarding step manager/config, insert this step with hidden: true for now
      // When enabling, just set the feature flag(s) to true and the step will appear
    localStorage.setItem('userSavingsProfile', JSON.stringify(userSavingsProfile));
    // For backward compatibility, also update userHomeData
    localStorage.setItem('userHomeData', JSON.stringify(userSavingsProfile));
    // If authenticated, sync to server
    if (user && user.uid) {
      try {
        // Map UserSavingsProfile to a compatible UserProfile update
        await updateUserProfile(user.uid, {
          postcode: userSavingsProfile.household.postcode,
          homeType: userSavingsProfile.household.homeType,
          occupants: userSavingsProfile.household.occupants,
          onboardingCompleted: true,
          profileCompleteness: 100,
          lastCompleted: new Date().toISOString(),
          // Optionally store the full canonical profile as JSON for future extensibility
          savingsProfileV1: userSavingsProfile,
        });
      } catch (e) {
        // Fail silently, user still proceeds
      }
    }
    setMessages(prev => [
      ...prev,
      {
        type: 'assistant',
        message: "All done! 🎉",
        delay: 0,
      },
      {
        type: 'assistant',
        message: "Your personalized dashboard is ready. Let me show you what you could be saving...",
        delay: 800,
      },
    ]);
    setTimeout(() => {
      if (onComplete) {
        onComplete();
        setTimeout(() => router.push('/dashboard-new/'), 500);
      } else {
        const returnUrl = sessionStorage.getItem('returnAfterOnboarding');
        if (returnUrl) {
          sessionStorage.removeItem('returnAfterOnboarding');
          router.push(returnUrl);
        } else {
          router.push('/dashboard-new/');
        }
      }
    }, 2500);
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsUploading(true);
    setShowConfirmation(false);
    setExtractedData(null);
    setEditedData({});
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: `📸 Uploaded ${file.name}`,
        delay: 0,
      },
    ]);

    try {
      // 1. Upload file to server
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/bills/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success || !uploadData.fileUrl) {
        setMessages(prev => [
          ...prev,
          { type: 'assistant', message: uploadData.error || 'Upload failed. Please try again.', delay: 0 },
        ]);
        setIsUploading(false);
        setShowSkipOption(true);
        return;
      }

      // 2. Extract bill data (PDF or image)
      const extractRes = await fetch('/api/bills/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: uploadData.fileUrl, fileName: uploadData.fileName }),
      });
      const extractData = await extractRes.json();
      if (extractData.error) {
        setMessages(prev => [
          ...prev,
          { type: 'assistant', message: extractData.error, delay: 0 },
        ]);
        setIsUploading(false);
        setShowSkipOption(true);
        return;
      }

      // 3. Show extracted fields for review & edit
      setExtractedData(extractData);
      setEditedData(extractData);
      setShowConfirmation(true);
      setIsUploading(false);
      setMessages(prev => [
        ...prev,
        { type: 'assistant', message: 'Perfect! I found these details from your document. Please review and confirm:', delay: 0 },
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { type: 'assistant', message: 'Extraction failed. Please try again or use a different file.', delay: 0 },
      ]);
      setIsUploading(false);
      setShowSkipOption(true);
    }
  }

  function handleConfirmExtraction() {
    // User confirmed the extracted data
    const dataToSave = editMode ? editedData : extractedData;
    manager.processExtractedData(dataToSave);
    
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: "✓ Looks good!",
        delay: 0,
      },
      {
        type: 'assistant',
        message: "Great! I've saved those details for you.",
        delay: 600,
      },
    ]);

    setShowConfirmation(false);
    setExtractedData(null);
    setEditMode(false);
    setTimeout(() => loadNextQuestion(), 1500);
  }

  function handleReupload() {
    // Allow user to upload again
    setExtractedData(null);
    setShowConfirmation(false);
    setEditMode(false);
    
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: "Let me try uploading again",
        delay: 0,
      },
    ]);

    // Trigger file input
    setTimeout(() => {
      cameraInputRef.current?.click();
    }, 500);
  }

  function handleEditData(field: string, value: string) {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: field === 'usage' || field === 'cost' ? parseFloat(value) || 0 : value,
    }));
  }

  function handleSkipPhoto() {
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: "I'll add this later",
        delay: 0,
      },
    ]);

    // Skip to next question
    setTimeout(() => loadNextQuestion(), 600);
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${isPopup ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              <Home className="w-5 h-5" />
              Home
            </a>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg ml-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Cost Saver</span>
          </div>

          {manager.isComplete() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoDashboard}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1 transition-all duration-500"
            style={{ width: `${manager.getProgress()}%` }}
          />
        </div>
      </div>

      {/* Chat container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-32 min-h-[calc(100vh-6rem)]">
        <div className="space-y-4 py-4">
          {/* Conversation history */}
          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              type={msg.type}
              message={msg.message}
              icon={msg.type === 'assistant' ? <Sparkles className="w-5 h-5" /> : undefined}
            />
          ))}

          {/* Auth Choice Step */}
          {showAuthChoice && !authChoiceMade && (
            <MessageCard delay={600}>
              <div className="space-y-4 text-center">
                <div className="font-semibold text-lg">Create a free account to save your insights</div>
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    className="w-full h-12"
                    onClick={() => {
                      setAuthChoiceMade(true);
                      sessionStorage.setItem('returnAfterOnboarding', '/dashboard-new/');
                      router.push('/sign-up?from=onboarding');
                    }}
                  >Sign up</Button>
                  <Button
                    className="w-full h-12"
                    variant="outline"
                    onClick={() => {
                      setAuthChoiceMade(true);
                      sessionStorage.setItem('returnAfterOnboarding', '/dashboard-new/');
                      router.push('/sign-in?from=onboarding');
                    }}
                  >Sign in</Button>
                  <Button
                    className="w-full h-12"
                    variant="ghost"
                    onClick={() => {
                      setAuthChoiceMade(true);
                      setShowAuthChoice(false);
                      finalizeOnboarding();
                    }}
                  >Continue without account</Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">You can always create an account later to sync your data.</div>
              </div>
            </MessageCard>
          )}

          {/* Confirmation UI for extracted data (photo/PDF upload) */}
          {showConfirmation && (
            <MessageCard delay={600}>
              <div className="space-y-4">
                <div className="text-center font-semibold text-lg">Review & Confirm Extracted Bill Details</div>
                {/* Editable fields for extracted data */}
                <div className="space-y-2">
                  {Object.entries(extractedData || {}).map(([key, value]) => {
                    // Only show editable fields that are string/number and not internal
                    if ([
                      'provider','billDate','billPeriodStart','billPeriodEnd','energyType','electricityUsage','electricityDays','electricityCost','electricityUnitRate','electricityStandingCharge','gasUsage','gasDays','gasCost','gasUnitRate','gasStandingCharge','totalCost','tariff','cost','usage','ocrConfidence','needsReview'
                    ].includes(key) && typeof value !== 'object') {
                      return (
                        <div key={key}>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                          <Input
                            type={typeof value === 'number' ? 'number' : 'text'}
                            value={editedData[key] ?? ''}
                            onChange={e => handleEditData(key, e.target.value)}
                            className="h-12"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                {/* Save/Cancel/Re-upload buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    className="flex-1 h-12"
                    onClick={handleConfirmExtraction}
                  >
                    ✓ Confirm & Continue
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    variant="outline"
                    onClick={handleReupload}
                  >
                    Upload New Document
                  </Button>
                  <Button
                    className="flex-1 h-10"
                    variant="ghost"
                    onClick={() => {
                      setEditMode(false);
                      setEditedData(extractedData);
                    }}
                  >
                    Reset Edits
                  </Button>
                </div>
                {extractedData?.extractedText && (
                  <details className="mt-2 text-xs text-gray-400">
                    <summary>Show extracted text</summary>
                    <pre className="whitespace-pre-wrap">{extractedData.extractedText}</pre>
                  </details>
                )}
              </div>
            </MessageCard>
          )}

          {/* Question UI - Always show when question exists */}
          {currentQuestion && !showConfirmation && (
            <MessageCard delay={1200}>
              <div className={`space-y-4 transition-opacity duration-300 ${showTyping ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      manager.goToPreviousQuestion();
                      setCurrentQuestion(manager.getCurrentQuestion());
                    }}
                    disabled={manager.getState().currentQuestion === 0}
                  >
                    ← Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      manager.goToNextQuestion();
                      setCurrentQuestion(manager.getCurrentQuestion());
                    }}
                    disabled={manager.getState().currentQuestion >= ONBOARDING_QUESTIONS.length - 1}
                  >
                    Next →
                  </Button>
                </div>

                {/* Postcode input */}
                {currentQuestion.type === 'postcode' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block text-center">
                        UK Postcode
                      </label>
                      <Input
                        type="text"
                        placeholder="SW1A 1AA"
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' && inputValue.length >= 5) {
                            handleAnswer(inputValue, inputValue);
                          }
                        }}
                        className="text-center text-lg h-14 border-2"
                        maxLength={16}
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        We use this to find your area's energy prices
                      </p>
                    </div>
                    <Button
                      className="w-full mt-4 h-12"
                      disabled={inputValue.length < 5}
                      onClick={() => handleAnswer(inputValue, inputValue)}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Options with cards */}
                {currentQuestion.options && (
                  <SelectableGrid columns={currentQuestion.options.length > 4 ? 2 : 1}>
                    {currentQuestion.options.map((option: any) => (
                      <SelectableCard
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        icon={option.icon}
                        selected={selectedValue === option.value}
                        onSelect={() => {
                          setSelectedValue(option.value);
                          setTimeout(() => handleAnswer(option.value, option.label), 300);
                        }}
                      />
                    ))}
                  </SelectableGrid>
                )}

                {/* Supplier selection */}
                {currentQuestion.type === 'supplier' && (
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">
                      Popular Suppliers
                    </div>
                    <SelectableGrid>
                      {POPULAR_SUPPLIERS.map((supplier) => (
                        <SelectableCard
                          key={supplier.value}
                          value={supplier.value}
                          label={supplier.label}
                          icon={supplier.icon}
                          selected={selectedValue === supplier.value}
                          onSelect={() => {
                            setSelectedValue(supplier.value);
                            setTimeout(() => handleAnswer(supplier.value, supplier.label), 300);
                          }}
                        />
                      ))}
                    </SelectableGrid>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // TODO: Show full supplier list
                        handleAnswer('other', 'Other supplier');
                      }}
                    >
                      Show all suppliers
                    </Button>
                  </div>
                )}

                {/* Tariff input */}
                {currentQuestion.type === 'tariff' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-3">
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="e.g., Flexible Octopus, Agile Oct 24"
                        value={inputValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' && inputValue) {
                            handleAnswer(inputValue, inputValue);
                          }
                        }}
                        className="text-center text-lg h-14 border-2"
                        autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Check your latest bill or supplier website
                      </p>
                    </div>
                    <Button
                      className="w-full h-12"
                      disabled={!inputValue}
                      onClick={() => handleAnswer(inputValue, inputValue)}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      className="w-full h-10"
                      variant="ghost"
                      onClick={() => {
                        handleAnswer('unknown', "I don't know my tariff");
                      }}
                    >
                      I don't know
                    </Button>
                  </div>
                )}

                {/* Photo upload */}
                {currentQuestion.type === 'photo' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
                    {/* Hidden file inputs */}
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      aria-label="Take photo with camera or upload PDF"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      aria-label="Upload photo or PDF from gallery"
                    />

                    {/* Upload instruction */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      📄 Upload your energy bill, smart meter photo, or PDF
                    </p>

                    {/* Upload buttons */}
                    <Button 
                      className="w-full h-14" 
                      size="lg"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Take Photo</>
                      )}
                    </Button>
                    <Button
                      className="w-full h-12 mt-2"
                      variant="outline"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Upload from Gallery / PDF
                    </Button>
                  </div>
                )}
              </div>
            </MessageCard>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed bottom actions */}
      {currentQuestion && showSkipOption && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent pb-8 pt-12 z-20">
          <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <SkipForward className="w-4 h-4" />
              Skip for now
            </Button>
            
            {manager.isComplete() && (
              <Button
                variant="outline"
                onClick={handleGoDashboard}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

