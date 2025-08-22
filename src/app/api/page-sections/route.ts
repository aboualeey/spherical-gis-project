import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { prisma } from '@/lib/utils/prisma';
import { z } from 'zod';

const pageSectionSchema = z.object({
  page: z.string().min(1),
  section: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(), // JSON content
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
});

// GET /api/page-sections - Get page sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');
    
    const whereClause: { page?: string; section?: string } = {};
    if (page) whereClause.page = page;
    if (section) whereClause.section = section;
    
    const pageSections = await prisma.pageSection.findMany({
      where: whereClause,
      orderBy: [{ page: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(pageSections);
  } catch (error) {
    console.error('Error fetching page sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page sections' },
      { status: 500 }
    );
  }
}

// POST /api/page-sections - Create page section
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = pageSectionSchema.parse(body);

    const pageSection = await prisma.pageSection.create({
      data: validatedData
    });

    return NextResponse.json(pageSection, { status: 201 });
  } catch (error) {
    console.error('Error creating page section:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create page section' },
      { status: 500 }
    );
  }
}

// PUT /api/page-sections - Update page section
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

    const validatedData = pageSectionSchema.partial().parse(updateData);

    const pageSection = await prisma.pageSection.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(pageSection);
  } catch (error) {
    console.error('Error updating page section:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update page section' },
      { status: 500 }
    );
  }
}

// DELETE /api/page-sections - Delete page section
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

    await prisma.pageSection.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Page section deleted successfully' });
  } catch (error) {
    console.error('Error deleting page section:', error);
    return NextResponse.json(
      { error: 'Failed to delete page section' },
      { status: 500 }
    );
  }
}