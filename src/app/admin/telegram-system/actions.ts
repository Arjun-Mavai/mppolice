'use server';

import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';

/**
 * Parses markdown-like text to Telegram HTML format.
 * - Converts **text** to <b>text</b>
 * - Converts _text_ to <i>text</i>
 * - Converts blockquotes starting with '> ' to <blockquote>text</blockquote>
 * - Merges adjacent blockquotes to avoid visual breaks
 */
function parseToTelegramHTML(rawText: string) {
  const htmlText = rawText
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Italic (only if bounded by non-word chars, to avoid messing up URLs, but simple matching is usually fine for AI output)
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '<i>$1</i>')
    // Blockquote (line starts with > optionally followed by space)
    .replace(/^> ?(.*)$/gm, '<blockquote>$1</blockquote>')
    // Merge adjacent blockquotes
    .replace(/<\/blockquote>\n<blockquote>/g, '\n')
    // Markdown links to HTML links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  return htmlText;
}

export async function sendTelegramBotMessage(rawText: string) {
  try {
    await requireAdmin();

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error('Telegram Bot Token or Chat ID is missing in environment variables.');
    }

    const htmlContent = parseToTelegramHTML(rawText);

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: htmlContent,
        parse_mode: 'HTML',
        link_preview_options: {
          is_disabled: true
        },
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      logger.error('Telegram API Error', data);
      throw new Error(data.description || 'Failed to send message to Telegram');
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Failed to send Telegram message:', error);
    return { success: false, error: error.message || 'Something went wrong' };
  }
}
