# Migration Guide: Old Dashboard → Production Dashboard

## Overview

This guide helps you migrate from the old dashboard components to the new production-ready `DashboardShell` with all integrated features.

---

## 🔄 Component Mapping

### Old Components → New Components

| Old Component | New Component | Status |
|---------------|---------------|---------|
| `DashboardCard` | `DashboardShell` sections | ✅ Integrated |
| `TodaysInsights` | `InsightCard` | ✅ Enhanced |
| `CostComparisonBar` | Built into charts | ✅ User overlays |
| Individual chart imports | Single `DashboardShell` | ✅ All included |
| Manual loading states | `SkeletonLoaders` | ✅ Automated |
| Basic error handling | `ChartErrorBoundary` | ✅ Production-grade |

---

## 📝 Step-by-Step Migration

### Step 1: Update Dashboard Page

#### Before (`app/dashboard-new/page.tsx`)
```tsx
import DashboardCard from '@/components/DashboardCard';
import TodaysInsights from '@/components/TodaysInsights';
import CostComparisonBar from '@/components/CostComparisonBar';
// ... many more imports

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <div className="container">
          <h1>Dashboard</h1>
          <DashboardCard />
          <TodaysInsights />
          <CostComparisonBar />
          {/* ... many more components */}
        </div>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
```

#### After
```tsx
import DashboardShell from '@/components/dashboard/DashboardShell';
import { SkipToContent } from '@/lib/accessibility';

export default function DashboardPage() {
  return (
    <>
      <SkipToContent />
      <ProtectedRoute>
        <OnboardingGate>
          <div id="main-content">
            <DashboardShell />
          </div>
        </OnboardingGate>
      </ProtectedRoute>
    </>
  );
}
```

**What Changed**:
- ✅ Single `DashboardShell` component replaces multiple imports
- ✅ Added `SkipToContent` for accessibility
- ✅ Added `id="main-content"` for skip link target
- ✅ All features (charts, insights, stats) now included in DashboardShell

---

### Step 2: Pass User Data (Optional)

If you have user-specific data to display:

```tsx
import { useState, useEffect } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Fetch user's bill data
    fetchUserBills().then(setUserData);
  }, []);

  return (
    <ProtectedRoute>
      <OnboardingGate>
        <DashboardShell 
          userData={userData}
          demoMode={!userData} // Auto-detect demo mode
        />
      </OnboardingGate>
    </ProtectedRoute>
  );
}
```

---

### Step 3: Customize Sections (Optional)

Override default sections if needed:

```tsx
<DashboardShell
  greeting={<CustomGreeting userName={user.name} />}
  quickStats={<CustomQuickStats data={userStats} />}
  featuredChart={<CustomFeaturedChart />}
  insights={<CustomInsights />}
  sidebar={<CustomSidebar />}
/>
```

Most users can use the defaults with `userData` prop for automatic personalization.

---

### Step 4: Add Toast Notifications to Actions

#### Before (Basic error handling)
```tsx
const handleUpload = async (file: File) => {
  try {
    await uploadBill(file);
    alert('Upload successful!');
  } catch (error) {
    alert('Upload failed!');
  }
};
```

#### After (Production-ready)
```tsx
import { toastBillSuccess, toastBillError, toastPromise } from '@/lib/toastUtils';

const handleUpload = async (file: File) => {
  const uploadPromise = uploadBill(file);
  
  toastPromise(uploadPromise, {
    loading: 'Uploading bill...',
    success: 'Bill uploaded successfully!',
    error: (err) => `Upload failed: ${err.message}`
  });

  try {
    await uploadPromise;
    // Optionally track analytics
    trackBillUploadSuccess('pdf', file.size, Date.now());
  } catch (error) {
    trackBillUploadError(error.message, 'pdf');
  }
};
```

**What Changed**:
- ✅ Professional toast notifications instead of alerts
- ✅ Loading state shown automatically
- ✅ Error messages more informative
- ✅ Analytics tracking integrated

---

