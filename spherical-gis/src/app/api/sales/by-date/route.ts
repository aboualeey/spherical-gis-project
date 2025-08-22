import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// GET /api/sales/by-date?startDate=...&endDate=... - Get sales by date range
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }
    
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    
    // Add one day to end date to include the end date in the range
    endDate.setDate(endDate.getDate() + 1);
    
    // Get sales within date range
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales by date range:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching sales by date range' },
      { status: 500 }
    );
  }
}