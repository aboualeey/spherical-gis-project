import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { productSchema } from '@/lib/utils/validation';
import { authOptions } from '@/lib/utils/auth';

// GET /api/products/[id] - Get a product by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Get product by ID
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - Update a product
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
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Validate request body
    const result = productSchema.partial().safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Check if SKU is being updated and already exists
    if (body.sku && body.sku !== existingProduct.sku) {
      const productWithSku = await prisma.product.findUnique({
        where: { sku: body.sku },
      });
      
      if (productWithSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: result.data,
      include: {
        category: true,
      },
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
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
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Check if product has associated inventory or sales
    const inventoryCount = await prisma.inventoryItem.count({
      where: { productId: id },
    });
    
    const salesItemCount = await prisma.saleItem.count({
      where: { productId: id },
    });
    
    if (inventoryCount > 0 || salesItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with associated inventory or sales' },
        { status: 400 }
      );
    }
    
    // Delete product
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the product' },
      { status: 500 }
    );
  }
}