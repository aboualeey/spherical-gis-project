import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { prisma } from '@/lib/utils/prisma';
import { z } from 'zod';

const featuredProductSchema = z.object({
  productId: z.string().min(1),
  page: z.string().default('home'),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// GET /api/featured-products - Get featured products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    
    const featuredProducts = await prisma.featuredProduct.findMany({
      where: { page, isActive: true },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
            category: true
          }
        }
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}

// POST /api/featured-products - Create featured product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = featuredProductSchema.parse(body);

    const featuredProduct = await prisma.featuredProduct.create({
      data: validatedData,
      include: {
        product: true
      }
    });

    return NextResponse.json(featuredProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating featured product:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create featured product' },
      { status: 500 }
    );
  }
}

// PUT /api/featured-products - Update featured product
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const validatedData = featuredProductSchema.partial().parse(updateData);

    const featuredProduct = await prisma.featuredProduct.update({
      where: { id },
      data: validatedData,
      include: {
        product: true
      }
    });

    return NextResponse.json(featuredProduct);
  } catch (error) {
    console.error('Error updating featured product:', error);
    return NextResponse.json(
      { error: 'Failed to update featured product' },
      { status: 500 }
    );
  }
}

// DELETE /api/featured-products - Delete featured product
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.featuredProduct.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Featured product deleted successfully' });
  } catch (error) {
    console.error('Error deleting featured product:', error);
    return NextResponse.json(
      { error: 'Failed to delete featured product' },
      { status: 500 }
    );
  }
}