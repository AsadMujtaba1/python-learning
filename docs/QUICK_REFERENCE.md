# Production Dashboard - Quick Reference

## 🚀 Quick Start

### 1. Toast Notifications
```tsx
import { 
  toastSuccess, 
  toastError, 
  toastDemoMode,
  toastBillSuccess 
} from '@/lib/toastUtils';

// Simple notifications
toastSuccess('Settings saved!');
toastError('Upload failed');

// Pre-built notifications
toastDemoMode(); // Shows demo mode message
toastBillSuccess(); // Bill upload success

// Promise-based
toastPromise(
  uploadFile(),
  {
    loading: 'Uploading...',
    success: 'Uploaded!',
    error: 'Failed to upload'
  }
);
```

### 2. Error Boundaries
```tsx
import ChartErrorBoundary from '@/components/dashboard/ChartErrorBoundary';

// Wrap any chart component
<ChartErrorBoundary chartName="Price Trends">
  <WholesalePriceTrendChart data={data} />
</ChartErrorBoundary>

// Or use HOC
import { withChartErrorBoundary } from '@/components/dashboard/ChartErrorBoundary';
const SafeChart = withChartErrorBoundary(MyChart, 'My Chart');
```

### 3. Accessibility
```tsx
import { 
  SkipToContent,
  getChartAriaProps,
  useKeyboardNavigation,
  useReducedMotion
} from '@/lib/accessibility';

// Skip link
<SkipToContent />

// Chart accessibility
const ariaProps = getChartAriaProps({
  title: 'Sales Trend',
  description: 'Monthly sales over the year',
  dataPoints: chartData
});
<div {...ariaProps}><Chart /></div>

// Keyboard nav for tabs
useKeyboardNavigation(tabs, activeIndex, setActiveIndex);

// Check motion preference
const prefersReduced = useReducedMotion();
```

### 4. Loading States
```tsx
import { 
  useLoadingState,
  loadWithProgress 
} from '@/lib/loadingState';

// Hook
const { 
  isLoading, 
  progress, 
  startLoading, 
  updateProgress, 
  completeLoading 
} = useLoadingState();

// With progress tracking
const data = await loadWithProgress(
  () => fetchData(),
  {
    name: 'Dashboard Data',
    onProgress: (p, msg) => updateProgress(p, 'fetching', msg)
  }
);
```

### 5. Analytics
```tsx
import { 
  trackDashboardView,
  trackChartInteraction,
  trackBillUploadSuccess 
} from '@/lib/analytics';

// Track page view
useEffect(() => {
  trackDashboardView(isDemoMode);
}, [isDemoMode]);

// Track interactions
<Chart 
  onClick={() => trackChartInteraction('price_trend', 'click')} 
/>

// Track events
trackBillUploadSuccess('pdf', fileSize, processingTime);
```

### 6. Configuration
```tsx
import { 
  DASHBOARD_CONFIG,
  isFeatureEnabled,
  getChartColor 
} from '@/config/dashboard.config';

// Check feature
if (isFeatureEnabled('animations')) {
  // Enable animations
}

// Get chart color
const color = getChartColor('primary', theme);

// Access config
const timeout = DASHBOARD_CONFIG.api.timeout;
```

## 📁 File Locations

### Components
- `components/dashboard/DashboardShell.tsx` - Main dashboard
- `components/dashboard/ChartErrorBoundary.tsx` - Error handling
- `components/ToastProvider.tsx` - Toast system
- `components/dashboard/InsightCard.tsx` - Insight cards
- `components/dashboard/SkeletonLoaders.tsx` - Loading skeletons

### Charts
- `components/charts/WholesalePriceTrendChart.tsx`
- `components/charts/HouseholdUsageBenchmarkChart.tsx`
- `components/charts/StandingChargeComparisonChart.tsx`
- `components/charts/TariffDurationChart.tsx`
- `components/charts/WeatherImpactChart.tsx`
- `components/charts/DemandSpikeForecastChart.tsx`
- `components/charts/PriceCapForecastChart.tsx`

### Utilities
- `lib/toastUtils.ts` - Toast notifications
- `lib/accessibility.tsx` - A11y helpers
- `lib/loadingState.ts` - Loading management
- `lib/analytics.ts` - Event tracking

### Hooks
- `hooks/useBenchmarkData.ts` - Data fetching

### Config
- `config/dashboard.config.ts` - Dashboard settings

