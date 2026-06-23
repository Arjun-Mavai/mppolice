import { getTelemetryEnabled } from './system-settings';
import { escapeHTML } from './telegram';

export interface TelemetryEvent {
  type: 'page_view' | 'page_dwell' | 'action';
  path: string;
  previousPath?: string;
  duration?: number; // in seconds (current page)
  sessionDuration?: number; // in seconds (total tab session)
  user?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string;
    planTier?: string;
  } | null;
  guestName?: string | null;
  device?: string;
  userAgent?: string;
  referrer?: string;
  actionDetails?: string;
  ip?: string;
  location?: string;
}

function parseReadableUserAgent(ua: string): string {
  if (!ua) return 'Unknown Browser';
  const lowercaseUa = ua.toLowerCase();
  
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (lowercaseUa.includes('firefox')) browser = 'Firefox';
  else if (lowercaseUa.includes('edg/') || lowercaseUa.includes('edge')) browser = 'Edge';
  else if (lowercaseUa.includes('chrome')) browser = 'Chrome';
  else if (lowercaseUa.includes('safari')) browser = 'Safari';

  if (lowercaseUa.includes('iphone')) os = 'iPhone';
  else if (lowercaseUa.includes('ipad')) os = 'iPad';
  else if (lowercaseUa.includes('android')) os = 'Android';
  else if (lowercaseUa.includes('macintosh') || lowercaseUa.includes('mac os')) os = 'macOS';
  else if (lowercaseUa.includes('windows')) os = 'Windows';
  else if (lowercaseUa.includes('linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatTelemetryMessage(event: TelemetryEvent): string {
  const isPaymentPath = 
    event.path.startsWith('/pricing') || 
    event.path.startsWith('/payment') || 
    event.path.startsWith('/upgrade') || 
    event.path.startsWith('/thank-you');

  const isQuizPath = event.path.startsWith('/syllabus/quiz');

  let userDisplay = '👤 <b>Guest (Anonymous)</b>';
  if (event.user && (event.user.email || event.user.phone || event.user.name)) {
    const tier = event.user.planTier ? ` (${event.user.planTier.toUpperCase()})` : '';
    const namePart = event.user.name ? `<b>${escapeHTML(event.user.name)}</b>` : 'Registered User';
    const emailPart = event.user.email ? ` | 📧 ${escapeHTML(event.user.email)}` : '';
    const phonePart = event.user.phone ? ` | 📞 <code>${escapeHTML(event.user.phone)}</code>` : '';
    userDisplay = `👤 ${namePart}${tier}${emailPart}${phonePart}`;
  } else if (event.guestName) {
    userDisplay = `👤 <b>${escapeHTML(event.guestName)}</b> (Guest)`;
  }

  const deviceType = event.device ? `[${event.device}]` : '';
  const browserOs = event.userAgent ? parseReadableUserAgent(event.userAgent) : 'Unknown Browser';
  const connectionDisplay = `📱 ${escapeHTML(browserOs)} ${deviceType}`;
  const locationDisplay = event.location ? `🌍 <b>Location:</b> ${escapeHTML(event.location)}` : '';
  const ipDisplay = event.ip && event.ip !== 'Unknown IP' ? `🖥️ <code>${escapeHTML(event.ip)}</code>` : '';

  let networkInfo = '';
  if (locationDisplay && ipDisplay) {
    networkInfo = `${locationDisplay} | ${ipDisplay}\n`;
  } else if (locationDisplay) {
    networkInfo = `${locationDisplay}\n`;
  } else if (ipDisplay) {
    networkInfo = `${ipDisplay}\n`;
  }

  const dateObj = new Date();
  const dayName = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
  const dateStr = dateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const timestamp = `${dayName}, ${dateStr} | ${timeStr} IST`;

  let title = '📊 <b>MP POLICE ELITE TELEMETRY ALERT</b>';
  let body = '';
  let tags = '#telemetry #MPPolice';

  if (isPaymentPath) {
    title = '💰 <b>PAYMENT FUNNEL EVENT</b>';
    tags = '#PaymentFunnel #conversion #MPPolice';
  } else if (isQuizPath) {
    title = '📘 <b>QUIZ TELEMETRY ALERT</b>';
    tags = '#QuizPlatform #MPPolice';
  }

  if (event.type === 'page_view') {
    title = isPaymentPath ? `💰 <b>PAYMENT LANDING ALERT</b>` : title;
    
    const landingBadge = isPaymentPath ? '\n🚀 <b>HIGH PURCHASE INTENT!</b> Landed on checkout funnel.' : '';
    
    body = 
      `${title}\n` +
      `👀 <b>Page Visited:</b> <code>${escapeHTML(event.path)}</code>${landingBadge}\n\n` +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      networkInfo +
      (event.referrer ? `🔍 <b>Referrer:</b> <code>${escapeHTML(event.referrer)}</code>\n` : '') +
      `📅 <b>Date & Time:</b> ${timestamp}\n\n` +
      `${tags} #PageView`;
  } else if (event.type === 'page_dwell') {
    title = isPaymentPath ? `⏱️ <b>PAYMENT FUNNEL EXIT SURVEY</b>` : title;
    
    const stayTime = event.duration ? formatDuration(event.duration) : '0s';
    const totalSessionTime = event.sessionDuration ? formatDuration(event.sessionDuration) : null;
    
    body = 
      `${title}\n` +
      `⏱️ <b>Time on Page:</b> <b>${stayTime}</b> (<code>${escapeHTML(event.path)}</code>)\n` +
      (totalSessionTime ? `🕒 <b>Total Tab Session:</b> <b>${totalSessionTime}</b> (Open to Close/Switch)\n` : '') +
      (event.previousPath ? `➡️ <b>Navigated to:</b> <code>${escapeHTML(event.previousPath)}</code>\n\n` : '\n') +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      networkInfo +
      `📅 <b>Date & Time:</b> ${timestamp}\n\n` +
      `${tags} #DwellTime`;
  } else {
    body = 
      `${title}\n` +
      `🎯 <b>User Interaction:</b> <code>${escapeHTML(event.actionDetails || 'Clicked element')}</code>\n` +
      `📍 <b>Active Page:</b> <code>${escapeHTML(event.path)}</code>\n\n` +
      `${userDisplay}\n` +
      `${connectionDisplay}\n` +
      networkInfo +
      `📅 <b>Date & Time:</b> ${timestamp}\n\n` +
      `${tags} #UserAction`;
  }

  return body;
}

export async function sendTelemetryEvent(event: TelemetryEvent) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const isEnabled = await getTelemetryEnabled();
    if (!isEnabled) {
      return;
    }

    const BOT_TOKEN = process.env.TELEGRAM_EVENTS_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_EVENTS_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Telemetry] Missing event bot token or chat ID configuration; alert skipped.');
      }
      return;
    }

    const isDetailed = process.env.TELEGRAM_EVENTS_DETAILED !== 'false';
    const isPaymentPath = 
      event.path.startsWith('/pricing') || 
      event.path.startsWith('/payment') || 
      event.path.startsWith('/upgrade') || 
      event.path.startsWith('/thank-you');
    const isQuizPath = event.path.startsWith('/syllabus/quiz');

    if (!isDetailed && !isPaymentPath && !isQuizPath && event.type !== 'action') {
      return;
    }

    const message = formatTelemetryMessage(event);

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: controller.signal,
    });

    if (!response.ok && process.env.NODE_ENV === 'development') {
      console.error('[Telemetry] Telegram API Error:', await response.text());
    }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      if (error.name === 'AbortError') {
        console.error('[Telemetry] Telegram notification timed out (3s limit reached)');
      } else {
        console.error('[Telemetry] Failed to dispatch event:', error);
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
