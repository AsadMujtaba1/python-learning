/**
 * API Route: Confirm Photo Extraction
 * POST /api/smart-meter/photos/[id]/confirm
 * 
 * User confirms or rejects extracted values
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock stores (replace with actual database)
const photoStore = new Map();
const valueStore = new Map();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;
    const body = await request.json();
    const { confirmed, editedValues } = body;

    // Get photo
    const photo = photoStore.get(photoId);
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Update photo
    photo.userConfirmed = confirmed;
    photo.confirmationTimestamp = new Date();
    
    if (!confirmed) {
      photo.extractionStatus = 'rejected';
    }

    photoStore.set(photoId, photo);

    // If user edited values, update them
    if (editedValues && Array.isArray(editedValues)) {
      photo.userEditedValues = true;
      editedValues.forEach((editedValue: any) => {
        const existing = valueStore.get(editedValue.id);
        if (existing) {
          existing.value = editedValue.value;
          existing.validated = true;
          existing.updatedAt = new Date();
          valueStore.set(editedValue.id, existing);
        }
      });
    }

    return NextResponse.json({
      success: true,
      confirmed,
      message: confirmed ? 'Values confirmed' : 'Values rejected',
    });
  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Confirmation failed' },
      { status: 500 }
    );
  }
}
