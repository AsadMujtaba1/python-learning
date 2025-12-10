/**
 * MissingDataNotice Component
 * 
 * Displayed when user hasn't provided their personal data.
 * Encourages users to complete onboarding for personalized insights.
 * 
 * @module components/dashboard/MissingDataNotice
 */

'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MissingDataNoticeProps {
  className?: string;
  variant?: 'banner' | 'card';
}

export default function MissingDataNotice({ 
  className = '', 
  variant = 'banner' 
}: MissingDataNoticeProps) {
  const router = useRouter();

  const handleStartOnboarding = () => {
    router.push('/onboarding');
  };

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5 shadow-lg ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Using Regional & National Averages
              </h3>
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Right now we're showing estimated data based on regional and national averages. 
              <span className="font-semibold text-amber-700 dark:text-amber-400"> Add your details to unlock personalized insights and accurate savings recommendations tailored just for you!</span>
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleStartOnboarding}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Complete Your Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="font-semibold">💡 Takes only 2 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="mt-4 ml-16 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Accurate costs</strong> based on your usage
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Personalized recommendations</strong>
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Track actual savings</strong> over time
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Card variant (more compact)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Estimated Data
        </h4>
      </div>
      
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        We're using regional/national averages. Add your details to get personalized insights!
      </p>
      
      <Button
        onClick={handleStartOnboarding}
        size="sm"
        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
      >
        Complete Profile
        <ArrowRight className="w-3 h-3 ml-2" />
      </Button>
    </motion.div>
  );
}
