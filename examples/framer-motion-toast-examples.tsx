/**
 * Usage Examples: Framer Motion + React Hot Toast
 * 
 * How to use the newly integrated animation and notification libraries
 */

// ============================================
// 1. TOAST NOTIFICATIONS - Basic Usage
// ============================================

import toast from 'react-hot-toast';
import { 
  toastBillSuccess, 
  toastDemoMode, 
  toastExitDemoMode,
  toastPromise 
} from '@/lib/toastUtils';

// Example 1: Simple success toast
function handleBillUpload() {
  toast.success('Bill uploaded successfully!');
}

// Example 2: Using pre-configured toasts
function handleUploadComplete() {
  toastBillSuccess();
}

// Example 3: Toast with custom icon and description
function showDemoReminder() {
  toast('Upload your bills to unlock insights', {
    icon: '💡',
    duration: 5000,
  });
}

// Example 4: Promise-based toast (for async operations)
async function uploadBill(file: File) {
  const uploadPromise = fetch('/api/upload', {
    method: 'POST',
    body: file,
  });

  toastPromise(uploadPromise, {
    loading: 'Uploading bill...',
    success: 'Bill uploaded successfully!',
    error: 'Upload failed. Please try again.',
  });
}

// Example 5: Update existing toast
function handleLongOperation() {
  const toastId = toast.loading('Processing...');
  
  setTimeout(() => {
    toast.success('Done!', { id: toastId });
  }, 3000);
}

// ============================================
// 2. FRAMER MOTION - Animation Variants
// ============================================

import { motion } from 'framer-motion';

// Example 1: Fade in animation
function FadeInComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Content fades in
    </motion.div>
  );
}

// Example 2: Slide up animation
function SlideUpComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content slides up
    </motion.div>
  );
}

// Example 3: Scale animation
function ScaleComponent() {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      Content scales in
    </motion.div>
  );
}

// Example 4: Hover effects
function HoverCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="p-4 bg-white rounded-lg shadow"
    >
      Hover me!
    </motion.div>
  );
}

// Example 5: Stagger children animation
function StaggerList() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {[1, 2, 3, 4].map(i => (
        <motion.li key={i} variants={item}>
          Item {i}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// Example 6: Exit animations
function ExitAnimation() {
  const [show, setShow] = useState(true);

  return (
    <>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          This will fade out when removed
        </motion.div>
      )}
      <button onClick={() => setShow(!show)}>Toggle</button>
    </>
  );
}

// ============================================
// 3. COMBINED USAGE - Real Dashboard Example
// ============================================

'use client';

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { toastBillSuccess, toastBillError } from '@/lib/toastUtils';

function BillUploadWidget() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const loadingToast = toast.loading('📄 Uploading bill...');

    try {
      const formData = new FormData();
      formData.append('bill', file);

      const response = await fetch('/api/bills/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toastBillSuccess();

      // Trigger success animation
      // (component will re-render with new data)
    } catch (error) {
      toast.dismiss(loadingToast);
      toastBillError();
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="p-6 bg-white rounded-xl shadow-lg"
    >
      <h3 className="text-lg font-semibold mb-4">Upload Bill</h3>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
    </motion.div>
  );
}

// ============================================
// 4. DEMO MODE INTEGRATION
// ============================================

function DashboardWithDemoMode() {
  const [demoMode, setDemoMode] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user has data
    const storedData = localStorage.getItem('userEnergyData');
    
    if (storedData) {
      setUserData(JSON.parse(storedData));
      setDemoMode(false);
    } else {
      // Show demo mode toast
      setTimeout(() => {
        toastDemoMode();
      }, 1000);
    }
  }, []);

  const handleDataUpload = (newData: any) => {
    // Save data
    localStorage.setItem('userEnergyData', JSON.stringify(newData));
    
    // Update state
    setUserData(newData);
    setDemoMode(false);

    // Show success toast
    toastExitDemoMode();
  };

  return (
    <DashboardShell
      demoMode={demoMode}
      userData={userData}
      postcode="SW1A 1AA"
      region="London"
    />
  );
}

// ============================================
// 5. CHART LOADING ANIMATION
// ============================================

function AnimatedChart({ data, loading }) {
  if (loading) {
    return <ChartSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <WholesalePriceTrendChart data={data} />
    </motion.div>
  );
}

// ============================================
// 6. NOTIFICATION FLOW EXAMPLES
// ============================================

// Scenario 1: User uploads first bill
function handleFirstBillUpload() {
  toastPromise(
    uploadBillToServer(),
    {
      loading: '📄 Uploading your first bill...',
      success: '🎉 Welcome! Your dashboard is now personalized!',
      error: '❌ Upload failed. Please try again.',
    }
  ).then(() => {
    // Show achievement toast after success
    setTimeout(() => {
      toast('🎯 Achievement Unlocked!', {
        description: 'First bill uploaded - keep tracking!',
        duration: 5000,
      });
    }, 1000);
  });
}

// Scenario 2: Savings milestone reached
function checkSavingsMilestone(totalSaved: number) {
  const milestones = [100, 250, 500, 1000];
  
  milestones.forEach(milestone => {
    if (totalSaved >= milestone) {
      toast.success(`🎉 £${milestone} Saved!`, {
        description: `You've saved £${milestone} this year!`,
        duration: 5000,
      });
    }
  });
}

// Scenario 3: Tariff expiry warning
function checkTariffExpiry(daysLeft: number) {
  if (daysLeft <= 30) {
    toast('⚠️ Tariff Expiring Soon!', {
      description: `Only ${daysLeft} days left. Compare tariffs now.`,
      duration: 6000,
      style: {
        background: 'linear-gradient(to right, #fef3c7, #fde68a)',
        color: '#92400e',
      },
    });
  }
}

// ============================================
// 7. ADVANCED ANIMATIONS
// ============================================

// Page transition animation
const pageVariants = {
  initial: { opacity: 0, x: -20 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

function DashboardPage() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <DashboardContent />
    </motion.div>
  );
}

// Number counter animation
function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={value} // Re-trigger animation when value changes
      transition={{ duration: 0.5 }}
    >
      £{value.toFixed(2)}
    </motion.span>
  );
}

// ============================================
// 8. TIPS & BEST PRACTICES
// ============================================

/*
  TOAST BEST PRACTICES:
  ✅ Use success toasts for completed actions
  ✅ Use error toasts for failures
  ✅ Use loading toasts for async operations
  ✅ Keep messages short and clear
  ✅ Use icons to enhance meaning
  ✅ Set appropriate durations (2-5s)
  ❌ Don't show too many toasts at once
  ❌ Don't use for critical information (use modals instead)

  ANIMATION BEST PRACTICES:
  ✅ Keep animations fast (0.3-0.5s)
  ✅ Use spring physics for natural feel
  ✅ Stagger child animations for polish
  ✅ Add hover effects for interactivity
  ✅ Use whileTap for button feedback
  ❌ Don't overdo animations
  ❌ Don't animate large components (performance)
  ❌ Don't use long durations (users get impatient)

  PERFORMANCE:
  ✅ Use layoutId for shared element transitions
  ✅ Use initial={false} to skip first animation
  ✅ Use useReducedMotion for accessibility
  ✅ Lazy load heavy animations
  ❌ Don't animate during scroll (janky)
  ❌ Don't animate too many elements at once
*/
