'use client';

import { motion } from 'framer-motion';
import { Play, Lock, CheckCircle2, Clock, Info, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuizListItemProps {
  index: number;
  title: string;
  subtitle?: string;
  questions?: number;
  marks?: number;
  duration?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  attemptsLeft?: number | null;
  maxAttempts?: number | null;
  isFree?: boolean;
  onClick: () => void;
  language?: 'en' | 'hi';
  colorVariant?: 'blue' | 'pink' | 'emerald' | 'amber' | 'slate' | 'indigo';
  isLoading?: boolean;
  itemLabel?: string;
  onMouseEnter?: () => void;
  onTouchStart?: () => void;
}

export function QuizListItem({
  index,
  title,
  questions,
  marks,
  duration,
  isLocked,
  isCompleted,
  attemptsLeft,
  maxAttempts,
  isFree,
  onClick,
  language = 'en',
  colorVariant = 'slate',
  isLoading = false,
  itemLabel,
  onMouseEnter,
  onTouchStart,
}: QuizListItemProps) {
  const hi = language === 'hi';
  const num = index + 1;
  const formattedNum = num < 10 ? `0${num}` : num;

  const styles = {
    amber: {
      // Matches MP GK / Economy
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      hoverBorder: 'hover:border-amber-200',
      shadow: 'hover:shadow-amber-100/50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    pink: {
      // Matches History / Science
      bg: 'bg-pink-50/50',
      border: 'border-pink-100',
      hoverBorder: 'hover:border-pink-200',
      shadow: 'hover:shadow-pink-100/50',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
    emerald: {
      // Matches Geography / ICT
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      hoverBorder: 'hover:border-emerald-200',
      shadow: 'hover:shadow-emerald-100/50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    blue: {
      // Matches Polity / Current Affairs
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      hoverBorder: 'hover:border-blue-200',
      shadow: 'hover:shadow-blue-100/50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    indigo: {
      // Fallback / Extra
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
      hoverBorder: 'hover:border-indigo-200',
      shadow: 'hover:shadow-indigo-100/50',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    slate: {
      // Default
      bg: 'bg-white',
      border: 'border-slate-200',
      hoverBorder: 'hover:border-slate-300',
      shadow: 'shadow-sm',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  };

  const style = styles[colorVariant];
  const isExhausted = !isLocked && attemptsLeft === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isExhausted && !isLoading ? { y: -4, transition: { duration: 0.2 } } : {}}
      whileTap={!isExhausted && !isLoading ? { scale: 0.98 } : {}}
      onClick={isExhausted || isLoading ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      className={cn(
        'group relative flex flex-col gap-4 rounded-[1.5rem] border p-5 transition-all sm:flex-row sm:items-center sm:gap-6',
        isExhausted || isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
        style.bg,
        style.border,
        !isExhausted && !isLoading && style.hoverBorder,
        !isExhausted && !isLoading && style.shadow,
        isLocked && 'opacity-75 grayscale-[0.2]',
        isExhausted && 'border-slate-100 bg-slate-50 opacity-60'
      )}
    >
      {/* Decorative Icon Top Right */}
      {!isLocked && !isExhausted && (
        <div className="absolute top-4 right-4 opacity-50">
          <Sparkles className={cn('h-5 w-5', style.iconColor)} />
        </div>
      )}

      {/* 🔢 Index / Status Indicator */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'flex h-12 w-12 flex-col items-center justify-center rounded-2xl font-black transition-transform sm:h-14 sm:w-14',
            !isExhausted && !isLoading && 'group-hover:scale-105',
            isLocked
              ? 'bg-slate-100 text-slate-400'
              : isExhausted
                ? 'bg-slate-200 text-slate-500'
                : isCompleted
                  ? 'border border-emerald-100 bg-white text-emerald-600 shadow-sm'
                  : cn(style.iconBg, style.iconColor, 'shadow-sm') // Use variant colors
          )}
        >
          <span className="text-[9px] leading-tight tracking-widest uppercase opacity-80">
            {hi ? 'टेस्ट' : 'Test'}
          </span>
          <span className="text-lg leading-none sm:text-xl">
            {isLocked ? (
              <Lock size={18} />
            ) : isExhausted ? (
              <Lock size={18} className="opacity-50" />
            ) : (
              formattedNum
            )}
          </span>
        </div>

        {isCompleted && !isLocked && !isExhausted && (
          <div className="absolute -top-1 -right-1 rounded-full border border-emerald-100 bg-white p-0.5 shadow-sm">
            <CheckCircle2 className="h-4 w-4 fill-white text-emerald-500" />
          </div>
        )}
      </div>

      {/* 📝 Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1 flex items-center gap-2">
          <h3
            className={cn(
              'text-base font-black tracking-tight transition-colors sm:text-lg',
              isLocked || isExhausted ? 'text-slate-500' : 'text-slate-900'
            )}
          >
            {title}
          </h3>
          {isFree && (
            <span className="rounded-md border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-emerald-700 uppercase">
              Free
            </span>
          )}
          {/* 🔒 ATTEMPTS (Grey Text Only) */}
          {!isLocked && (attemptsLeft !== undefined || maxAttempts === null) && (
            <span
              className={cn(
                'text-[10px] font-bold tracking-tighter uppercase',
                isExhausted ? 'rounded bg-rose-50 px-1.5 py-0.5 text-rose-500' : 'text-slate-400'
              )}
            >
              {maxAttempts === null || maxAttempts === undefined // Untracked or explicitly unlimited
                ? hi
                  ? 'असीमित प्रयास'
                  : 'Unlimited'
                : attemptsLeft !== null && attemptsLeft !== undefined
                  ? attemptsLeft === 0
                    ? hi
                      ? 'कोई प्रयास शेष नहीं'
                      : 'No Attempts Left'
                    : hi
                      ? `${maxAttempts - attemptsLeft}/${maxAttempts} प्रयास`
                      : `${maxAttempts - attemptsLeft}/${maxAttempts} Attempts`
                  : null}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500">
          {(questions !== undefined || itemLabel) && (
            <span className="flex items-center gap-1">
              {questions || 0} {itemLabel || (hi ? 'टॉपिक्स' : 'Topics')}
            </span>
          )}
          {marks !== undefined && (
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              {marks} {hi ? 'अंक' : 'Marks'}
            </span>
          )}
          {attemptsLeft !== undefined && maxAttempts && !isExhausted && (
            <span
              className={cn(
                'flex items-center gap-1',
                attemptsLeft === 0 ? 'text-rose-500' : 'text-emerald-600'
              )}
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-40" />
              {attemptsLeft} {hi ? 'शेष' : 'Left'}
            </span>
          )}
        </div>
      </div>

      {/* 🏁 Action Area */}
      <div className="ml-auto flex items-center gap-3">
        {duration !== undefined && (
          <div className="mr-2 hidden flex-col items-end sm:flex">
            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
              {hi ? 'समय' : 'Time'}
            </span>
            <span className="text-xs font-black text-slate-900">{duration}m</span>
          </div>
        )}

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            disabled={isExhausted || isLoading}
            className={cn(
              'flex h-10 flex-shrink-0 items-center gap-2 rounded-xl border-0 px-4 text-xs font-black shadow-sm transition-all',
              isLocked
                ? 'bg-slate-100 text-slate-400'
                : isExhausted
                  ? 'border border-slate-200 bg-slate-100 text-slate-400'
                  : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-900 hover:text-white active:scale-95'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="xs:inline hidden">{hi ? 'खुल रहा है...' : 'Opening...'}</span>
              </>
            ) : isLocked ? (
              <Lock size={14} />
            ) : isExhausted ? (
              <Lock size={14} />
            ) : (
              <>
                <Play
                  size={14}
                  className={cn('transition-transform group-hover:scale-110', 'fill-current')}
                />
                <span className="xs:inline hidden">
                  {isCompleted ? (hi ? 'फिर से' : 'Redo') : hi ? 'शुरू' : 'Start'}
                </span>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
