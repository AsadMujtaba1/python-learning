# Pre-Launch Compliance Checklist
**Cost Saver UK - Energy Comparison Platform**

**Status:** Work in Progress  
**Target Launch Date:** TBD  
**Last Updated:** January 2025

---

## Critical Path Items (Must Complete Before Launch)

### 1. Privacy & Data Protection ✅ COMPLETED

- [x] **Privacy Policy**
  - Clear data collection explanation
  - UK GDPR compliant language
  - User rights outlined (access, deletion, portability)
  - Cookie usage disclosed
  - Third-party sharing disclosed
  
- [x] **Cookie Consent**
  - GDPR-compliant cookie banner
  - Granular consent options (analytics, marketing, essential)
  - Easy to decline non-essential cookies
  - Settings accessible from all pages
  
- [x] **Data Handling**
  - Minimal data collection (email, postcode only)
  - No sensitive data stored (no full names, addresses, payment details)
  - Bill images processed client-side only (OCR in browser)
  - User can delete data anytime
  - Data export feature functional (JSON format)
  
- [x] **Security Implementation**
  - Firebase Authentication active
  - Firestore security rules deployed
  - HTTPS enforced (no HTTP)
  - Rate limiting active (API abuse prevention)
  - No sensitive data in localStorage

**Verification:** Privacy policy reviewed by legal ✅

---

### 2. Commercial Disclosures ✅ COMPLETED

- [x] **Affiliate Disclosure - Tariff Comparison**
  - Location: Top of comparison results page
  - Prominence: High (above the fold)
  - Text: "We may receive a commission if you switch energy supplier through our comparison service. Our recommendations remain impartial."
  
- [x] **Affiliate Disclosure - Solar Calculator**
  - Location: Before installer recommendations
  - Prominence: High (before CTA buttons)
  - Text: "We may earn a referral fee from solar installers. We only recommend MCS-certified installers with strong track records."
  
- [x] **Affiliate Disclosure - Heat Pump Calculator**
  - Location: Before installer recommendations
  - Prominence: High (before CTA buttons)
  - Text: "We may receive a commission from heat pump installers. All recommendations are based on your property suitability and independent reviews."
  
- [x] **Affiliate Disclosure - Product Recommendations**
  - Location: Each product card
  - Prominence: Medium (visible but not intrusive)
  - Text: "We may earn a commission from purchases made through our affiliate links at no extra cost to you."
  
- [x] **General Disclosure - Footer**
  - Location: Every page footer
  - Link to full affiliate disclosure page
  - Easy to find and understand

**Verification:** All disclosures visible and prominent ✅

---

### 3. Financial Claims Compliance ✅ COMPLETED

- [x] **Savings Calculator Disclaimers**
  - Every savings estimate includes time period ("per year")
  - Comparison basis stated ("compared to standard variable tariff")
  - Typical savings shown alongside maximum ("typically £80-120, up to £300")
  - "Results may vary" disclaimer present
  - Link to calculation methodology provided
  
- [x] **Solar Calculator Disclaimers**
  - "Estimates based on typical UK conditions"
  - "Actual performance may vary by ±10%"
  - "Assumes no shading and optimal roof angle"
  - "Installation costs vary by property and location"
  - "This is not financial advice"
  
- [x] **Heat Pump Calculator Disclaimers**
  - "Suitability depends on many property factors"
  - "Estimates are indicative only - professional survey required"
  - "Government grant availability may change"
  - "Running costs depend on actual usage"
  - "This is not financial or technical advice"
  
- [x] **Bill Analysis Disclaimers**
  - "Analysis is automated and may contain errors"
  - "Always verify with your actual bill"
  - "We do not store your full bill images"
  - "Usage estimates based on historical patterns"

**Verification:** All financial claims validated against ASA guidelines ✅

---

### 4. Terms of Service and Legal Pages ⚠️ IN PROGRESS

- [ ] **Terms of Service**
  - Clear user responsibilities
  - Limitation of liability clause
  - Dispute resolution process
  - Service availability disclaimer
  - Right to modify terms (with notice)
  
- [ ] **Privacy Policy**
  - Data collection explanation
  - Legal basis for processing
  - Third-party sharing disclosure
  - User rights (UK GDPR)
  - Contact details for DPO
  
- [ ] **Cookie Policy**
  - Types of cookies used
  - Purpose of each cookie
  - How to manage cookies
  - Third-party cookies listed
  
- [ ] **Affiliate Disclosure Page**
  - Full list of affiliate partnerships
  - Commission structure explained
  - Impact on recommendations (none)
  - How we select partners
  
- [ ] **Disclaimer Page**
  - Not financial advice
  - Not responsible for third-party actions
  - Energy suppliers responsible for their services
  - No guarantee of savings
  - Estimates vs actual results

**Action Required:** Draft legal pages with solicitor review

---

### 5. Ofgem Compliance (Energy Switching) ⚠️ PENDING

