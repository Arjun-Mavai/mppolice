'use client';

import { useState, useEffect } from 'react';
import { CardStack } from '@/components/CardStack';
import { Category, Quote } from '@/data/quotes';
import { SavedQuotes } from '@/components/SavedQuotes';
import { useAppStore } from '@/hooks/useAppStore';
import { Heart, User } from 'lucide-react';
import { PaywallModal } from '@/components/PaywallModal';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { TopMenu } from '@/components/TopMenu';
import { QUOTES } from '@/data/quotes'; // Import QUOTES directly for now
import { useSettingsStore } from '@/store/useSettingsStore';

// Extended props to accept initial data from Server Component
interface DashboardProps {
  initialCategories: Category[];
  initialQuotes: any[]; // Use any or specific Quote type from DB if shapes match
}

export default function Dashboard({ initialCategories, initialQuotes }: DashboardProps) {
  const [category, setCategory] = useState<Category>('Spirituality');
  const [author, setAuthor] = useState<string | null>(null);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const {
    savedQuotes,
    removeQuote,
    swipeCount,
    isPro,
    upgradeToPro,
    syncProStatus,
    isZenMode,
    toggleZenMode,
  } = useAppStore();

  // If initialCategories is passed, use the first one as default?
  // Or keep Spirituality.
  // Note: we might want to update FilterBar to use initialCategories instead of local QUOTES logic

  // Check paywall on mount and whenever swipeCount changes
  // Sync Pro Status
  // Sync Pro Status from Global Store instead of redundant API call
  const { user } = useSettingsStore();

  useEffect(() => {
    if (user) {
      // Check multiple flags for robustness (legacy is_pro, plan_tier, or is_subscribed)
      const isProUser = user.isPro || user.planTier === 'pro' || user.isSubscribed;

      // Only sync if the value actually changes to avoid unnecessary store updates
      // (Assuming syncProStatus handles this check internally, but good to be aware)
      syncProStatus(!!isProUser);
    }
  }, [user, syncProStatus]);

  // // ------------------------------------------------------------------
  // // EFFECT 2: BUSINESS LOGIC (The "Enforcer")
  // // ------------------------------------------------------------------
  // // Why: This strictly watches the `swipeCount` and `isPro` status.
  // // If the user runs out of free swipes (>=10) and isn't Pro, we slam the Paywall.
  // useEffect(() => {
  //   // Optimization: Only trigger if NOT pro. Pro users shouldn't even check this logic.
  //   if (!isPro && swipeCount >= 10) {
  //       setShowPaywall(true);
  //   }
  // }, [swipeCount, isPro]);

  return (
    <main
      className={cn(
        'flex h-dvh flex-col items-center justify-between overflow-hidden p-4 transition-colors duration-700',
        isZenMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-900'
      )}
    >
      <div className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center">
        {/* Header */}
        <div className="flex w-full items-center justify-between px-4 transition-opacity duration-300">
          <Link href="/" className="group block cursor-pointer text-left">
            <h1
              className={cn(
                'font-display text-2xl font-bold tracking-tight transition-colors group-hover:opacity-80 md:text-3xl',
                isZenMode ? 'text-white' : 'text-gray-900'
              )}
            >
              Mindful
            </h1>
            <p
              className={cn(
                'text-xs transition-colors group-hover:opacity-80 md:text-sm',
                isZenMode ? 'text-slate-400' : 'text-gray-500'
              )}
            >
              {isZenMode ? 'Zen Mode Active' : 'Daily Wisdom'}
            </p>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app/profile"
              className={cn(
                'rounded-full border p-3 shadow-sm transition-all',
                isZenMode
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:shadow-md'
              )}
            >
              <User size={20} />
            </Link>
            <button
              onClick={() => {
                if (!isPro) {
                  setShowPaywall(true);
                } else {
                  toggleZenMode();
                }
              }}
              className={cn(
                'group relative rounded-full border p-3 shadow-sm transition-all',
                isZenMode
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700'
                  : 'border-gray-100 bg-white hover:shadow-md'
              )}
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full',
                  isZenMode
                    ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    : 'bg-gray-200 group-hover:bg-indigo-200'
                )}
              />
            </button>

            <button
              onClick={() => setIsSavedOpen(true)}
              className={cn(
                'relative rounded-full border p-3 shadow-sm transition-all',
                isZenMode
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                  : 'border-gray-100 bg-white text-gray-700 hover:text-red-500 hover:shadow-md'
              )}
            >
              <Heart size={20} className="transition-colors" />
              {savedQuotes.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {savedQuotes.length}
                </span>
              )}
            </button>
            <TopMenu
              category={category}
              setCategory={setCategory}
              author={author}
              setAuthor={setAuthor}
              onLockedClick={() => setShowPaywall(true)}
              availableQuotes={initialQuotes || []}
              categories={initialCategories}
            />
          </div>
        </div>

        <div className="relative flex min-h-[500px] w-full flex-1 items-center justify-center py-8">
          {/* Background Ambience for Zen Mode */}
          {isZenMode && (
            <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
              <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-700" />
            </div>
          )}
          <CardStack category={category} authorFilter={author} initialQuotes={initialQuotes} />
        </div>

        <p
          className={cn(
            'pb-4 text-center text-xs transition-colors',
            isZenMode ? 'text-slate-500' : 'text-gray-400'
          )}
        >
          Swipe right or tap heart to save •{' '}
          {isPro ? 'Unlimited Swipes' : `${10 - swipeCount} swipes left`}
        </p>
      </div>

      <SavedQuotes
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedQuotes={savedQuotes}
        onRemove={removeQuote}
      />

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </main>
  );
}
