
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PaymentExitAnalytics() {
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
