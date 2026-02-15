// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // 🛡️ ENV-DRIVEN DSN: Don't hardcode secrets in source code!
  // Bhai, DSN source code mein hardcoded tha — koi bhi GitHub se dekh sakta tha.
  // Ab .env se aata hai. Agar missing hai toh Sentry silently disable ho jaata hai.
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,

  // 📊 CONSERVATIVE SAMPLING: Production mein 10% traces enough hain
  // 100% tracing = massive Sentry bill + performance overhead!
  // Override via `SENTRY_TRACES_SAMPLE_RATE=0.5` in .env for more coverage
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE
    ? Number(process.env.SENTRY_TRACES_SAMPLE_RATE)
    : 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // 🔒 PII DISABLED BY DEFAULT: Only enable when explicitly needed
  // sendDefaultPii sends user IPs, cookies, headers to Sentry servers.
  // For GDPR/privacy: keep disabled unless `SENTRY_SEND_DEFAULT_PII=true` in .env
  sendDefaultPii: process.env.SENTRY_SEND_DEFAULT_PII === 'true',
});
