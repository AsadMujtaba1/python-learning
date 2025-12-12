import React, { useState, useEffect, useRef } from 'react';
import ConversationalOnboardingPage from '@/app/onboarding-conversational/page';

export default function OnboardingChatPopup({ open: controlledOpen, setOpen: setControlledOpen }: { open?: boolean, setOpen?: (open: boolean) => void } = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen;
  const chatRef = useRef<HTMLDivElement>(null);

  // Focus trap and ESC close
  useEffect(() => {
    if (open && chatRef.current) {
      chatRef.current.focus();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (open && e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

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
      {open && (
        <div
          ref={chatRef}
          tabIndex={-1}
          aria-label="Onboarding assistant chat"
          role="dialog"
          aria-modal="true"
          className="fixed z-50"
          style={{
            right: '16px',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(720px, calc(100vh - 32px))',
            maxWidth: '100vw',
            maxHeight: '100vh',
            pointerEvents: 'auto',
            borderRadius: '1.25rem', // rounded-2xl
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            background: 'var(--tw-bg-opacity,1) #fff',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--tw-border-color, #e5e7eb)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-t-2xl shrink-0">
            <span className="font-bold text-blue-700 dark:text-blue-200 text-lg">Cost Saver</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Chat content: scrollable message area, input fixed at bottom */}
          <div className="flex-1 overflow-y-auto" style={{ paddingBottom: '6rem' }}>
            <ConversationalOnboardingPage isPopup onComplete={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
