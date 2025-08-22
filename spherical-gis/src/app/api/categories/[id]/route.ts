import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// GET /api/categories/[id] - Get a category by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get category by ID
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the category' },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id] - Update a category
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    
    const { id } = params;
    const body = await request.json();
    
    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
    });
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Validate request body
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim() === '')) {
      return NextResponse.json(
        { error: 'Category name cannot be empty' },
        { status: 400 }
      );
    }
    
    // Check if name is being updated and already exists
    if (body.name && body.name !== existingCategory.name) {
      const categoryWithName = await prisma.productCategory.findFirst({
        where: {
          name: {
            equals: body.name,
            mode: 'insensitive',
          },
          id: {
            not: id,
          },
        },
      });
      
      if (categoryWithName) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update category
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
    });
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permission
    const userRole = session.user.role;
    const allowedRoles = ['managing_director', 'admin'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
    });
    
    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    // Check if category has associated products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });
    
    if (productsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      );
    }
    
    // Delete category
    await prisma.productCategory.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the category' },
      { status: 500 }
    );
  }
}