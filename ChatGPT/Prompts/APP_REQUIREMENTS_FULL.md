# Cost Saver App Requirements Document  
Version 1.1 (Includes Copilot Efficiency Rules)

---

# GENERAL INSTRUCTIONS FOR COPILOT (ALWAYS APPLY THESE RULES)

Before completing any task:

1. Check if the feature, page, component, or logic already exists.  
   - If it exists, do NOT recreate it.  
   - Instead improve, extend, or refactor only where required.

2. Avoid duplication of code, pages, UI components, API calls, or logic.

3. Work efficiently.  
   - Update only the minimum necessary files.  
   - Reuse existing components and styles.

4. Keep updates clean and consistent.  
   - Follow existing naming conventions, styles, and folder structure.

5. Prompts should not trigger huge rewrites.  
   - Avoid generating extremely large files unless explicitly requested.

6. If something conflicts with existing code, choose the safer option:  
   - Modify  
   - Extend  
   - Or skip and notify

7. Apply improvements sequentially when a file requires multiple updates.

8. Your goal is to create production‑quality code.

9. If unsure, ask for clarification rather than guessing.

---

# 1. Overview
Cost Saver is a UK cost‑optimisation app helping users reduce household expenses by analysing energy usage, tariffs, smart meter data, product efficiency, and more. It will later support broadband, insurance, travel, and general cost‑saving insights.

The system supports:
- conversational onboarding  
- OCR for bills and smart meter photos  
- intelligent inference when user data is missing  
- personalised dashboard  
- product recommendations  
- blogs  
- referrals + promo codes  
- user profiles, settings, accounts  
- GDPR and data privacy  
- scalable backend (Firebase)

---

# 2. User Types
## Standard User
- Basic dashboard  
- Tool access  
- Tariff suggestions  
- Can upload bills/smart meter photos  

## Premium User
- Advanced insights  
- Product recommendations  
- Full tools access  
- Extra savings calculations  
- Referral rewards  

## Admin
- Create/edit blogs  
- Manage discount/promo codes  

---

# 3. Core Features (High‑Level)
1. Conversational onboarding  
2. Bill OCR  
3. Smart meter multi photo upload  
4. Usage inference model  
5. Personalised dashboard  
6. Tariff comparison  
7. Product recommendations  
8. Blog system  
9. Tools for organic traffic  
10. Referral + promo systems  
11. User profile  
12. Settings  
13. Account page (premium, export, delete)  
14. GDPR compliance  

---

# 4. Conversational Onboarding Requirements
### Goals
- Minimal typing  
- Simple choices  
- Auto‑detect data  
- Ask only relevant questions  
- User can skip at any time  
- Feels like WhatsApp/Monzo/Revolut chat flow  

### Structure
1. Welcome  
2. Ask for bill upload (OCR if uploaded)  
3. Confirm extracted supplier/tariff/address  
4. Ask postcode (only if missing)  
5. Ask supplier (dropdown sorted by popularity)  
6. Ask tariff  
7. Optional smart meter photo upload  
8. Estimate usage  
9. Redirect to dashboard  

---

# 5. Bill OCR Requirements
Extract the following when possible:
- Supplier  
- Address  
- Tariff name  
- Tariff rates  
- Standing charges  
- Billing period  
- MPAN  
- Meter number  
- Total charge  

---

# 6. Smart Meter Multi‑Photo Requirements
User may upload daily, weekly, monthly or yearly charts.

AI must:
- recognise chart type  
- extract usage values  
- detect date range  
- infer missing periods  
- adjust for seasonality  
- merge multiple photos into one usage model  

Example:
- If only weekly photo is uploaded → infer monthly & yearly usage  
- If uploaded in January → account for higher winter usage  

---

# 7. Dashboard Requirements
Dashboard must show:
- estimated annual usage  
- estimated annual cost  
- potential savings  
- cheapest tariffs  
- product recommendations  
- blog previews  
- weather insights  
- carbon intensity  
- referral progress  
- premium status  

Must be mobile‑first.

---

# 8. User Profile
Editable fields:
- Name  
- Address  
- Supplier  
- Tariff  
- Usage details  
- Bill documents  
- Smart meter photos  

---

# 9. Settings Page
Includes:
- Notification preferences  
- Privacy controls  
- Dark mode toggle  
- Language (future)  
- Clear local cache  

---

# 10. Account Page
Shows:
- Premium status  
- Renewal info  
- Referral summary  
- Upgrade button  
- Enter promo code  

Subpages:
- /account/delete  
- /account/export  

---

# 11. Referrals
- User gets premium time for referrals  
- Admin can create promotions  
- Track referral count and reward progress  

---

# 12. Promo Codes
Promo codes unlock:
- 7‑day premium  
- 30‑day premium  
- Event‑based codes (mall outreach etc.)  

---

# 13. Blog System
Supports:
- Manual blog posting  
- AI‑generated blog posting  
- Categories  
- Search  
- Featured blogs  

---

# 14. Product Recommendations
AI summarises:
- heater efficiency  
- washing machine usage  
- dryer ratings  
- energy‑saving devices  
- solar panels  
- heat pumps  

Using:
- product specs  
- user reviews  
- energy calculations  

---

# 15. Tools Section
Tools may include:
- Energy waste calculator  
- Appliance efficiency checker  
- Bill breakdown  
- Insulation estimator  

---

# 16. Legal & GDPR
- No storing full bills unless user consents  
- Provide data deletion  
- Provide export option  
- All storage must meet GDPR  

---

# 17. Backend Architecture
Use:
- Firebase Auth  
- Firestore  
- Firebase Storage  
- Serverless functions for OCR/AI  

---

# 18. Performance Requirements
- Load in under 2 seconds  
- SEO friendly  
- Cache external API calls  
- Handle 10,000 users  

---

# END OF DOCUMENT
