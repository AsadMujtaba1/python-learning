# Demo Mode Implementation Guide

## Overview

The dashboard now supports **Demo Mode** - a state where users see benchmark data with skeleton loaders before they've uploaded their personal energy data. When users upload bills or add meter readings, the dashboard smoothly transitions to personalized charts.

## Features

### 1. Demo Mode Indicators
- **Desktop**: Prominent banner at top of dashboard
- **Mobile**: Subtle badge in header
- **Sidebar**: Demo mode notification card

### 2. Skeleton Loaders
When in demo mode and data is loading:
- Quick stats cards show animated skeletons
- Charts display placeholder loading states
- Insight cards show loading skeletons
- Sidebar shows loading skeleton

### 3. Fade Transitions
Smooth opacity transitions when:
- Switching from demo to personalized mode (500ms)
- Data loads in demo mode
- Staggered delays for visual hierarchy (75-300ms)

### 4. Benchmark Data Only
Demo mode shows:
- National/regional benchmark data
- No user-specific comparisons
- Placeholder values for quick stats

### 5. Personalized Mode
When user uploads data:
- Green overlays on charts (user's actual data)
- Comparison indicators (% better/worse)
- Red highlights for current supplier/tariff
- Actual usage breakdown

## Implementation

### Props

```typescript
interface DashboardShellProps {
  postcode?: string;
  region?: string;
  demoMode?: boolean; // NEW: Enables demo mode
  userData?: {        // NEW: User's actual data for comparisons
    wholesaleTrend?: any[];
    usageBenchmark?: any;
    standingCharge?: any;
    tariffDuration?: any;
    weatherForecast?: any;
    demandForecast?: any[];
    priceCapForecast?: any;
  };
  // ... other props
}
```

### Basic Usage

```tsx
import DashboardShell from '@/components/dashboard/DashboardShell';

function Dashboard() {
  const [demoMode, setDemoMode] = useState(true);
  const [userData, setUserData] = useState(null);

  return (
    <DashboardShell
      postcode="SW1A 1AA"
      region="London"
      demoMode={demoMode}
      userData={userData}
    />
  );
}
```

### Transitioning from Demo to Personalized

```tsx
// When user uploads bill or adds reading
const handleDataUpload = (newData: any) => {
  // Save data
  localStorage.setItem('userEnergyData', JSON.stringify(newData));
  
  // Update state (triggers smooth transition)
  setUserData({
    wholesaleTrend: newData.costs,
    usageBenchmark: {
      actualUsage: newData.usage,
      breakdown: newData.breakdown,
    },
    standingCharge: {
      currentSupplier: newData.supplier,
      electricityCharge: newData.elecCharge,
      gasCharge: newData.gasCharge,
    },
    // ... other data
  });
  
  setDemoMode(false); // Exit demo mode with fade
};
```

## Components

### New Components

1. **DemoModeBadge** (`components/dashboard/DemoModeBadge.tsx`)
   - Subtle inline badge
   - Banner variant for prominent display
   - Eye icon with blue color scheme

2. **SkeletonLoaders** (`components/dashboard/SkeletonLoaders.tsx`)
   - `StatCardSkeleton`: For quick stat cards
   - `ChartSkeleton`: For chart placeholders
   - `InsightCardSkeleton`: For insight cards
   - `SidebarSkeleton`: For sidebar loading
   - `GreetingSkeleton`: For greeting header

### Updated Components

**DashboardShell** (`components/dashboard/DashboardShell.tsx`)
- Added `demoMode` and `userData` props
- Fade transition logic with `useEffect`
- Demo banner display
- Skeleton loaders for loading states
- Pass `userData` to all chart components

**All Chart Components**
- Already support `userData` prop (from Prompt 8)
- Show green overlays when userData present
- Comparison indicators
- Conditional rendering

## Styling

### Fade Transitions

```tsx
// Staggered fade-in for visual hierarchy
<section className="transition-opacity duration-500 opacity-100">
  {/* Content */}
</section>

<section className="transition-opacity duration-500 delay-75 opacity-100">
  {/* Content with 75ms delay */}
</section>
```

### Demo Mode Colors

- **Badge**: Blue (blue-50, blue-700, blue-200)
- **Banner**: Blue gradient (blue-50 to indigo-50)
- **Sidebar Note**: Blue highlight card

### Skeleton Animation

```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## User Flow

### Initial State (Demo Mode)
1. User lands on dashboard without data
2. `demoMode={true}`, `userData={null}`
3. Demo banner appears
4. Skeleton loaders show (if data loading)
5. Benchmark charts display national/regional data
6. No personalized comparisons

### Data Upload
1. User clicks "Upload Bill" or "Add Reading"
2. Data extracted/processed
3. `setUserData(extractedData)`
4. `setDemoMode(false)`

### Transition (Automatic)
1. `useEffect` detects `demoMode` change
2. Sets `showContent={false}` (fade out)
3. After 150ms, sets `showContent={true}` (fade in)
4. All sections fade in with staggered delays
5. Charts now show userData overlays

### Personalized Mode
1. Green lines/bars overlay benchmark data
2. Comparison indicators (% better/worse)
3. Red highlights for user's supplier/tariff
4. Actual usage breakdown displayed
5. Demo banner hidden

## Data Structure

### userData Format

```typescript
{
  wholesaleTrend: [
    { period: '2024-01', actualCost: 150 },
    { period: '2024-02', actualCost: 145 },
    // ...
  ],
  
  usageBenchmark: {
    actualUsage: 320, // kWh
    breakdown: {
      heating: 180,
      appliances: 80,
      lighting: 40,
      other: 20,
    },
  },
  
  standingCharge: {
    currentSupplier: 'British Gas',
    electricityCharge: 52.50,
    gasCharge: 27.80,
  },
  
  tariffDuration: {
    currentTariff: 'Fixed 12M',
    currentRate: 32.5, // p/kWh
    expiryDate: '2025-06-30',
    daysLeft: 202,
  },
  
  weatherForecast: {
    actualCosts: [
      { date: '2024-12-10', cost: 4.20 },
      // ...
    ],
  },
  
  demandForecast: {
    preferredUsageTimes: ['22:00-06:00'], // Off-peak hours
  },
  
  priceCapForecast: {
    tariffType: 'fixed',
    fixedUntil: '2025-06-30',
  },
}
```

## API Integration

No backend changes required. Uses existing APIs:
- `/api/weather` - Weather forecast data
- `/api/tariffs` - Tariff comparison data
- `/api/ons` - ONS energy statistics

Demo mode simply shows benchmark data without user overlays.

## Testing Checklist

- [ ] Demo mode shows banner on desktop
- [ ] Demo mode shows badge on mobile
- [ ] Skeleton loaders appear when loading
- [ ] Benchmark charts display without userData
- [ ] Fade transition works on demo→personalized
- [ ] User data overlays appear after transition
- [ ] Comparison indicators show correct %
- [ ] Green/red colors match design
- [ ] Sidebar shows demo mode notification
- [ ] Mobile tabs work with demo mode
- [ ] No console errors or warnings

## Troubleshooting

### Transition Not Smooth
- Check `showContent` state updates
- Verify CSS transitions (`duration-500`)
- Ensure staggered delays applied

### Skeleton Loaders Not Showing
- Verify `loading && demoMode` condition
- Check `useBenchmarkData` hook returns loading state
- Ensure SkeletonLoaders imported

### userData Not Displaying
- Verify userData structure matches expected format
- Check chart components accept userData prop
- Ensure demoMode=false when userData present

### Demo Badge Not Appearing
- Check demoMode prop passed correctly
- Verify DemoModeBadge imported
- Ensure conditional rendering logic correct

## Performance

- Skeleton loaders are lightweight (pure CSS)
- Fade transitions use CSS opacity (GPU accelerated)
- No unnecessary re-renders
- Lazy loading unchanged
- Benchmark data cached by `useBenchmarkData` hook

## Accessibility

- Demo mode announced to screen readers
- Skeleton loaders use semantic HTML
- Fade transitions respect `prefers-reduced-motion`
- Color contrast meets WCAG AA standards
- Keyboard navigation unchanged

## Future Enhancements

1. **Onboarding Tooltip**: Guide users to upload data
2. **Progress Indicator**: Show % of data collected
3. **Sample Data Toggle**: Let users explore with fake data
4. **Comparison View**: Side-by-side demo vs actual
5. **Export Demo Data**: Download sample CSV