### Step 5: Wrap Custom Charts in Error Boundaries

If you have custom charts not in DashboardShell:

#### Before
```tsx
<MyCustomChart data={data} />
```

#### After
```tsx
import ChartErrorBoundary from '@/components/dashboard/ChartErrorBoundary';

<ChartErrorBoundary chartName="Custom Metrics">
  <MyCustomChart data={data} />
</ChartErrorBoundary>
```

**What Changed**:
- ✅ Graceful error handling
- ✅ Fallback UI on error
- ✅ Retry functionality
- ✅ Error reporting hooks

---

### Step 6: Add Analytics Tracking

#### Before
```tsx
<button onClick={handleClick}>
  Export Data
</button>
```

#### After
```tsx
import { trackDataExport } from '@/lib/analytics';

<button onClick={() => {
  handleClick();
  trackDataExport('csv');
}}>
  Export Data
</button>
```

**What Changed**:
- ✅ User interactions tracked
- ✅ Feature usage monitored
- ✅ Data-driven improvements

---

### Step 7: Improve Accessibility

#### Before
```tsx
<div className="chart-container">
  <Chart data={data} />
</div>
```

#### After
```tsx
import { getChartAriaProps } from '@/lib/accessibility';

const ariaProps = getChartAriaProps({
  title: 'Energy Usage Chart',
  description: 'Shows your energy consumption over the last 12 months',
  dataPoints: data.map(d => ({ label: d.month, value: d.usage }))
});

<div {...ariaProps} className="chart-container">
  <Chart data={data} />
</div>
```

**What Changed**:
- ✅ Screen reader accessible
- ✅ ARIA labels and roles
- ✅ Keyboard navigable
- ✅ WCAG 2.1 AA compliant

---

### Step 8: Optimize Loading States

#### Before
```tsx
{loading && <div>Loading...</div>}
{!loading && <Chart data={data} />}
```

#### After
```tsx
import { ChartSkeleton } from '@/components/dashboard/SkeletonLoaders';
import ChartErrorBoundary from '@/components/dashboard/ChartErrorBoundary';

{loading ? (
  <ChartSkeleton />
) : (
  <ChartErrorBoundary chartName="Energy Usage">
    <Chart data={data} />
  </ChartErrorBoundary>
)}
```

**What Changed**:
- ✅ Skeleton loaders with shimmer effect
- ✅ Error boundaries prevent crashes
- ✅ Better perceived performance
- ✅ Professional loading experience

---

## 🗑️ Components to Remove

After migration, you can safely remove these old files:

```bash
# Old dashboard components (backup first!)
- components/DashboardCard.tsx
- components/TodaysInsights.tsx
- components/CostComparisonBar.tsx
- components/OldChartComponent.tsx
# ... any other deprecated components
```

**Before removing**:
1. ✅ Backup files
2. ✅ Search for all usages
3. ✅ Test new dashboard thoroughly
4. ✅ Verify no other pages use them

---

## ⚙️ Configuration Changes

### Update Feature Flags

Add to `config/dashboard.config.ts` if not present:

```typescript
export const DASHBOARD_CONFIG = {
  features: {
    demoMode: true,
    animations: true,
    toastNotifications: true,
    darkMode: true,
    // ... other features
  },
  // ... rest of config
};
```

### Environment Variables

Ensure these are set:

```env
# .env.local
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
SENTRY_DSN=your-sentry-dsn # Optional
```

---

## 🧪 Testing After Migration

### Checklist

- [ ] Dashboard loads without errors
- [ ] Demo mode works (no user data)
- [ ] Personalized mode works (with user data)
- [ ] All charts render correctly
- [ ] Toast notifications appear
- [ ] Error boundaries catch errors
- [ ] Mobile responsive layout
- [ ] Dark mode works
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Analytics tracking active

### Test Commands

```bash
# Check TypeScript
npm run type-check

# Check for errors
npm run lint

# Build for production
npm run build

# Test production build
npm start
```

---

## 🐛 Common Migration Issues

