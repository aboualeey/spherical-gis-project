import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { prisma } from '@/lib/utils/prisma';
import { z } from 'zod';

const carouselItemSchema = z.object({
  title: z.string().min(1),
  caption: z.string().optional(),
  page: z.string().min(1),
  order: z.number().int().min(0),
  isActive: z.boolean().default(true),
  mediaId: z.string().optional(),
  externalUrl: z.string().optional(),
  type: z.enum(['image', 'video']).default('image'),
});

// GET /api/carousel - Get carousel items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    const whereClause = page ? { page, isActive: true } : { isActive: true };
    
    const carouselItems = await prisma.carouselItem.findMany({
      where: whereClause,
      include: {
        media: true
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    // Transform for frontend compatibility
    const transformedItems = carouselItems.map(item => ({
      id: item.id,
      title: item.title,
      caption: item.caption,
      src: item.media?.url || item.externalUrl || '',
      alt: item.media?.alt || item.title,
      type: item.type,
      order: item.order,
      isActive: item.isActive,
      page: item.page
    }));
    
    return NextResponse.json(transformedItems);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel items' },
      { status: 500 }
    );
  }
}

// POST /api/carousel - Create carousel item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = carouselItemSchema.parse(body);

    const carouselItem = await prisma.carouselItem.create({
      data: validatedData,
      include: {
        media: true
      }
    });

    return NextResponse.json(carouselItem, { status: 201 });
  } catch (error) {
    console.error('Error creating carousel item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid carousel item data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create carousel item' },
      { status: 500 }
    );
  }
}