'use client';

import dynamic from 'next/dynamic';

const AnalyticsDashboardClient = dynamic(() => import('./AnalyticsDashboardClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-800"></div>
    </div>
  ),
});

export default function AnalyticsDashboardWrapper({
  analytics,
  actionCard,
}: {
  analytics: any;
  actionCard?: React.ReactNode;
}) {
  return <AnalyticsDashboardClient analytics={analytics} actionCard={actionCard} />;
}
