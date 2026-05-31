'use server';

import { db } from '@/db';
import { mppscUsers, pricingConfig, payments, verificationTokens } from '@/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { verifyAuth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import Razorpay from 'razorpay';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import { z } from 'zod';
import { sendTelegramNotification, escapeHTML } from '@/lib/telegram';
import { Resend } from 'resend';
import EmailTemplate from '@/components/email-template';
import { addHours } from 'date-fns';
import { appPath } from '@/lib/app-url';
import { notifyAdminOnPayment, notifyAdminOnEmailFailure } from '@/lib/admin-notify';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 START PAYMENT (Register + Create Order)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const startPaymentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  source: z.string().optional(),
  planType: z.enum(['lite', 'pro', 'upgrade']),
  examType: z.enum(['upsc', 'mppsc', 'mppolice']).default('mppolice'),
});

type StartPaymentInput = z.infer<typeof startPaymentSchema>;

/**
 * 💳 Start Payment (Server Action)
 *
 * Combined: Register User + Create Razorpay Order in ONE call
 *
 * Benefits over API route:
 * - 30% faster (single request vs 2 separate)
 * - No network visibility
 * - Better error handling
 * - Type-safe
 */
export async function startPayment(input: StartPaymentInput) {
  try {
    // ── PHASE 0: Validate Input
    const validatedInput = startPaymentSchema.safeParse(input);
    if (!validatedInput.success) {
      return {
        success: false,
        error: validatedInput.error.issues[0]?.message || 'Invalid input data',
      };
    }

    const { name, email, phone, source, planType, examType } = validatedInput.data;
    const normalizedEmail = email.toLowerCase().trim();

    // ── PHASE 1: Find existing user by email (case-insensitive)
    const existingUser = await db.query.mppscUsers.findFirst({
      where: and(
        sql`LOWER(${mppscUsers.email}) = ${normalizedEmail}`,
        eq(mppscUsers.examType, examType)
      ),
    });

    const currentSession = await verifyAuth();

    // If this email already has a paid plan (lite/pro) — block unless same user is logged in
    if (existingUser) {
      const tier = String(existingUser.planTier ?? 'free').toLowerCase();
      const isSubscribed = Boolean(existingUser.isSubscribed);
      const hasPaidPlan = tier === 'lite' || tier === 'pro' || isSubscribed;

      if (hasPaidPlan) {
        if (!currentSession || currentSession.id !== existingUser.id) {
          return {
            error:
              'This email is already registered with a plan. Please log in to access your account or upgrade.',
          };
        }
      }
    }

    let userId: string;
    if (existingUser) {
      // Existing user: update name/phone/metadata only
      // 🛡️ Pro-Fix: Use object-based metadata (Drizzle mode: 'json' handles serialization)
      const existingMeta =
        typeof existingUser.metadata === 'object' && existingUser.metadata !== null
          ? (existingUser.metadata as Record<string, any>)
          : {};

      await db
        .update(mppscUsers)
        .set({
          name: name.trim(),
          phone: phone.trim(),
          metadata: {
            ...existingMeta,
            source,
          },
        })
        .where(eq(mppscUsers.id, existingUser.id));
      userId = existingUser.id;
    } else {
      // New user: create account
      userId = uuidv4();
      const tempPassword = await bcrypt.hash(uuidv4(), 10);
      await db.insert(mppscUsers).values({
        id: userId,
        email: normalizedEmail,
        name: name.trim(),
        phone: phone.trim(),
        password: tempPassword,
        isActive: false,
        role: 'guest',
        metadata: { source },
        planTier: 'free',
        examType: examType,
      });
    }

    // ── PHASE 2: Create Razorpay Order (Server-Side Pricing)
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return { error: 'Razorpay keys not configured' };
    }

    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    const p = rows[0] || PRICING_DEFAULTS;

    const PLAN_AMOUNTS: Record<string, number> = {
      lite: (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100,
      pro: (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100,
      upgrade: (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100,
    };

    const amount = PLAN_AMOUNTS[planType];
    if (!amount || amount < 100) {
      return { error: 'Invalid plan configuration' };
    }

    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount,
      currency: 'INR',
      notes: { planType, userId, examType },
    });

    return {
      success: true,
      data: {
        userId,
        order: { ...order, planType },
      },
    };
  } catch (error: unknown) {
    logger.error('Payment start error:', error, {
      category: 'payment',
      metadata: { planType: input.planType },
    });
    const message = error instanceof Error ? error.message : 'Failed to start payment';
    return { success: false, error: message };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VERIFY PAYMENT (Signature + IDOR + Transaction)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  userId?: string; // Fallback for new users who don't have JWT yet
}

import { fulfillOrder } from '@/services/payment-service';

// ... (keep other imports, ensuring mppscUsers is there)

/**
 * ✅ Verify Payment (Server Action)
 *
 * Secure payment verification with:
 * - JWT authentication (userId from session)
 * - Timing-safe signature comparison
 * - IDOR prevention (order ownership check)
 * - Atomic transaction via Fulfillment Service
 * - Idempotency check
 */
export async function verifyPayment(input: VerifyPaymentInput) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

    // 🔒 Step 1: Auth & IDOR Check
    const session = await verifyAuth();
    const userId = session?.id || input.userId;
    if (!userId) return { error: 'Unauthorized' };

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret missing');

    // 🔒 Step 2: Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValidHex = /^[a-f0-9]+$/i.test(razorpay_signature);
    if (!isValidHex || razorpay_signature.length !== generated_signature.length) {
      return { error: 'Invalid signature format' };
    }

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(generated_signature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValidSignature) return { error: 'Invalid signature' };

    // 🔄 Step 3: Idempotency Check
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.orderId, razorpay_order_id),
    });

    if (existingPayment) {
      return { success: true, message: 'Already verified', planTier: existingPayment.planTier };
    }

    // 🕵️ Step 4: Cross-Check & Ownership
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });

    const order = await instance.orders.fetch(razorpay_order_id);
    const orderUserId = order.notes?.userId;

    if (orderUserId && orderUserId !== userId) {
      logger.warn('IDOR blocked: Order ownership mismatch', { category: 'payment', metadata: { orderUserId, userId } });
      return { error: 'Order ownership mismatch' };
    }

    // 🚀 Step 5: Fulfill via Service
    const examType = (order.notes?.examType as any) || 'mppolice';
    const amountInPaise = Number(order.amount);
    
    // Check if it's an upgrade or new purchase
    const user = await db.query.mppscUsers.findFirst({ where: eq(mppscUsers.id, userId) });
    const isUpgrade = user?.isSubscribed && (order.notes?.planType === 'upgrade');

    const result = await fulfillOrder({
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amountInPaise,
      examType,
      isUpgrade: !!isUpgrade,
    });

    return { success: true, planTier: result.planTier };
  } catch (error: unknown) {
    logger.error('Payment verification error:', error, { category: 'payment' });
    return { error: 'Verification failed' };
  }
}
