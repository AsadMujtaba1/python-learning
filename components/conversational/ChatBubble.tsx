'use client';

/**
 * CONVERSATIONAL CHAT BUBBLE
 * 
 * Reusable chat bubble component for conversational flows
 * Supports assistant messages, user selections, and animations
 */

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface ChatBubbleProps {
  message: string;
  type: 'assistant' | 'user';
  icon?: React.ReactNode;
  delay?: number;
  animate?: boolean;
}

export function ChatBubble({ message, type, icon, delay = 0, animate = true }: ChatBubbleProps) {
  const [show, setShow] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, animate]);

  if (!show) return null;

  return (
    <div
      className={`flex items-start gap-3 animate-slide-up ${
        type === 'assistant' ? 'justify-start' : 'justify-end'
      }`}
    >
      {type === 'assistant' && icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
      )}
      
      <div
        className={`max-w-[85%] sm:max-w-md px-5 py-3.5 rounded-3xl shadow-sm ${
          type === 'assistant'
            ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-none'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
        }`}
      >
        <p className="text-[15px] leading-relaxed">{message}</p>
      </div>

      {type === 'user' && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
          <CheckCircle className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

interface MessageCardProps {
  children: React.ReactNode;
  delay?: number;
  animate?: boolean;
}

export function MessageCard({ children, delay = 0, animate = true }: MessageCardProps) {
  const [show, setShow] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay, animate]);

  if (!show) return null;

  return (
    <div className="animate-slide-up">
      {children}
    </div>
  );
}