### Documentation
- `docs/PRODUCTION_INTEGRATION_GUIDE.md` - Full integration guide
- `docs/PRODUCTION_TESTING_CHECKLIST.md` - Testing checklist
- `docs/PRODUCTION_COMPLETION_SUMMARY.md` - What was built

## 🎨 Common Patterns

### Loading with Skeleton
```tsx
{loading ? (
  <ChartSkeleton />
) : (
  <ChartErrorBoundary chartName="Sales">
    <SalesChart data={data} />
  </ChartErrorBoundary>
)}
```

### Async Action with Toast
```tsx
const handleSave = async () => {
  const promise = saveSettings(data);
  
  toastPromise(promise, {
    loading: 'Saving...',
    success: 'Settings saved!',
    error: (err) => `Failed: ${err.message}`
  });
  
  try {
    await promise;
    trackSettingsSave('preferences');
  } catch (error) {
    trackError('settings_save', error.message);
  }
};
```

### Accessible Chart with Tracking
```tsx
const ariaProps = getChartAriaProps({
  title: 'Price Trends',
  description: 'Wholesale prices over 12 months',
  dataPoints: data
});

<ChartErrorBoundary chartName="Price Trends">
  <div 
    {...ariaProps}
    onClick={() => trackChartInteraction('price_trend', 'click')}
  >
    <PriceTrendChart data={data} />
  </div>
</ChartErrorBoundary>
```

### Responsive with Reduced Motion
```tsx
const prefersReduced = useReducedMotion();
const animationConfig = prefersReduced 
  ? { duration: 0 }
  : DASHBOARD_CONFIG.animations.duration.normal;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: animationConfig }}
>
  {content}
</motion.div>
```

## 🔧 Feature Flags

Toggle features in `config/dashboard.config.ts`:

```typescript
features: {
  demoMode: true,           // Show demo mode banner
  animations: true,         // Enable Framer Motion
  toastNotifications: true, // Show toast messages
  darkMode: true,           // Dark theme support
  mobileResponsive: true,   // Mobile tabs
  chartInteractions: true,  // Track clicks/hovers
  exportData: false,        // Coming soon
  shareData: false,         // Coming soon
}
```

## 🐛 Debug Mode

In development, enable extra logging:

```tsx
// Toast debug
if (process.env.NODE_ENV === 'development') {
  console.log('Toast shown:', message);
}

// Error details
{process.env.NODE_ENV === 'development' && error && (
  <details>
    <summary>Error Details</summary>
    <pre>{error.stack}</pre>
  </details>
)}
```

## ⚡ Performance Tips

1. **Lazy load charts**: Already done with dynamic imports
2. **Memoize expensive calculations**: Use `React.memo()`
3. **Debounce API calls**: Use loading state debouncing
4. **Optimize images**: Use Next.js Image component
5. **Reduce bundle size**: Check with `npm run analyze`

## 🧪 Testing

### Manual Testing
```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Browser Testing
- Chrome DevTools → Lighthouse
- React DevTools → Profiler
- axe DevTools → Accessibility

### Accessibility
- Tab through all elements
- Test with screen reader (NVDA/VoiceOver)
- Check color contrast (4.5:1 minimum)
- Verify reduced motion works

## 📚 More Resources

- **Integration Guide**: Full step-by-step instructions
- **Testing Checklist**: 100+ test cases
- **Completion Summary**: What was built and why
- **Component Examples**: In `/docs/flows/`

## 🆘 Troubleshooting

### Toasts not showing?
- Check `ToastProvider` in `app/layout.tsx`
- Verify `react-hot-toast` is installed
- Clear browser cache

### Charts not loading?
- Check API endpoints return data
- Verify error boundaries are present
- Check browser console for errors

### Animations not smooth?
- Check reduced motion preference
- Verify Framer Motion is installed
- Test on different devices

### TypeScript errors?
- Run `npm run type-check`
- Check imports are correct
- Verify all types are exported

## 🎯 Deployment Checklist

Before deploying:
- [ ] All TypeScript errors fixed
- [ ] No console errors in production
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Performance tested (Lighthouse > 90)
- [ ] Accessibility tested (WAVE, axe)
- [ ] Mobile tested on real devices
- [ ] Cross-browser tested

## 💡 Pro Tips

1. Use feature flags to roll out gradually
2. Monitor error rates after deployment
3. Track performance metrics
4. Collect user feedback
5. Iterate based on data

---

**Quick help**: Check `docs/` folder for comprehensive guides

