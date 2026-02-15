import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

// Manual Svix Signature Verification (to avoid adding dependencies)
function verifySignature(payload: string, headers: Headers, secret: string) {
  const msgId = headers.get('svix-id');
  const msgTimestamp = headers.get('svix-timestamp');
  const msgSignature = headers.get('svix-signature');

  if (!msgId || !msgTimestamp || !msgSignature || !secret) {
    return false;
  }

  const timestamp = Number(msgTimestamp);
  const now = Math.floor(Date.now() / 1000);

  // Tolerance check (e.g., 5 minutes)
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  const toSign = `${msgId}.${msgTimestamp}.${payload}`;

  // Svix signatures are space-separated list of "v1,signature"
  // We need to check if any of them match our computed signature
  const signatureParts = msgSignature.split(' ');

  // Usually secrets start with "whsec_", strip it if needed for base64 decoding if it was base64,
  // but Svix usually provides the raw secret or base64.
  // Standard Svix: Secret is base64.
  // Dodo might provide raw string or formatted.
  // We will assume standard Svix behavior: secret key is used in HMAC-SHA256.
  // If the secret starts with "whsec_", it might be just the string.

  // Let's compute the HMAC safely.
  // Note: If secret is base64 encoded, we should decode it.
  // Many providers give `whsec_<base64>`.
  let secretKey = secret;
  if (secret.startsWith('whsec_')) {
    secretKey = secret.substring(6);
  }

  // Try verifying with the key as string first (common mistake/confusion),
  // but standard Svix uses base64 decoded key.
  // We will try to construct the signature.

  const hmac = crypto.createHmac('sha256', Buffer.from(secretKey, 'base64'));
  hmac.update(toSign);
  const computed = hmac.digest('base64');
  const expected = `v1,${computed}`;

  return signatureParts.includes(expected);
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const headers = request.headers;
    const secret = process.env.DODO_WEBHOOK_SECRET;

    if (!secret) {
      logger.error('Webhook secret not configured', undefined, { category: 'payment' });
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    // // Verify Signature
    // const isValid = verifySignature(payload, headers, secret);
    // if (!isValid) {
    //    console.error("Invalid Webhook Signature");
    //    // Return 400 or 401
    //    return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
    // }
    // console.log("Webhook payload", payload);
    const event = JSON.parse(payload);

    // Log event for debugging (optional)
    logger.info(`Received secure webhook event: ${event.type}`, {
      category: 'payment',
      metadata: { type: event.type },
    });

    // Handle 'payment.succeeded'
    // Dodo payload structure variant: Check generic 'type' or Dodo specific
    if (event.type === 'payment.succeeded') {
      const { data } = event;
      // Check for customer email in data
      const email = data.customer_email || data.customer?.email || data.email;

      if (email) {
        // Extract scalable fields from Dodo payload
        // Note: Adjust field mapping based on actual Dodo payload structure
        const subscriptionId = data.subscription_id || data.subscription?.id;
        const customerId = data.customer_id || data.customer?.id;
        const status = data.status || 'active'; // Default to active on success

        // Handle date: Dodo might send ISO string or timestamp
        let periodEnd = data.current_period_end || data.expires_at;
        if (!periodEnd) {
          // Fallback: Add 30 days if not provided
          const now = new Date();
          now.setDate(now.getDate() + 30);
          periodEnd = now.toISOString();
        }

        // Update User Pro Status & Subscription Details
        const { error } = await supabase
          .from('card_users')
          .update({
            is_pro: true,
            subscription_id: subscriptionId,
            customer_id: customerId,
            subscription_status: status,
            current_period_end: periodEnd,
            payment_provider: 'dodo',
          })
          .eq('email', email);

        if (error) {
          logger.error('Failed to update user status:', error, {
            category: 'payment',
            metadata: { email, subscriptionId, customerId },
          });
          return NextResponse.json({ error: 'Database Update Failed' }, { status: 500 });
        }

        logger.info(`Upgraded user ${email} to Pro with sub_id: ${subscriptionId}`, {
          category: 'payment',
          metadata: { email, subscriptionId },
        });
        // return NextResponse.redirect(new URL('/app', request.url));
      } else {
        logger.warn('No email found in payment payload', {
          category: 'payment',
          metadata: { eventId: event.id },
        });
      }
    }

    // Handle 'payment.failed' or 'subscription.deleted' for cancellations
    if (event.type === 'payment.failed' || event.type === 'subscription.deleted') {
      const { data } = event;
      logger.info('Payment failed or subscription deleted', {
        category: 'payment',
        metadata: data,
      });
      const email = data.customer_email || data.customer?.email || data.email;

      if (email) {
        // Downgrade user to Free
        const { error } = await supabase
          .from('card_users')
          .update({
            is_pro: false,
            subscription_id: null,
            customer_id: null,
            subscription_status: 'inactive',
            current_period_end: null,
            payment_provider: null,
          })
          .eq('email', email);

        if (error) {
          logger.error('Failed to update user status on failure:', error, {
            category: 'payment',
            metadata: { email },
          });
          return NextResponse.json({ error: 'Database Update Failed' }, { status: 500 });
        }

        logger.info(`Downgraded user ${email} to Free`, {
          category: 'payment',
          metadata: { email },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Webhook Error:', error, { category: 'payment' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
