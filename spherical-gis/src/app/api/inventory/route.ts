import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { inventorySchema } from '@/lib/utils/validation';
import { authOptions } from '@/lib/utils/auth';

// GET /api/inventory - Get all inventory items
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all inventory items with product details
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: true,
      },
      orderBy: {
        product: {
          name: 'asc',
        },
      },
    });
    
    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching inventory items' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create a new inventory item
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
    const result = inventorySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { productId, quantity, location, minStockLevel } = result.data;
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if inventory item already exists for this product and location
    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        productId_location: {
          productId,
          location,
        },
      },
    });
    
    if (existingItem) {
      // Update existing inventory item
      const updatedItem = await prisma.inventoryItem.update({
        where: {
          productId_location: {
            productId,
            location,
          },
        },
        data: {
          quantity,
          minStockLevel,
          lastUpdated: new Date(),
        },
        include: {
          product: true,
        },
      });
      
      return NextResponse.json(updatedItem);
    }
    
    // Create new inventory item
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        productId,
        quantity,
        location,
        minStockLevel,
      },
      include: {
        product: true,
      },
    });
    
    return NextResponse.json(inventoryItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the inventory item' },
      { status: 500 }
    );
  }
}