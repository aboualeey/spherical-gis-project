import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// GET /api/sales/summary - Get sales summary for dashboard
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permission
    const userRole = session.user.role;
    const allowedRoles = ['managing_director', 'admin', 'report_viewer'];
    
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get total sales count
    const totalSales = await prisma.sale.count();
    
    // Get total revenue
    const revenueResult = await prisma.sale.aggregate({
      _sum: {
        finalAmount: true,
      },
    });
    const totalRevenue = revenueResult._sum.finalAmount || 0;
    
    // Calculate average sale value
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Get sales by category
    const salesByCategory = await prisma.$queryRaw`
      SELECT 
        p.category, 
        COUNT(DISTINCT s.id) as count, 
        SUM(si.quantity * si.unitPrice) as amount
      FROM 
        "Sale" s
        JOIN "SaleItem" si ON s.id = si."saleId"
        JOIN "Product" p ON si."productId" = p.id
      GROUP BY 
        p.category
      ORDER BY 
        amount DESC
    `;
    
    return NextResponse.json({
      totalSales,
      totalRevenue,
      averageSaleValue,
      salesByCategory,
    });
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching sales summary' },
      { status: 500 }
    );
  }
}