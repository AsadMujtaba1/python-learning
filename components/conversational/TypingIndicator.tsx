'use client';

/**
 * TYPING INDICATOR
 * 
 * Shows "assistant is thinking" animation
 */

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
        <span className="text-sm">💭</span>
      </div>
      
      <div className="bg-white dark:bg-gray-800 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
