import { NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { quoteSchema } from '@/lib/utils/validation';

// POST /api/quote - Submit a quote request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = quoteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { 
      name, 
      email, 
      phone, 
      company, 
      serviceType, 
      otherServiceType, 
      projectDescription, 
      budget, 
      timeframe, 
      additionalInfo 
    } = result.data;
    
    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone,
        company,
        serviceType,
        otherServiceType,
        projectDescription,
        budget,
        timeframe,
        additionalInfo,
      },
    });
    
    // In a real application, you would also send an email notification here
    
    return NextResponse.json(
      { success: true, message: 'Quote request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting quote request:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the quote request' },
      { status: 500 }
    );
  }
}