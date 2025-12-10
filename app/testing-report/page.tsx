/**
 * TESTING REPORT PAGE
 * 
 * Comprehensive testing results from 10 mock users
 * Shows bugs, user feedback, and action items
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TEST_USERS,
  TEST_SCENARIOS,
  DISCOVERED_ISSUES,
  USER_FEEDBACK,
  TESTING_SUMMARY 
} from '@/lib/comprehensiveUserTesting';
import { 
  BUG_REPORT,
  ACTION_ITEMS,
  USER_SCORES,
  LAUNCH_READINESS,
  TESTING_CHECKLIST 
} from '@/lib/bugReportActionPlan';

export default function TestingReportPage() {
  const [selectedTab, setSelectedTab] = useState<'summary' | 'bugs' | 'feedback' | 'action'>('summary');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            🧪 Comprehensive User Testing Report
          </h1>
          <p className="text-lg opacity-90">
            10 Mock Users • 10 Scenarios • {DISCOVERED_ISSUES.length} Issues Found
          </p>
          <p className="text-sm opacity-75 mt-2">
            Generated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {[
              { id: 'summary', label: '📊 Summary', },
              { id: 'bugs', label: '🐛 Bugs Found' },
              { id: 'feedback', label: '💬 User Feedback' },
              { id: 'action', label: '✅ Action Items' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Tab */}
        {selectedTab === 'summary' && (
          <div className="space-y-6">
            {/* Launch Readiness */}
            <div className={`p-6 rounded-lg border-2 ${
              LAUNCH_READINESS.blockers.length > 0
                ? 'bg-red-50 border-red-400 dark:bg-red-900/20'
                : 'bg-green-50 border-green-400 dark:bg-green-900/20'
            }`}>
              <h2 className="text-2xl font-bold mb-4">
                {LAUNCH_READINESS.status} Launch Readiness
              </h2>
              {LAUNCH_READINESS.blockers.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">🚫 Launch Blockers:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {LAUNCH_READINESS.blockers.map((blocker, i) => (
                      <li key={i} className="text-gray-900 dark:text-white">{blocker}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3 className="font-bold mb-2">Recommendations:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  {LAUNCH_READINESS.recommendations.map((rec, i) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300">{rec}</li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Testing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl font-bold text-blue-600">{BUG_REPORT.usersTest}</div>
                <div className="text-gray-600 dark:text-gray-400">Users Tested</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl font-bold text-purple-600">{BUG_REPORT.scenariosTested}</div>
                <div className="text-gray-600 dark:text-gray-400">Scenarios</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl font-bold text-red-600">{BUG_REPORT.bugsFound}</div>
                <div className="text-gray-600 dark:text-gray-400">Issues Found</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl font-bold text-green-600">{USER_SCORES.projectedAfterFixes.average}</div>
                <div className="text-gray-600 dark:text-gray-400">Score (after fixes)</div>
              </div>
            </div>

            {/* Issue Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4">Issue Severity Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="font-semibold">🔴 Critical</span>
                  <span className="text-2xl font-bold">{BUG_REPORT.criticalBugs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <span className="font-semibold">🟠 High</span>
                  <span className="text-2xl font-bold">{BUG_REPORT.highPriorityIssues.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <span className="font-semibold">🟡 Medium</span>
                  <span className="text-2xl font-bold">{BUG_REPORT.mediumPriorityIssues.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="font-semibold">🟢 Low</span>
                  <span className="text-2xl font-bold">{BUG_REPORT.lowPriorityIssues.length}</span>
                </div>
              </div>
            </div>

            {/* Testing Checklist */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold mb-4">Components Tested</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(TESTING_CHECKLIST).map(([component, data]: [string, any]) => (
                  <div key={component} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-bold capitalize mb-2">{component}</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(data).filter(([key]) => key !== 'tested').map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bugs Tab */}
        {selectedTab === 'bugs' && (
          <div className="space-y-6">
            {/* Critical Issues */}
            {BUG_REPORT.criticalIssues.map((issue, idx) => (
              <div key={idx} className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
                      {issue.severity}
                    </span>
                    <h3 className="text-xl font-bold mt-2">{issue.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{issue.component}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">Problem:</h4>
                    <p className="text-gray-700 dark:text-gray-300">{issue.problem.description}</p>
                    <p className="text-red-600 dark:text-red-400 mt-2">
                      <strong>User Impact:</strong> {issue.problem.userImpact}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">How to Reproduce:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {issue.problem.reproduction.map((step, i) => (
                        <li key={i} className="text-gray-700 dark:text-gray-300">{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Root Cause:</h4>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      {issue.rootCause}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Fix ({issue.fix.effort}):</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded">
                      <ol className="list-decimal list-inside space-y-1 text-sm mb-3">
                        {issue.fix.steps.map((step, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">{step}</li>
                        ))}
                      </ol>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                        {issue.fix.code.trim()}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-red-300">
                    <span className="text-sm">
                      <strong>Affected:</strong> {issue.affectedUsers}
                    </span>
                    <span className="text-sm">
                      <strong>Business Impact:</strong> {issue.businessImpact}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* High Priority */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">🟠 High Priority Issues</h3>
              {BUG_REPORT.highPriorityIssues.map((issue, idx) => (
                <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-400 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold">{issue.title}</h4>
                    <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">{issue.severity}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{issue.problem.description}</p>
                  {issue.problem.userQuotes && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded mb-3">
                      {issue.problem.userQuotes.map((quote, i) => (
                        <p key={i} className="text-sm italic text-gray-600 dark:text-gray-400">"{quote}"</p>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Fix:</strong> {issue.fix.effort} • {issue.fix.priority}
                  </div>
                </div>
              ))}
            </div>

            {/* Medium/Low Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold mb-3">🟡 Medium Priority</h3>
                <div className="space-y-2">
                  {BUG_REPORT.mediumPriorityIssues.map((issue, idx) => (
                    <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
                      <div className="font-semibold mb-1">{issue.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{issue.fix}</div>
                      <div className="text-xs text-gray-500 mt-1">Effort: {issue.effort}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">🟢 Low Priority</h3>
                <div className="space-y-2">
                  {BUG_REPORT.lowPriorityIssues.map((issue, idx) => (
                    <div key={idx} className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
                      <div className="font-semibold mb-1">{issue.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{issue.fix}</div>
                      <div className="text-xs text-gray-500 mt-1">Effort: {issue.effort}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {selectedTab === 'feedback' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold text-green-600 mb-4">✅ Positive Feedback</h3>
              <ul className="space-y-2">
                {USER_FEEDBACK.positive.map((feedback, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold text-red-600 mb-4">❌ Issues Reported</h3>
              <ul className="space-y-2">
                {USER_FEEDBACK.negative.map((feedback, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold text-blue-600 mb-4">💡 Suggestions</h3>
              <ul className="space-y-2">
                {USER_FEEDBACK.suggestions.map((feedback, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-xl font-bold text-orange-600 mb-4">🚫 Conversion Blockers</h3>
              <ul className="space-y-2">
                {USER_FEEDBACK.conversionBlockers.map((feedback, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Items Tab */}
        {selectedTab === 'action' && (
          <div className="space-y-6">
            {/* Immediate Actions */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-400 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">🔴 DO IMMEDIATELY (Today)</h3>
              {ACTION_ITEMS.immediate.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{item.task}</h4>
                    <span className="px-3 py-1 bg-red-600 text-white text-sm rounded">
                      {item.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div><strong>Assign:</strong> {item.assignTo}</div>
                    <div><strong>Time:</strong> {item.estimatedTime}</div>
                    <div><strong>Blocks Launch:</strong> {item.blocksLaunch ? 'YES' : 'NO'}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* This Week */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-400 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">🟠 This Week</h3>
              <div className="space-y-3">
                {ACTION_ITEMS.thisWeek.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{item.task}</h4>
                      <span className="text-xs text-gray-500">{item.deadline}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.assignTo} • {item.estimatedTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Sprint */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">🟢 Next Sprint</h3>
              <div className="space-y-3">
                {ACTION_ITEMS.nextSprint.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{item.task}</h4>
                      <span className="text-xs text-gray-500">{item.estimatedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link href="/dashboard-new">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
