'use client';
import type React from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Clock, Lock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface BlogCardProps {
  blog: any;
  index?: number;
  isLocked?: boolean;
  onNavigate?: (id: string) => void;
  isNavigating?: boolean;
}

// ... existing variants object ...

const variants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-400',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200/40',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    icon: 'text-pink-400',
    border: 'border-pink-100',
    shadow: 'shadow-pink-200/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-400',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200/40',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-400',
    border: 'border-amber-100',
    shadow: 'shadow-amber-200/40',
  },
};

const bgEmojis = ['📖', '📝', '💡', '🧠', '🎯', '📊', '⚖️', '📜', '🔍', '🎓'];

export function BlogCard({ blog, index = 0, isLocked, onNavigate, isNavigating }: BlogCardProps) {
  const { language } = useSettingsStore();
  const router = useRouter();

  const colorVariant = (['blue', 'pink', 'emerald', 'amber'] as const)[index % 4];
  const style = variants[colorVariant];
  const mainEmoji = bgEmojis[index % bgEmojis.length];

  // Bilingual Title Splitting logic
  const splitTitle = (blog.title || '').split('|');
  const displayTitle =
    splitTitle.length > 1
      ? language === 'hi'
        ? splitTitle[1].trim()
        : splitTitle[0].trim()
      : blog.title;

  const displayReadTime = index % 2 === 0 ? 5 : 6;

  const CardContent = (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'group relative flex h-[360px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500',
        style.bg,
        style.border,
        'shadow-sm hover:shadow-2xl',
        style.shadow,
        isLocked && 'opacity-90 grayscale-[0.4]'
      )}
    >
      {/* 🎭 PREMIUM EMOJI PATTERN BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03] transition-opacity duration-500 select-none group-hover:opacity-[0.06]">
        <div className="grid scale-150 rotate-12 grid-cols-4 gap-12">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="text-4xl">
              {bgEmojis[(i + index) % bgEmojis.length]}
            </div>
          ))}
        </div>
      </div>

      {/* Top Bar: Unit/Category + Lock Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {blog.unitId && (
            <div className="flex items-center gap-2 rounded-full border border-white bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <div
                className={cn(
                  'h-1.5 w-1.5 animate-pulse rounded-full',
                  colorVariant === 'emerald'
                    ? 'bg-emerald-500'
                    : colorVariant === 'blue'
                      ? 'bg-blue-500'
                      : colorVariant === 'pink'
                        ? 'bg-pink-500'
                        : 'bg-amber-500'
                )}
              />
              <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase">
                Unit {blog.unitId.replace('unit_', '')}
              </span>
            </div>
          )}
          {blog.isFreeAccess && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm shadow-emerald-200">
              <Sparkles className="h-3 w-3" />
              Free
            </div>
          )}
        </div>

        {isLocked && (
          <div className="rounded-full border border-white/50 bg-white/50 p-2.5 text-amber-600">
            <Lock className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Middle Area: Big Featured Emoji */}
      <div className="relative -mt-4 flex flex-1 items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className={cn('absolute inset-0 rounded-full opacity-30 blur-3xl', style.bg)} />
          <div className="animate-float relative text-8xl drop-shadow-2xl transition-all duration-700 group-hover:scale-125 group-hover:rotate-12">
            {mainEmoji}
          </div>
        </div>
      </div>

      {/* Bottom Content: Title & Meta */}
      <div className="relative z-10 space-y-4">
        <div className="space-y-2">
          <h3 className="line-clamp-3 text-2xl leading-[1.1] font-black tracking-tighter text-slate-900 transition-colors group-hover:text-slate-800">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-3 pt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            <div className="flex items-center gap-1">
              <Clock size={12} className={style.icon} />
              <span>{displayReadTime} Min Read</span>
            </div>
            {isLocked ? (
              <span className="text-amber-500">Premium Content</span>
            ) : isNavigating ? (
              <div className="flex items-center gap-1 text-emerald-600">
                <Loader2 size={12} className="animate-spin" />
                <span>Reading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-900 transition-transform group-hover:translate-x-1">
                Read Now <ArrowRight size={10} className="ml-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-white/30 blur-3xl transition-colors duration-500 group-hover:bg-white/50" />
    </motion.div>
  );

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={cn(
        'group block h-full transition-transform outline-none active:scale-[0.98]',
        isNavigating && 'pointer-events-none opacity-80'
      )}
      onClick={() => {
        if (onNavigate) {
          onNavigate(blog.id);
        }
      }}
      onMouseEnter={() => router.prefetch(`/blogs/${blog.slug}`)}
      onTouchStart={() => router.prefetch(`/blogs/${blog.slug}`)}
    >
      {CardContent}
    </Link>
  );
}
