'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminDashboardStats } from "@/actions/admin-actions";
import { Loader2, Activity, FileText, CheckCircle2, ListChecks } from "lucide-react";
import { AdminDashboardResponse } from "@/types/admin";
import dynamic from 'next/dynamic';

// Lazy Load Admin Components
const TopicCoverageMatrix = dynamic(() => import('@/features/admin/components/TopicCoverageMatrix').then(mod => mod.TopicCoverageMatrix), {
    loading: () => <div className="h-[600px] flex items-center justify-center text-slate-400 border rounded-xl"><Loader2 className="animate-spin mr-2" /> Loading Matrix...</div>,
    ssr: false
});

const AdminTicketsList = dynamic(() => import('@/features/admin/components/AdminTicketsList').then(mod => mod.AdminTicketsList), {
    loading: () => <div className="text-sm text-slate-500">Loading tickets...</div>,
    ssr: false
});

const PaymentExitAnalytics = dynamic(() => import('@/features/admin/components/PaymentExitAnalytics').then(mod => mod.PaymentExitAnalytics), {
    loading: () => <div className="text-sm text-slate-500">Loading analytics...</div>,
    ssr: false
});

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminDashboardStats().then(res => {
            if (res.success) {
                setStats(res);
            }
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    if (!stats || !stats.stats) return <div>Error loading dashboard.</div>;

    const { stats: metrics, recentUploads = [] } = stats;
    const { typeCount } = metrics;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 font-medium">Overview of content ingestion and test coverage.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon={<Activity />} title="Total Tests" value={metrics.totalTests} color="blue" />
                    <StatCard icon={<ListChecks />} title="Total Questions" value={metrics.totalQuestions} color="indigo" />
                    <StatCard icon={<FileText />} title="Total Blogs" value={metrics.totalBlogs} color="violet" />
                    <StatCard icon={<FileText />} title="Topic Tests" value={typeCount?.TOPIC || 0} color="emerald" />
                    <StatCard icon={<CheckCircle2 />} title="FLTs" value={typeCount?.FLT || 0} color="rose" />
                    <StatCard icon={<ListChecks />} title="PYQs" value={typeCount?.PYQ || 0} color="slate" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Recent Uploads */}
                    <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Uploads</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentUploads.length === 0 ? <p className="text-slate-400 text-sm">No uploads yet.</p> : 
                             recentUploads.map((t: any) => (
                                <div key={t.id} className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0">
                                    <div className="space-y-1">
                                        <p className="font-semibold text-slate-800 text-sm line-clamp-1">{t.title}</p>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary" className="text-[10px] h-5">{t.type}</Badge>
                                            <span className="text-[10px] text-slate-400">{new Date(t.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{t.totalQuestions} Q</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Topic Coverage Tracker */}
                    <TopicCoverageMatrix />
                </div>
                
                {/* Support Tickets Section */}
                <div className="grid lg:grid-cols-2 gap-8">
                     <div className="w-full">
                        <h2 className="text-xl font-bold mb-4">Payment Exit Reasons</h2>
                        <PaymentExitAnalytics />
                     </div>
                     <div className="w-full">
                        <h2 className="text-xl font-bold mb-4">Recent Support Tickets</h2>
                        <AdminTicketsList /> 
                     </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
    };
    return (
        <Card className="shadow-sm border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-full ${colors[color] || colors.blue}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-black text-slate-900">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
