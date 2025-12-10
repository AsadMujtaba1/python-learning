/**
 * API Route: Get Smart Meter Analytics
 * GET /api/smart-meter/analytics
 * 
 * Returns complete analytics, estimates, and insights for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAnalytics, buildConsumptionRecords } from '@/lib/smartMeterService';

// Mock stores (replace with actual database)
const photoStore = new Map();
const valueStore = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth
    const userId = 'demo-user'; // In production, get from auth
    const postcode = 'SW1A 1AA'; // Get from user profile
    const householdSize = 3; // Get from user profile

    // Get user's photos
    const photos = Array.from(photoStore.values())
      .filter((photo: any) => photo.userId === userId);

    // Get all extracted values for user's photos
    const photoIds = photos.map((p: any) => p.id);
    const extractedValues = Array.from(valueStore.values())
      .filter((value: any) => photoIds.includes(value.photoId));

    // Build consumption records
    const records = await buildConsumptionRecords(userId, extractedValues);

    // If no data yet, return empty analytics
    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: null,
        estimate: null,
        insights: [],
        message: 'No data available yet. Upload photos to get started.',
      });
    }

    // Generate full analytics
    const { analytics, estimate, insights } = await generateAnalytics(
      userId,
      photos,
      records,
      postcode,
      householdSize
    );

    return NextResponse.json({
      success: true,
      analytics,
      estimate,
      insights,
    });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
