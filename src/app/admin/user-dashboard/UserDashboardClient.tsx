'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Search,
  Users,
  Activity,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import type { UserWithStats } from './actions';

const TIER_COLORS: Record<string, string> = {
  pro: 'bg-amber-100 text-amber-700',
  lite: 'bg-blue-100 text-blue-700',
  free: 'bg-slate-100 text-slate-600',
};

interface Props {
  users: UserWithStats[];
}

export default function UserDashboardClient({ users }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'attempts' | 'score'>('recent');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.totalAttempts > 0).length;
  const totalAttempts = users.reduce((s, u) => s + u.totalAttempts, 0);
  const avgAttempts = activeUsers > 0 ? Math.round(totalAttempts / activeUsers) : 0;

  // Filter + Sort
  const filtered = users
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'attempts') return b.totalAttempts - a.totalAttempts;
      if (sortBy === 'score') return (b.avgScore ?? -1) - (a.avgScore ?? -1);
      // recent — by lastActiveAt, nulls last
      const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
      const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
      return bTime - aTime;
    });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                <Users className="h-6 w-6 text-slate-700" />
                User Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Har user ki test history aur performance — ek nazar me
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={<Users className="h-4 w-4" />}
            label="Total Users"
            value={totalUsers}
            color="blue"
          />
          <SummaryCard
            icon={<Activity className="h-4 w-4" />}
            label="Active Users"
            value={activeUsers}
            color="emerald"
          />
          <SummaryCard
            icon={<Trophy className="h-4 w-4" />}
            label="Total Attempts"
            value={totalAttempts}
            color="violet"
          />
          <SummaryCard
            icon={<Clock className="h-4 w-4" />}
            label="Avg Attempts/User"
            value={avgAttempts}
            color="amber"
          />
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
            />
          </div>
          <div className="flex gap-2">
            {(['recent', 'attempts', 'score'] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={sortBy === s ? 'default' : 'outline'}
                onClick={() => setSortBy(s)}
                className="capitalize"
              >
                {s === 'recent' ? '🕐 Recent' : s === 'attempts' ? '🔢 Attempts' : '🏆 Score'}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">{filtered.length} users found</p>

        {/* User List */}
        <div className="space-y-2">
          {visible.map((user) => {
            const isExpanded = expandedUser === user.id;
            return (
              <Card key={user.id} className="border transition-all hover:shadow-sm">
                <CardContent className="p-4">
                  {/* Main Row */}
                  <div
                    className="flex cursor-pointer items-center gap-4"
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                      {(user.name?.[0] || user.email[0]).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {user.name || 'No Name'}
                        </h3>
                        <Badge className={cn('text-[10px]', TIER_COLORS[user.planTier || 'free'])}>
                          {user.planTier || 'free'}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-slate-400">{user.email}</p>
                    </div>

                    {/* Quick Stats */}
                    <div className="hidden shrink-0 items-center gap-4 text-xs text-slate-500 sm:flex">
                      <span className="font-bold text-slate-700">
                        {user.totalAttempts} attempts
                      </span>
                      {user.avgScore != null && (
                        <span className="font-bold text-emerald-600">avg {user.avgScore}%</span>
                      )}
                      {user.lastActiveAt && (
                        <span className="text-slate-400">
                          {formatRelativeDate(new Date(user.lastActiveAt))}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        <CategoryStat label="FLT" count={user.fltCount} emoji="📝" color="violet" />
                        <CategoryStat label="Unit" count={user.unitCount} emoji="📚" color="blue" />
                        <CategoryStat
                          label="CSAT"
                          count={user.csatCount}
                          emoji="🧠"
                          color="amber"
                        />
                        <CategoryStat
                          label="PYQ"
                          count={user.pyqCount}
                          emoji="📜"
                          color="emerald"
                        />
                        <CategoryStat
                          label="Topic"
                          count={user.topicCount}
                          emoji="🎯"
                          color="rose"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
                        <span>
                          Completed:{' '}
                          <strong className="text-slate-600">
                            {user.completedAttempts}/{user.totalAttempts}
                          </strong>
                        </span>
                        <span>
                          Joined:{' '}
                          <strong className="text-slate-600">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : 'N/A'}
                          </strong>
                        </span>
                        {user.lastActiveAt && (
                          <span>
                            Last Active:{' '}
                            <strong className="text-slate-600">
                              {new Date(user.lastActiveAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </strong>
                          </span>
                        )}
                        {user.avgScore != null && (
                          <span>
                            Avg Score:{' '}
                            <strong className="text-emerald-600">{user.avgScore}%</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasMore && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
            >
              Load More ({filtered.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">No users found.</div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="border-slate-100">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('rounded-full p-2', colors[color])}>{icon}</div>
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
          <p className="text-xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryStat({
  label,
  count,
  emoji,
  color,
}: {
  label: string;
  count: number;
  emoji: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 border-violet-100',
    blue: 'bg-blue-50 border-blue-100',
    amber: 'bg-amber-50 border-amber-100',
    emerald: 'bg-emerald-50 border-emerald-100',
    rose: 'bg-rose-50 border-rose-100',
  };
  return (
    <div className={cn('rounded-xl border p-3 text-center', colors[color])}>
      <div className="text-lg">{emoji}</div>
      <div className="text-lg font-black text-slate-900">{count}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase">{label}</div>
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
