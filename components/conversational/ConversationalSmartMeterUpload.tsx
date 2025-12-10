'use client';

/**
 * CONVERSATIONAL SMART METER UPLOAD
 * 
 * Chat-style photo upload and confirmation flow
 * Multi-photo support with adaptive feedback
 */

import { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Edit2, RotateCcw, Sparkles } from 'lucide-react';
import { ChatBubble } from '@/components/conversational/ChatBubble';
import { TypingIndicator } from '@/components/conversational/TypingIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface ConversationalSmartMeterUploadProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
  existingData?: any;
}

export default function ConversationalSmartMeterUpload({
  onComplete,
  onCancel,
  existingData,
}: ConversationalSmartMeterUploadProps) {
  const [step, setStep] = useState<'intro' | 'upload' | 'processing' | 'confirm' | 'complete'>('intro');
  const [messages, setMessages] = useState<Array<{ type: 'assistant' | 'user'; message: string }>>([
    {
      type: 'assistant',
      message: "Hi! 👋 Want to upload photos of your smart meter or energy usage?",
    },
    {
      type: 'assistant',
      message: "I can extract the details automatically — no typing needed!",
    },
  ]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function addMessage(type: 'assistant' | 'user', message: string) {
    setMessages(prev => [...prev, { type, message }]);
  }

  function handleStartUpload() {
    addMessage('user', "Yes, let's do it!");
    setStep('upload');
    setTimeout(() => {
      addMessage('assistant', "Great! You can take a photo or upload from your gallery.");
    }, 800);
  }

  function handleSkip() {
    addMessage('user', "I'll skip for now");
    setTimeout(() => {
      onCancel();
    }, 500);
  }

  async function handleFilesSelected(files: File[]) {
    if (files.length === 0) return;

    setSelectedFiles(files);
    setStep('processing');

    addMessage('user', `Uploaded ${files.length} photo${files.length > 1 ? 's' : ''} 📸`);
    
    setTimeout(() => {
      addMessage('assistant', "Analyzing your photo...");
    }, 500);

    // Simulate AI processing
    setTimeout(async () => {
      // TODO: Call actual API
      const mockExtracted = {
        meterReading: 12345,
        weeklyUsage: 85,
        monthlyUsage: 350,
        supplier: 'Octopus Energy',
        date: new Date().toLocaleDateString(),
        confidence: 0.92,
      };

      setExtractedData(mockExtracted);
      setEditedValues(mockExtracted);
      setStep('confirm');

      addMessage('assistant', "Perfect! Here's what I found:");
    }, 2500);
  }

  function handleConfirm() {
    addMessage('user', "Looks good!");
    setStep('complete');

    setTimeout(() => {
      addMessage('assistant', "Brilliant! Updating your dashboard now...");
    }, 500);

    setTimeout(() => {
      onComplete(editMode ? editedValues : extractedData);
    }, 1500);
  }

  function handleRetry() {
    addMessage('user', "Let me try again");
    setStep('upload');
    setSelectedFiles([]);
    setExtractedData(null);

    setTimeout(() => {
      addMessage('assistant', "No problem! Take another photo or upload a different one.");
    }, 800);
  }

  function handleEdit() {
    setEditMode(true);
    addMessage('user', "I'll make some corrections");
    setTimeout(() => {
      addMessage('assistant', "Sure! Update any values that don't look right.");
    }, 800);
  }

  const getConfidenceMessage = (confidence: number) => {
    if (confidence >= 0.9) return "I'm very confident about these readings.";
    if (confidence >= 0.7) return "These readings look good, but please double-check.";
    return "I'm not very confident about these. Please review carefully.";
  };

  const getSeasonalInsight = () => {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 2) {
      return "Because you uploaded this in winter, I expect your heating usage to be higher than in summer.";
    } else if (month >= 5 && month <= 8) {
      return "Summer months typically have lower usage — mainly just lighting and appliances.";
    }
    return "Your usage looks typical for this time of year.";
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">Smart Meter Upload</span>
          </div>

          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat container */}
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <div className="space-y-4">
          {/* Messages */}
          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              type={msg.type}
              message={msg.message}
              icon={msg.type === 'assistant' ? <Sparkles className="w-5 h-5" /> : undefined}
              animate={idx >= messages.length - 2}
            />
          ))}

          {/* Intro actions */}
          {step === 'intro' && (
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <Button
                className="w-full h-14 text-lg"
                onClick={handleStartUpload}
              >
                Yes, let's upload! 📸
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 text-lg"
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          )}

          {/* Upload options */}
          {step === 'upload' && (
            <div className="space-y-3 animate-slide-up">
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex-col gap-3"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="w-10 h-10 text-blue-600" />
                    <span className="text-base">Take Photo</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-32 flex-col gap-3"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-blue-600" />
                    <span className="text-base">Upload File</span>
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    💡 I can read: Meter displays, charts, bills, app screenshots, or any energy usage photo
                  </p>
                </div>
              </Card>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
              />
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <TypingIndicator />
          )}

          {/* Confirmation */}
          {step === 'confirm' && extractedData && (
            <div className="space-y-4 animate-slide-up">
              <Card className="p-6">
                {/* Confidence indicator */}
                <div className={`mb-4 p-3 rounded-lg ${
                  extractedData.confidence >= 0.9
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : extractedData.confidence >= 0.7
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                  <p className="text-sm font-medium">
                    {getConfidenceMessage(extractedData.confidence)}
                  </p>
                </div>

                {/* Extracted values */}
                <div className="space-y-3">
                  {editMode ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Meter Reading
                        </label>
                        <Input
                          type="number"
                          value={editedValues.meterReading}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedValues({ ...editedValues, meterReading: parseInt(e.target.value) })}
                          className="text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Weekly Usage (kWh)
                        </label>
                        <Input
                          type="number"
                          value={editedValues.weeklyUsage}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedValues({ ...editedValues, weeklyUsage: parseInt(e.target.value) })}
                          className="text-lg"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">Meter Reading:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {extractedData.meterReading.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">Weekly Usage:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {extractedData.weeklyUsage} kWh
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300">Monthly Usage:</span>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {extractedData.monthlyUsage} kWh
                        </span>
                      </div>

                      {extractedData.supplier && (
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">Supplier:</span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {extractedData.supplier}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Seasonal insight */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 {getSeasonalInsight()}
                  </p>
                </div>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  className="w-full h-14 text-lg"
                  onClick={handleConfirm}
                >
                  <Check className="w-5 h-5 mr-2" />
                  {editMode ? 'Save Changes' : 'Looks Good!'}
                </Button>

                {!editMode && (
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={handleEdit}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Values
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full h-12"
                  onClick={handleRetry}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div className="animate-slide-up">
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  All Set!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your usage data has been added to your dashboard
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
