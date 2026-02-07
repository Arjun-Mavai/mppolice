import { verifyAuth } from '@/lib/auth';
import { getUserAnalytics } from "@/features/analytics/actions";
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

export default async function AnalyticsPage() {
    const user = await verifyAuth();
    
    if (!user) {
        redirect('/login');
    }

    const analyticsData = await getUserAnalytics(user.id);

    return <AnalyticsDashboardWrapper analytics={analyticsData} />;
}
