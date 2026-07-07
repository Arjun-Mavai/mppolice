const https = require('https');
require('dotenv').config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://mppolice.zenscroll.app';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN not found in .env.local');
  process.exit(1);
}

const webhookUrl = `${domain}/api/telegram/webhook`;
const apiUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`;

console.log(`Setting Telegram Webhook to: ${webhookUrl}`);

https.get(apiUrl, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
