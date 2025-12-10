/**
 * REAL PRODUCTS API ROUTE
 * Server-side endpoint to fetch real product data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealProductData } from '@/lib/realProductDataService';
import { ProductCategory } from '@/lib/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ProductCategory || 'heaters';
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🔍 Fetching real products for category: ${category}`);
    
    const products = await getRealProductData(category, limit);
    
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Real products API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real products',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
