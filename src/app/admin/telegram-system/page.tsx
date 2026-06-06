import { requireAdmin } from '@/lib/auth-admin';
import TelegramGeneratorClient from './TelegramGeneratorClient';

export const dynamic = 'force-dynamic';

export default async function TelegramSystemPage() {
  await requireAdmin();
  return <TelegramGeneratorClient />;
}
