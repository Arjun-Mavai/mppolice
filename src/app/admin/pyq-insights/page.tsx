import { requireAdmin } from '@/lib/auth-admin';
import PYQInsightsAdminClient from './PYQInsightsAdminClient';

export const dynamic = 'force-dynamic';

export default async function PYQInsightsAdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <PYQInsightsAdminClient />
    </div>
  );
}
