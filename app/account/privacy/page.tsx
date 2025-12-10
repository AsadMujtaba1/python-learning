'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserProfile } from '@/lib/userProfile';
import { compliance } from '@/lib/complianceService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Download, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  FileText,
  Clock
} from 'lucide-react';

export default function PrivacyDataPage() {
  const router = useRouter();
  const { user, deleteUserAccount } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportData = async () => {
    if (!user) return;

    try {
      setExporting(true);
      setError(null);

      // Fetch user data from Firestore
      const profile = await getUserProfile(user.uid);
      
      // Get localStorage data
      const localData = {
        userHomeData: localStorage.getItem('userHomeData'),
        onboardingProgress: localStorage.getItem('onboardingProgress'),
      };

      // Use compliance service to format export
      const exportData = compliance.exportUserData(user.uid, {
        email: user.email,
        displayName: user.displayName,
        createdAt: user.metadata.creationTime,
        ...profile,
        localStorage: localData,
      });

      // Create JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cost-saver-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Your data has been downloaded successfully!');
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data. Please try again or contact support.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      // Use the deleteUserAccount function from AuthContext
      // This should delete both Firestore data and Firebase Auth user
      await deleteUserAccount();

      // Clear localStorage
      localStorage.clear();
      sessionStorage.clear();

      // Redirect to homepage with confirmation
      router.push('/?deleted=true');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete account. Please try again or contact support at privacy@costsaver.com');
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access privacy settings</p>
          <Button onClick={() => router.push('/sign-in')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/account')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Account
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Privacy & Data</h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Your Rights */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your GDPR Rights</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Under UK/EU data protection law, you have complete control over your data.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span><strong>Right to Access:</strong> Download all your data in machine-readable format</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span><strong>Right to Rectification:</strong> Update your information in Account Settings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span><strong>Right to Erasure:</strong> Permanently delete your account and data</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <span><strong>Right to Portability:</strong> Take your data to another service</span>
            </li>
          </ul>
        </Card>

        {/* Export Data Section */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Export Your Data
              </h3>
              <p className="text-gray-600 mb-4">
                Download a complete copy of all data we store about you in JSON format. 
                This includes your profile, energy usage data, and all activity history.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Export includes:</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-6">
                  <li>• Personal information (email, postcode, etc.)</li>
                  <li>• Energy usage data and bills</li>
                  <li>• Tariff comparison history</li>
                  <li>• Recommendations and insights</li>
                  <li>• Consent records and data retention policies</li>
                </ul>
              </div>
              <Button
                onClick={handleExportData}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download My Data
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                File will be downloaded as JSON format, readable by any text editor
              </p>
            </div>
          </div>
        </Card>

        {/* Delete Account Section */}
        <Card className="p-6 border-red-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Delete Your Account
              </h3>
              <p className="text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Before you delete:</p>
                        <ul className="space-y-1">
                          <li>• All your data will be permanently removed</li>
                          <li>• You won't be able to access your account</li>
                          <li>• Any active referrals or rewards will be lost</li>
                          <li>• This action is irreversible</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Data will be completely removed within 30 days as per GDPR requirements</span>
                  </div>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    I Want to Delete My Account
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <p className="font-semibold text-red-900 mb-3">
                      ⚠️ Final Confirmation Required
                    </p>
                    <p className="text-sm text-red-800 mb-4">
                      Type <strong>DELETE MY ACCOUNT</strong> below to confirm permanent deletion:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type here..."
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      {deleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Permanently Delete Account
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                        setError(null);
                      }}
                      variant="outline"
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            If you have questions about your privacy rights or need assistance:
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Email: <a href="mailto:privacy@costsaver.com" className="text-blue-600 hover:underline">privacy@costsaver.com</a>
          </p>
        </Card>
      </div>
    </div>
  );
}
