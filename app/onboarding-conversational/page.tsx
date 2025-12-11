'use client';

/**
 * CONVERSATIONAL ONBOARDING PAGE
 * 
 * Modern chat-style onboarding inspired by Monzo, Revolut, Octopus Energy
 * One question at a time, tap-based, minimal typing, adaptive skipping
 */

import { useState, useEffect, useRef } from 'react';
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

export default function ConversationalOnboardingPage() {
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
        // Add assistant messages
        const newMessages: Array<{ type: 'assistant' | 'user'; message: string; delay: number }> = [];
        
        if (next.message) {
          newMessages.push({
            type: 'assistant' as const,
            message: next.message,
            delay: 0,
          });
        }

        if (next.secondaryMessage) {
          newMessages.push({
            type: 'assistant' as const,
            message: next.secondaryMessage,
            delay: 800,
          });
        }

        setMessages(prev => [...prev, ...newMessages]);

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
    // Accept UK postcodes with or without spaces
    const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
    // UK postcode regex (no space)
    const ukPostcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\d[A-Z]{2}$/i;
    return ukPostcodeRegex.test(cleaned);
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

    manager.answerQuestion(currentQuestion.id, answer);

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

  async function handleComplete() {
    // Save final data
    const answers = manager.getAnswers();
    localStorage.setItem('userHomeData', JSON.stringify(answers));

    // Show completion message
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

    // Navigate after delay - check for return URL
    setTimeout(() => {
      const returnUrl = sessionStorage.getItem('returnAfterOnboarding');
      if (returnUrl) {
        sessionStorage.removeItem('returnAfterOnboarding');
        router.push(returnUrl);
      } else {
        router.push('/dashboard-new/');
      }
    }, 2500);
  }

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        message: `📸 Uploaded ${files[0].name}`,
        delay: 0,
      },
    ]);

    // Simulate processing delay
    setTimeout(() => {
      // TODO: Replace with actual OCR/extraction API call
      // Improved extraction: if PDF, show message to user
      const file = files[0];
      let mockExtracted;
      if (file && file.type === 'application/pdf') {
        mockExtracted = {
          supplier: '',
          usage: '',
          tariff: '',
          cost: '',
        };
        setMessages(prev => [
          ...prev,
          {
            type: 'assistant',
            message: "PDF extraction is not yet supported. Please upload a photo for best results.",
            delay: 0,
          },
        ]);
      } else {
        mockExtracted = {
          supplier: 'Octopus Energy',
          usage: 2500,
          tariff: 'Flexible Octopus',
          cost: 215.50,
        };
        setMessages(prev => [
          ...prev,
          {
            type: 'assistant',
            message: "Perfect! I found these details from your photo:",
            delay: 0,
          },
        ]);
      }
      setExtractedData(mockExtracted);
      setEditedData(mockExtracted);
      setIsUploading(false);
      setShowConfirmation(true);
    }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
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
              delay={msg.delay}
              animate={idx >= messages.length - 2}
            />
          ))}

          {/* Typing indicator */}
          {showTyping && <TypingIndicator />}

          {/* Extraction Confirmation UI */}
          {showConfirmation && extractedData && (
            <MessageCard delay={800}>
              <div className="bg-blue-50 dark:bg-gray-700 rounded-2xl p-5 space-y-4">
                {!editMode ? (
                  <>
                    {/* Display extracted data */}
                    <div className="space-y-3">
                      {extractedData.supplier && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {extractedData.supplier}
                          </p>
                        </div>
                      )}
                      
                      {extractedData.usage && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Usage</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {extractedData.usage} kWh
                          </p>
                        </div>
                      )}

                      {extractedData.tariff && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tariff</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            {extractedData.tariff}
                          </p>
                        </div>
                      )}

                      {extractedData.cost && (
                        <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Cost</p>
                          <p className="text-base font-semibold text-gray-900 dark:text-white">
                            £{extractedData.cost.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <Button
                        className="w-full h-12"
                        onClick={handleConfirmExtraction}
                      >
                        ✓ Looks good!
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 h-10"
                          variant="outline"
                          onClick={() => setEditMode(true)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          className="flex-1 h-10"
                          variant="outline"
                          onClick={handleReupload}
                        >
                          📸 Re-upload
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Edit mode */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Edit the details below
                      </p>
                      
                      {extractedData.supplier !== undefined && (
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Supplier</label>
                          <Input
                            type="text"
                            value={editedData.supplier || ''}
                            onChange={(e) => handleEditData('supplier', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}
                      
                      {extractedData.usage !== undefined && (
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Monthly Usage (kWh)</label>
                          <Input
                            type="number"
                            value={editedData.usage || ''}
                            onChange={(e) => handleEditData('usage', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}

                      {extractedData.tariff !== undefined && (
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tariff</label>
                          <Input
                            type="text"
                            value={editedData.tariff || ''}
                            onChange={(e) => handleEditData('tariff', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}

                      {extractedData.cost !== undefined && (
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Monthly Cost (£)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editedData.cost || ''}
                            onChange={(e) => handleEditData('cost', e.target.value)}
                            className="h-12"
                          />
                        </div>
                      )}
                    </div>

                    {/* Save/Cancel buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-12"
                        onClick={handleConfirmExtraction}
                      >
                        ✓ Save Changes
                      </Button>
                      <Button
                        className="flex-1 h-10"
                        variant="outline"
                        onClick={() => {
                          setEditMode(false);
                          setEditedData(extractedData);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </MessageCard>
          )}

          {/* Question UI - Always show when question exists */}
          {currentQuestion && !showConfirmation && (
            <MessageCard delay={1200}>
              <div className={`space-y-4 transition-opacity duration-300 ${showTyping ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Postcode input */}
                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      manager.state.currentQuestion = Math.max(0, manager.state.currentQuestion - 1);
                      setCurrentQuestion(manager.getCurrentQuestion());
                    }}
                    disabled={manager.state.currentQuestion === 0}
                  >
                    ← Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      manager.state.currentQuestion = Math.min(manager.state.currentQuestion + 1, ONBOARDING_QUESTIONS.length - 1);
                      setCurrentQuestion(manager.getCurrentQuestion());
                    }}
                    disabled={manager.state.currentQuestion >= ONBOARDING_QUESTIONS.length - 1}
                  >
                    Next →
                  </Button>
                </div>
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value.toUpperCase();
                          // Auto-format: add space before last 3 characters
                          if (value.length > 3 && !value.includes(' ')) {
                            const formatted = value.slice(0, -3) + ' ' + value.slice(-3);
                            setInputValue(formatted);
                          } else {
                            setInputValue(value);
                          }
                        }}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter' && inputValue.length >= 5) {
                            handleAnswer(inputValue, inputValue);
                          }
                        }}
                        className="text-center text-lg h-14 border-2"
                        maxLength={8}
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
                    {currentQuestion.options.map((option) => (
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
                        size="lg"
                      />
                    ))}
                  </SelectableGrid>
                )}

                {/* Occupants selector */}
                {currentQuestion.type === 'occupants' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center gap-6 sm:gap-8">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full text-2xl font-bold"
                        onClick={() => setInputValue(Math.max(1, parseInt(inputValue || '1') - 1).toString())}
                        aria-label="Decrease occupants"
                      >
                        −
                      </Button>
                      
                      <div className="min-w-[120px] text-center">
                        <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {inputValue || '2'}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {parseInt(inputValue || '2') === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full text-2xl font-bold"
                        onClick={() => setInputValue(Math.min(10, parseInt(inputValue || '2') + 1).toString())}
                        aria-label="Increase occupants"
                      >
                        +
                      </Button>
                    </div>

                    <Button
                      className="w-full mt-6 h-12"
                      onClick={() => handleAnswer(parseInt(inputValue || '2'), `${inputValue || '2'} people`)}
                    >
                      Confirm <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
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
                        <>
                          📸 Take Photo or Upload PDF
                        </>
                      )}
                    </Button>
                    <Button 
                      className="w-full h-14" 
                      variant="outline" 
                      size="lg"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      📁 Upload from Gallery or PDF
                    </Button>

                    {/* Clear skip option */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        className="w-full h-12"
                        variant="ghost"
                        onClick={() => {
                          handleSkipPhoto();
                          setShowSkipOption(false);
                          manager.skipQuestion();
                          setTimeout(() => loadNextQuestion(), 600);
                        }}
                        disabled={isUploading}
                      >
                        Skip - I'll add this later
                      </Button>
                    </div>

                    {/* Help text */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      We'll extract your supplier, tariff, and usage details automatically
                    </p>
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
