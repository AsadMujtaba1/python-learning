/**
 * Sentry Server Configuration
 * 
 * Captures server-side errors, API failures, and performance metrics.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Server-side tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture all errors
  sampleRate: 1.0,
  
  environment: process.env.NODE_ENV,
  
  release: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const env = event.contexts.runtime.env as Record<string, any>;
      Object.keys(env).forEach(key => {
        if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN')) {
          env[key] = '[REDACTED]';
        }
      });
    }
    
    return event;
  },
});
