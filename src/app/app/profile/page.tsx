'use client';

import { useAppStore } from '@/hooks/useAppStore';
import { User, LogOut, Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { savedQuotes, swipeCount, isPro, syncProStatus } = useAppStore();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          syncProStatus(!!data.user.is_pro);
        } else {
          // If fetching fails (unauthorized), redirect to login
          router.push('/login');
        }
      } catch (e) {
        logger.error('Profile Fetch Error:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router, syncProStatus]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/app" className="rounded-full bg-white p-2 shadow-sm hover:bg-gray-100">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-display text-2xl font-bold">Profile</h1>
        </div>

        {/* User Card */}
        <div className="mb-6 flex items-center gap-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="font-display flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-400">
            {user.name ? user.name[0].toUpperCase() : <User size={40} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name || 'Mindful User'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700 uppercase">
              {isPro ? 'Pro Member' : 'Free Plan'}
              {isPro && <Check size={12} />}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-1 text-4xl font-bold text-gray-900">{savedQuotes.length}</div>
            <div className="text-sm font-medium text-gray-500">Saved Quotes</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-1 text-4xl font-bold text-gray-900">{swipeCount}</div>
            <div className="text-sm font-medium text-gray-500">Daily Swipes</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white p-4 font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400">Mindful App v1.2.0 • Build 2026.01</p>
        </div>
      </div>
    </div>
  );
}
