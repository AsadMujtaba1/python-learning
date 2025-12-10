# Cost Saver App - Manual Test Checklist

## ✅ Complete Testing Guide

### Pre-Test Setup
- [ ] Dev server running at http://localhost:3000
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible for errors
- [ ] Network tab monitoring requests

---

## Test 1: Landing Page ✓
**URL:** http://localhost:3000

**Expected Behavior:**
- [ ] Page loads without errors
- [ ] "Save Money, Effortlessly" heading visible
- [ ] "Start Saving" button is clickable
- [ ] Three feature cards display (Energy Insights, Weather Impact, Smart Recommendations)
- [ ] Responsive design works (resize browser)

**How to Test:**
1. Open http://localhost:3000
2. Check console for errors (should be none)
3. Click "Start Saving" button
4. Should redirect to `/onboarding-v2`

---

## Test 2: Onboarding Flow ✓
**URL:** http://localhost:3000/onboarding-v2

**Expected Behavior:**
- [ ] Onboarding form displays
- [ ] All 3 input fields visible:
  - Postcode input
  - Home type buttons (Flat, Terraced, Semi-Detached, Detached)
  - Occupants slider (1-10)
- [ ] Heating type selection visible (optional)
- [ ] Continue button enabled when required fields filled

**How to Test:**
1. **Clear localStorage first:**
   - DevTools → Application → Local Storage → http://localhost:3000
   - Right-click → Clear
   
2. **Fill in form:**
   - Postcode: `SW1A 1AA`
   - Home Type: Click "Semi-Detached"
   - Occupants: Move slider to `3`
   - Heating: Click "Gas" (optional)

3. **Submit:**
   - Click "Continue" button
   - Watch console for any errors
   - Should see "Saved locally" toast message

4. **Verify redirect:**
   - Should automatically redirect to `/dashboard-new` after 500ms
   - If redirect fails, check console for errors

5. **Verify data saved:**
   - DevTools → Application → Local Storage
   - Check for `userHomeData` key
   - Should contain: `{"postcode":"SW1A 1AA","homeType":"semi-detached","occupants":3,"heatingType":"gas"}`

---

## Test 3: Enhanced Dashboard ✓
**URL:** http://localhost:3000/dashboard-new

**Expected Behavior:**
- [ ] Dashboard loads without errors
- [ ] Profile completeness widget shows (sidebar or top)
- [ ] 4 metric cards display:
  - Daily Cost (~£3.85)
  - Monthly Cost (~£115)
  - Annual Savings (£120-850 range)
  - Efficiency Score (0-100)
- [ ] Peer comparison section visible
- [ ] 7-day forecast chart displays
- [ ] Energy breakdown shows (if data available)
- [ ] Weather impact widget visible
- [ ] Top recommendations panel displays

**How to Test:**
1. **After onboarding redirect, verify:**
   - URL is `/dashboard-new`
   - Page loads completely
   - No errors in console

2. **Check Profile Widget:**
   - Shows "6% complete" (Basic tier)
   - Displays "£120/year → £850/year possible"
   - Shows tier badge (Basic/Standard/Advanced/Expert)
   - "Complete Profile" button links to `/settings`

3. **Check Metric Cards:**
   - All 4 cards visible
   - Values are reasonable (£3-5/day range)
   - Icons display correctly
   - Hover effects work

4. **Check Peer Comparison:**
   - Bar chart visible
   - Shows "You", "Regional Avg", "National Avg"
   - Your cost should be ~£4.20/day
   - Regional avg ~£4.20, National ~£4.50

5. **Check 7-Day Forecast:**
   - 7 bars visible (Mon-Sun)
   - Cost values displayed (£3-5 range)
   - Visual height represents cost

6. **Check Energy Breakdown:**
   - 4 categories: Heating, Hot Water, Lighting, Appliances
   - Percentages add up to 100%
   - Progress bars show correct proportions

7. **Navigation:**
   - Click "Complete Profile" → Should go to `/settings`
   - Back button → Should return to dashboard

---

## Test 4: Settings/Profile Page ✓
**URL:** http://localhost:3000/settings

**Expected Behavior:**
- [ ] Settings page loads
- [ ] Header shows profile completeness and savings potential
- [ ] Progress bar displays completion percentage
- [ ] 10 expandable sections visible:
  1. Home Details
  2. Heating & Insulation
  3. Energy Sources
  4. Electricity Tariff
  5. Gas Tariff
  6. Historical Usage
  7. Smart Meter
  8. Appliances
  9. EV Charging
  10. Heating Schedule
- [ ] Bill upload section at bottom
- [ ] Sticky "Save Profile" button always visible
- [ ] Back to dashboard link works

**How to Test:**
1. **Navigate to settings:**
   - From dashboard, click "Complete Profile"
   - OR directly visit http://localhost:3000/settings

2. **Verify header:**
   - Shows "6%" and "Basic" badge
   - Shows "£850/year Maximum savings potential"
   - Progress bar shows 6% filled

3. **Test section expansion:**
   - Click on "Home Details" section
   - Should expand to show fields
   - Fields should be pre-filled with onboarding data:
     - Postcode: SW1A 1AA
     - Home Type: semi-detached
     - Occupants: 3

4. **Test field editing:**
   - Change occupants to 4
   - Add property age
   - Add floor area
   - Should see completion percentage increase

5. **Test section collapse:**
   - Click section header again
   - Should collapse

6. **Test other sections:**
   - Expand "Heating & Insulation"
   - Fill in heating system type
   - Expand "Electricity Tariff"
   - Add tariff details

