import { verifyAuth } from '@/lib/auth';
import { getUserAnalytics } from '@/features/analytics/actions';
import { redirect } from 'next/navigation';
import { TestHistoryClient } from './TestHistoryClient';

// Force fresh data — user test history should never be stale
export const dynamic = 'force-dynamic';

export default async function TestHistoryPage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  const analyticsData = await getUserAnalytics(user.id);

  return <TestHistoryClient analytics={analyticsData} />;
}
