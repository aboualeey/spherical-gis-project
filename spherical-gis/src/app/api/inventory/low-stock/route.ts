import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// GET /api/inventory/low-stock - Get inventory items with quantity below min stock level
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get low stock inventory items
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minStockLevel,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        quantity: 'asc',
      },
    });
    
    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching low stock items' },
      { status: 500 }
    );
  }
}