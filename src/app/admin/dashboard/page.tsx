'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getAdminDashboardStats } from "@/actions/admin-actions";
import { Loader2, Activity, FileText, CheckCircle2, ListChecks, Check } from "lucide-react";
import { syllabusData } from "@/data/syllabusData";
import { AdminDashboardResponse } from "@/types/admin";
import { useSettingsStore } from "@/store/useSettingsStore";

const UNITS = Array.from({ length: 10 }, (_, i) => `unit_${i + 1}`);

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { language } = useSettingsStore();

    useEffect(() => {
        getAdminDashboardStats().then(res => {
            if (res.success) {
                setStats(res);
            }
            setLoading(false);
        });
    }, []);

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

    const { stats: metrics, recentUploads = [], recentBlogs = [], topicCoverage = {} } = stats;
    const { typeCount } = metrics; // Destructure typeCount from the NESTED stats object destructuring above.

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

// Client Component for Coverage Matrix
import { getTopicTestStats, TopicStat } from "@/actions/getTopicTestStats";

function TopicCoverageMatrix() {
    const [stats, setStats] = useState<Record<string, TopicStat[]> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTopicTestStats().then(res => {
            if (res.success && res.data) {
                setStats(res.data);
            }
            setLoading(false);
        });
    }, []);

    if (loading) return <Card className="lg:col-span-2 shadow-sm border-slate-200 h-[600px] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400"/></Card>;
    if (!stats) return <Card className="lg:col-span-2 shadow-sm border-slate-200 p-6 text-slate-500">Failed to load coverage.</Card>;

    const units = Object.keys(stats).sort((a, b) => {
        const numA = parseInt(a.replace('unit_', '')) || 0;
        const numB = parseInt(b.replace('unit_', '')) || 0;
        return numA - numB;
    });

    return (
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Topic Coverage Matrix</span>
                    <Badge variant="outline" className="font-normal">Real-time DB Sync</Badge>
                </CardTitle>
                <CardDescription>Expand units to see uploaded questions count per topic.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px] w-full px-6">
                    <Accordion type="single" collapsible className="pb-6">
                        {units.map((unitId) => {
                            const topics = stats[unitId] || [];
                            const totalTopics = topics.length;
                            const coveredTopics = topics.filter(t => t.questionCount > 0).length;
                            const coveragePercent = totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0;
                            const isComplete = coveragePercent === 100;

                            return (
                                <AccordionItem key={unitId} value={unitId} className="border-slate-100">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-12 rounded-full ${coveragePercent > 0 ? (isComplete ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`} />
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-800 text-sm">Unit {unitId.replace('unit_', '')}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1 w-48 md:w-auto">{coveredTopics} / {totalTopics} Topics Ready</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <div className="text-right hidden md:block">
                                                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                        <div className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${coveragePercent}%` }} />
                                                    </div>
                                                </div>
                                                <Badge variant={isComplete ? 'default' : 'outline'} className={isComplete ? 'bg-emerald-600' : 'text-slate-400'}>
                                                    {coveragePercent}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid md:grid-cols-2 gap-2 pl-4 py-2">
                                            {topics.map((topic) => {
                                                const hasQuestions = topic.questionCount > 0;
                                                return (
                                                    <div key={topic.topicId} className={`flex items-center justify-between gap-2 p-3 rounded border ${hasQuestions ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <div className={`shrink-0 w-2 h-2 rounded-full ${hasQuestions ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                            <div className="space-y-0.5">
                                                                 <p className={`text-xs font-medium truncate max-w-[200px] ${hasQuestions ? 'text-emerald-900' : 'text-slate-500'}`}>{topic.topicTitle}</p>
                                                            </div>
                                                        </div>
                                                        {hasQuestions ? (
                                                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 h-5 text-[10px]">{topic.questionCount} Q</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-slate-300 h-5 text-[10px]">Empty</Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

// Client Component for Ticket List to keep main page clean
function AdminTicketsList() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("@/actions/support-actions").then(({ getSupportTickets }) => {
            getSupportTickets().then(res => {
                if (res.success && res.tickets) {
                    setTickets(res.tickets);
                }
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div className="text-sm text-slate-500">Loading tickets...</div>;
    if (tickets.length === 0) return <div className="text-sm text-slate-500">No open tickets.</div>;

    return (
        <Card className="shadow-sm border-slate-200">
             <CardContent className="p-0">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                             <tr>
                                 <th className="px-6 py-3 font-medium">User</th>
                                 <th className="px-6 py-3 font-medium">Topic</th>
                                 <th className="px-6 py-3 font-medium">Message</th>
                                 <th className="px-6 py-3 font-medium">Date</th>
                                 <th className="px-6 py-3 font-medium">Status</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {tickets.map((ticket) => (
                                 <tr key={ticket.id} className="hover:bg-slate-50/50">
                                     <td className="px-6 py-4">
                                         <p className="font-bold text-slate-900">{ticket.name}</p>
                                         <p className="text-xs text-slate-500">{ticket.email}</p>
                                         {ticket.phone && <p className="text-xs text-slate-400">{ticket.phone}</p>}
                                     </td>
                                     <td className="px-6 py-4 capitalize">
                                         <Badge variant="outline">{ticket.category}</Badge>
                                     </td>
                                     <td className="px-6 py-4 max-w-xs truncate" title={ticket.message}>
                                         {ticket.message}
                                     </td>
                                     <td className="px-6 py-4 text-slate-500">
                                         {new Date(ticket.createdAt).toLocaleDateString()}
                                     </td>
                                     <td className="px-6 py-4">
                                         <Badge className={
                                             ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 
                                             ticket.status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                                         }>
                                             {ticket.status}
                                         </Badge>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </CardContent>
        </Card>
    )
}

function PaymentExitAnalytics() {
    const [data, setData] = useState<{ reasons: any[], breakdown: Record<string, number> } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("@/actions/admin-actions").then(({ getPaymentExitStats }) => {
            getPaymentExitStats().then(res => {
                if (res.success) {
                    setData({ reasons: res.reasons || [], breakdown: res.breakdown || {} });
                }
                setLoading(false);
            });
        });
    }, []);

    if (loading) return <div className="text-sm text-slate-500">Loading analytics...</div>;
    if (!data || data.reasons.length === 0) return <div className="text-sm text-slate-500">No exit data recorded yet.</div>;

    const sortedBreakdown = Object.entries(data.breakdown).sort(([,a], [,b]) => b - a);
    const totalExits = data.reasons.length;

    return (
        <Card className="shadow-sm border-slate-200 h-[400px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Top Drop-off Reasons</CardTitle>
                <CardDescription className="text-2xl font-bold text-slate-900">{totalExits} <span className="text-sm font-normal text-slate-500">total responses</span></CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6 pb-6">
                    <div className="space-y-4">
                        {sortedBreakdown.map(([reason, count]) => {
                            const percent = Math.round((count / totalExits) * 100);
                            return (
                                <div key={reason} className="space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-700">{reason}</span>
                                        <span className="font-bold text-slate-900">{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                        
                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Recent Comments</h4>
                            <div className="space-y-2">
                                {data.reasons.filter((r: any) => r.customReason).slice(0, 5).map((r: any) => (
                                    <div key={r.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-100 italic text-slate-600">
                                        "{r.customReason}"
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
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
