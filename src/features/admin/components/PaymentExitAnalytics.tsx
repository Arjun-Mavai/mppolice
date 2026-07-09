'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PaymentExitAnalytics() {
  const { data, isLoading: loading } = useQuery<{ reasons: any[]; breakdown: Record<string, number> } | null>({
    queryKey: ['admin-payment-exit-stats'],
    queryFn: async () => {
      const { getPaymentExitStats } = await import('@/actions/admin-actions');
      const res = await getPaymentExitStats();
      if (res.success) {
        return { reasons: res.reasons || [], breakdown: res.breakdown || {} };
      }
      return null;
    }
  });

  if (loading) return <div className="text-sm text-slate-500">Loading analytics...</div>;
  if (!data || data.reasons.length === 0)
    return <div className="text-sm text-slate-500">No exit data recorded yet.</div>;

  const sortedBreakdown = Object.entries(data.breakdown).sort(([, a], [, b]) => b - a);
  const totalExits = data.reasons.length;

  return (
    <Card className="flex h-[400px] flex-col border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium tracking-wider text-slate-500 uppercase">
          Top Drop-off Reasons
        </CardTitle>
        <CardDescription className="text-2xl font-bold text-slate-900">
          {totalExits} <span className="text-sm font-normal text-slate-500">total responses</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-4">
            {sortedBreakdown.map(([reason, count]) => {
              const percent = Math.round((count / totalExits) * 100);
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{reason}</span>
                    <span className="font-bold text-slate-900">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <h4 className="mb-2 text-xs font-bold text-slate-400 uppercase">Recent Comments</h4>
              <div className="space-y-2">
                {data.reasons
                  .filter((r: any) => r.customReason)
                  .slice(0, 5)
                  .map((r: any) => (
                    <div
                      key={r.id}
                      className="rounded border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600 italic"
                    >
                      "{r.customReason}"
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
