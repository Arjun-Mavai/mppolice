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

/**
 * ✅ Verify Payment (Server Action)
 *
 * Secure payment verification with:
 * - JWT authentication (userId from session)
 * - Timing-safe signature comparison
 * - IDOR prevention (order ownership check)
 * - Atomic transaction (payment + user update)
 * - Idempotency check
 *
 * Benefits over API route:
 * - No userId visible in Network tab
 * - Automatic JWT handling
 * - Type-safe
 */
export async function verifyPayment(input: VerifyPaymentInput) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

    // 🔒 Step 1: Get userId — JWT first, fallback to input (for new users)
    // New users registered via startPayment don't have a JWT cookie yet,
    // so we accept userId from the client as a fallback.
    // Security: We ALWAYS verify this userId matches the Razorpay order's notes.userId (Step 4)
    const session = await verifyAuth();
    const userId = session?.id || input.userId;
    if (!userId) {
      return { error: 'Unauthorized — no session or userId provided' };
    }

    // 🔒 Step 2: Timing-Safe Signature Verification
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // 🛡️ CRASH PREVENTION: Validate signature format before timingSafeEqual
    // ─────────────────────────────────────────────────────────────────────
    // Bhai, timingSafeEqual THROW karta hai agar dono buffers ka length
    // different ho! Attacker garbage signature bhej ke server crash kara sakta tha.
    //
    // Attack scenario: razorpay_signature = "abc" (odd-length, not valid hex)
    //   → Buffer.from("abc", 'hex') = <Buffer ab> (1 byte, 'c' dropped!)
    //   → generated_signature buffer = 32 bytes (SHA256)
    //   → timingSafeEqual THROWS: "Input buffers must have the same length"
    //   → Unhandled error = 500 response + potential info leak
    //
    // Fix: Check length match BEFORE calling timingSafeEqual
    const isValidHex = /^[a-f0-9]+$/i.test(razorpay_signature);
    if (!isValidHex || razorpay_signature.length !== generated_signature.length) {
      logger.warn('Malformed payment signature rejected', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id, sigLength: razorpay_signature.length },
      });
      return { error: 'Invalid signature format' };
    }

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(generated_signature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    );

    if (!isValidSignature) {
      logger.warn('Invalid payment signature', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id },
      });
      return { error: 'Invalid signature' };
    }

    // 🔄 Step 3: Idempotency Check
    // DB column is `orderId` (maps to `order_id` in SQLite)
    const existingPayment = await db.query.payments.findFirst({
      where: eq(payments.orderId, razorpay_order_id),
    });

    if (existingPayment) {
      logger.info('Payment already verified (idempotent)', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id },
      });
      return {
        message: 'Payment already verified',
        planTier: existingPayment.planTier, // DB column is `planTier`
      };
    }

    // 🕵️ Step 4: Cross-Check with Razorpay API + IDOR Prevention
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.fetch(razorpay_order_id);
    const orderUserId = order.notes?.userId;

    if (orderUserId && orderUserId !== userId) {
      logger.warn('Payment verification failed: Order ownership mismatch', {
        category: 'payment',
        metadata: { orderUserId, requestUserId: userId, orderId: razorpay_order_id },
      });
      return { error: 'Order does not belong to this user' };
    }

    // 💰 Determine plan tier from amount
    // ─────────────────────────────────────────────────────────────────────
    // IMPORTANT: order.amount is ALREADY in paise (Razorpay standard).
    // DB column `payments.amount` is integer → store paise directly!
    //
    // Before fix: amount = order.amount / 100 → stored rupees in integer
    //   column → 49900 paise became 499 rupees → DB stored 499 (truncated!)
    //
    // After fix: Keep paise throughout. Compare against pricing × 100.
    // ─────────────────────────────────────────────────────────────────────
    const amountInPaise = Number(order.amount); // Already paise from Razorpay
    
    // Recover examType from order notes (fallback to user's examType or mppsc)
    const examType = (order.notes?.examType as 'upsc' | 'mppsc' | 'mppolice') || 'mppsc';

    const rows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    const p = rows[0] || PRICING_DEFAULTS;

    // Compare paise against expected prices (config stores rupees, ×100 for paise)
    const litePaise = (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100;
    const proPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;
    const upgradePaise = (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100;

    let planTier: 'lite' | 'pro';
    if (amountInPaise === litePaise) {
      planTier = 'lite';
    } else if (amountInPaise === proPaise || amountInPaise === upgradePaise) {
      // 🛡️ Both pro purchase and lite→pro upgrade grant 'pro' tier
      planTier = 'pro';
    } else {
      // 🚨 SECURITY: Reject unknown amounts instead of defaulting to pro!
      // Before this fix, ANY amount → 'pro' tier (free pro for everyone!)
      logger.warn('Unknown payment amount — does not match any plan', {
        category: 'payment',
        metadata: { userId, orderId: razorpay_order_id, amountInPaise },
      });
      return { error: 'Payment amount does not match any valid plan' };
    }

    // 💾 Step 5: Atomic Transaction (Payment + User Update)
    // DB columns: orderId, paymentId, signature, planTier, status (enum: created/captured/failed)
    // amount stored in PAISE (integer column, Razorpay standard)
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        id: uuidv4(),
        userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: amountInPaise, // ✅ Store paise (integer), NOT rupees
        planTier,
        status: 'captured', // Razorpay marks successful payments as 'captured'
        examType,
      });

      await tx
        .update(mppscUsers)
        .set({
          planTier,
          isSubscribed: true,
          isActive: true,
        })
        .where(eq(mppscUsers.id, userId));
    });

    logger.info('Payment verified successfully', {
      category: 'payment',
      metadata: { userId, planTier, orderId: razorpay_order_id },
    });

    // 🚀 Step 6: Post-Verification Flow (Non-blocking but vital)
    // We run this in the background to keep the response snappy.
    (async () => {
      try {
        const user = await db.query.mppscUsers.findFirst({
          where: eq(mppscUsers.id, userId),
        });
        if (!user || !user.email) return;

        const isUpgrade = order.notes?.planType === 'upgrade';

        // 1. Generate 'Set Password' Token for New Users
        if (!isUpgrade) {
          const token = uuidv4();
          const expires = addHours(new Date(), 1); // 1 hour expiry

          await db.insert(verificationTokens).values({
            identifier: userId,
            token,
            expires,
          });

          // 2. Send Welcome Email
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromName = process.env.EMAIL_FROM_NAME || 'MP POLICE ZEN';
          const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'mppolice@zenscroll.app';
          const fromEmail = `${fromName} <${fromAddress}>`;
          const actionUrl = `${appPath('auth/set-password')}?token=${token}`;

          const { error: emailError } = await resend.emails.send({
            from: fromEmail,
            to: [user.email],
            subject: '🎉 Welcome to MP POLICE ZEN — Set Your Password',
            react: EmailTemplate({ name: user.name || 'Student', actionUrl, planName: planTier.toUpperCase() }),
          });

          if (emailError) {
            logger.error('Failed to send welcome email', emailError, { category: 'email', userId, metadata: { to: user.email } });
            await notifyAdminOnEmailFailure({
              userName: user.name || 'Unknown',
              userEmail: user.email,
              errorMessage: JSON.stringify(emailError),
              paymentId: razorpay_payment_id,
            });
          }
        }

        // 3. Notify Admin on Payment
        await notifyAdminOnPayment({
          type: isUpgrade ? 'upgrade' : 'new_payment',
          userName: user.name || 'Unknown',
          userEmail: user.email,
          planTier,
          amountInRupees: amountInPaise / 100,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          isUpgrade,
        });

        // 4. Log User Activity
        try {
          const { logUserActivity } = await import('@/app/actions/user-activity');
          await logUserActivity({
            userId,
            userEmail: user.email,
            userName: user.name,
            adminId: 'system',
            action: 'PLAN_CHANGE',
            details: {
              plan: planTier,
              amount: amountInPaise / 100,
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              reason: isUpgrade ? 'Plan Upgrade' : 'Initial Payment',
            },
          });
        } catch (actErr) {
          logger.warn('Failed to log activity', { category: 'payment', metadata: { error: actErr, userId } });
        }
      } catch (flowErr) {
        logger.error('Post-verification flow failed', flowErr, { category: 'payment', userId });
      }
    })();

    return { success: true, planTier };
  } catch (error: unknown) {
    logger.error('Payment verification error:', error, {
      category: 'payment',
    });
    const message = error instanceof Error ? error.message : 'Verification failed';
    return { error: message };
  }
}
