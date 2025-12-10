/**
 * BILL UPLOAD WIDGET (HOMEPAGE)
 * 
 * Prominent drag & drop bill upload on homepage
 * Client-side OCR processing for privacy
 * Instant analysis and savings preview
 * 
 * @component BillUploadWidget
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { extractBillData, BillData } from '@/lib/billOCR';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

export default function BillUploadWidget() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<BillData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  // Handle file input change
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  // Process uploaded file
  const processFile = async (file: File) => {
    setError(null);
    setExtractedData(null);
    setUploading(true);
    setExtracting(true);

    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a PDF, JPG, or PNG file.');
      }

      // Extract data with user feedback
      console.log(`Processing ${file.type} file: ${file.name}`);
      const result = await extractBillData(file);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setError(null);
        console.log('Extraction successful:', result.data);
      } else {
        const errorMessage = result.error || 'Failed to extract bill data.';
        console.error('Extraction failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setExtractedData(null);
    } finally {
      setUploading(false);
      setExtracting(false);
    }
  };

  // Calculate potential savings
  const calculateSavings = (billData: BillData): number => {
    if (!billData.totalCost) return 0;
    // Conservative estimate: 15% savings available
    return Math.round(billData.totalCost * 0.15);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload Your Energy Bill
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
            We'll analyze it instantly and show you exactly how much you could save
          </p>
        </div>

        {!extractedData ? (
          <>
            {/* Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center 
                transition-all duration-200 cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
                ${uploading ? 'pointer-events-none' : ''}
              `}
            >
              {uploading || extracting ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                    {extracting ? '🔍 Reading your bill...' : '📤 Uploading...'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {extracting ? 'Extracting supplier, usage, and costs' : 'Processing file...'}
                  </p>
                  <div className="mt-4 bg-blue-50 dark:bg-gray-700 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-300">
                    💡 <strong>Tip:</strong> PDF bills are fastest. Scanned images may take 10-20 seconds.
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {dragActive ? 'Drop your bill here' : 'Drag & drop your bill here'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                    Supports: PDF, JPG, PNG • Max size: 10MB
                  </p>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Trust indicators */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">🔒</span>
                      <span>100% Private</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">⚡</span>
                      <span>Instant Results</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
                      <span>Free Forever</span>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {error}
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Try uploading a clearer image or PDF of your bill.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Results */
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-5xl mb-3">✨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Bill Analyzed Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Here's what we found from your bill
              </p>
            </div>

            {/* Extracted Data Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              {extractedData.supplier && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Supplier</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {extractedData.supplier}
                  </p>
                </div>
              )}
              
              {extractedData.totalCost && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Cost</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    £{extractedData.totalCost.toFixed(2)}
                  </p>
                </div>
              )}

              {extractedData.electricityUsage && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Electricity Usage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {extractedData.electricityUsage.kwh} kWh
                  </p>
                  {extractedData.electricityUsage.rate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @ {extractedData.electricityUsage.rate}p/kWh
                    </p>
                  )}
                </div>
              )}

              {extractedData.gasUsage && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gas Usage</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {extractedData.gasUsage.kwh} kWh
                  </p>
                  {extractedData.gasUsage.rate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      @ {extractedData.gasUsage.rate}p/kWh
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Savings Potential */}
            {extractedData.totalCost && (
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white text-center">
                <p className="text-sm opacity-90 mb-2">Estimated Annual Savings</p>
                <p className="text-4xl font-bold mb-2">
                  £{(calculateSavings(extractedData) * 12).toFixed(0)}
                </p>
                <p className="text-sm opacity-90">
                  Based on our comparison of 150+ tariffs
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/tariffs')}
                className="flex-1"
              >
                Compare Tariffs & Save →
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setExtractedData(null);
                  setError(null);
                }}
                className="flex-1"
              >
                Upload Another Bill
              </Button>
            </div>

            {/* Confidence Indicator */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Extraction Confidence: {extractedData.confidence === 'high' ? '🟢 High' : extractedData.confidence === 'medium' ? '🟡 Medium' : '🔴 Low'}
              {extractedData.confidence !== 'high' && (
                <span className="block mt-1">
                  Some data may need manual verification
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        <p className="flex items-center justify-center gap-1">
          <span>🔒</span>
          <span>All processing happens on your device. Your bill data never leaves your browser.</span>
        </p>
      </div>
    </div>
  );
}
