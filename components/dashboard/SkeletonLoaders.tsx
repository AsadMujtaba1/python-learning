/**
 * Skeleton Loaders for Dashboard Components
 * 
 * Loading placeholders for dashboard sections during demo mode
 * 
 * @module components/dashboard/SkeletonLoaders
 */

interface SkeletonProps {
  className?: string;
}

export function StatCardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5 shadow-lg ${className}`}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="relative space-y-3">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl mb-3 animate-pulse"></div>
        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-20 animate-pulse"></div>
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-28 animate-pulse"></div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function ChartSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg overflow-hidden relative ${className}`}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="space-y-4 relative">
        {/* Header */}
        <div className="space-y-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-2/3 animate-pulse"></div>
        </div>
        
        {/* Chart Area */}
        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-850 rounded-xl flex items-end justify-around p-4 gap-2 shadow-inner">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gradient-to-t from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded-t-lg w-full transition-all duration-1000 animate-pulse"
              style={{ 
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${i * 150}ms`
              }}
            ></div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex gap-6 justify-center pt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-400 dark:from-blue-600 dark:to-blue-700 rounded-full animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-300 to-purple-400 dark:from-purple-600 dark:to-purple-700 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-pulse" style={{ animationDelay: '200ms' }}></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function InsightCardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5 shadow-lg ${className}`}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="flex items-start gap-4 relative">
        <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24 animate-pulse"></div>
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-28 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-32 animate-pulse"></div>
          <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-full animate-pulse"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function SidebarSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-5 shadow-lg ${className}`}>
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <div className="space-y-4 relative">
        {/* Avatar and name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-20 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-16 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

export function GreetingSkeleton({ mobile = false }: { mobile?: boolean }) {
  return (
    <div className={`relative overflow-hidden ${mobile ? '' : 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl'}`}>
      {!mobile && <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>}
      
      <div className="relative">
        <div className={`h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-lg w-56 ${mobile ? '' : 'bg-white/40'} mb-3 animate-pulse`}></div>
        <div className={`h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-500 rounded-lg w-72 ${mobile ? '' : 'bg-white/30'} animate-pulse`}></div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
