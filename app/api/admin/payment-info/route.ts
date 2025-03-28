import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Get all UPI payment info entries
export async function GET() {
  try {
    const paymentInfoList = await prisma.paymentInfo.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      paymentInfoList
    });
  } catch (error) {
    console.error('Error fetching payment info list:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}

// Create new UPI payment info
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { upiId, merchantName } = body;
    
    if (!upiId || !merchantName) {
      return NextResponse.json(
        { success: false, message: 'UPI ID and Merchant Name are required' },
        { status: 400 }
      );
    }

    // Create new payment info
    const newPaymentInfo = await prisma.paymentInfo.create({
      data: {
        type: 'UPI',
        upiId,
        merchantName,
        isActive: true,
      }
    });

    // Set all other payment info as inactive
    await prisma.paymentInfo.updateMany({
      where: {
        id: {
          not: newPaymentInfo.id
        },
        type: 'UPI'
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({
      success: true,
      paymentInfo: newPaymentInfo,
      message: 'UPI payment information created successfully'
    });
  } catch (error) {
    console.error('Error creating payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment information' },
      { status: 500 }
    );
  }
}

// Update existing UPI payment info
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, upiId, merchantName, isActive } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Payment info ID is required' },
        { status: 400 }
      );
    }

    // Check if the payment info exists
    const existingPaymentInfo = await prisma.paymentInfo.findUnique({
      where: { id }
    });

    if (!existingPaymentInfo) {
      return NextResponse.json(
        { success: false, message: 'Payment information not found' },
        { status: 404 }
      );
    }

    // Update the payment info
    const updatedPaymentInfo = await prisma.paymentInfo.update({
      where: { id },
      data: {
        upiId: upiId || existingPaymentInfo.upiId,
        merchantName: merchantName || existingPaymentInfo.merchantName,
        isActive: isActive ?? existingPaymentInfo.isActive,
        updatedAt: new Date()
      }
    });

    // If this payment info is now active, deactivate all others
    if (updatedPaymentInfo.isActive) {
      await prisma.paymentInfo.updateMany({
        where: {
          id: {
            not: updatedPaymentInfo.id
          },
          type: 'UPI'
        },
        data: {
          isActive: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      paymentInfo: updatedPaymentInfo,
      message: 'Payment information updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment info:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update payment information' },
      { status: 500 }
    );
  }
} 