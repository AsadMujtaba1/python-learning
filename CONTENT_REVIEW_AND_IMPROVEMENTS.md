# CONTENT REVIEW & IMPROVEMENT PLAN
## Cost Saver UK - Content Audit & Expansion Strategy
**Date:** December 7, 2025  
**Review Type:** Full Content Audit + UX Improvements  
**Requested By:** Founder

---

## EXECUTIVE SUMMARY

**Current State:**
- App is energy-focused but founder plans to expand to more cost-saving categories
- Bill upload feature exists but OCR extraction is inaccurate
- Premium features are gated but should be enabled for all during beta
- Blog and News sections exist but not prominently featured
- Content needs updating to reflect broader vision

**Actions Required:**
1. Update About section to reflect future expansion (not just energy)
2. Fix bill OCR extraction patterns
3. Move bill upload to homepage (critical feature)
4. Temporarily enable all premium features
5. Feature blog/news on homepage
6. Review and improve all page content
7. Update brand messaging across app

---

## 1. CONTENT TEAM REVIEW

### Homepage Content (/page.tsx)

**Current Issues:**
- ❌ Hero says "Save Money on Your Energy Bills" - too narrow
- ❌ Tagline only mentions energy
- ❌ Bill upload not visible (critical feature hidden)
- ❌ Blog/news not featured
- ❌ "Average user saves £300/year" - needs context

**Improvements Needed:**
- ✅ Change hero to "Save Money on Your Household Bills"
- ✅ Update tagline: "Energy, broadband, insurance & more - all in one place"
- ✅ Add bill upload widget to homepage (above fold)
- ✅ Add latest blog posts carousel
- ✅ Add news ticker/feed
- ✅ Make savings claim more specific

**New Homepage Structure:**
1. Hero Section (updated messaging)
2. **NEW: Bill Upload Widget** (prominent, drag & drop)
3. Quick Actions
4. Features Grid
5. **NEW: Latest Blog Posts** (3 cards)
6. **NEW: Energy News Feed** (ticker or 3 cards)
7. Social Proof
8. CTA

---

### About Page (/about/page.tsx)

**Current Issues:**
- ❌ "We help everyday people save money on their bills" - good but vague
- ❌ Mission section only talks about energy bills
- ❌ No mention of future expansion plans
- ❌ Doesn't explain full value proposition

**Improvements:**
- ✅ Update mission: "Started with energy, expanding to all household costs"
- ✅ Add roadmap section showing planned features
- ✅ Mention: broadband, insurance, subscriptions, shopping coming soon
- ✅ Position as "Your Personal Money-Saving Assistant"

**New Content:**
```
Our Mission:
Household bills are confusing and expensive. From energy to broadband, 
insurance to subscriptions - most people overpay without even knowing it.

We started with energy bills because they're the most complex. But our vision 
is bigger: Cost Saver will become your personal money-saving assistant for ALL 
your household costs.

Currently Available:
✅ Energy bill analysis & comparison
✅ Solar panel ROI calculator
✅ Heat pump suitability assessment
✅ Smart product recommendations

Coming Soon:
🔜 Broadband comparison
🔜 Home & car insurance
🔜 Subscription audit
🔜 Shopping deal alerts
```

---

### Bill Upload Page (/bills/page.tsx)

**Current Issues:**
- ❌ Hidden behind navigation - users don't discover it
- ❌ Gated as premium feature
- ❌ OCR extraction produces wrong data
- ❌ No clear value proposition visible

**Improvements:**
1. **Move to Homepage** - Create BillUploadWidget component
2. **Enable for All Users** - Remove FeatureGate temporarily
3. **Fix OCR Patterns** - Improve regex extraction
4. **Better Error Messages** - Guide users when extraction fails

**OCR Fix Strategy:**
```typescript
// Current regex is too strict
// Problem: Looks for exact patterns that don't match real bills
// Solution: More flexible patterns, multiple fallbacks

Issues found:
1. Supplier matching too rigid
2. Date formats not flexible
3. kWh extraction missing common variations
4. Standing charge patterns incomplete
5. Total cost not capturing all formats
```

---

### Tariffs Page (/tariffs/page.tsx)

**Content Review:**
- ✅ Content is good but gated behind premium
- ❌ Should be available to all during beta
- ❌ Needs clearer explanation of how comparison works

