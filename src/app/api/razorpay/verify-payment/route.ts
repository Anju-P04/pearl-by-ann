import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Missing required parameters'
      }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    
    // Create the signature using Razorpay's method: order_id + "|" + payment_id
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    // Verify the signature
    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid payment signature'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Verification failed'
    }, { status: 500 });
  }
}