import { spawnSync } from 'node:child_process';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

const allowDestructivePush = process.env.ALLOW_DB_PUSH === 'true';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const targetUrl = process.env.TURSO_DATABASE_URL ?? '';
const isCloudTarget = targetUrl.startsWith('libsql://');

if ((isProduction || isCloudTarget) && !allowDestructivePush) {
  console.error('❌ Blocked: `drizzle-kit push` is disabled for cloud/production targets.');
  console.error('Use migration flow instead: `npm run db:generate` + `npm run db:migrate`.');
  console.error('If you really need push, run with `ALLOW_DB_PUSH=true` intentionally.');
  process.exit(1);
}

const result = spawnSync('npx', ['drizzle-kit', 'push'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
