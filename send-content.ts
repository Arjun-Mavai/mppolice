import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

function parseToTelegramHTML(rawText: string) {
  const htmlText = rawText
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    // Italic (only if bounded by non-word chars, to avoid messing up URLs, but simple matching is usually fine for AI output)
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '<i>$1</i>')
    // Blockquote (line starts with > )
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    // Merge adjacent blockquotes
    .replace(/<\/blockquote>\n<blockquote>/g, '\n');

  return htmlText;
}

async function run() {
  try {
    const rawText = fs.readFileSync('temp-content.txt', 'utf8');
    const htmlContent = parseToTelegramHTML(rawText);
    
    console.log("Parsed HTML:");
    console.log(htmlContent);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error('Missing token/chat id');
    }

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: htmlContent,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    console.log("Telegram Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}
run();
