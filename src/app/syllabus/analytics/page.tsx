import { verifyAuth } from '@/lib/auth';
import { getUserAnalytics } from '@/features/analytics/actions';
import { redirect } from 'next/navigation';
import AnalyticsDashboardWrapper from './AnalyticsDashboardWrapper';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 ANALYTICS PAGE (Server Component)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Flow:
// 1. Verify user authentication (server-side)
// 2. Fetch analytics data (server-side)
// 3. Pass data to client wrapper
// 4. Client wrapper handles dynamic import with ssr: false
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Suspense } from 'react';

export default async function AnalyticsPage() {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login');
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-800"></div>
        </div>
      }
    >
      <AnalyticsContent userId={user.id} />
    </Suspense>
  );
}

async function AnalyticsContent({ userId }: { userId: string }) {
  const analyticsData = await getUserAnalytics(userId);
  return <AnalyticsDashboardWrapper analytics={analyticsData} />;
}