**Improvements:**
- Remove FeatureGate temporarily
- Add tooltip: "We compare 150+ tariffs from all major UK suppliers"
- Add disclaimer: "Prices updated daily from official supplier websites"

---

### Solar Page (/solar/page.tsx)

**Content Review:**
- ✅ Calculator is clear and works well
- ✅ Affiliate disclosure present
- ❌ Could add more context about government schemes

**Improvements:**
- Add section about ECO4 grant scheme
- Link to government renewable energy resources
- Add "Typical savings" examples with real UK postcodes

---

### Heat Pump Page (/heat-pump/page.tsx)

**Content Review:**
- ✅ Good suitability checker
- ✅ Clear explanations
- ❌ Could explain government BUS grant better

**Improvements:**
- Add Boiler Upgrade Scheme (BUS) calculator
- Show grant amount (£7,500 for air source)
- Add "With grant, your cost is only £X" messaging

---

### Products Page (/products/page.tsx)

**Content Review:**
- ✅ Product recommendations present
- ✅ Energy efficiency focus
- ❌ Limited to energy products only

**Future Expansion:**
- Prepare for: Smart home devices, broadband routers, insurance products
- Add category filter: Energy | Smart Home | Connectivity | Insurance
- Update copy: "Products to help you save across all categories"

---

## 2. PREMIUM FEATURE CHANGES

### Current Premium Features (lib/featureGating.ts):
```
- advanced_analytics (30-day history, hourly breakdown)
- ai_insights (personalized tips, savings forecast)
- bill_upload (OCR extraction, automatic tracking)
- tariff_comparison (150+ tariffs, auto-switching alerts)
- export_data (PDF reports, CSV exports)
- priority_support (24h response, phone support)
- price_alerts (tariff change notifications)
- appliance_tracking (device-level monitoring)
```

### Temporary Changes (Beta Launch):
**Enable for ALL users:**
- ✅ bill_upload (critical for user acquisition)
- ✅ tariff_comparison (main value prop)
- ✅ ai_insights (differentiation)
- ✅ advanced_analytics (keep users engaged)

**Keep Premium-only:**
- ⏳ export_data (nice-to-have, not essential)
- ⏳ priority_support (limited capacity)
- ⏳ price_alerts (complex to scale)

**Implementation:**
```typescript
// In lib/featureGating.ts
export const BETA_ENABLED_FEATURES = [
  'bill_upload',
  'tariff_comparison',
  'ai_insights',
  'advanced_analytics',
];

export function hasFeatureAccess(profile: UserProfile | null, featureId: string): boolean {
  // During beta, enable specific features for all
  if (BETA_ENABLED_FEATURES.includes(featureId)) {
    return true;
  }
  
  // Original logic for other features
  // ...
}
```

---

## 3. BILL OCR IMPROVEMENTS

### Current Problems:
1. **Supplier Detection:** Only checks exact names, misses variations
2. **Date Parsing:** Rigid DD/MM/YYYY, fails on DD MMM YYYY
3. **Usage Extraction:** Doesn't handle "Total Usage" vs "Current Reading"
4. **Rate Formats:** Misses "6.2p/kWh" vs "6.2p per kWh"
5. **Standing Charge:** Only finds monthly, not daily amounts

### Improved Patterns:

```typescript
// lib/billOCR.ts improvements

// 1. Flexible Supplier Matching
const suppliers = [
  { name: 'Octopus Energy', variations: ['octopus', 'octopus energy'] },
  { name: 'British Gas', variations: ['british gas', 'bg', 'britishgas'] },
  { name: 'OVO Energy', variations: ['ovo', 'ovo energy'] },
  // ... add all UK suppliers
];

// 2. Multiple Date Formats
const datePatterns = [
  /(\d{2})\/(\d{2})\/(\d{4})/,  // DD/MM/YYYY
  /(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,  // DD Mon YYYY
  /(\d{1,2})(st|nd|rd|th)?\s+(January|February|...|December)\s+(\d{4})/i,  // 1st January 2024
];

// 3. Flexible Usage Extraction
const usagePatterns = [
  /total\s+usage[\s:]+(\d+\.?\d*)\s*kwh/i,
  /usage[\s:]+(\d+\.?\d*)\s*kwh/i,
  /current\s+reading[\s:]+(\d+)[\s\S]*previous\s+reading[\s:]+(\d+)/i,  // Calculate from readings
  /electricity[\s:]+(\d+\.?\d*)\s*kwh/i,
];

// 4. Rate Extraction (multiple formats)
const ratePatterns = [
  /(\d+\.?\d*)\s*p\s*(?:per\s*)?kwh/i,
  /rate[\s:]+(\d+\.?\d*)\s*p/i,
  /unit\s+rate[\s:]+(\d+\.?\d*)/i,
  /£(\d+\.?\d*)\s*per\s*kwh/i,  // Convert £ to pence
];

// 5. Standing Charge (daily or monthly)
const standingChargePatterns = [
  /standing\s+charge[\s:]+£?(\d+\.?\d*)\s*(?:per\s+)?(day|daily)/i,
  /standing\s+charge[\s:]+£?(\d+\.?\d*)\s*(?:per\s+)?(month|monthly)/i,
  /daily\s+charge[\s:]+£?(\d+\.?\d*)/i,
];
```

