/**
 * UX TESTING DASHBOARD
 * 
 * Visualizes user journey analysis and identifies UX issues
 * Shows time-to-value metrics and improvement recommendations
 */

'use client';

import { useState } from 'react';
import { 
  MOCK_USERS, 
  JOURNEY_ANALYSIS, 
  PRIORITY_IMPROVEMENTS,
  UX_SUMMARY 
} from '@/lib/mockUserJourneys';

export default function UXTestingDashboard() {
  const [selectedUser, setSelectedUser] = useState<keyof typeof MOCK_USERS>('busyParent');
  
  const user = MOCK_USERS[selectedUser];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 UX Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analysis of user journeys and app usability with 4 personas
          </p>
        </div>

        {/* Overall Assessment */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 shadow-lg border-2 border-yellow-400">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📊 Overall Assessment
          </h2>
          <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            {UX_SUMMARY.overallAssessment}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">Strengths:</h3>
              <ul className="space-y-1">
                {UX_SUMMARY.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Weaknesses:</h3>
              <ul className="space-y-1">
                {UX_SUMMARY.weaknesses.map((weakness, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{weakness}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* User Persona Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            👥 Test Personas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(MOCK_USERS).map(([key, userData]) => (
              <button
                key={key}
                onClick={() => setSelectedUser(key as keyof typeof MOCK_USERS)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedUser === key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {key === 'busyParent' && '👨‍👩‍👧‍👦'}
                  {key === 'techStudent' && '👨‍💻'}
                  {key === 'elderlyUser' && '👵'}
                  {key === 'renter' && '🏠'}
                </div>
                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                  {userData.profile.displayName}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {key === 'busyParent' && 'Busy Parent'}
                  {key === 'techStudent' && 'Tech-Savvy'}
                  {key === 'elderlyUser' && 'Elderly User'}
                  {key === 'renter' && 'Price-Conscious'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Persona Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            📋 {user.profile.displayName}'s Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Demographics</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>🏠 {user.profile.homeType} ({user.profile.occupants} people)</li>
                <li>💰 Budget: £{(user.profile as any).monthlyBudget}/month</li>
                <li>🎯 Goal: Save £{(user.profile as any).savingsGoal}/month</li>
                <li>⚡ Electricity: {user.billData.electricityUsage?.kwh} kWh</li>
                {user.billData.gasUsage && <li>🔥 Gas: {user.billData.gasUsage.kwh} kWh</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Expectations</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>⏱️ Max time: {user.expectations.maxTimeToValue}</li>
                <li>🎯 Goal: {user.expectations.primaryGoal}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Frustrations</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {user.expectations.frustrations.map((f, i) => (
                  <li key={i}>❌ {f}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Ideal Flow ({user.expectations.maxTimeToValue}):
            </h3>
            <ol className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              {user.expectations.idealFlow.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Time to Complete Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            ⏱️ Time to Complete Key Tasks
          </h2>
          
          <div className="space-y-4">
            {Object.entries(JOURNEY_ANALYSIS.timeToComplete.tasks).map(([task, data]) => (
              <div key={task} className="border-l-4 pl-4 py-2" style={{
                borderColor: data.status.includes('GOOD') ? '#10b981' : 
                            data.status.includes('ACCEPTABLE') ? '#f59e0b' : '#ef4444'
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{task}</span>
                  <span className="text-sm">{data.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Current: {data.current}</span>
                  <span>→</span>
                  <span>Ideal: {data.ideal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Improvements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🔧 Priority Improvements
          </h2>
          
          <div className="space-y-4">
            {PRIORITY_IMPROVEMENTS.map((improvement, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  improvement.priority === 'HIGH' 
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                    : improvement.priority === 'MEDIUM'
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-400 bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      improvement.priority === 'HIGH' ? 'bg-red-600 text-white' :
                      improvement.priority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {improvement.priority}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {improvement.issue}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {improvement.effort} effort • ~{improvement.estimatedTime}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Impact:</strong> {improvement.impact}
                </p>
                
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Solution:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {improvement.solution.map((sol, i) => (
                      <li key={i}>{sol}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🗺️ Current User Journey Issues
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Homepage → First Value
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  {JOURNEY_ANALYSIS.homepageToValue.currentSteps.map((step, i) => (
                    <div key={i}>{step}</div>
                  ))}
                </div>
                <div className="mt-4">
                  <strong className="text-red-600 dark:text-red-400">Issues:</strong>
                  <ul className="mt-1 space-y-1">
                    {JOURNEY_ANALYSIS.homepageToValue.issues.map((issue, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Cognitive Load Assessment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  <div>Homepage elements: <strong>{JOURNEY_ANALYSIS.cognitiveLoad.homepageElements}</strong></div>
                  <div>Dashboard elements: <strong>{JOURNEY_ANALYSIS.cognitiveLoad.dashboardElements}</strong></div>
                  <div>Decision points: <strong>{JOURNEY_ANALYSIS.cognitiveLoad.averageDecisionPoints}</strong></div>
                  <div className="mt-2 text-red-600 dark:text-red-400 font-bold">
                    Status: {JOURNEY_ANALYSIS.cognitiveLoad.recommendation}
                  </div>
                </div>
                <div className="mt-4">
                  <strong className="text-red-600 dark:text-red-400">Issues:</strong>
                  <ul className="mt-1 space-y-1">
                    {JOURNEY_ANALYSIS.cognitiveLoad.issues.map((issue, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-3">
            💡 Bottom Line
          </h2>
          <p className="text-lg mb-4">
            {UX_SUMMARY.recommendation}
          </p>
          <p className="text-sm opacity-90">
            The app has a solid foundation but needs simplification. Users want value in under 60 seconds, 
            but current flow takes 60-120 seconds. Focus on reducing steps, speeding up OCR, and showing 
            savings estimates immediately after upload.
          </p>
        </div>

      </div>
    </div>
  );
}
