/**
 * REAL NEWS API ROUTE
 * Server-side endpoint to fetch real news data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealNewsData } from '@/lib/realNewsDataService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real news from RSS feeds...');
    
    const articles = await getRealNewsData();
    
    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error('Real news API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real news',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
