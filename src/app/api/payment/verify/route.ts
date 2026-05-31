import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '@/db';
import { payments, verificationTokens, mppscUsers, pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import EmailTemplate from '@/components/email-template';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { checkRateLimit } from '@/lib/rate-limit';
import { appPath } from '@/lib/app-url';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { notifyAdminOnPayment, notifyAdminOnEmailFailure, notifyAdminOnVerificationFailure } from '@/lib/admin-notify';

import { fulfillOrder } from '@/services/payment-service';

// ... (existing imports, ensuring fulfillOrder and mppscUsers are present)

export async function POST(req: Request) {
  let requestUserId: string | undefined;
  let requestOrderId: string | undefined;
  let requestPaymentId: string | undefined;
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { paymentLimiter } = await import('@/lib/rate-limit');
    const { success } = await checkRateLimit(paymentLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;
    requestUserId = userId;
    requestOrderId = razorpay_order_id;
    requestPaymentId = razorpay_payment_id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret not configured');

    // 1. Signature Verification
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    const isValidHex = /^[a-f0-9]+$/i.test(razorpay_signature);
    if (!isValidHex || razorpay_signature.length !== generated_signature.length) {
      return NextResponse.json({ error: 'Invalid signature format' }, { status: 400 });
    }

    if (!crypto.timingSafeEqual(Buffer.from(generated_signature, 'hex'), Buffer.from(razorpay_signature, 'hex'))) {
      notifyAdminOnVerificationFailure({ userId, orderId: razorpay_order_id, paymentId: razorpay_payment_id, error: 'Invalid Signature' });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 2. Idempotency Check
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.orderId, razorpay_order_id),
    });
    if (existingPayment) {
      return NextResponse.json({ success: true, message: 'Already verified' });
    }

    // 3. Razorpay Cross-Check
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });
    const order = await instance.orders.fetch(razorpay_order_id);
    
    // Ownership check
    if (order.notes?.userId && order.notes.userId !== userId) {
      return NextResponse.json({ error: 'Order ownership mismatch' }, { status: 403 });
    }

    // 4. Fulfill Order via Service
    const user = await db.query.mppscUsers.findFirst({ where: eq(mppscUsers.id, userId) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isUpgrade = user.isSubscribed && (order.notes?.planType === 'upgrade');
    const examType = (order.notes?.examType as any) || 'mppolice';

    const result = await fulfillOrder({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amountInPaise: Number(order.amount),
      examType,
      isUpgrade: !!isUpgrade,
    });

    return NextResponse.json({ success: true, planTier: result.planTier });
  } catch (error) {
    logger.error('API Verification error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