### Issue 1: Charts Not Showing
**Symptom**: White space where charts should be
**Solution**: Check `useBenchmarkData` hook is fetching correctly

```tsx
// Add debug logging
const { data, loading, error } = useBenchmarkData(postcode, region);

console.log('Benchmark data:', { data, loading, error });
```

### Issue 2: Toasts Not Appearing
**Symptom**: Toast notifications don't show
**Solution**: Verify `ToastProvider` in `app/layout.tsx`

```tsx
// Should be wrapped around children
<ToastProvider>
  {children}
</ToastProvider>
```

### Issue 3: TypeScript Errors
**Symptom**: Type errors in console
**Solution**: Ensure all imports correct

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Issue 4: Animations Jerky
**Symptom**: Animations lag or stutter
**Solution**: Check `framer-motion` installed

```bash
npm install framer-motion@^11.15.0
```

### Issue 5: Data Not Loading
**Symptom**: API calls failing
**Solution**: Check API endpoints and CORS

```tsx
// Verify API routes work
fetch('/api/weather').then(r => r.json()).then(console.log);
fetch('/api/tariffs').then(r => r.json()).then(console.log);
fetch('/api/ons').then(r => r.json()).then(console.log);
```

---

## 📊 Before/After Comparison

### Code Volume
- **Before**: ~500 lines across multiple files
- **After**: ~50 lines in single file
- **Reduction**: 90% less code to maintain

### Features
- **Before**: Basic charts, manual error handling
- **After**: Advanced charts, auto error handling, analytics, A11y, toasts
- **Improvement**: 10+ production features added

### Performance
- **Before**: Multiple component re-renders
- **After**: Optimized with memo, lazy loading
- **Improvement**: Faster load times, better UX

### Maintainability
- **Before**: Scattered configuration
- **After**: Centralized config
- **Improvement**: Single source of truth

---

## 🎯 Migration Timeline

### Phase 1: Preparation (1 hour)
- [ ] Backup current dashboard code
- [ ] Review new components
- [ ] Read integration guide
- [ ] Plan custom sections (if any)

### Phase 2: Integration (2-3 hours)
- [ ] Update dashboard page
- [ ] Add ToastProvider (if not done)
- [ ] Test basic functionality
- [ ] Add error boundaries
- [ ] Integrate analytics

### Phase 3: Testing (2-3 hours)
- [ ] Test all features
- [ ] Mobile testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Cross-browser testing

### Phase 4: Cleanup (1 hour)
- [ ] Remove old components
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Final production deployment

**Total Time**: 6-8 hours for complete migration

---

## 🚀 Post-Migration

### Monitor These Metrics

1. **Error Rates**
   - Watch error tracking dashboard
   - Check browser console in production
   - Monitor user reports

2. **Performance**
   - Run Lighthouse audits
   - Check Core Web Vitals
   - Monitor load times

3. **User Engagement**
   - Track dashboard views
   - Monitor feature usage
   - Collect user feedback

4. **Accessibility**
   - Test with screen readers
   - Verify keyboard navigation
   - Check contrast ratios

### Iterate and Improve

- Review analytics weekly
- Fix issues promptly
- Collect user feedback
- Implement improvements

---

## 🆘 Need Help?

### Resources
1. **PRODUCTION_INTEGRATION_GUIDE.md** - Complete integration steps
2. **QUICK_REFERENCE.md** - Quick code snippets
3. **PRODUCTION_TESTING_CHECKLIST.md** - Testing guidelines

### Troubleshooting
- Check browser console for errors
- Review TypeScript errors
- Test in isolation
- Ask for help in team chat

---

## ✅ Migration Complete!

Once all steps are done and tested:

- [ ] Old components removed
- [ ] New dashboard working perfectly
- [ ] All tests passing
- [ ] Performance metrics good
- [ ] Accessibility verified
- [ ] Deployed to production
- [ ] Monitoring active

**Congratulations! Your dashboard is now production-ready! 🎉**

