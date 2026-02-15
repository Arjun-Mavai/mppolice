import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '@/db';
import { payments, mppscUsers, pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { checkRateLimit } from '@/lib/rate-limit';
import { PRICING_DEFAULTS } from '@/config/pricing';

/**
 * Payment Verification API FOR UPGRADES 🚀
 *
 * Specialized route for existing users upgrading to Pro.
 * - Verifies payment
 * - Updates plan to Pro
 * - Sends RECEIPT email (No magic link/password setup)
 */
export async function POST(req: Request) {
  try {
    // 🛑 Rate Limit
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { paymentLimiter } = await import('@/lib/rate-limit');
    const { success } = await checkRateLimit(paymentLimiter, ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret not configured');

    // 🔒 Signature Verification
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 🔄 Idempotency Check
    const existingPayment = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.paymentId, razorpay_payment_id))
      .limit(1);
    if (existingPayment.length > 0) {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    // 👤 Verify User
    const user = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId),
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // 🕵️ Razorpay Cross-Check
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: secret,
    });
    const order = await instance.orders.fetch(razorpay_order_id);
    const paidAmount = order.amount as number;

    // 🏷️ Plan Verification (Allows Upgrade Price OR Full Pro Price)
    const pricingRows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.id, 'default'))
      .limit(1);
    const p = pricingRows[0] || PRICING_DEFAULTS;

    // We expect user to pay at least upgrade price
    const upgradeAmountPaise = (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100;
    const proAmountPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;

    const isValidAmount = paidAmount >= upgradeAmountPaise || paidAmount >= proAmountPaise;

    // If they paid standard Lite price (unlikely in this route, but safety check), don't upgrade to Pro
    const liteAmountPaise = (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100;

    let planTier = user.planTier || 'lite';
    if (isValidAmount && paidAmount > liteAmountPaise) {
      planTier = 'pro';
    }

    // 💾 Persist Payment & Update User
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        id: `pay_${uuidv4()}`,
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: paidAmount,
        planTier: planTier as 'lite' | 'pro',
        status: 'captured',
        currency: 'INR',
      });

      await tx
        .update(mppscUsers)
        .set({ planTier: planTier as 'lite' | 'pro' })
        .where(eq(mppscUsers.id, userId));
    });

    // 📧 Send Receipt Email
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromName = process.env.EMAIL_FROM_NAME || 'MPPSC 2026';
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';
    const fromEmail = `${fromName} <${fromAddress}>`;

    await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: '🚀 Upgrade Successful — MPPSC ZEN',
      html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #111;">Upgrade Successful!</h1>
                <p>Hi ${user.name},</p>
                <p>You have successfully upgraded your plan to <strong>Pro</strong>.</p>
                <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px;">Transaction ID</p>
                    <p style="margin: 4px 0 0; font-family: monospace; font-size: 16px;">${razorpay_payment_id}</p>
                </div>
                <p>All Pro features are now unlocked for your account.</p>
                <p>Keep practicing!</p>
                <hr style="border: none; border-top: 1px solid #eaeaea; margin: 40px 0;" />
                <p style="color: #888; font-size: 12px;">Mindful MPPSC Zen App</p>
            </div>
        `,
    });

    // ── Log Activity ──────────────────────────────────────────────
    try {
      const { logUserActivity } = await import('@/app/actions/user-activity');
      await logUserActivity({
        userId,
        userEmail: user.email,
        userName: user.name,
        adminId: 'system',
        action: 'PLAN_CHANGE',
        details: {
          plan: 'pro',
          amount: paidAmount / 100,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          reason: 'Upgrade Payment',
          isUpgrade: true,
        },
      });
    } catch (err) {
      console.error('Failed to log upgrade activity:', err);
    }

    return NextResponse.json({ success: true, planTier });
  } catch (error) {
    console.error('Upgrade verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
