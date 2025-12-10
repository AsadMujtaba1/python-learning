# Production Dashboard Testing Checklist

## ✅ Pre-Deployment Testing

### 1. Functionality Testing

#### Core Features
- [ ] Dashboard loads without errors
- [ ] Demo mode activates when no user data present
- [ ] Demo mode banner displays correctly
- [ ] Transition from demo to personalized mode works smoothly
- [ ] All 7 charts render correctly
- [ ] Chart data displays accurate values
- [ ] User data overlays appear on charts when available
- [ ] Insight cards show relevant information
- [ ] Quick stats update correctly

#### Data Integration
- [ ] API endpoints return data (weather, tariffs, ONS)
- [ ] useBenchmarkData hook fetches correctly
- [ ] Error states handled gracefully
- [ ] Loading states show appropriate skeletons
- [ ] Data refresh works after interval
- [ ] Stale data indicators appear when needed

#### User Interactions
- [ ] Toast notifications appear for actions
- [ ] Toast notifications dismiss correctly
- [ ] Chart hover interactions work
- [ ] Chart click interactions tracked
- [ ] Tab navigation works on mobile
- [ ] Settings save successfully
- [ ] Export functionality works (if enabled)

### 2. Error Handling

#### Error Boundaries
- [ ] Chart errors caught by ChartErrorBoundary
- [ ] Fallback UI displays on error
- [ ] Retry button works
- [ ] Error details shown in development
- [ ] Error details hidden in production
- [ ] Root ErrorBoundary catches global errors

#### API Errors
- [ ] Network errors handled gracefully
- [ ] Timeout errors show appropriate message
- [ ] 404 errors display fallback content
- [ ] 500 errors trigger retry mechanism
- [ ] Rate limit errors show user-friendly message
- [ ] Error tracking sends to monitoring service

### 3. Performance Testing

#### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] First contentful paint < 1.5 seconds
- [ ] Largest contentful paint < 2.5 seconds
- [ ] Cumulative layout shift < 0.1

#### Runtime Performance
- [ ] Chart animations smooth (60fps)
- [ ] No memory leaks after prolonged use
- [ ] Data fetching doesn't block UI
- [ ] Skeleton loaders don't cause jank
- [ ] Tab switching instant on mobile
- [ ] No unnecessary re-renders

#### Bundle Size
- [ ] JavaScript bundle < 500KB (gzipped)
- [ ] CSS bundle < 50KB (gzipped)
- [ ] Framer Motion tree-shaken correctly
- [ ] Recharts tree-shaken correctly
- [ ] Unused code eliminated

#### Network
- [ ] API requests batched appropriately
- [ ] Images optimized and lazy-loaded
- [ ] Fonts preloaded
- [ ] Critical CSS inlined
- [ ] Non-critical resources deferred

### 4. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab key navigates all interactive elements
- [ ] Skip to content link works
- [ ] Focus visible on all elements
- [ ] Arrow keys navigate tabs on mobile
- [ ] Home/End keys work in navigation
- [ ] Escape closes modals/dropdowns

#### Screen Readers
- [ ] All images have alt text
- [ ] Charts have aria-labels
- [ ] Chart descriptions available
- [ ] Loading states announced
- [ ] Error states announced
- [ ] Success states announced
- [ ] Demo mode announced

#### Visual Accessibility
- [ ] Color contrast ratio >= 4.5:1 (AA)
- [ ] Text readable at 200% zoom
- [ ] Focus indicators visible
- [ ] No information conveyed by color alone
- [ ] High contrast mode supported
- [ ] Reduced motion respected

#### WCAG 2.1 Compliance
- [ ] Level A criteria met
- [ ] Level AA criteria met
- [ ] Lighthouse accessibility score > 90
- [ ] axe DevTools reports no violations
- [ ] WAVE tool reports no errors

### 5. Responsive Design

#### Desktop (>= 1024px)
- [ ] 2-column layout displays correctly
- [ ] Sidebar fixed width (300px)
- [ ] Charts use full available width
- [ ] No horizontal scroll
- [ ] All content visible without scrolling sections

#### Tablet (768px - 1023px)
- [ ] Layout switches to single column
- [ ] Tab navigation appears
- [ ] Charts resize appropriately
- [ ] Touch interactions work
- [ ] No content cut off

#### Mobile (<768px)
- [ ] Mobile tabs display correctly
- [ ] Tab switching smooth
- [ ] Charts readable on small screens
- [ ] Text sizes appropriate
- [ ] Touch targets >= 44x44px
- [ ] No pinch-zoom needed for text

#### Breakpoint Testing
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12)
- [ ] 414px (iPhone Pro Max)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1280px (Desktop)
- [ ] 1920px (Large Desktop)

