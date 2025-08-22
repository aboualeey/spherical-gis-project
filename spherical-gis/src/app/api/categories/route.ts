import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// GET /api/categories - Get all product categories
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all categories
    const categories = await prisma.productCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new product category
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permission
    const userRole = session.user.role;
    const allowedRoles = ['managing_director', 'admin', 'inventory_manager'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate request body
    if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Check if category with the same name already exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: 'insensitive',
        },
      },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create category
    const category = await prisma.productCategory.create({
      data: {
        name: body.name,
        description: body.description || null,
      },
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the category' },
      { status: 500 }
    );
  }
}