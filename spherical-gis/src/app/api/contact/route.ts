import { NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/prisma';
import { contactSchema } from '@/lib/utils/validation';

// POST /api/contact - Submit a contact form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = contactSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, phone, message } = result.data;
    
    // Create contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });
    
    // In a real application, you would also send an email notification here
    
    return NextResponse.json(
      { success: true, message: 'Contact request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the contact form' },
      { status: 500 }
    );
  }
}