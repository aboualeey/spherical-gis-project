import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { prisma } from '@/lib/utils/prisma';
import { z } from 'zod';

const trainingProgramSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  duration: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  price: z.number().min(0),
  currency: z.string().default('USD'),
  features: z.string(), // JSON array
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  maxStudents: z.number().int().min(1).optional(),
});

// GET /api/training-programs - Get training programs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    const whereClause = activeOnly ? { isActive: true } : {};
    
    const trainingPrograms = await prisma.trainingProgram.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });
    
    return NextResponse.json(trainingPrograms);
  } catch (error) {
    console.error('Error fetching training programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training programs' },
      { status: 500 }
    );
  }
}

// POST /api/training-programs - Create training program
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = trainingProgramSchema.parse(body);

    const trainingProgram = await prisma.trainingProgram.create({
      data: validatedData
    });

    return NextResponse.json(trainingProgram, { status: 201 });
  } catch (error) {
    console.error('Error creating training program:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create training program' },
      { status: 500 }
    );
  }
}

// PUT /api/training-programs - Update training program
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

    const validatedData = trainingProgramSchema.partial().parse(updateData);

    const trainingProgram = await prisma.trainingProgram.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(trainingProgram);
  } catch (error) {
    console.error('Error updating training program:', error);
    return NextResponse.json(
      { error: 'Failed to update training program' },
      { status: 500 }
    );
  }
}

// DELETE /api/training-programs - Delete training program
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

    await prisma.trainingProgram.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Training program deleted successfully' });
  } catch (error) {
    console.error('Error deleting training program:', error);
    return NextResponse.json(
      { error: 'Failed to delete training program' },
      { status: 500 }
    );
  }
}