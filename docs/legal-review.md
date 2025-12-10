# Legal and Compliance Review
**Cost Saver UK - Energy Comparison Platform**

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Review Cycle:** Quarterly

---

## Executive Summary

This document outlines the legal, commercial, privacy, security, and compliance framework for Cost Saver UK. All decisions have been reviewed from CEO (commercial impact), CTO (technical architecture), and Legal (compliance) perspectives.

**Status:** ✅ Pre-launch compliance review completed

---

## 1. Commercial Impact Analysis

### Revenue Model
**Decision Owner:** CEO

**Primary Revenue Streams:**
1. **Affiliate Commissions**
   - Energy supplier switching commissions (£50-150 per switch)
   - Solar installer referral fees (£200-500 per installation)
   - Heat pump installer referral fees (£300-600 per installation)
   - Product affiliate links (Amazon, retailers) (5-10% commission)

2. **Potential Future Revenue:**
   - Premium features (detailed analytics, priority support)
   - B2B partnerships with energy suppliers
   - White-label solutions for other platforms

**Commercial Risks:**
- Dependence on affiliate programs (mitigation: diversify partners)
- Commission rate changes (mitigation: contract negotiations, multiple suppliers)
- Regulatory changes affecting switching (mitigation: monitor Ofgem closely)

**Competitive Advantage:**
- UK-focused with localized calculations
- Solar and heat pump recommendations (competitors focus only on tariffs)
- AI-powered insights (cost-controlled with caching)
- Free for consumers (ad-free experience)

**CEO Decision:** ✅ Approved  
**Rationale:** Revenue model sustainable, low customer acquisition cost, high lifetime value potential

---

## 2. Privacy and Data Protection

### UK GDPR Compliance
**Decision Owner:** Legal / DPO

**Data Collection Policy:**

#### What We Collect:
- **Essential Data:**
  - Email address (authentication)
  - Postcode (regional calculations)
  - Energy usage data (uploaded bills)
  - Tariff preferences
  
- **Optional Data:**
  - Property type (for better recommendations)
  - Household size (for usage estimates)
  - Current supplier (for comparison)

#### What We DO NOT Collect:
- ❌ Full name (unless user provides)
- ❌ Full address (postcode only)
- ❌ Payment details (no transactions on our platform)
- ❌ National Insurance Number
- ❌ Bank account details
- ❌ Detailed personal financial data

**Data Retention:**
- User accounts: Active + 3 years after deletion request
- Energy bills: 2 years (user can delete anytime)
- Usage patterns: 1 year (for historical analysis)
- Error logs: 30 days
- Analytics: 1 year (anonymized)

**User Rights (UK GDPR):**
1. ✅ Right to access (data export feature)
2. ✅ Right to deletion (account deletion + 30-day grace period)
3. ✅ Right to rectification (user can edit data)
4. ✅ Right to data portability (JSON export)
5. ✅ Right to object (opt-out of analytics/marketing)
6. ✅ Right to restrict processing (pause recommendations)

**Legal Basis:**
- Service provision: Contract
- Energy analysis: Consent (explicit opt-in)
- Analytics: Legitimate interest (anonymized)
- Marketing: Consent (opt-in only, easy unsubscribe)

**DPO Decision:** ✅ Approved  
**Action Required:** Appoint Data Protection Officer when >250 employees or processing >10,000 data subjects

---

## 3. Security Measures

### Technical Security
**Decision Owner:** CTO

**Data Protection:**
- ✅ Firebase Authentication (industry-standard)
- ✅ Firestore Security Rules (user data isolation)
- ✅ HTTPS only (no plain HTTP)
- ✅ No sensitive data in localStorage (session tokens only)
- ✅ Bill images processed client-side (OCR in browser)
- ✅ No bill images stored on servers
- ✅ API rate limiting (prevent abuse)

**Vulnerabilities Addressed:**
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (Firebase built-in)
- ✅ SQL injection (N/A - using Firestore)
- ✅ Rate limiting (cost control + abuse prevention)
- ✅ Input validation (all user inputs sanitized)

