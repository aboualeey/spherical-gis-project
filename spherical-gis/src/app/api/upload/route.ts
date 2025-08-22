import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { prisma } from '@/lib/utils/prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';
    const alt = formData.get('alt') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, MP4, and WebM are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${category}-${timestamp}.${extension}`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', category);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Save to database
    const publicUrl = `/uploads/${category}/${filename}`;
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        alt: alt || file.name,
        category,
        uploadedBy: session.user.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      id: mediaFile.id,
      url: publicUrl,
      filename: filename,
      category: category
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Get media files
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const whereClause = category ? { category, isActive: true } : { isActive: true };
    
    const mediaFiles = await prisma.mediaFile.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}