### 6. Cross-Browser Testing

#### Chrome/Edge (Chromium)
- [ ] All features work
- [ ] Animations smooth
- [ ] Charts render correctly
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] CSS Grid layout correct
- [ ] Framer Motion animations work
- [ ] No console errors

#### Safari (macOS)
- [ ] All features work
- [ ] WebKit animations smooth
- [ ] Charts render correctly
- [ ] No console errors

#### Safari (iOS)
- [ ] Touch interactions work
- [ ] Animations smooth
- [ ] No viewport issues
- [ ] No console errors

### 7. Dark Mode Testing

#### Theme Switching
- [ ] Dark mode toggles correctly
- [ ] All colors appropriate for dark mode
- [ ] Charts readable in dark mode
- [ ] Text contrast sufficient
- [ ] Images/icons visible
- [ ] No flash of unstyled content

#### Persistence
- [ ] Theme preference saved
- [ ] Theme loads on page refresh
- [ ] Theme syncs across tabs
- [ ] System preference respected

### 8. Security Testing

#### Data Protection
- [ ] No sensitive data in localStorage (plain text)
- [ ] API keys not exposed in client
- [ ] User data encrypted in transit
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities

#### API Security
- [ ] Protected routes require authentication
- [ ] Rate limiting in place
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] CORS configured correctly

### 9. SEO & Meta Tags

- [ ] Title tag descriptive and unique
- [ ] Meta description present
- [ ] Open Graph tags set
- [ ] Twitter Card tags set
- [ ] Canonical URL set
- [ ] robots.txt configured
- [ ] sitemap.xml present

### 10. Analytics & Monitoring

#### Event Tracking
- [ ] Page views tracked
- [ ] Dashboard view events sent
- [ ] Chart interactions tracked
- [ ] Error events tracked
- [ ] Performance metrics sent
- [ ] User journey tracked

#### Error Monitoring
- [ ] Errors sent to monitoring service
- [ ] Source maps uploaded
- [ ] Error context includes user info
- [ ] Error rate alerts configured
- [ ] Error dashboards set up

## 🧪 Testing Tools

### Automated Testing
```bash
# Run TypeScript checks
npm run type-check

# Run linting
npm run lint

# Run unit tests (if available)
npm run test

# Run build
npm run build

# Check bundle size
npm run analyze
```

### Manual Testing Tools
- **Chrome DevTools**: Performance, Network, Lighthouse
- **React DevTools**: Component inspection, profiling
- **axe DevTools**: Accessibility auditing
- **WAVE**: Web accessibility evaluation
- **Screen Readers**: NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)

### Performance Tools
- **Lighthouse**: Core Web Vitals
- **WebPageTest**: Load time analysis
- **Bundle Analyzer**: Bundle size inspection
- **Chrome DevTools Performance**: Runtime analysis

## 📊 Acceptance Criteria

### Performance Targets
- Lighthouse Performance Score: >= 90
- Lighthouse Accessibility Score: >= 95
- Lighthouse Best Practices Score: >= 95
- Lighthouse SEO Score: >= 90
- Core Web Vitals: All "Good"

### Code Quality
- TypeScript: No errors
- ESLint: No errors, minimal warnings
- Test Coverage: >= 80% (if tests implemented)
- No console.errors in production

### User Experience
- Zero layout shifts
- Smooth animations (60fps)
- Instant feedback on interactions
- Clear error messages
- Helpful loading states

## 🚀 Deployment Steps

1. **Pre-Deployment**
   - [ ] All tests passing
   - [ ] Environment variables set
   - [ ] Database migrations completed
   - [ ] Backup current production

2. **Staging Deployment**
   - [ ] Deploy to staging environment
   - [ ] Run smoke tests
   - [ ] Verify all features work
   - [ ] Get stakeholder approval

3. **Production Deployment**
   - [ ] Deploy to production
   - [ ] Monitor error rates
   - [ ] Check performance metrics
   - [ ] Verify analytics working

4. **Post-Deployment**
   - [ ] Monitor for 24 hours
   - [ ] Check error logs
   - [ ] Review user feedback
   - [ ] Document any issues

## 🐛 Known Issues & Workarounds

### Issue 1: [Describe any known issues]
**Workaround**: [Describe workaround]
**Status**: [In Progress / Fixed / Wontfix]

---

## 📝 Sign-Off

- [ ] Development Team: _______________
- [ ] QA Team: _______________
- [ ] Product Owner: _______________
- [ ] Deployment Date: _______________

---

**Testing Completed**: ___ / ___ items checked
**Ready for Production**: Yes / No
**Notes**: 
