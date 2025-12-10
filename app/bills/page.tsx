/**
 * BILL UPLOAD PAGE
 * 
 * Upload energy bills for automatic data extraction
 * Premium feature with OCR processing
 * Privacy-focused: all processing done client-side
 * 
 * @page /bills
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile, UserProfile, isPremiumActive } from '@/lib/userProfile';
import { extractBillData, saveBillData, getUserBills, compareBillWithTariffs, BillData } from '@/lib/billOCR';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import FeatureGate from '@/components/FeatureGate';
import Alert from '@/components/Alert';

export default function BillsPage() {
  return (
    <ProtectedRoute>
      <BillsContent />
    </ProtectedRoute>
  );
}

function BillsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<BillData | null>(null);
  const [savedBills, setSavedBills] = useState<BillData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const loadProfileAndBills = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProfile = await getUserProfile(user.uid);
      setProfile(userProfile);

      const bills = await getUserBills(user.uid);
      setSavedBills(bills);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load profile and bills
  useEffect(() => {
    if (user) {
      loadProfileAndBills();
    }
  }, [user]);

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setError(null);
    setExtracting(true);

    try {
      // Extract data from bill
      const result = await extractBillData(file);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to extract bill data');
        setExtractedData(null);
      }
    } catch (err) {
      setError('An error occurred during extraction');
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // Save extracted bill
  const handleSaveBill = async () => {
    if (!user || !extractedData) return;

    try {
      setLoading(true);
      await saveBillData(user.uid, extractedData);
      
      // Reload bills
      const bills = await getUserBills(user.uid);
      setSavedBills(bills);

      // Clear form
      setUploadedFile(null);
      setExtractedData(null);
      setError(null);
    } catch (err) {
      setError('Failed to save bill data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && savedBills.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <FeatureGate featureId="bill_upload" profile={profile}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/dashboard-new" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm mb-2 inline-block">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📄 Upload Energy Bills
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-3">
                Automatic Bill Analysis
              </h2>
              <p className="text-purple-100 text-lg">
                Upload your energy bill and we'll automatically extract usage data, rates, and find better deals
              </p>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20">
                  🔒 Privacy-First
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20">
                  ⚡ Instant Analysis
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20">
                  💰 Find Savings
                </span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Upload Your Bill
            </h3>

            {/* Drag & Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="bill-upload"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                disabled={extracting}
              />

              {extracting ? (
                <div className="space-y-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Extracting bill data...
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">📤</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Drag & drop your bill here
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse
                  </p>
                  <label htmlFor="bill-upload">
                    <span className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer transition-colors">
                      Choose File
                    </span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Supports PDF, JPG, PNG (max 10MB)
                  </p>
                </>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="error" className="mt-4">
                {error}
              </Alert>
            )}

            {/* Extracted Data Display */}
            {extractedData && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    Extracted Information
                  </h4>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    extractedData.confidence === 'high'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : extractedData.confidence === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {extractedData.confidence === 'high' && '✅ High Confidence'}
                    {extractedData.confidence === 'medium' && '⚠️ Medium Confidence'}
                    {extractedData.confidence === 'low' && '❌ Low Confidence'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Supplier Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Supplier</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {extractedData.supplier || 'Not detected'}
                    </p>
                  </div>

                  {/* Account Number */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {extractedData.accountNumber || 'Not detected'}
                    </p>
                  </div>

                  {/* Billing Period */}
                  {extractedData.billingPeriod && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Billing Period</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {extractedData.billingPeriod.from} - {extractedData.billingPeriod.to}
                      </p>
                    </div>
                  )}

                  {/* Total Cost */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      £{extractedData.totalCost?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Electricity Usage */}
                  {extractedData.electricityUsage && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Electricity</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {extractedData.electricityUsage.kwh} kWh @ {extractedData.electricityUsage.rate}p/kWh
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cost: £{extractedData.electricityUsage.cost?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  )}

                  {/* Gas Usage */}
                  {extractedData.gasUsage && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gas</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {extractedData.gasUsage.kwh} kWh @ {extractedData.gasUsage.rate}p/kWh
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cost: £{extractedData.gasUsage.cost?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSaveBill}
                    disabled={loading}
                  >
                    💾 Save Bill Data
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setUploadedFile(null);
                      setExtractedData(null);
                      setError(null);
                    }}
                  >
                    ❌ Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Bills */}
          {savedBills.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Your Saved Bills
              </h3>
              <div className="space-y-4">
                {savedBills.map((bill, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {bill.supplier || 'Unknown Supplier'}
                          </p>
                          {bill.billingPeriod && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {bill.billingPeriod.from} - {bill.billingPeriod.to}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total: <strong className="text-gray-900 dark:text-white">£{bill.totalCost?.toFixed(2)}</strong>
                          </span>
                          {bill.electricityUsage && (
                            <span className="text-gray-600 dark:text-gray-400">
                              ⚡ {bill.electricityUsage.kwh} kWh
                            </span>
                          )}
                          {bill.gasUsage && (
                            <span className="text-gray-600 dark:text-gray-400">
                              🔥 {bill.gasUsage.kwh} kWh
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href="/tariffs">
                        <Button variant="primary" size="sm">
                          Find Better Deal →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🔒 Your Privacy Matters
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              All bill processing happens on your device. We never upload your bills to external servers. 
              Only extracted data (usage, rates) is saved securely to your account for tariff recommendations.
            </p>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
