import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { mppscUsers } from '@/db/schema';
import { DashboardView } from "@/features/analytics/components/DashboardView";

// Dashboard is user-specific — must NEVER serve cached/stale page
export const dynamic = 'force-dynamic';
import { getUserAnalytics } from "@/features/analytics/actions";

import AnalyticsDashboardWrapper from '@/app/syllabus/analytics/AnalyticsDashboardWrapper';
import { Badge } from '@/components/ui/badge';
import { syllabusData } from '@/data/syllabusData';
import { verifyAuth } from '@/lib/auth';
import { getUserSyllabusProgress } from '@/features/syllabus/actions/revision';
import { SyllabusProgressWidget } from '@/features/analytics/components/SyllabusProgressWidget';

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
        <div className="min-h-screen bg-[#fafbfc] pt-24 pb-20 font-sans relative overflow-hidden">
            {/* 🎭 PREMIUM BACKGROUND BLURS */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-slate-100/30 to-transparent pointer-events-none" />
            <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-150px] w-[400px] h-[400px] bg-emerald-50/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col gap-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-display">
                                Welcome back, {user.name?.split(' ')[0]}! 👋
                            </h1>
                        </div>
                        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl">
                            Here is your performance snapshot and syllabus progress overview.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {user.planTier === 'pro' ? (
                            <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                PRO Member
                            </div>
                        ) : user.planTier === 'lite' ? (
                            <div className="bg-emerald-600 text-white px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                LITE Member
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-slate-400 border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-1.5 text-xs font-bold rounded-xl">
                                Free Plan
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Dashboard Content — Full Analytics view */}
                <div className="w-full">
                    <AnalyticsDashboardWrapper analytics={analyticsData} />
                </div>

                {/* Syllabus Progress — Side by side or stacked based on importance */}
                <div className="w-full">
                    <SyllabusProgressWidget data={syllabusProgress} totalTopics={totalTopics} />
                </div>
            </div>
        </div>
    );
}
