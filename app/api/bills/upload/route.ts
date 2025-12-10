import { NextRequest, NextResponse } from 'next/server';

/**
 * Bill Upload API
 * Handles file upload to Firebase Storage
 * 
 * POST /api/bills/upload
 * Body: multipart/form-data with 'file' field
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and images are allowed.' },
        { status: 400 }
      );
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }
    
    // Get user ID from session (for now, use a placeholder)
    // TODO: Replace with actual user authentication
    const userId = 'anonymous-user';
    
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${userId}/${timestamp}-${sanitizedFilename}`;
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // For MVP, we'll use a mock storage URL
    // TODO: Implement actual Firebase Storage upload
    const fileUrl = `/uploads/${fileName}`;
    
    // In production, use Firebase Storage:
    /*
    import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    const storage = getStorage();
    const storageRef = ref(storage, `bills/${fileName}`);
    await uploadBytes(storageRef, buffer, { contentType: file.type });
    const fileUrl = await getDownloadURL(storageRef);
    */
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    
  } catch (error) {
    console.error('Bill upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
