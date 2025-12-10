/**
 * API Route: Get Smart Meter Photos
 * GET /api/smart-meter/photos
 * 
 * Returns all photos for the current user
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock data store (replace with actual database)
const photoStore = new Map();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/auth
    const userId = 'demo-user'; // In production, get from auth

    // Get all photos for user
    const userPhotos = Array.from(photoStore.values())
      .filter((photo: any) => photo.userId === userId)
      .sort((a: any, b: any) => b.uploadTimestamp.getTime() - a.uploadTimestamp.getTime());

    return NextResponse.json({
      success: true,
      count: userPhotos.length,
      photos: userPhotos,
    });
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
