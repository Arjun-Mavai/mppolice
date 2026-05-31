import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fulfillOrder } from '@/services/payment-service';

/**
 * ⚓ Razorpay Webhook Handler
 * 
 * Bhai, ye 'Safety Net' h. Agar user pay karke browser tab band kar de
 * ya internet chala jaye, to Razorpay humare server ko directly 'ping' karta h.
 * 
 * Hum 'payment.captured' event sunte h aur fulfillment process trigger karte h.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('RAZORPAY_WEBHOOK_SECRET is missing');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('Invalid Razorpay Webhook Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    logger.info(`Razorpay Webhook: ${event.event}`, { category: 'payment' });

    // 2. Handle 'payment.captured'
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const userId = payment.notes?.userId;
      const amountInPaise = payment.amount;
      const examType = payment.notes?.examType || 'mppolice';

      if (!userId || !orderId) {
        logger.error('Webhook missing critical notes', { metadata: { paymentId, userId, orderId } });
        return NextResponse.json({ error: 'Missing notes' }, { status: 400 });
      }

      // Idempotency Check
      const existing = await db.query.payments.findFirst({
        where: eq(payments.paymentId, paymentId),
      });

      if (existing) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Fulfill Order
      await fulfillOrder({
        userId,
        orderId,
        paymentId,
        signature: 'webhook_verified', // We don't have the client-side sig here, but we verified the webhook
        amountInPaise,
        examType,
        isUpgrade: payment.notes?.planType === 'upgrade',
      });

      logger.info(`Webhook fulfilled order: ${orderId} for user ${userId}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Razorpay Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
