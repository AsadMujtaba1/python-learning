# Real Data Configuration

## Environment Variables

Add these to `.env.local` for full real data functionality:

```bash
# ============================================================================
# REAL DATA SOURCES - OPTIONAL API KEYS
# ============================================================================

# Amazon Product API (for real product data)
# Sign up: https://affiliate-program.amazon.co.uk/
NEXT_PUBLIC_AMAZON_ACCESS_KEY=your_access_key_here
NEXT_PUBLIC_AMAZON_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_AMAZON_PARTNER_TAG=your_partner_tag_here

# OpenWeather API (already configured - for weather-based tips)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_existing_key

# ============================================================================
# REAL DATA SETTINGS
# ============================================================================

# Enable/disable real data globally
NEXT_PUBLIC_USE_REAL_DATA=true

# Cache durations (in milliseconds)
NEXT_PUBLIC_PRODUCT_CACHE_DURATION=86400000  # 24 hours
NEXT_PUBLIC_TARIFF_CACHE_DURATION=21600000   # 6 hours
NEXT_PUBLIC_NEWS_CACHE_DURATION=7200000      # 2 hours

# Rate limiting (milliseconds between requests)
NEXT_PUBLIC_RATE_LIMIT_DELAY=1000            # 1 second

# Data source preferences (comma-separated, in order of priority)
NEXT_PUBLIC_PRODUCT_SOURCES=pricerunner,which,est,amazon
NEXT_PUBLIC_TARIFF_SOURCES=ofgem,octopus,mse,which
NEXT_PUBLIC_NEWS_SOURCES=bbc,guardian,ofgem,govuk

# User-Agent for web scraping
NEXT_PUBLIC_USER_AGENT=CostSaverApp/1.0 (+https://cost-saver-app.vercel.app; research@costsaver.uk)

# Contact email for robots.txt compliance
NEXT_PUBLIC_CONTACT_EMAIL=research@costsaver.uk

# ============================================================================
# FALLBACK BEHAVIOR
# ============================================================================

# What to do if real data fails
NEXT_PUBLIC_FALLBACK_TO_MOCK=true           # true = use mock, false = show error

# Maximum retries before fallback
NEXT_PUBLIC_MAX_RETRIES=3

# Retry delay (milliseconds)
NEXT_PUBLIC_RETRY_DELAY=2000                # 2 seconds
```

## Feature Flags

Control real data features via environment variables:

```bash
# Product data
NEXT_PUBLIC_REAL_PRODUCTS_ENABLED=true

# Tariff data
NEXT_PUBLIC_REAL_TARIFFS_ENABLED=true

# News data
NEXT_PUBLIC_REAL_NEWS_ENABLED=true
```

## Testing Configuration

For development and testing:

```bash
# .env.local (development)
NEXT_PUBLIC_USE_REAL_DATA=false             # Use mock data for faster dev
NEXT_PUBLIC_LOG_DATA_SOURCES=true           # Log which source is used
NEXT_PUBLIC_CACHE_DISABLED=true             # Disable caching for testing
```

For production:

```bash
# .env.production (production)
NEXT_PUBLIC_USE_REAL_DATA=true              # Use real data in production
NEXT_PUBLIC_LOG_DATA_SOURCES=false          # Don't log sources (performance)
NEXT_PUBLIC_CACHE_DISABLED=false            # Enable caching
```

## Per-Component Configuration

You can also control real data per component in code:

```typescript
// In your React components
import { getProductsByCategory } from '@/lib/productService';

// Force real data
const products = await getProductsByCategory('heaters', true);

// Force mock data
const mockProducts = await getProductsByCategory('heaters', false);

// Use environment variable (default)
const autoProducts = await getProductsByCategory('heaters');
```

## Monitoring

Add these for monitoring real data performance:

```bash
# Analytics
NEXT_PUBLIC_TRACK_DATA_SOURCES=true         # Track which sources are used
NEXT_PUBLIC_TRACK_CACHE_HITS=true           # Track cache hit rate
NEXT_PUBLIC_TRACK_FETCH_TIMES=true          # Track fetch performance

# Logging
NEXT_PUBLIC_LOG_FAILED_FETCHES=true         # Log when real data fails
NEXT_PUBLIC_LOG_CACHE_OPERATIONS=true       # Log cache hits/misses
```

## Quick Setup

### Minimal Setup (No API Keys)
Works out of the box with:
- RSS feeds (BBC, Guardian, Ofgem, Gov.UK)
- Public APIs (Octopus Energy, Ofgem data portal)
- Legal web scraping (PriceRunner, Which?, EST)

**No configuration needed!** Just deploy and it works.

### Full Setup (With Amazon API)
1. Sign up for Amazon Associates: https://affiliate-program.amazon.co.uk/
2. Get API credentials
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_AMAZON_ACCESS_KEY=your_key
   NEXT_PUBLIC_AMAZON_SECRET_KEY=your_secret
   NEXT_PUBLIC_AMAZON_PARTNER_TAG=your_tag
   ```
4. Restart dev server

### Disable Real Data (For Testing)
```bash
# .env.local
NEXT_PUBLIC_USE_REAL_DATA=false
```

All services will automatically use mock data as fallback.
