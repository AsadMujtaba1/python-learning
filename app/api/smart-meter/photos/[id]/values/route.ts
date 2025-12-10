/**
 * API Route: Get Extracted Values for Photo
 * GET /api/smart-meter/photos/[id]/values
 * 
 * Returns all values extracted from a specific photo
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock store (replace with actual database)
const valueStore = new Map();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;

    // Get values for this photo
    const values = Array.from(valueStore.values())
      .filter((value: any) => value.photoId === photoId);

    return NextResponse.json({
      success: true,
      count: values.length,
      values,
    });
  } catch (error) {
    console.error('Get values error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch values' },
      { status: 500 }
    );
  }
}