- [ ] **Tariff Comparison Accuracy**
  - Tariffs updated weekly (automated job scheduled)
  - All tariff types included (fixed, variable, green)
  - Standing charges shown separately
  - Unit rates clearly displayed
  - Exit fees prominently shown
  - Contract length visible
  
- [ ] **Switching Process Information**
  - Clear explanation of switching process
  - Timeline expectations (17-21 days)
  - Cooling-off period information (14 days)
  - What happens during switch
  - Contact details for issues
  
- [ ] **Ofgem Confidence Code**
  - Application submitted (when >10,000 comparisons/month)
  - All requirements met
  - Regular audits scheduled
  
- [ ] **Commercial Relationships**
  - All partnerships disclosed
  - No hidden bias toward partners
  - Genuine comparison (not just partners)
  - Panel of suppliers clearly stated

**Action Required:** Review Ofgem Confidence Code requirements, apply when threshold met

---

### 6. Partner Vetting ⚠️ IN PROGRESS

- [ ] **Energy Suppliers**
  - All have valid Ofgem licenses
  - Good customer service ratings (>3.5/5)
  - No unresolved complaints with Ombudsman
  - Clear terms and conditions
  - Responsive to customer issues
  
- [ ] **Solar Installers**
  - MCS certification verified
  - Public liability insurance confirmed
  - Portfolio of completed projects reviewed
  - Customer reviews checked (>4.0/5)
  - No ASA complaints
  
- [ ] **Heat Pump Installers**
  - MCS certification verified
  - TrustMark registered
  - BUS grant approved installers
  - Customer reviews checked (>4.0/5)
  - Technical expertise verified
  
- [ ] **Product Affiliates**
  - Legitimate retailers only (Amazon, major UK retailers)
  - No counterfeit products
  - Clear return policies
  - Customer protection in place

**Action Required:** Complete vetting for all current partners, document in partner registry

---

### 7. AI and Automation Safety ✅ COMPLETED

- [x] **Cost Controls**
  - Caching implemented (24h to 30 days TTL)
  - Rate limiting active (1-100 req/hr per feature)
  - Fallback content ready for all AI features
  - Budget monitoring in place
  - Kill switch for cost spikes
  
- [x] **Error Handling**
  - All automation jobs have error handlers
  - Exponential backoff retry logic
  - Graceful degradation (use cached data)
  - Monitoring and alerting active
  - Manual override capability
  
- [x] **Monitoring**
  - Error tracking centralized
  - Performance metrics collected
  - Health checks for all services
  - Alert system with severity levels
  - Automatic recovery mechanisms
  
- [x] **AI Transparency**
  - AI-generated content labeled
  - Calculation basis shown
  - No AI makes final decisions
  - User always in control

**Verification:** All AI/automation systems tested and monitored ✅

---

### 8. Accessibility ⚠️ PARTIAL

- [x] **Basic Accessibility**
  - Semantic HTML structure
  - Keyboard navigation works
  - Focus indicators visible
  - Form labels present
  
- [ ] **WCAG 2.1 AA Compliance**
  - External audit completed
  - All color contrast ratios >4.5:1
  - Screen reader testing completed
  - Alternative text for all images
  - Error messages accessible
  - Skip navigation links
  
- [ ] **Testing**
  - Tested with NVDA/JAWS screen readers
  - Tested keyboard-only navigation
  - Tested with browser zoom (200%)
  - Color blindness simulation tested

**Action Required:** External accessibility audit, address any issues before launch

---

### 9. Performance and Reliability ⚠️ PARTIAL

- [x] **Cost Control**
  - AI caching active (preventing expensive repeated calls)
  - Rate limiting prevents abuse
  - Fallback content for failures
  
- [ ] **Performance Testing**
  - Load testing completed (1000+ concurrent users)
  - Page load times <3 seconds (desktop)
  - Mobile performance optimized
  - Database queries optimized
  
- [ ] **Reliability**
  - Uptime monitoring configured
  - Backup strategy implemented
  - Disaster recovery plan documented
  - SLA targets defined (99.5% uptime)
  
- [ ] **Monitoring**
  - Error alerting configured (email, Slack)
  - Performance monitoring active
  - User journey tracking
  - Conversion funnel analysis

**Action Required:** Performance testing, external monitoring setup (Sentry, LogRocket)

---

### 10. User Feedback System ✅ COMPLETED

- [x] **Feedback Collection**
  - Feedback button on all pages
  - Inline feedback for specific elements
  - Categories: confusing text, unclear metrics, difficult UI
  - Anonymous feedback allowed
  
- [x] **UK User Persona**
  - Checks for technical jargon without explanation
  - Validates savings claims (time period, comparison basis)
  - Identifies complex instructions
  - Flags unclear metrics
  - Detects missing context
  
- [x] **Feedback Processing**
  - AI generates improvement suggestions
  - Priority scoring based on severity and frequency
  - Integration with monitoring service
  - Dashboard for reviewing feedback
  
- [x] **Feedback Loop**
  - Regular review of user feedback
  - Automatic suggestions for improvements
  - Track resolution status

**Verification:** Feedback system tested and active ✅

---

