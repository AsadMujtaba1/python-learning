import React, { useState } from 'react';
import { X } from 'lucide-react';
import ConversationalOnboardingPage from '@/app/onboarding-conversational/page';

export default function OnboardingChatPopup() {
  const [open, setOpen] = useState(false);

  // Only show on desktop (hidden on mobile)
  return (
    <>
      {/* Chat button (bottom right) */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl transition-all duration-300 hidden md:flex"
        onClick={() => setOpen(true)}
        aria-label="Open onboarding chat"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
      >
        💬
      </button>
      {/* Popup modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-end md:justify-end pointer-events-none">
          <div className="w-full md:w-[420px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col pointer-events-auto animate-in fade-in duration-300 mr-0 md:mr-8 mb-0 md:mb-8">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-t-2xl md:rounded-t-2xl">
              <span className="font-semibold text-blue-700 dark:text-blue-300">Onboarding Assistant</span>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationalOnboardingPage isPopup onComplete={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