**Incident Response Plan:**
1. Detect breach via monitoring service
2. Notify users within 72 hours (UK GDPR requirement)
3. Report to ICO if high risk to user rights
4. Document incident and remediation
5. Review and update security measures

**CTO Decision:** ✅ Approved  
**Action Required:** External security audit before scaling to >10,000 users

---

## 4. Brand Safety and Reputation

### Partner Vetting
**Decision Owner:** CEO + Legal

**Affiliate Partner Requirements:**
- ✅ Legitimate UK-registered businesses
- ✅ Ofgem license (energy suppliers)
- ✅ MCS certification (solar/heat pump installers)
- ✅ Positive consumer reviews (>3.5/5 average)
- ✅ No history of misleading advertising
- ✅ Clear terms and conditions
- ✅ Responsive customer service

**Prohibited Partners:**
- ❌ Unlicensed energy suppliers
- ❌ Non-MCS certified renewable installers
- ❌ Companies with unresolved ASA complaints
- ❌ High-pressure sales tactics
- ❌ Hidden fees or misleading claims

**Content Standards:**
- ✅ Clear, honest language (no exaggeration)
- ✅ Realistic savings estimates (include "typical" and "up to")
- ✅ Transparent calculations (link to methodology)
- ✅ Prominent affiliate disclosures
- ✅ Disclaimers on all financial advice
- ✅ Regular content audits

**Legal Decision:** ✅ Approved  
**Action Required:** Quarterly partner review, annual content audit

---

## 5. UK Consumer Compliance

### Consumer Rights Act 2015
**Decision Owner:** Legal

**Compliance Measures:**
- ✅ Clear, transparent pricing information
- ✅ No hidden fees in our service (free for consumers)
- ✅ Accurate product descriptions
- ✅ Right to cancel comparisons (no commitment)
- ✅ 14-day cooling-off period information for switches

### Consumer Protection from Unfair Trading Regulations 2008
**Compliance Measures:**
- ✅ No misleading actions (accurate data sources)
- ✅ No misleading omissions (full disclosure)
- ✅ No aggressive practices (no pressure tactics)
- ✅ Affiliate relationships clearly disclosed
- ✅ Limitations stated clearly (e.g., "not all suppliers compared")

### Financial Services and Markets Act 2000
**Important:** We do NOT provide financial advice

**Disclaimers Required:**
- ✅ "This is a comparison tool, not financial advice"
- ✅ "Savings are estimates based on typical usage"
- ✅ "Actual savings may vary"
- ✅ "Consider your individual circumstances"
- ✅ "We may earn commission from switches"
- ✅ "Recommendations are not guaranteed"

**Legal Decision:** ✅ Approved  
**Condition:** Maintain clear disclaimers on all recommendation pages

---

## 6. Advertising Standards Authority (ASA) Compliance

### Financial Claims Validation
**Decision Owner:** Legal + Marketing

**Required Elements for Savings Claims:**
1. ✅ Time period specified ("per year", "per month")
2. ✅ Comparison basis stated ("vs. your current tariff")
3. ✅ Typical savings included (not just maximum)
4. ✅ Calculation basis transparent (link to methodology)
5. ✅ "Results may vary" disclaimer
6. ✅ Assumptions stated (e.g., "based on 3,100 kWh annual usage")

**Prohibited Claims:**
- ❌ "Guaranteed to save £500"
- ❌ "Risk-free investment"
- ❌ "Definitely will reduce your bills"
- ❌ "100% savings"
- ❌ Absolute guarantees without substantiation

**Compliant Claims Examples:**
- ✅ "Typical user saves £150 per year by switching"
- ✅ "You could save up to £300 annually (typical savings: £80-120)"
- ✅ "Based on average usage, potential saving of £200/year compared to standard variable tariff"

**Legal Decision:** ✅ Approved  
**Action Required:** All marketing materials must pass compliance validation

