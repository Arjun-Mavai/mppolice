import { NextResponse } from 'next/server';
import { sendTelegramEventNotification, escapeHTML } from '@/lib/telegram';
import { getTelemetryEnabled } from '@/lib/system-settings';

const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

export async function POST(req: Request) {
  try {
    const isTelemetryEnabled = await getTelemetryEnabled();
    if (!isTelemetryEnabled) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, timestamp: now };
    
    if (now - rateData.timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    } else {
      rateData.count++;
      if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      }
      rateLimitMap.set(ip, rateData);
    }

    const body = await req.json();
    const { modalType, path, user, guestName, device, userAgent } = body as {
      modalType: 'premium' | 'payment';
      path: string;
      user?: {
        id?: string;
        name?: string;
        email?: string;
        phone?: string | null;
        planTier?: string;
        role?: string;
      } | null;
      guestName?: string | null;
      device?: string;
      userAgent?: string;
    };

    if (!modalType || !path) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // --- Build user display string ---
    let userDisplay = '👤 <b>Guest (Anonymous)</b>';
    if (user && (user.email || user.phone || user.name)) {
      const tier = user.planTier ? ` (${user.planTier.toUpperCase()})` : '';
      const namePart = user.name ? `<b>${escapeHTML(user.name)}</b>` : 'Registered User';
      const emailPart = user.email ? ` | 📧 ${escapeHTML(user.email)}` : '';
      const phonePart = user.phone ? ` | 📞 <code>${escapeHTML(user.phone)}</code>` : '';
      userDisplay = `👤 ${namePart}${tier}${emailPart}${phonePart}`;
    } else if (guestName) {
      userDisplay = `👤 <b>${escapeHTML(guestName)}</b> (Guest)`;
    }

    // --- Parse device / browser / OS from UA ---
    const deviceStr = device ? `[${device}]` : '';
    let browserOs = 'Unknown';
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      let browser = 'Unknown';
      let os = 'Unknown';
      if (ua.includes('firefox')) browser = 'Firefox';
      else if (ua.includes('edg/') || ua.includes('edge')) browser = 'Edge';
      else if (ua.includes('chrome')) browser = 'Chrome';
      else if (ua.includes('safari')) browser = 'Safari';
      if (ua.includes('iphone')) os = 'iPhone';
      else if (ua.includes('ipad')) os = 'iPad';
      else if (ua.includes('android')) os = 'Android';
      else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
      else if (ua.includes('windows')) os = 'Windows';
      else if (ua.includes('linux')) os = 'Linux';
      browserOs = `${browser} on ${os}`;
    }

    // --- Timestamp in IST ---
    const dateObj = new Date();
    const dayName = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
    const dateStr = dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeStr = dateObj.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const timestamp = `${dayName}, ${dateStr} | ${timeStr} IST`;

    // --- Build Telegram message ---
    const isPremium = modalType === 'premium';
    const emoji = '🔒';
    const label = isPremium ? 'PREMIUM SYLLABUS MODAL' : 'PAYMENT MODAL';
    const tag = isPremium ? '#PremiumLock' : '#PaymentLock';

    const message =
      `💰 <b>${emoji} ${label} OPENED</b>\n` +
      `🚀 <b>HIGH PURCHASE INTENT!</b> User tried to access locked content in MP Police.\n\n` +
      `📍 <b>Page:</b> <code>${escapeHTML(path.substring(0, 255))}</code>\n\n` +
      `${userDisplay}\n` +
      `📱 <b>${escapeHTML(browserOs)}</b> ${deviceStr}\n` +
      `📅 <b>Date & Time:</b> ${timestamp}\n\n` +
      `${tag} #PurchaseIntent #LockModal`;

    // Fire-and-forget
    sendTelegramEventNotification(message).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}