/**
 * UPLOAD SECTION COMPONENT
 * 
 * UX/UI Team Implementation
 * Bill upload via photo/PDF with OCR extraction
 * Reuses existing BillUploadWidget infrastructure
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { extractBillData, BillData } from '@/lib/billOCR';
import { extractInputsFromBillData, WasteCalculatorInput } from '@/lib/energyWasteCalculator';

interface UploadSectionProps {
  onExtract: (input: Partial<WasteCalculatorInput>) => void;
  onError: (error: string) => void;
}

export default function UploadSection({ onExtract, onError }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [extractedData, setExtractedData] = useState<BillData | null>(null);
  const [extractedInput, setExtractedInput] = useState<Partial<WasteCalculatorInput> | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedInput, setEditedInput] = useState<Partial<WasteCalculatorInput>>({});

  const processFile = async (file: File) => {
    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      onError('Please upload a JPEG, PNG, or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setProgress('Reading file...');

    try {
      // Extract bill data using existing OCR
      setProgress('Analyzing your bill...');
      const result = await extractBillData(file);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract bill data');
      }

      setProgress('Extracting key information...');
      
      // Convert bill data to calculator input
      const calculatorInput = extractInputsFromBillData(result.data);
      
      if (!calculatorInput.monthlyBill && !calculatorInput.unitRate) {
        throw new Error('Could not extract enough information from the bill. Please try manual input.');
      }

      setProgress('Done! ✓');
      
      // Show confirmation UI instead of immediately extracting
      setTimeout(() => {
        setExtractedData(result.data || null);
        setExtractedInput(calculatorInput);
        setEditedInput(calculatorInput);
        setShowConfirmation(true);
        setUploading(false);
        setProgress('');
      }, 500);

    } catch (err: any) {
      console.error('Bill extraction error:', err);
      onError(err.message || 'Failed to process bill. Please try again or use manual input.');
      setUploading(false);
      setProgress('');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleConfirm = () => {
    const dataToUse = editMode ? editedInput : extractedInput;
    if (dataToUse) {
      onExtract(dataToUse);
      setShowConfirmation(false);
      setExtractedData(null);
      setExtractedInput(null);
      setEditMode(false);
    }
  };

  const handleReupload = () => {
    setShowConfirmation(false);
    setExtractedData(null);
    setExtractedInput(null);
    setEditMode(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 300);
  };

  const handleEditField = (field: keyof WasteCalculatorInput, value: any) => {
    setEditedInput(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 border-2 border-dashed border-green-300 dark:border-green-700">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <span className="text-4xl">📸</span>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Upload Your Bill (Fastest!)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            We'll automatically extract the information
          </p>
        </div>

        {/* Confirmation UI */}
        {showConfirmation && extractedInput ? (
          <div className="bg-white dark:bg-gray-800 border-2 border-green-500 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-center justify-center">
              <span className="text-2xl">✓</span>
              <span>Data Extracted Successfully!</span>
            </div>

            {!editMode ? (
              <>
                <div className="space-y-3">
                  {extractedInput.monthlyBill !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Bill</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        £{extractedInput.monthlyBill.toFixed(2)}
                      </p>
                    </div>
                  )}

                  {extractedInput.unitRate !== undefined && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Rate</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {extractedInput.unitRate}p/kWh
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleConfirm}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    ✓ Use This Data
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={handleReupload}
                      className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      📸 Re-upload
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Edit the extracted values
                  </p>

                  {extractedInput.monthlyBill !== undefined && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                        Monthly Bill (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedInput.monthlyBill || ''}
                        onChange={(e) => handleEditField('monthlyBill', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
                      />
                    </div>
                  )}

                  {extractedInput.unitRate !== undefined && (
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                        Unit Rate (p/kWh)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editedInput.unitRate || ''}
                        onChange={(e) => handleEditField('unitRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border-2 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    ✓ Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedInput(extractedInput);
                    }}
                    className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                dragActive
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-green-400'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload bill file"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  !uploading && fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploading}
                aria-hidden="true"
              />

              {uploading ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {progress}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-5xl">📤</div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Drag & drop your bill here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Supports: PDF, JPG, PNG • Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Privacy Notice */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-start text-left">
          <span className="text-green-600 dark:text-green-400 mr-2 flex-shrink-0">🔒</span>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">100% Private:</strong> All processing happens in your browser.
            Your bill data is never uploaded to any server. We take your privacy seriously.
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 dark:text-gray-400">
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">⚡</span>
            <span>Instant</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">✓</span>
            <span>Accurate</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg mb-1">🔒</span>
            <span>Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