7. **Test save:**
   - Scroll to bottom
   - Click "Save Profile" button
   - Should see success message at top
   - Progress percentage should update
   - Return to dashboard and verify data persists

8. **Test bill upload:**
   - Scroll to "Bill Upload Section"
   - Drag and drop a PDF or image
   - Should see upload progress
   - Should show extracted data for review

---

## Test 5: API Endpoints ✓

**How to Test:**
1. **Open Network tab** in DevTools

2. **Weather API:**
   - Visit dashboard
   - Check for request to `/api/data?postcode=SW1A1AA...`
   - Should return 200 status
   - Response should include weather data

3. **Carbon Intensity API:**
   - Should be called automatically on dashboard load
   - Check for `/api/carbon-intensity`
   - Should return current gCO₂/kWh value

4. **Location API:**
   - Should be called with postcode
   - Returns lat/lon coordinates

5. **Unified Data API:**
   - Dashboard makes one call to `/api/data`
   - Returns all data in single response
   - Check response includes: weather, location, regional data

---

## Test 6: Data Persistence ✓

**How to Test:**
1. **Complete onboarding** with test data
2. **Close browser tab**
3. **Reopen** http://localhost:3000/dashboard-new
4. **Verify:**
   - Dashboard loads immediately (no redirect to onboarding)
   - All data still visible
   - Profile completeness preserved

5. **Edit in settings:**
   - Go to settings
   - Add more fields
   - Click Save
   - Close browser

6. **Reopen and verify:**
   - Changes persisted
   - Completeness percentage updated
   - New data visible on dashboard

---

## Test 7: Error Handling ✓

**How to Test:**
1. **No data scenario:**
   - Clear localStorage
   - Visit http://localhost:3000/dashboard-new directly
   - Should redirect to `/onboarding-v2`

2. **API failure:**
   - Disconnect internet
   - Refresh dashboard
   - Should show mock/fallback data
   - Should still be usable

3. **Invalid postcode:**
   - Enter invalid postcode in onboarding
   - Should still allow submission
   - Should use fallback location data

---

## Test 8: Responsive Design ✓

**How to Test:**
1. **Desktop (>1024px):**
   - 3-column layout
   - Sidebar visible
   - All cards display side by side

2. **Tablet (768px-1024px):**
   - 2-column layout
   - Cards reflow
   - All features accessible

3. **Mobile (<768px):**
   - Single column
   - Stacked cards
   - Touch-friendly buttons
   - Bottom navigation (if implemented)

**Test by resizing browser or using DevTools device toolbar**

---

## Test 9: Dark Mode ✓

**How to Test:**
1. **Check system preference:**
   - If OS is in dark mode, app should follow
   - All text readable
   - Proper contrast

2. **Manual toggle** (if implemented):
   - Click dark mode toggle
   - All pages switch correctly
   - Preference persisted

---

## Test 10: Performance ✓

**How to Test:**
1. **Page load time:**
   - Landing page: <1s
   - Dashboard: <2s
   - Settings: <1s

2. **No console errors:**
   - Check console throughout testing
   - Should be clean (no red errors)

3. **Network requests:**
   - Check Network tab
   - API calls should be <500ms each
   - No failed requests

---

## Expected Results Summary

### ✅ PASS Criteria:
- All 10 tests complete without errors
- Onboarding → Dashboard redirect works
- Data persists in localStorage
- Settings page saves correctly
- All sections expandable/collapsible
- Profile completeness calculates correctly
- API calls succeed (or fallback gracefully)
- No console errors
- Responsive on all screen sizes

### ❌ FAIL Indicators:
- Console errors (red text)
- Redirect loops
- Data not saving
- Blank pages
- API errors without fallback
- Broken layouts
- Non-responsive elements

---

## Quick Test Command

Run this in browser console on any page:
```javascript
// Quick validation
console.log('localStorage:', localStorage.getItem('userHomeData'));
console.log('Current URL:', window.location.href);
console.log('Errors:', performance.getEntriesByType('navigation'));
```

---

## Test Completion Checklist

After running all tests:
- [ ] Onboarding flow: ✅ PASS / ❌ FAIL
- [ ] Dashboard display: ✅ PASS / ❌ FAIL
- [ ] Settings page: ✅ PASS / ❌ FAIL
- [ ] Data persistence: ✅ PASS / ❌ FAIL
- [ ] API endpoints: ✅ PASS / ❌ FAIL
- [ ] Error handling: ✅ PASS / ❌ FAIL
- [ ] Responsive design: ✅ PASS / ❌ FAIL
- [ ] Dark mode: ✅ PASS / ❌ FAIL
- [ ] Performance: ✅ PASS / ❌ FAIL
- [ ] No console errors: ✅ PASS / ❌ FAIL

---

## If Tests Fail

### Common Issues & Fixes:

**Issue:** Dashboard shows "No data found"
- **Fix:** Clear localStorage, redo onboarding

**Issue:** Redirect loop
- **Fix:** Check localStorage key is `userHomeData` (not `homeData`)

**Issue:** API calls fail
- **Fix:** Check dev server is running on port 3000

**Issue:** Data not saving
- **Fix:** Check localStorage permissions in browser

**Issue:** Console errors
- **Fix:** Check error message, fix TypeScript/React errors

---

## Ready for Production?

All tests PASS → ✅ Ready to deploy!
Any test FAILS → ❌ Fix issues first

**Deployment checklist:**
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Firebase configured (if using)
- [ ] Build completes successfully (`npm run build`)
- [ ] Production build tested locally (`npm start`)