---

## 7. Web Scraping and Data Collection

### Terms of Service Compliance
**Decision Owner:** CTO + Legal

**Allowed Sources:**
- ✅ Government websites (ofgem.gov.uk, gov.uk)
- ✅ Public data feeds (RSS, APIs)
- ✅ Websites with explicit permission
- ✅ Partner APIs (Amazon, eBay with API keys)

**Prohibited Sources:**
- ❌ Competitor comparison sites (ToS violation)
- ❌ Price comparison sites without permission
- ❌ Any site with robots.txt restrictions
- ❌ Sites requiring authentication to access data
- ❌ Sites with "no scraping" in ToS

**Scraping Best Practices:**
- ✅ Check robots.txt before any scraping
- ✅ Rate limiting (max 1 request per second)
- ✅ User-agent identification
- ✅ Respect "nofollow" and meta robot tags
- ✅ Cache results (don't repeatedly scrape)
- ✅ Seek API access where possible

**CTO Decision:** ✅ Approved  
**Policy:** No scraping without explicit legal review

---

## 8. Ofgem Compliance (Energy Sector)

### Price Comparison and Switching
**Decision Owner:** Legal

**Ofgem Confidence Code Requirements:**
- ✅ Accurate and up-to-date tariff information
- ✅ Clear disclosure of commercial relationships
- ✅ No bias toward partners (genuine comparison)
- ✅ Include standing charges and unit rates
- ✅ Show exit fees prominently
- ✅ Explain switching process clearly
- ✅ Provide Ofgem contact information

**Tariff Comparison Standards:**
- ✅ Update tariffs weekly (automated)
- ✅ Include all tariff types (fixed, variable, green)
- ✅ Show contract length clearly
- ✅ Calculate based on user's actual/estimated usage
- ✅ Include payment method discounts
- ✅ Flag best deals clearly

**Legal Decision:** ✅ Approved  
**Action Required:** Apply for Ofgem Confidence Code accreditation when processing >10,000 comparisons/month

---

## 9. AI and Automation Governance

### AI Ethics and Transparency
**Decision Owner:** CTO + Legal

**AI Usage Policy:**
- ✅ AI-generated content clearly labeled
- ✅ Human review for critical recommendations
- ✅ No AI decisions without user control
- ✅ Explainable AI (show calculation basis)
- ✅ Bias monitoring (check for unfair patterns)
- ✅ Regular accuracy audits

**Cost Control Measures:**
- ✅ Comprehensive caching (24h to 30 days)
- ✅ Rate limiting (1-100 requests/hour per feature)
- ✅ Fallback to static content
- ✅ Budget alerts (notify if costs spike)
- ✅ Monthly cost cap (kill switch at threshold)

**Automation Safeguards:**
- ✅ Error handling with exponential backoff
- ✅ Monitoring and alerting
- ✅ Graceful degradation (use cached data)
- ✅ Manual override capability
- ✅ Audit logs for all automated actions

**CTO Decision:** ✅ Approved  
**Policy:** AI never makes final decisions without user confirmation

---

## 10. Accessibility Compliance

### Web Content Accessibility Guidelines (WCAG 2.1)
**Decision Owner:** CTO

**Target Level:** AA (industry standard)

**Compliance Measures:**
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Alt text for images
- ✅ Form labels and error messages
- ✅ Focus indicators visible

**Legal Decision:** ✅ Approved  
**Action Required:** External accessibility audit before public launch

---

## 11. Insurance and Liability

### Professional Indemnity Insurance
**Decision Owner:** CEO + Legal

**Coverage Required:**
- Public liability: £2 million
- Professional indemnity: £1 million
- Cyber liability: £500,000

**Limitations of Liability:**
- Not liable for energy supplier actions
- Not liable for third-party (affiliate) products
- Not liable for user switching decisions
- Capped at £1,000 per user incident
- No liability for indirect/consequential losses

**Terms of Service Must Include:**
- Clear limitation of liability clause
- "Use at your own risk" disclaimer
- No warranty on savings accuracy
- Not responsible for third-party content
- Dispute resolution process

**Legal Decision:** ✅ Approved  
**Action Required:** Purchase insurance before public launch

---

## 12. Monitoring and Continuous Compliance

### Compliance Audit Schedule
**Decision Owner:** Legal

**Monthly:**
- ✅ Review new user feedback (privacy concerns)
- ✅ Check affiliate partner compliance
- ✅ Monitor error logs for data breaches
- ✅ Verify affiliate disclosures visible

**Quarterly:**
- ✅ Data retention policy audit
- ✅ Financial claims review (ASA compliance)
- ✅ Partner vetting (reviews, complaints)
- ✅ Security update review
- ✅ Update this document

**Annually:**
- ✅ External security audit
- ✅ Legal framework review (new regulations)
- ✅ Insurance renewal
- ✅ Accessibility audit
- ✅ Data Protection Impact Assessment (DPIA)

**Action Required:** Implement compliance dashboard in admin panel

---

## 13. Pre-Launch Checklist

### Legal and Compliance Sign-Off

**Privacy & Data Protection:**
- [ ] Privacy Policy published
- [ ] Cookie Policy published
- [ ] Terms of Service published
- [ ] GDPR consent banners implemented
- [ ] Data export feature tested
- [ ] Data deletion feature tested
- [ ] DPO contact details published

**Commercial:**
- [ ] Affiliate disclosures on all relevant pages
- [ ] Financial disclaimers on calculators
- [ ] Savings methodology documented
- [ ] Partner agreements signed
- [ ] Insurance purchased

**Security:**
- [ ] Firebase security rules deployed
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Monitoring service deployed
- [ ] Incident response plan documented

**Compliance:**
- [ ] ASA guidelines review completed
- [ ] Ofgem Confidence Code checklist completed
- [ ] Accessibility audit passed
- [ ] All disclaimers in place
- [ ] Marketing materials reviewed

**Technical:**
- [ ] AI cost controls active (caching, rate limits)
- [ ] Automation error handling tested
- [ ] Monitoring alerts configured
- [ ] Backup and recovery tested
- [ ] Performance optimization completed

---

## 14. Regulatory Change Monitoring

**Responsibility:** Legal Team

**Key Regulations to Monitor:**
1. UK GDPR amendments (ICO)
2. Ofgem policy changes (switching, price cap)
3. ASA advertising guidance updates
4. Consumer protection regulation changes
5. Energy sector reforms
6. Data protection case law

**Process:**
- Monthly review of ICO, Ofgem, ASA announcements
- Quarterly legal update meeting
- Update platform within 30 days of regulatory change
- Document all compliance adaptations

---

## 15. Contact and Escalation

### Key Contacts

**Data Protection Officer (DPO):**  
Email: dpo@costsaver.uk  
Response time: 48 hours

**Legal Compliance:**  
Email: legal@costsaver.uk  
Response time: 24 hours (urgent), 72 hours (standard)

**Security Incidents:**  
Email: security@costsaver.uk  
Response time: Immediate (critical), 4 hours (high)

**Information Commissioner's Office (ICO):**  
Tel: 0303 123 1113  
Website: ico.org.uk

**Ofgem:**  
Tel: 020 7901 7295  
Website: ofgem.gov.uk

---

## 16. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Legal/CEO/CTO | Initial compliance framework |

---

## Conclusion

**Overall Compliance Status:** ✅ READY FOR LAUNCH (with pre-launch checklist completion)

**CEO Approval:** ✅ Signed Off  
**CTO Approval:** ✅ Signed Off  
**Legal Approval:** ✅ Signed Off (conditional on pre-launch checklist)

**Risk Level:** LOW (with monitoring and regular audits)

**Next Review:** April 2025

---

**Document Classification:** Internal - Leadership Team  
**Distribution:** CEO, CTO, DPO, Legal, Senior Management
