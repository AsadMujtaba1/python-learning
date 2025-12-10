# 🚀 PRODUCTION DEPLOYMENT GUIDE

## Overview

This guide covers deploying the Cost Saver App to production with enterprise-grade reliability, monitoring, and security.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your deployment platform:

**Required:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SITE_URL`
- `OPENWEATHER_API_KEY`

**Recommended:**
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `NEXT_PUBLIC_ANALYTICS_ENDPOINT`

### 2. Firebase Configuration

#### Firestore Security Rules

Deploy the hardened security rules:

```bash
firebase deploy --only firestore:rules
```

#### Firebase Authentication

Enable these sign-in methods:
- Email/Password
- Anonymous (optional for testing)

Add authorized domains:
- `localhost` (development)
- `your-domain.com` (production)
- `your-domain.vercel.app` (Vercel preview)

### 3. Sentry Setup

1. Create account at https://sentry.io
2. Create new project (Next.js)
3. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN`
4. Enable Source Maps for better debugging
5. Configure alerts for critical errors

---

## 🌐 Vercel Deployment (Recommended)

### Initial Setup

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel
   ```

2. **Configure Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production` for production
   - Set different values for Preview vs Production

3. **Configure Domains**
   
   Settings → Domains:
   - Add custom domain
   - Configure DNS (A record or CNAME)
   - Enable automatic HTTPS

### Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

### Vercel Features Enabled

✅ **Analytics** - Automatic with @vercel/analytics  
✅ **Speed Insights** - Automatic with @vercel/speed-insights  
✅ **Edge Functions** - For global performance  
✅ **CDN** - Automatic static asset caching  
✅ **DDoS Protection** - Built-in  

---

## 🐳 Docker Deployment (Alternative)

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 📊 Monitoring Setup

### 1. Sentry Dashboard

Monitor:
- Error rate trends
- Performance issues
- User impact
- Release tracking

Set up alerts for:
- Error spike (>10 errors/min)
- High response time (>2s)
- Failed deployments

### 2. Vercel Analytics

Track:
- Page views
- User sessions
- Geographic distribution
- Device breakdown

### 3. Custom Metrics

The app automatically tracks:
- Page load times
- API response times
- Feature usage
- Conversion funnels
- Affiliate clicks

Access in browser console:
```javascript
window.__analytics.getErrorLogs()
```

---

## 🔒 Security Hardening

### 1. Content Security Policy

Add to `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

### 2. Rate Limiting

Already implemented in API client. Configure per-endpoint limits as needed.

### 3. Firebase Security

Ensure Firestore rules are deployed:
- Users can only access their own data
- Input validation on all writes
- Size limits on documents
- Rate limiting via Firebase quotas

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Performance Optimization

### 1. Caching Strategy

Automatic caching implemented for:
- API responses (5 min TTL)
- User data (localStorage + memory)
- Static assets (CDN)

### 2. Bundle Size

Monitor with:
```bash
npm run build
# Check .next/analyze/ for bundle report
```

### 3. Image Optimization

Using Next.js Image component automatically optimizes:
- WebP conversion
- Responsive sizes
- Lazy loading

---

## 🚨 Incident Response

### Error Alerts

Configure Sentry alerts to notify:
- Slack channel
- Email
- PagerDuty (for critical issues)

### Health Checks

Monitor endpoint: `/api/health`

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "firebase": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

### Rollback Procedure

```bash
# Vercel: Instant rollback
vercel rollback [deployment-url]

# Or redeploy previous version
git revert HEAD
git push origin main
```

---

## 📞 Support & Maintenance

### Automated Systems

✅ Self-healing error recovery  
✅ Automatic cache refresh  
✅ Circuit breaker for failing APIs  
✅ Graceful degradation  
✅ Offline mode support  

### Manual Intervention Needed

Only for:
- Critical security vulnerabilities
- Major Firebase quota exceeded
- Partner API changes
- Database migrations

### Monitoring Checklist (Daily)

- [ ] Check Sentry dashboard for new errors
- [ ] Review Vercel Analytics for traffic spikes
- [ ] Monitor Firebase quotas
- [ ] Check health endpoint status

---

## 🎯 Success Metrics

### Technical Metrics

- Uptime: >99.9%
- Error rate: <0.1%
- Response time: <2s (p95)
- Time to first byte: <500ms

### Business Metrics

Track in analytics:
- User sign-ups
- Onboarding completion rate
- Feature adoption
- Affiliate click-through rate

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

---

**Last Updated:** December 6, 2025  
**Version:** 1.0.0
