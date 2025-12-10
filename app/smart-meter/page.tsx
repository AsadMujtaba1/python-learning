'use client';

/**
 * SMART METER ANALYTICS DASHBOARD
 * 
 * Comprehensive dashboard showing all smart meter photo analysis,
 * consumption history, insights, and recommendations
 */

import { useState, useEffect } from 'react';
import { Camera, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Upload, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SmartMeterUpload from '@/components/smartMeter/SmartMeterUpload';
import UsageChart from '@/components/smartMeter/UsageChart';
import InsightsList from '@/components/smartMeter/InsightsList';
import PhotoHistory from '@/components/smartMeter/PhotoHistory';
import PhotoConfirmation from '@/components/smartMeter/PhotoConfirmation';
import type {
  SmartMeterPhoto,
  SmartMeterAnalytics,
  UsageEstimate,
  UsageInsight,
  ConsumptionRecord,
} from '@/lib/types/smartMeterTypes';

export default function SmartMeterAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpload, setShowUpload] = useState(false);
  const [photos, setPhotos] = useState<SmartMeterPhoto[]>([]);
  const [analytics, setAnalytics] = useState<SmartMeterAnalytics | null>(null);
  const [estimate, setEstimate] = useState<UsageEstimate | null>(null);
  const [insights, setInsights] = useState<UsageInsight[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<SmartMeterPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load user's photos
      const photosRes = await fetch('/api/smart-meter/photos');
      const photosData = await photosRes.json();
      setPhotos(photosData.photos || []);

      // Load analytics
      const analyticsRes = await fetch('/api/smart-meter/analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);
      setEstimate(analyticsData.estimate);
      setInsights(analyticsData.insights || []);

      // Check for pending confirmations
      const pending = photosData.photos?.find(
        (p: SmartMeterPhoto) => p.extractionStatus === 'completed' && !p.userConfirmed
      );
      if (pending) {
        setPendingConfirmation(pending);
      }
    } catch (error) {
      console.error('Failed to load smart meter data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhotoUpload(files: File[]) {
    setShowUpload(false);
    setLoading(true);

    try {
      // Upload photos
      const formData = new FormData();
      files.forEach(file => formData.append('photos', file));

      const res = await fetch('/api/smart-meter/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // Reload data
        await loadData();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your energy data...</p>
        </div>
      </div>
    );
  }

  // First-time user - no photos yet
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Camera className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Smart Meter Photo Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload photos of your smart meter, energy bills, or usage charts. 
              Our AI will extract the data and provide intelligent insights to help you save money.
            </p>

            <Card className="max-w-2xl mx-auto mb-8 text-left">
              <CardHeader>
                <CardTitle>What can you upload?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Smart meter readings</strong> - Import, export, day, night rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Usage charts</strong> - Weekly, monthly, or yearly graphs from your supplier app</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Energy bills</strong> - Paper bills or email screenshots</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>In-home displays</strong> - Photos of your energy monitor</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Any energy data</strong> - Tables, graphs, statements from any source</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setShowUpload(true)} className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowUpload(true)}>
                <Upload className="w-5 h-5 mr-2" />
                Upload Files
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Your photos are processed securely and only usage numbers are stored. 
              You can delete photos anytime.
            </p>
          </div>
        </div>

        {showUpload && (
          <SmartMeterUpload
            onUpload={handlePhotoUpload}
            onCancel={() => setShowUpload(false)}
          />
        )}
      </div>
    );
  }

  // Main dashboard with data
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Smart Meter Analytics</h1>
              <p className="text-blue-100">
                {photos.length} photos uploaded • {analytics?.totalReadings || 0} readings analyzed
              </p>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Camera className="w-4 h-4 mr-2" />
              Add Photos
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6">
                <p className="text-blue-100 text-sm mb-1">Estimated Annual Usage</p>
                <p className="text-3xl font-bold">
                  {estimate?.yearlyTotal.toLocaleString() || '—'} <span className="text-xl">kWh</span>
                </p>
                <p className="text-sm text-blue-100 mt-1">
                  {estimate?.yearlyMin.toLocaleString()} - {estimate?.yearlyMax.toLocaleString()} kWh range
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6">
                <p className="text-blue-100 text-sm mb-1">Estimated Annual Cost</p>
                <p className="text-3xl font-bold">
                  £{estimate?.estimatedAnnualCost.toFixed(0) || '—'}
                </p>
                <p className="text-sm text-blue-100 mt-1">
                  £{estimate?.costMin.toFixed(0)} - £{estimate?.costMax.toFixed(0)} range
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6">
                <p className="text-blue-100 text-sm mb-1">Usage Trend</p>
                <div className="flex items-center gap-2">
                  {estimate?.trendDirection === 'increasing' && (
                    <>
                      <TrendingUp className="w-6 h-6 text-red-300" />
                      <span className="text-3xl font-bold">+{estimate.trendPercentage}%</span>
                    </>
                  )}
                  {estimate?.trendDirection === 'decreasing' && (
                    <>
                      <TrendingDown className="w-6 h-6 text-green-300" />
                      <span className="text-3xl font-bold">-{estimate.trendPercentage}%</span>
                    </>
                  )}
                  {estimate?.trendDirection === 'stable' && (
                    <span className="text-3xl font-bold">Stable</span>
                  )}
                </div>
                <p className="text-sm text-blue-100 mt-1">Over time</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="pt-6">
                <p className="text-blue-100 text-sm mb-1">Potential Savings</p>
                <p className="text-3xl font-bold">
                  £{analytics?.potentialSavings || 0}
                </p>
                <p className="text-sm text-blue-100 mt-1">Per year</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">
              Insights
              {insights.filter(i => !i.viewed).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {insights.filter(i => !i.viewed).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Photo History</TabsTrigger>
            <TabsTrigger value="charts">Detailed Charts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Urgent alerts */}
            {insights.filter(i => i.severity === 'alert' && !i.dismissed).length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <CardTitle className="text-red-900">Action Required</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights
                      .filter(i => i.severity === 'alert' && !i.dismissed)
                      .slice(0, 2)
                      .map(insight => (
                        <div key={insight.id} className="bg-white p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      ))}
                  </div>
                  <Button className="mt-4" onClick={() => setActiveTab('insights')}>
                    View All Insights
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Usage Chart */}
            {analytics && (
              <UsageChart
                analytics={analytics}
                estimate={estimate}
              />
            )}

            {/* Top Insights Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  Automatically generated from your usage data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InsightsList
                  insights={insights.slice(0, 5)}
                  compact={true}
                  onViewAll={() => setActiveTab('insights')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <InsightsList insights={insights} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <PhotoHistory
              photos={photos}
              onPhotoClick={(photo: SmartMeterPhoto) => setPendingConfirmation(photo)}
              onRefresh={loadData}
            />
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts">
            {analytics && (
              <div className="space-y-6">
                <UsageChart
                  analytics={analytics}
                  estimate={estimate}
                  showDetailed={true}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <SmartMeterUpload
          onUpload={handlePhotoUpload}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Confirmation Modal */}
      {pendingConfirmation && (
        <PhotoConfirmation
          photo={pendingConfirmation}
          onConfirm={async (confirmed: boolean) => {
            await fetch(`/api/smart-meter/photos/${pendingConfirmation.id}/confirm`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ confirmed }),
            });
            setPendingConfirmation(null);
            loadData();
          }}
          onClose={() => setPendingConfirmation(null)}
        />
      )}
    </div>
  );
}
