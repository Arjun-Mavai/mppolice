'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, IndianRupee, TrendingUp, Users, Search,
  ArrowUpRight, ArrowDownRight, Calendar, BarChart3,
  Crown, Zap,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  planTier: string | null;
  status: string;
  currency: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
}

interface Stats {
  total: number;
  totalRevenue: number;
  liteCount: number;
  proCount: number;
  liteRevenue: number;
  proRevenue: number;
  today: number;
  todayRevenue: number;
  week: number;
  weekRevenue: number;
  month: number;
  monthRevenue: number;
}

interface DailyData {
  date: string;
  label: string;
  count: number;
  revenue: number;
  lite: number;
  pro: number;
}

type FilterType = 'all' | 'today' | 'week' | 'month';

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

export default function PaymentsPage() {
  const [data, setData] = useState<{ stats: Stats; dailyChart: DailyData[]; payments: PaymentRecord[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('filter', filter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchData(), 400);
    return () => clearTimeout(t);
  }, [search]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-500">Failed to load payment data.</div>;

  const { stats, dailyChart, payments } = data;
  const maxChartVal = Math.max(...dailyChart.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Payment Analytics
          </h1>
          <p className="text-sm text-slate-500">Real-time revenue & order tracking</p>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Total Revenue"
            value={formatRupees(stats.totalRevenue)}
            sub={`${stats.total} orders`}
            icon={<IndianRupee className="w-4 h-4" />}
            color="emerald"
          />
          <MetricCard
            label="Today"
            value={formatRupees(stats.todayRevenue)}
            sub={`${stats.today} orders`}
            icon={<TrendingUp className="w-4 h-4" />}
            color="blue"
          />
          <MetricCard
            label="This Week"
            value={formatRupees(stats.weekRevenue)}
            sub={`${stats.week} orders`}
            icon={<Calendar className="w-4 h-4" />}
            color="violet"
          />
          <MetricCard
            label="This Month"
            value={formatRupees(stats.monthRevenue)}
            sub={`${stats.month} orders`}
            icon={<BarChart3 className="w-4 h-4" />}
            color="amber"
          />
        </div>

        {/* ── Plan Breakdown ── */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-blue-100 bg-blue-50/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-500 uppercase">Lite Plan</p>
                <p className="text-lg font-black text-slate-900">{stats.liteCount}</p>
                <p className="text-[11px] text-slate-500">{formatRupees(stats.liteRevenue)}</p>
              </div>
              {stats.total > 0 && (
                <div className="ml-auto text-right">
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((stats.liteCount / stats.total) * 100)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-amber-100 bg-amber-50/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-amber-500 uppercase">Pro Plan</p>
                <p className="text-lg font-black text-slate-900">{stats.proCount}</p>
                <p className="text-[11px] text-slate-500">{formatRupees(stats.proRevenue)}</p>
              </div>
              {stats.total > 0 && (
                <div className="ml-auto text-right">
                  <span className="text-sm font-bold text-amber-600">
                    {Math.round((stats.proCount / stats.total) * 100)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Daily Chart (last 30 days) ── */}
        <Card className="border-slate-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Daily Orders</h3>
                <p className="text-[11px] text-slate-400">Last 30 days</p>
              </div>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Lite</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pro</span>
              </div>
            </div>
            {/* Bar chart */}
            <div className="flex items-end gap-[3px] h-32 md:h-40 overflow-x-auto pb-1">
              {dailyChart.map((d) => {
                const totalH = (d.count / maxChartVal) * 100;
                const liteH = d.count > 0 ? (d.lite / d.count) * totalH : 0;
                const proH = totalH - liteH;
                return (
                  <div key={d.date} className="flex-1 min-w-[8px] flex flex-col items-center gap-0.5 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      <p className="font-bold">{d.label}</p>
                      <p>{d.count} orders • ₹{(d.revenue / 100).toLocaleString('en-IN')}</p>
                      {d.lite > 0 && <p className="text-blue-300">Lite: {d.lite}</p>}
                      {d.pro > 0 && <p className="text-amber-300">Pro: {d.pro}</p>}
                    </div>
                    {/* Bar */}
                    <div className="w-full flex flex-col justify-end" style={{ height: '100%' }}>
                      {d.count > 0 ? (
                        <>
                          <div className="w-full bg-amber-400 rounded-t-sm transition-all" style={{ height: `${proH}%`, minHeight: proH > 0 ? 2 : 0 }} />
                          <div className="w-full bg-blue-400 rounded-b-sm transition-all" style={{ height: `${liteH}%`, minHeight: liteH > 0 ? 2 : 0 }} />
                        </>
                      ) : (
                        <div className="w-full bg-slate-100 rounded-sm" style={{ height: '4px' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* X-axis labels (show every 5th) */}
            <div className="flex gap-[3px] mt-1">
              {dailyChart.map((d, i) => (
                <div key={d.date} className="flex-1 min-w-[8px] text-center">
                  {i % 5 === 0 && (
                    <span className="text-[8px] text-slate-400">{d.label.split(' ')[0]}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Filters + Search ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex gap-1.5 bg-white border rounded-lg p-1">
            {(['all', 'today', 'week', 'month'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  filter === f
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search name, email, phone, payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-white"
            />
          </div>
          <span className="text-xs text-slate-400 self-center">
            {payments.length} result{payments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── Payments Table ── */}
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">Plan</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Payment ID</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      {search ? 'No payments match your search' : 'No payments yet'}
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate max-w-[180px]">
                            {p.userName || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{p.userEmail}</p>
                          {p.userPhone && (
                            <p className="text-[10px] text-slate-300 sm:hidden">{p.userPhone}</p>
                          )}
                          {/* Mobile-only plan badge */}
                          <div className="sm:hidden mt-1">
                            <PlanBadge plan={p.planTier} />
                          </div>
                        </div>
                      </td>
                      {/* Plan */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <PlanBadge plan={p.planTier} />
                      </td>
                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-slate-900">₹{p.amount}</span>
                      </td>
                      {/* Payment ID */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.paymentId ? `${p.paymentId.slice(0, 16)}...` : '—'}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {new Date(p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}

// ── Sub-components ──

function MetricCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub: string; icon: React.ReactNode; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg ${colors[color] || colors.blue}`}>{icon}</div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{value}</p>
        <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (plan === 'pro') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-bold px-1.5 py-0">
        <Crown className="w-2.5 h-2.5 mr-0.5" /> PRO
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] font-bold px-1.5 py-0">
      <Zap className="w-2.5 h-2.5 mr-0.5" /> LITE
    </Badge>
  );
}
