'use client';

/**
 * CONVERSATIONAL DASHBOARD WIDGET
 * 
 * Shows conversational feedback and insights on the dashboard
 * Replaces traditional cards with chat-style bubbles
 */

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Zap, Info } from 'lucide-react';
import { ChatBubble } from './ChatBubble';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ConversationalFeedback } from '@/lib/conversationalIntegration';

interface ConversationalDashboardWidgetProps {
  feedback?: ConversationalFeedback[];
  onUploadPhoto?: () => void;
  showUploadPrompt?: boolean;
}

export default function ConversationalDashboardWidget({
  feedback = [],
  onUploadPhoto,
  showUploadPrompt = true,
}: ConversationalDashboardWidgetProps) {
  const [visibleMessages, setVisibleMessages] = useState<ConversationalFeedback[]>([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Show messages one by one with delays
    if (feedback.length > 0) {
      feedback.forEach((msg, idx) => {
        setTimeout(() => {
          setVisibleMessages(prev => [...prev, msg]);
        }, idx * 800);
      });
    }
  }, [feedback]);

  const displayedMessages = showMore ? visibleMessages : visibleMessages.slice(0, 3);

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Your Energy Assistant</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Personalized insights</p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {displayedMessages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">👋</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Hi! I'm your energy assistant. Upload photos to get personalized insights.
            </p>
            {showUploadPrompt && onUploadPhoto && (
              <Button onClick={onUploadPhoto} className="gap-2">
                📸 Upload Photo
              </Button>
            )}
          </div>
        )}

        {displayedMessages.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm">
              {msg.emoji || getEmojiForType(msg.type)}
            </div>
            <div className="flex-1 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                {msg.message}
              </p>
            </div>
          </div>
        ))}

        {visibleMessages.length > 3 && !showMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(true)}
            className="w-full"
          >
            Show {visibleMessages.length - 3} more insights
          </Button>
        )}
      </div>

      {/* Action Prompt */}
      {visibleMessages.length > 0 && showUploadPrompt && onUploadPhoto && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onUploadPhoto}
            className="w-full gap-2"
          >
            📸 Upload More Photos
          </Button>
        </div>
      )}
    </Card>
  );
}

function getEmojiForType(type: ConversationalFeedback['type']): string {
  switch (type) {
    case 'success': return '✅';
    case 'info': return '💡';
    case 'warning': return '⚠️';
    case 'seasonal': return '🌍';
    case 'comparison': return '📊';
    default: return '💬';
  }
}

/**
 * Compact version for smaller spaces
 */
export function ConversationalInsightBubble({ feedback }: { feedback: ConversationalFeedback }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
      <div className="flex-shrink-0 text-2xl">
        {feedback.emoji || getEmojiForType(feedback.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
          {feedback.message}
        </p>
      </div>
    </div>
  );
}

/**
 * Multi-photo update notification
 */
export function ConversationalPhotoUpdate({ count, latestInsight }: { count: number; latestInsight?: string }) {
  return (
    <div className="animate-slide-up">
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {count === 1 ? 'Photo Added!' : `${count} Photos Added!`}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {latestInsight || "Great! I've updated your usage history and trends."}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                View Insights
              </Button>
              <Button size="sm" variant="ghost" className="text-xs">
                Upload More
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
