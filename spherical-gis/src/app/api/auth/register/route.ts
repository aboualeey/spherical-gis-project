import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/utils/prisma';
import { registerSchema } from '@/lib/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create user with default role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'REPORT_VIEWER', // Default role for public registrations
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'An error occurred while registering the user' },
      { status: 500 }
    );
  }
}