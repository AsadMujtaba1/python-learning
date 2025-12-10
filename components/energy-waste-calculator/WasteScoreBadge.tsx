/**
 * WASTE SCORE BADGE COMPONENT
 * 
 * UI Design Team Implementation
 * Visual representation of waste score with color coding
 */

'use client';

interface WasteScoreBadgeProps {
  score: number; // 0-100
  severity: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
}

export default function WasteScoreBadge({ score, severity, size = 'large' }: WasteScoreBadgeProps) {
  const colors = {
    low: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-500',
      text: 'text-green-700 dark:text-green-300',
      ring: 'ring-green-500',
    },
    medium: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-500',
    },
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-500',
      text: 'text-red-700 dark:text-red-300',
      ring: 'ring-red-500',
    },
  };

  const labels = {
    low: 'Good Deal',
    medium: 'Could Improve',
    high: 'High Waste',
  };

  const icons = {
    low: '✓',
    medium: '⚠️',
    high: '⚠️',
  };

  const sizes = {
    small: {
      container: 'w-20 h-20',
      text: 'text-2xl',
      label: 'text-xs',
    },
    medium: {
      container: 'w-28 h-28',
      text: 'text-3xl',
      label: 'text-sm',
    },
    large: {
      container: 'w-40 h-40',
      text: 'text-5xl',
      label: 'text-base',
    },
  };

  const color = colors[severity];
  const sizeClass = sizes[size];

  // Calculate circle progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Circular Progress */}
      <div className={`relative ${sizeClass.container}`}>
        {/* Background circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={color.text}
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>

        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-bold ${color.text} ${sizeClass.text}`}>
              {score}
            </div>
            <div className={`text-xs text-gray-600 dark:text-gray-400 font-medium`}>
              / 100
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className={`px-4 py-2 rounded-full ${color.bg} ${color.text} font-semibold ${sizeClass.label} flex items-center space-x-2`}>
        <span>{icons[severity]}</span>
        <span>{labels[severity]}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-center text-gray-600 dark:text-gray-400 max-w-xs">
        {severity === 'low' && "You're paying close to market average. Focus on reducing usage."}
        {severity === 'medium' && "You could save money by switching to a better tariff."}
        {severity === 'high' && "You're overpaying significantly. Switching could save you hundreds!"}
      </p>
    </div>
  );
}