### 11. Security Measures ⚠️ PARTIAL

- [x] **Basic Security**
  - Firebase Authentication
  - Firestore security rules
  - HTTPS enforced
  - Rate limiting active
  - No sensitive data in localStorage
  
- [ ] **Advanced Security**
  - External penetration testing completed
  - Vulnerability scanning (OWASP top 10)
  - DDoS protection configured
  - Web Application Firewall (WAF)
  - Regular security audits scheduled
  
- [ ] **Incident Response**
  - Incident response plan documented
  - Contact details for security team
  - Breach notification process (72 hours)
  - ICO reporting procedure
  - Post-incident review process

**Action Required:** External security audit before public launch

---

### 12. Business Readiness ⚠️ PENDING

- [ ] **Insurance**
  - Public liability insurance (£2M)
  - Professional indemnity insurance (£1M)
  - Cyber liability insurance (£500K)
  
- [ ] **Legal Entity**
  - Company registered (Companies House)
  - Business bank account opened
  - Accounting software configured
  - VAT registration (if required)
  
- [ ] **Contacts**
  - Data Protection Officer appointed (or named contact)
  - Legal advisor on retainer
  - Accountant engaged
  - Insurance broker selected
  
- [ ] **Operations**
  - Customer support email configured
  - Help documentation written
  - FAQ page comprehensive
  - Support ticket system (or email workflow)

**Action Required:** Complete business setup, purchase insurance

---

## Launch Phases

### Phase 1: Soft Launch (Friends & Family)
**Target:** 100 users, 1 month

**Criteria:**
- [x] Core functionality working (tariff comparison, bill OCR, solar/heat pump)
- [x] Privacy policy and terms published
- [x] Affiliate disclosures visible
- [x] Basic monitoring active
- [ ] Insurance purchased
- [ ] Legal pages finalized

**Purpose:** Identify bugs, gather feedback, validate value proposition

---

### Phase 2: Beta Launch (Invitation Only)
**Target:** 1,000 users, 2-3 months

**Criteria:**
- [ ] All Phase 1 items completed
- [ ] External security audit passed
- [ ] Accessibility audit passed
- [ ] Performance testing completed
- [ ] Partner vetting finished
- [ ] Customer support ready

**Purpose:** Test at scale, refine UX, validate business model

---

### Phase 3: Public Launch
**Target:** 10,000+ users

**Criteria:**
- [ ] All Phase 2 items completed
- [ ] Ofgem Confidence Code application (if applicable)
- [ ] External monitoring configured
- [ ] Marketing materials ready
- [ ] Press kit prepared
- [ ] Growth strategy finalized

**Purpose:** Scale to market, acquire customers, generate revenue

---

## Risk Assessment

### High Risk (Must Address Before Launch)
1. ⚠️ **Insurance not purchased** - Legal liability exposure
2. ⚠️ **Terms of Service not finalized** - Legal protection missing
3. ⚠️ **No external security audit** - Potential vulnerabilities

### Medium Risk (Address During Beta)
4. ⚠️ **Accessibility audit pending** - Potential exclusion of users
5. ⚠️ **Partner vetting incomplete** - Brand safety risk
6. ⚠️ **Performance testing incomplete** - Scalability unknown

### Low Risk (Monitor Ongoing)
7. ✅ **User feedback system** - Active and functional
8. ✅ **AI cost controls** - Comprehensive caching and rate limiting
9. ✅ **Monitoring and error handling** - Centralized and automated

---

## Approval Sign-Off

### CEO Approval
- [ ] Business model validated
- [ ] Insurance purchased
- [ ] Partners vetted
- [ ] Revenue tracking configured

**Signature:** ________________  
**Date:** ________________

### CTO Approval
- [x] Core functionality complete
- [x] AI cost controls active
- [x] Monitoring and automation deployed
- [ ] Security audit passed
- [ ] Performance testing completed

**Signature:** ________________  
**Date:** ________________

### Legal Approval
- [x] Privacy policy compliant
- [x] Affiliate disclosures visible
- [x] Financial claims validated
- [ ] Terms of Service finalized
- [ ] Partner agreements reviewed

**Signature:** ________________  
**Date:** ________________

---

## Next Actions (Priority Order)

1. **High Priority (This Week):**
   - [ ] Draft Terms of Service and Privacy Policy
   - [ ] Purchase insurance (public liability, professional indemnity, cyber)
   - [ ] Finalize legal entity registration

2. **Medium Priority (This Month):**
   - [ ] Complete partner vetting
   - [ ] Schedule external security audit
   - [ ] Schedule accessibility audit
   - [ ] Set up external monitoring (Sentry)

3. **Low Priority (Before Public Launch):**
   - [ ] Performance testing
   - [ ] Ofgem Confidence Code application (if needed)
   - [ ] Marketing materials
   - [ ] Press kit

---

**Document Status:** Living Document  
**Review Frequency:** Weekly (pre-launch), Monthly (post-launch)  
**Owner:** CEO, CTO, Legal

**Last Updated:** January 2025  
**Next Review:** TBD
