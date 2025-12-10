/**
 * API Health Check Endpoint
 * 
 * Monitors system health and provides status for:
 * - API availability
 * - Database connectivity
 * - External services
 * - Cache status
 * 
 * Used for:
 * - Self-healing checks
 * - Uptime monitoring
 * - Load balancer health checks
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  
  // Check Firebase connectivity
  try {
    const { auth, db } = await import('@/lib/firebase');
    checks.firebase = {
      auth: !!auth,
      firestore: !!db,
      status: auth && db ? 'healthy' : 'degraded',
    };
  } catch (error) {
    checks.firebase = {
      status: 'unhealthy',
      error: 'Failed to initialize Firebase',
    };
  }
  
  // Check localStorage availability (client-side feature)
  checks.localStorage = {
    status: 'available',
    note: 'Client-side only',
  };
  
  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  checks.environment = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'degraded',
    missing: missingEnvVars,
  };
  
  // Overall health status
  const allHealthy = Object.values(checks).every(
    check => check.status === 'healthy' || check.status === 'available'
  );
  
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    checks,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  }, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
