
import { NextResponse } from 'next/server';
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
import { PRICING_DEFAULTS } from '@/config/pricing';

/**
 * Payment Verification API - The Trust Center 🏦
 * 
 * Bhai, ye route sabse heavy lifting karta h. Jab user pay karke wapas aata h,
 * humein verify karna padta h ki sach me pay kiya ya bas fake request bhej di.
 * 
 * Key Pillars of Trust:
 * 1. **HMAC Signature Check**: Cryptographic proof ki data Razorpay se hi aaya h.
 * 2. **Razorpay Server Cross-Check**: Hum Razorpay se order fetch karke amount re-verify karte h.
 * 3. **Idempotency**: Agar user page refresh kare, to double entry nahi honi chahiye.
 * 4. **Transactional Data**: Payment record karo, User ko assign karo, aur Email bhejo.
 */
export async function POST(req: Request) {
  try {
    // 🛑 Rate Limit: Protect verification endpoint
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

    // 🔒 Step 1: Signature Verification (Cryptography Magic)
    // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
    // Agar ye match nahi hua, to pakka koi fraud karne ki koshish kar raha h.
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 🔄 Step 2: Idempotency Check (Double-Spending Prevention)
    // Check karo ki ye payment ID pehle se DB me to nahi h?
    const existingPayment = await db.select({ id: payments.id }).from(payments)
      .where(eq(payments.paymentId, razorpay_payment_id)).limit(1);
    if (existingPayment.length > 0) {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    // 👤 Step 3: Verify User
    const user = await db.query.mppscUsers.findFirst({
      where: eq(mppscUsers.id, userId),
    });
    if (!user || user.email === null) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 });
    }

    // 🕵️ Step 4: Cross-Check with Razorpay API (Trust but Verify)
    // Hamesha 'captured' amount check karo. Signature sahi ho sakti h par amount galat ho sakta h
    // (rare but possible via specialized attacks). Fetch real data from source.
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: secret,
    });
    const order = await instance.orders.fetch(razorpay_order_id);
    const paidAmount = order.amount as number; // amount in paise

    // 🏷️ Step 5: Logic to assign Plan based on Amount
    // 99900 paise = 999 Rs = Pro Plan
    const pricingRows = await db.select().from(pricingConfig).where(eq(pricingConfig.id, 'default')).limit(1);
    const p = pricingRows[0] || PRICING_DEFAULTS;
    const proAmountPaise = (p.proPrice ?? PRICING_DEFAULTS.proPrice) * 100;
    const planTier = paidAmount >= proAmountPaise ? 'pro' : 'lite';

    // 💾 Step 6: Persist Payment in DB
    // Transaction log maintain karna zaroori h for audits & analytics.
    await db.insert(payments).values({
      id: `pay_${uuidv4()}`,
      userId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: paidAmount,
      planTier,
      status: 'captured',
      currency: 'INR',
    });

    // 🎫 Step 7: Generate 'Magic Link' Token
    // User ko ab password set karna h. Hum ek secure, temporary token banate h.
    const token = uuidv4();
    const expires = addHours(new Date(), 1); // Token valid for 1 hour

    await db.insert(verificationTokens).values({
      identifier: userId,
      token,
      expires,
    });

    // 📧 Step 8: Send Welcome Email (The "Wow" Moment)
    // Resend API se beautiful email bhejo jisme Magic Link ho.
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'MPPSC Syllabus <onboarding@resend.dev>';
    const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${token}`;

    const planLabel = planTier === 'pro' ? 'Pro Plan' : 'Lite Plan';

    await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: '🎉 Welcome to MPPSC Syllabus — Set Your Password',
      react: EmailTemplate({ name: user.name || 'Student', actionUrl, planName: planLabel }),
    });

    return NextResponse.json({ success: true, planTier });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
