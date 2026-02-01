import { verifyAuth } from '@/lib/auth';
import { getUserAnalytics } from '@/actions/analytics-actions';
import { redirect } from 'next/navigation';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export default async function AnalyticsPage() {
    const user = await verifyAuth();
    
    if (!user) {
        redirect('/login');
    }

    const analyticsData = await getUserAnalytics(user.id);

    return <AnalyticsDashboardClient analytics={analyticsData} />;
}