### Testing Strategy:
1. Collect 10 real UK energy bills (anonymized)
2. Test extraction accuracy on each
3. Target: 80%+ accurate extraction
4. Provide manual edit option if confidence < 70%

---

## 4. HOMEPAGE REDESIGN

### New Component: BillUploadWidget

**Location:** Homepage, after hero, before features
**Purpose:** Make bill upload discoverable and easy
**Design:** Drag & drop zone with instant feedback

```tsx
// components/BillUploadWidget.tsx
export default function BillUploadWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📄 Upload Your Energy Bill
        </h2>
        <p className="text-gray-600">
          We'll analyze it instantly and show you how much you could save
        </p>
      </div>
      
      <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer">
        <div className="text-5xl mb-4">📤</div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drag & drop your bill here
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to browse (PDF, JPG, PNG)
        </p>
        <p className="text-xs text-gray-400">
          🔒 Your data never leaves your device - 100% private
        </p>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="text-green-500">✓</span> Free forever
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-500">✓</span> Takes 30 seconds
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-500">✓</span> Instant results
        </span>
      </div>
    </div>
  );
}
```

### New Section: Latest Blog Posts

**Location:** Homepage, after features, before social proof
**Purpose:** Drive engagement, improve SEO

```tsx
// On homepage
<div className="pt-16 max-w-7xl mx-auto">
  <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
    💡 Latest Money-Saving Tips
  </h2>
  <div className="grid md:grid-cols-3 gap-6">
    {latestPosts.slice(0, 3).map(post => (
      <BlogCard key={post.id} post={post} />
    ))}
  </div>
  <div className="text-center mt-8">
    <Link href="/blog">
      <Button variant="outline">View All Articles →</Button>
    </Link>
  </div>
</div>
```

### New Section: Energy News Ticker

**Location:** Homepage, below blog posts
**Purpose:** Show app is up-to-date, build trust

