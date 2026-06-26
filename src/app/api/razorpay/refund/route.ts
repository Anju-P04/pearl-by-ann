import { NextRequest, NextResponse } from 'next/server';
import razorpay from '@/lib/razorpay/client';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, amount } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
    }

    const refundData: any = {};
    
    if (amount && amount > 0) {
      refundData.amount = amount * 100; // Convert rupees to paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: (refund.amount || 0) / 100, // Convert paise to rupees
      status: refund.status,
    });
  } catch (error: any) {
    console.error('Razorpay refund failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Refund failed',
        details: error?.error?.description || error?.message || 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}