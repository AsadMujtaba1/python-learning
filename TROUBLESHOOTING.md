# Cost Saver App - Quick Troubleshooting Reference

**For full deployment guide, see: DEPLOYMENT.md**

---

## 🔥 Top 5 Most Common Issues

### 1. Authentication Not Working
**Error:** "Firebase not initialized" or user stays null

**Quick Fix:**
```bash
# Check environment variables
cat .env.local

# Should have all these:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Restart server
npm run dev
```

### 2. Protected Routes Redirecting Endlessly
**Error:** Stuck in redirect loop

**Quick Fix:**
- Clear browser localStorage and cookies
- Log out completely
- Log in again
- If still broken, check `useAuth` hook for infinite useEffect

### 3. Build Errors with "window is not defined"
**Error:** `ReferenceError: window is not defined`

**Quick Fix:**
- Add `'use client'` to top of component file
- OR wrap in check:
```typescript
if (typeof window !== 'undefined') {
  // browser code here
}
```

### 4. API Calls Failing
**Error:** Network errors or timeout

**Quick Fix:**
- Use mock data temporarily (see `lib/mockData.ts`)
- Check API rate limits
- Implement retry logic with exponential backoff

### 5. Dark Mode Not Working
**Error:** Dark theme classes not applying

**Quick Fix:**
- Verify `tailwind.config.ts` has `darkMode: 'class'`
- Check all classes use `dark:` prefix
- Restart dev server

---

## 🚨 Emergency Fixes

### Server Won't Start
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### TypeScript Errors Everywhere
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or rebuild
npm run build
```

### Firebase Permission Denied
```javascript
// Update Firestore rules in Firebase Console:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📋 Quick Test Accounts

```
Email: test@costsaver.com
Password: test123
Profile: Basic (25% complete)

Email: advanced@costsaver.com  
Password: advanced123
Profile: Advanced (65% complete)

Email: expert@costsaver.com
Password: expert123
Profile: Expert (100% complete)
```

---

## ⚡ Performance Fixes

### Slow Page Load
1. Enable image optimization (use Next.js `<Image>`)
2. Code split large components
3. Cache API responses in localStorage
4. Use dynamic imports for heavy components

### High Memory Usage
1. Check for memory leaks in useEffect
2. Clean up event listeners
3. Unsubscribe from Firebase listeners
4. Limit state updates

---

## 🔍 Debugging Tips

### Check Console First
```javascript
// Add these to components:
console.log('User state:', user);
console.log('Loading state:', loading);
console.log('LocalStorage:', localStorage.getItem('userHomeData'));
```

### Firebase Console Checks
1. Authentication → Users (verify user created)
2. Firestore → Data (check user document)
3. Usage → Check quotas not exceeded

### Network Tab
- Check for 401/403 errors (auth issue)
- Check for 429 errors (rate limit)
- Verify API endpoints correct

---

## 📞 Get Help

- **Testing Guide:** `TESTING_GUIDE.md`
- **Full Deployment:** `DEPLOYMENT.md`
- **Mock Data:** `lib/mockData.ts`
- **GitHub Issues:** https://github.com/AsadMujtaba1/python-learning/issues

---

## ✅ Quick Health Check

Run these to verify everything works:

```bash
# No TypeScript errors
npm run build

# No runtime errors
npm run dev
# Open http://localhost:3000

# Test critical path
# 1. Sign up → onboarding → dashboard ✓
# 2. Sign out → sign in ✓
# 3. Protected routes redirect ✓
```

**All good?** You're ready to deploy! 🚀
