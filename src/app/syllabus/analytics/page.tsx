import { verifyAuth } from '@/lib/auth';
import { getUserAnalytics } from "@/features/analytics/actions";
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AnalyticsDashboardClient = dynamic(() => import('./AnalyticsDashboardClient'), {
  loading: () => (
    <div className="w-full h-96 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <p className="text-slate-500">Loading Analytics...</p>
    </div>
  ),
});

export default async function AnalyticsPage() {
    const user = await verifyAuth();
    
    if (!user) {
        redirect('/login');
    }

    const analyticsData = await getUserAnalytics(user.id);

    return <AnalyticsDashboardClient analytics={analyticsData} />;
}
