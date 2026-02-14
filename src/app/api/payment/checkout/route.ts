import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const paymentLink = process.env.DODO_PAYMENT_LINK;

  if (!paymentLink) {
    return NextResponse.json({ error: 'Payment link not configured' }, { status: 500 });
  }

  // Determine the base URL (ngrok or production)
  const { origin } = new URL(request.url);
  const returnUrl = `${origin}/payment/success`;

  // Append return_url to Dodo link (assuming Dodo supports this standard param)
  // Check if link already has params
  const separator = paymentLink.includes('?') ? '&' : '?';
  const finalLink = `${paymentLink}${separator}redirect_url=${encodeURIComponent(returnUrl)}`;

  return NextResponse.redirect(finalLink);
}