```tsx
<div className="bg-blue-50 rounded-2xl p-8">
  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
    📰 Latest Energy News
  </h3>
  <div className="space-y-4">
    {latestNews.slice(0, 5).map(article => (
      <div key={article.id} className="flex items-start gap-3 text-sm">
        <span className="text-blue-600">•</span>
        <div>
          <a href={article.url} className="font-medium text-gray-900 hover:text-blue-600">
            {article.title}
          </a>
          <p className="text-gray-500 text-xs mt-1">{article.source} • {formatDate(article.publishedAt)}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## 5. BRAND MESSAGING UPDATES

### Current Tagline:
"Save Money on Your Energy Bills"

### New Tagline Options:
1. **"Your Personal Money-Saving Assistant"** ← RECOMMENDED
2. "Save Money on All Your Household Bills"
3. "Stop Overpaying. Start Saving."
4. "Energy, Broadband, Insurance & More - All In One Place"

### Value Proposition Evolution:

**Current:**
- Energy bill analysis
- Tariff comparison
- Solar/heat pump calculators

**Future Vision (communicate now):**
- ALL household cost analysis
- Multi-category comparison
- Subscription auditing
- Shopping deal alerts
- Insurance renewals
- Broadband optimization

### Messaging Guidelines:

**Do:**
- ✅ "We started with energy, but we're expanding to help you save on everything"
- ✅ "Currently: Energy | Coming Soon: Broadband, Insurance, Subscriptions"
- ✅ "Your one-stop shop for household savings"

**Don't:**
- ❌ "Energy-only service" (limiting)
- ❌ Over-promise features not built yet
- ❌ Create separate brand for each category

---

## 6. NAVIGATION & IA IMPROVEMENTS

### Current Navigation:
- Dashboard
- About
- Settings
- (Hidden: Bills, Blog, News)

### New Navigation Structure:

**Top Navigation:**
- 🏠 Home
- 📊 Dashboard
- 💰 Tools ▾
  - Energy Tariffs
  - Solar Calculator
  - Heat Pump Checker
  - Bill Upload
  - Product Recommendations
- 📚 Resources ▾
  - Blog
  - News
  - Guides
  - FAQs
- ℹ️ About
- ⚙️ Settings

### Homepage Quick Links:
- Upload Bill (prominent button)
- Compare Tariffs
- Check Solar Savings
- View Blog
- See Latest News

---

## 7. IMPLEMENTATION PRIORITY

### Phase 1: Critical (Do Now)
1. ✅ Enable premium features for all (20 mins)
2. ✅ Fix bill OCR patterns (2 hours)
3. ✅ Add bill upload widget to homepage (1 hour)
4. ✅ Update About page content (1 hour)
5. ✅ Update homepage hero & tagline (30 mins)

### Phase 2: High Priority (This Week)
6. ✅ Add blog section to homepage (1 hour)
7. ✅ Add news section to homepage (1 hour)
8. ✅ Remove FeatureGate from tariffs (15 mins)
9. ✅ Update navigation structure (1 hour)
10. ✅ Add roadmap section to About (30 mins)

### Phase 3: Medium Priority (Next Week)
11. Improve product page categories
12. Add grant calculators (Solar ECO4, Heat Pump BUS)
13. Create comprehensive FAQ page
14. Add testimonials with real savings data
15. Implement feedback on all pages

---

## 8. CONTENT CHECKLIST

### Homepage:
- [x] Hero messaging updated
- [ ] Bill upload widget added
- [ ] Blog posts featured
- [ ] News feed added
- [ ] Tagline updated
- [ ] Savings claim clarified

### About Page:
- [ ] Mission expanded beyond energy
- [ ] Future roadmap added
- [ ] Value proposition clearer
- [ ] Team/story section

### Bills Page:
- [ ] OCR patterns improved
- [ ] Error messages clearer
- [ ] Example bills shown
- [ ] Manual edit option added

### All Pages:
- [ ] "Energy-only" language removed
- [ ] Future categories mentioned
- [ ] Consistent branding
- [ ] Clear CTAs

---

## 9. TESTING PLAN

### Bill Upload Testing:
1. Test with 10 real UK bills:
   - Octopus Energy
   - British Gas
   - OVO Energy
   - EDF
   - E.ON
   - SSE
   - Scottish Power
   - Bulb
   - Shell Energy
   - Utilita

2. Measure:
   - Extraction accuracy (target: 80%+)
   - Time to extract (target: <10s)
   - User satisfaction (manual edits needed?)

### Content Testing:
1. A/B test new vs old hero messaging
2. Track blog click-through rate
3. Measure bill upload conversion
4. Monitor bounce rate changes

---

## 10. SUCCESS METRICS

### Beta Launch Goals:
- **Bill Upload Adoption:** 50%+ of users try it
- **OCR Accuracy:** 80%+ correct extractions
- **Blog Engagement:** 20%+ users read an article
- **Feature Discovery:** 70%+ users find tariff comparison
- **Conversion:** 30%+ complete onboarding

### Content Effectiveness:
- Time on page (homepage target: 2+ minutes)
- Scroll depth (target: 70%+ see blog section)
- Click-through to tools (target: 50%)
- Return visitors (target: 40% within 7 days)

---

## CONCLUSION

**Summary:**
The app has excellent technical foundation but content needs updating to reflect broader vision. Main priorities are:

1. **Fix bill upload** - Critical feature, currently hidden and broken
2. **Enable premium features** - Remove friction during beta
3. **Update messaging** - Expand beyond energy-only positioning
4. **Feature content** - Blog/news on homepage for engagement

**Estimated Time:** 6-8 hours for Phase 1 + Phase 2
**Risk:** Low - mostly content changes, minimal code changes
**Impact:** High - better user acquisition and engagement

---

**Status:** Ready to implement  
**Next Steps:** Begin Phase 1 implementations  
**Owner:** Development Team  
**Review Date:** After Phase 2 complete

