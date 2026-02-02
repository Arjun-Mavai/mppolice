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

    const { stats: metrics, recentUploads = [], topicCoverage = {} } = stats;
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Activity />} title="Total Tests" value={metrics.totalTests} color="blue" />
                    <StatCard icon={<ListChecks />} title="Total Questions" value={metrics.totalQuestions} color="indigo" />
                    <StatCard icon={<FileText />} title="Topic Tests" value={typeCount?.TOPIC || 0} color="emerald" />
                    <StatCard icon={<CheckCircle2 />} title="FLTs" value={typeCount?.FLT || 0} color="rose" />
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
                    <Card className="lg:col-span-2 shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Topic Coverage Matrix</span>
                                <Badge variant="outline" className="font-normal">Tracks 'TOPIC' type tests</Badge>
                            </CardTitle>
                            <CardDescription>Expand units to see which topics have associated quick checks.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[600px] w-full px-6">
                                <Accordion type="single" collapsible className="pb-6">
                                    {UNITS.map((unitId) => {
                                        // @ts-ignore
                                        const unitData = syllabusData.units[unitId];
                                        const unitTitle = language === 'hi' ? (unitData?.title || unitId) : (unitData?.title_en || unitData?.title || unitId);
                                        
                                        // @ts-ignore
                                        const topics = language === 'hi' ? (unitData?.topics || []) : (unitData?.topics_en || unitData?.topics || []);
                                        
                                        const coveredTopicIds = topicCoverage[unitId] || [];
                                        const coveragePercent = Math.round((coveredTopicIds.length / Math.max(topics.length, 1)) * 100);
                                        const isComplete = coveragePercent === 100;

                                        return (
                                            <AccordionItem key={unitId} value={unitId} className="border-slate-100">
                                                <AccordionTrigger className="hover:no-underline py-4">
                                                    <div className="flex justify-between items-center w-full pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-12 rounded-full ${coveragePercent > 0 ? (isComplete ? 'bg-emerald-500' : 'bg-amber-400') : 'bg-slate-200'}`} />
                                                            <div className="text-left">
                                                                <p className="font-bold text-slate-800 text-sm">Unit {unitId.split('_')[1]}</p>
                                                                <p className="text-xs text-slate-500 line-clamp-1 w-48 md:w-auto">{unitTitle}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-4 items-center">
                                                            <div className="text-right hidden md:block">
                                                                <p className="text-xs font-bold text-slate-700">{coveredTopicIds.length} / {topics.length} Covered</p>
                                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                                    <div className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${coveragePercent}%` }} />
                                                                </div>
                                                            </div>
                                                            <Badge variant={isComplete ? 'default' : 'outline'} className={isComplete ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-400'}>
                                                                {coveragePercent}%
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="grid md:grid-cols-2 gap-2 pl-4 py-2">
                                                        {topics.map((topic: any) => {
                                                            const isCovered = coveredTopicIds.includes(topic.id.toString());
                                                            return (
                                                                <div key={topic.id} className={`flex items-start gap-2 p-2 rounded border ${isCovered ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                                                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${isCovered ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-300'}`}>
                                                                        {isCovered && <Check className="w-2.5 h-2.5" />}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                         <p className={`text-xs font-medium ${isCovered ? 'text-emerald-900' : 'text-slate-500'}`}>{topic.front}</p>
                                                                         <p className="text-[10px] text-slate-400 line-clamp-1">{topic.back}</p>
                                                                    </div>
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
                </div>
                
                {/* Support Tickets Section */}
                <div className="w-full">
                     <h2 className="text-xl font-bold mb-4">Recent Support Tickets</h2>
                     <AdminTicketsList /> 
                </div>
            </div>
        </div>
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
