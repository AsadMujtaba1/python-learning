/**
 * API Route: Delete Photo
 * DELETE /api/smart-meter/photos/[id]
 * 
 * Deletes photo but optionally keeps extracted data
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock store (replace with actual database)
const photoStore = new Map();
const valueStore = new Map();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params;
    const url = new URL(request.url);
    const deleteValues = url.searchParams.get('deleteValues') === 'true';

    // Get photo
    const photo = photoStore.get(photoId);
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Delete photo
    photoStore.delete(photoId);

    // Optionally delete associated values
    if (deleteValues) {
      const values = Array.from(valueStore.entries())
        .filter(([_, value]: [string, any]) => value.photoId === photoId);
      
      values.forEach(([id]) => valueStore.delete(id));

      return NextResponse.json({
        success: true,
        message: 'Photo and values deleted',
        deletedValues: values.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted (values preserved)',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}
