/**
 * API Route: Upload Smart Meter Photos
 * POST /api/smart-meter/upload
 * 
 * Handles photo upload, storage, and triggers AI extraction
 */

import { NextRequest, NextResponse } from 'next/server';
import { processSmartMeterPhoto } from '@/lib/smartMeterService';

// This would use your actual database/storage
// For now, using in-memory storage as example
const photoStore = new Map();
const valueStore = new Map();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photos = formData.getAll('photos') as File[];

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      );
    }

    // Get user ID from session/auth (placeholder)
    const userId = 'demo-user'; // In production, get from auth
    const userPostcode = 'SW1A 1AA'; // In production, get from user profile

    const results = [];

    for (const file of photos) {
      // Generate unique ID
      const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      // Convert file to data URL (in production, upload to Firebase/S3)
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // Process photo
      const result = await processSmartMeterPhoto(
        photoId,
        userId,
        dataUrl,
        new Date(),
        userPostcode
      );

      // Store photo and values
      photoStore.set(photoId, result.photo);
      result.extractedValues.forEach(value => {
        valueStore.set(value.id, value);
      });

      results.push({
        photoId,
        success: true,
        extractedValues: result.extractedValues.length,
        warnings: result.warnings,
      });
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      results,
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Note: bodyParser config is no longer needed in Next.js App Router
// The route handles file uploads directly via FormData
