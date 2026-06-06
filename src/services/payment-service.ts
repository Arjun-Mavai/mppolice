import { db } from '@/db';
import { mppscUsers, pricingConfig, payments, verificationTokens } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { Resend } from 'resend';
import EmailTemplate from '@/components/email-template';
import { appPath } from '@/lib/app-url';
import { notifyAdminOnPayment, notifyAdminOnEmailFailure } from '@/lib/admin-notify';

export interface FulfillmentInput {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  amountInPaise: number;
  examType: 'upsc' | 'mppsc' | 'mppolice';
  isUpgrade?: boolean;
}

/**
 * 💳 Order Fulfillment Service
 * 
 * Centralized logic to:
 * 1. Record payment in DB
 * 2. Update user plan and expiry
 * 3. Send welcome/upgrade email
 * 4. Notify admin
 * 5. Log activity
 * 
 * Used by: verifyPayment (Server Action), verify API route, and Webhooks.
 */
export async function fulfillOrder(input: FulfillmentInput) {
  const { userId, orderId, paymentId, signature, amountInPaise, examType, isUpgrade } = input;

  try {
    // 1. Fetch Pricing Config to determine Plan and Expiry
    const pricingRows = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.examType, examType))
      .limit(1);
    
    const p = (pricingRows[0] as any) || PRICING_DEFAULTS;
    
    const litePaise = (p.litePrice ?? PRICING_DEFAULTS.litePrice) * 100;
    const proPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;
    const upgradePaise = (p.upgradePrice ?? PRICING_DEFAULTS.upgradePrice) * 100;

    let planTier: 'lite' | 'pro';
    if (amountInPaise === litePaise) {
      planTier = 'lite';
    } else if (amountInPaise === proPaise || amountInPaise === upgradePaise) {
      planTier = 'pro';
    } else {
      logger.error('Payment amount mismatch, failing fulfillment', { 
        category: 'payment', 
        metadata: { userId, amountInPaise, expectedLite: litePaise, expectedPro: proPaise, expectedUpgrade: upgradePaise } 
      });
      throw new Error(`Invalid payment amount: ${amountInPaise}`);
    }

    const months = planTier === 'pro' 
      ? (p.proMonths ?? PRICING_DEFAULTS.proMonths) 
      : (p.liteMonths ?? PRICING_DEFAULTS.liteMonths);

    const accessExpiresAt = new Date();
    accessExpiresAt.setMonth(accessExpiresAt.getMonth() + months);

    // 2. Atomic Transaction: Payment Record + User Update
    await db.transaction(async (tx) => {
      // Record the payment
      await tx.insert(payments).values({
        id: `pay_${uuidv4()}`,
        userId,
        orderId,
        paymentId,
        signature,
        amount: amountInPaise,
        planTier,
        status: 'captured',
        examType,
        createdAt: new Date(),
      });

      // Upgrade user
      await tx
        .update(mppscUsers)
        .set({
          planTier,
          isSubscribed: true,
          isActive: true,
          accessExpiresAt,
        })
        .where(eq(mppscUsers.id, userId));
    });

    // 3. Post-fulfillment (Non-blocking)
    const runPostFulfillment = async () => {
      try {
        const user = await db.query.mppscUsers.findFirst({
          where: eq(mppscUsers.id, userId),
        });
        if (!user || !user.email) return;

        // A. Generate 'Set Password' Token if user hasn't set one yet
        // In this flow, we usually send it for new payments
        const token = uuidv4();
        await db.insert(verificationTokens).values({
          identifier: userId,
          token,
          expires: addHours(new Date(), 24), // 24 hours for safety
        });

        // B. Send Email
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromName = process.env.EMAIL_FROM_NAME || 'MP POLICE ZEN';
        const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'mppolice@zenscroll.app';
        const actionUrl = `${appPath('auth/set-password')}?token=${token}`;

        const { error: emailError } = await resend.emails.send({
          from: `${fromName} <${fromAddress}>`,
          to: [user.email],
          subject: isUpgrade ? '🚀 Your Plan has been Upgraded!' : '🎉 Welcome to MP POLICE ZEN',
          react: EmailTemplate({ 
            name: user.name || 'Student', 
            actionUrl, 
            planName: planTier.toUpperCase() 
          }),
        });

        if (emailError) {
          logger.error('Failed to send fulfillment email', emailError, { category: 'email', userId });
          
          // Use type narrowing to extract message gracefully
          const errorMessage = 
            typeof emailError === 'object' && emailError !== null && 'message' in emailError
              ? String(emailError.message)
              : JSON.stringify(emailError);

          await notifyAdminOnEmailFailure({
            userName: user.name || 'Unknown',
            userEmail: user.email,
            errorMessage,
            paymentId,
          }).catch(() => {});
        }

        // C. Notify Admin
        await notifyAdminOnPayment({
          type: isUpgrade ? 'upgrade' : 'new_payment',
          userName: user.name || 'Unknown',
          userEmail: user.email,
          planTier,
          amountInRupees: amountInPaise / 100,
          orderId,
          paymentId,
          isUpgrade: !!isUpgrade,
        });

        // D. Log Activity
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
            orderId,
            paymentId,
            reason: isUpgrade ? 'Upgrade' : 'Initial Purchase',
          },
        });

      } catch (err) {
        logger.error('Post-fulfillment tasks failed', err, { category: 'payment', userId });
      }
    };

    // Trigger background tasks (Email, Telegram) without blocking the response
    // Using a separate try-catch to ensure background failures are logged but don't crash
    runPostFulfillment().catch((err) => {
      logger.error('Post-fulfillment background task failed:', err, { userId, paymentId });
    });

    return { success: true, planTier, accessExpiresAt };
  } catch (error) {
    logger.error('Fulfillment service error:', error, { category: 'payment', userId });
    throw error;
  }
}
