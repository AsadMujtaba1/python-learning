'use client';

import { useState } from 'react';
import { feedback } from '@/lib/feedbackService';
import type { UserFeedback } from '@/lib/feedbackService';

interface FeedbackButtonProps {
  page: string;
  section?: string;
  elementId?: string;
}

export default function FeedbackButton({ page, section, elementId }: FeedbackButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState<UserFeedback['category']>('general');
  const [issue, setIssue] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    feedback.submit({
      page,
      section,
      elementId,
      category,
      severity: 'minor',
      issue,
      userComment: comment,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
    });

    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setSubmitted(false);
      setIssue('');
      setComment('');
    }, 2000);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all z-50"
      >
        💬 Feedback
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-6 w-96 max-w-[calc(100vw-2rem)] z-50">
      {submitted ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-gray-900">Thank you!</h3>
          <p className="text-sm text-gray-600">Your feedback helps us improve.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Send Feedback</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What type of issue?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as UserFeedback['category'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="general">General</option>
                <option value="confusing-text">Confusing text/jargon</option>
                <option value="unclear-metrics">Unclear numbers/metrics</option>
                <option value="difficult-ui">Difficult to use</option>
                <option value="incorrect-data">Incorrect data</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief issue (required)
              </label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g., 'kWh' not explained"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                More details (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about the issue..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                maxLength={500}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Send
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Page: {page} {section && `• ${section}`}
          </p>
        </>
      )}
    </div>
  );
}

// Inline feedback component for specific elements
export function InlineFeedback({ 
  page, 
  section, 
  elementId,
  label = "Unclear?"
}: FeedbackButtonProps & { label?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleQuickFeedback = (category: UserFeedback['category'], issue: string) => {
    feedback.submit({
      page,
      section,
      elementId,
      category,
      severity: 'minor',
      issue,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <span className="text-xs text-green-600">✓ Thanks!</span>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-xs text-gray-400 hover:text-blue-500 underline ml-1"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="inline-block relative">
      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl p-3 w-48 z-50 border border-gray-200">
        <button
          onClick={() => setShowForm(false)}
          className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
        <p className="text-xs font-medium text-gray-700 mb-2">What's unclear?</p>
        <div className="space-y-1">
          <button
            onClick={() => handleQuickFeedback('confusing-text', 'Confusing text/jargon')}
            className="block w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
          >
            📝 Confusing text
          </button>
          <button
            onClick={() => handleQuickFeedback('unclear-metrics', 'Unclear numbers')}
            className="block w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
          >
            📊 Unclear numbers
          </button>
          <button
            onClick={() => handleQuickFeedback('difficult-ui', 'Hard to understand')}
            className="block w-full text-left text-xs px-2 py-1 hover:bg-gray-100 rounded"
          >
            🤔 Hard to understand
          </button>
        </div>
      </div>
    </div>
  );
}

// Feedback dashboard component for admin
export function FeedbackDashboard() {
  const [stats, setStats] = useState(feedback.getStats('week'));
  const [pending, setPending] = useState(feedback.getPending(10));
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week' | 'all'>('week');

  const updateStats = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
    setStats(feedback.getStats(newTimeframe));
    setPending(feedback.getPending(10));
  };

  const handleResolve = (feedbackId: string) => {
    feedback.updateStatus(feedbackId, 'resolved', 'Addressed based on feedback');
    setPending(feedback.getPending(10));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Feedback Dashboard</h2>
        <select
          value={timeframe}
          onChange={(e) => updateStats(e.target.value as typeof timeframe)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="hour">Last hour</option>
          <option value="day">Last 24 hours</option>
          <option value="week">Last week</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Total Feedback</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Confusing Text</div>
          <div className="text-3xl font-bold">{stats.byCategory['confusing-text'] || 0}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Unclear Metrics</div>
          <div className="text-3xl font-bold">{stats.byCategory['unclear-metrics'] || 0}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Difficult UI</div>
          <div className="text-3xl font-bold">{stats.byCategory['difficult-ui'] || 0}</div>
        </div>
      </div>

      {/* Top issues */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Issues</h3>
        <div className="space-y-2">
          {stats.topIssues.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b">
              <div className="flex-1">
                <div className="font-medium">{item.issue}</div>
                <div className="text-xs text-gray-600">{item.category}</div>
              </div>
              <div className="text-sm font-semibold">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending feedback */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Pending Feedback</h3>
        <div className="space-y-4">
          {pending.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    item.severity === 'blocker' ? 'bg-red-100 text-red-800' :
                    item.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                    item.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.severity}
                  </span>
                  <span className="ml-2 text-xs text-gray-600">{item.category}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="font-medium">{item.issue}</div>
                {item.userComment && (
                  <div className="text-sm text-gray-600 mt-1">{item.userComment}</div>
                )}
              </div>
              
              {item.aiSuggestion && (
                <div className="bg-blue-50 p-2 rounded text-sm mb-2">
                  <strong>AI Suggestion:</strong> {item.aiSuggestion}
                </div>
              )}
              
              <div className="text-xs text-gray-600 mb-2">
                Page: {item.page} {item.section && `• ${item.section}`}
              </div>
              
              <button
                onClick={() => handleResolve(item.id)}
                className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark Resolved
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
