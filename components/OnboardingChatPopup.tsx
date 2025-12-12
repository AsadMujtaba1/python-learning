import React, { useState } from 'react';
import Modal from './Modal';
import ConversationalOnboardingPage from '@/app/onboarding-conversational/page';

export default function OnboardingChatPopup({ open: controlledOpen, setOpen: setControlledOpen }: { open?: boolean, setOpen?: (open: boolean) => void } = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen;

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
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Onboarding Assistant"
        size="md"
        showCloseButton
        className="md:w-[420px] max-h-[90vh] p-0"
      >
        <div className="flex-1 overflow-y-auto">
          <ConversationalOnboardingPage isPopup onComplete={() => setOpen(false)} />
        </div>
      </Modal>
    </>
  );
}
