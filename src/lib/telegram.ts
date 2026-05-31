/**
 * Simple HTML escape for Telegram messages
 * Agar user name mein '<' ya '&' ho, Telegram API error de deta hai.
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sendTelegramNotification(message: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing; notification skipped'
      );
    }
    return;
  }

  // ⏱️ AbortController — 5s timeout, Telegram slow pe hang nahi karega
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML', // <b>, <code>, <i> work
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error('Telegram API Error:', await response.text());
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Telegram notification timed out');
    } else {
      console.error('Failed to send Telegram notification:', error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendTelegramEventNotification(message: string) {
  const BOT_TOKEN = process.env.TELEGRAM_EVENTS_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_EVENTS_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Telegram Events] TELEGRAM_EVENTS_BOT_TOKEN or TELEGRAM_EVENTS_CHAT_ID missing; event notification skipped'
      );
    }
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
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

    if (!response.ok) {
      console.error('Telegram Events API Error:', await response.text());
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Telegram events notification timed out');
    } else {
      console.error('Failed to send Telegram events notification:', error);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
