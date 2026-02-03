import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserAnalytics } from '@/actions/analytics-actions';
import { DashboardView } from '@/components/analytics/DashboardView';
import { Badge } from '@/components/ui/badge';
import { getUserSyllabusProgress } from '@/actions/syllabus';
import { syllabusData } from '@/data/syllabusData';
import { SyllabusProgressWidget } from '@/components/analytics/SyllabusProgressWidget';

import { verifyAuth } from '@/lib/auth';

export default async function DashboardPage() {
    const user = await verifyAuth();

    if (!user) {
        redirect('/login');
    }

    // Fetch Analytics
    const analyticsData = await getUserAnalytics(user.id);
    const syllabusProgress = await getUserSyllabusProgress();

    // Calculate Total Topics from Syllabus Data
    const totalTopics = Object.values(syllabusData.units).reduce((acc: number, unit: any) => {
        return acc + (unit.topics?.length || 0);
    }, 0);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20 font-sans">
            <div className="max-w-7xl mx-auto px-6 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                            Welcome back, {user.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Here is your progress and performance overview.
                        </p>
                    </div>
                    {user.planTier === 'pro' ? (
                         <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-sm gap-1 shadow-sm shadow-indigo-200">
                            PRO Member
                         </Badge>
                    ) : user.planTier === 'lite' ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm gap-1 shadow-sm shadow-emerald-200">
                           LITE Member
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-300 px-3 py-1 text-sm">
                            Free Plan
                        </Badge>
                    )}
                </div>

                <div className="h-px bg-slate-200 w-full" />
                
                {/* Syllabus Progress Widget */}
                <SyllabusProgressWidget data={syllabusProgress} totalTopics={totalTopics} />

                {/* Dashboard Content */}
                <DashboardView data={analyticsData} userName={user.name || 'User'} />
            </div>
        </div>
    );
}
