import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { saleSchema } from '@/lib/utils/validation';
import { authOptions } from '@/lib/utils/auth';

// GET /api/sales - Get all sales
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all sales with items
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching sales' },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permission
    const userRole = session.user.role;
    const allowedRoles = ['managing_director', 'admin', 'cashier'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const result = saleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { customerId, customerName, customerEmail, customerPhone, items, paymentMethod, discount, tax } = result.data;
    
    // Calculate totals
    const subtotal = items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * tax) / 100;
    const finalAmount = afterDiscount + taxAmount;
    
    // Start a transaction
    const sale = await prisma.$transaction(async (prisma) => {
      // Create the sale
      const newSale = await prisma.sale.create({
        data: {
          customerId,
          customerName,
          customerEmail,
          customerPhone,
          totalAmount: subtotal,
          discount,
          tax,
          finalAmount,
          paymentMethod,
          createdById: session.user.id,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      // Update inventory for each item
      for (const item of items) {
        // Find inventory item for this product
        const inventoryItem = await prisma.inventoryItem.findFirst({
          where: {
            productId: item.productId,
          },
        });
        
        if (inventoryItem) {
          // Update inventory quantity
          await prisma.inventoryItem.update({
            where: {
              id: inventoryItem.id,
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
              lastUpdated: new Date(),
            },
          });
        }
      }
      
      return newSale;
    });
    
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the sale' },
      { status: 500 }
    );
  }
}