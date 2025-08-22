import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/utils/prisma';
import { authOptions } from '@/lib/utils/auth';

// PATCH /api/users/[id]/toggle-active - Toggle user active status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prevent deactivating the last managing director
    if (existingUser.role === 'managing_director' && existingUser.isActive) {
      const activeManagingDirectorCount = await prisma.user.count({
        where: { 
          role: 'managing_director',
          isActive: true
        },
      });
      
      if (activeManagingDirectorCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last active managing director' },
          { status: 400 }
        );
      }
    }
    
    // Toggle user active status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !existingUser.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error toggling user active status:', error);
    return NextResponse.json(
      { error: 'An error occurred while toggling user active status' },
      { status: 500 }
    );
  }
}