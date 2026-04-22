import { motion } from 'framer-motion';
import { LucideIcon, Plus, Sparkles, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PYQCardProps {
  title: string;
  subtitle?: string;
  count: number;
  icon: LucideIcon;
  color: 'blue' | 'pink' | 'emerald' | 'amber'; // Strict Syllabus Colors
  onClick: () => void;
  isLocked?: boolean;
  delay?: number;
  description?: string;
}

const VARIANTS = {
  blue: {
    bg: 'bg-blue-50/80',
    text: 'text-blue-700',
    iconColor: 'text-blue-500',
    border: 'border-blue-200/60',
    shadow: 'shadow-blue-200/50',
    gradient: 'from-blue-600 to-blue-700',
  },
  pink: {
    bg: 'bg-pink-50/80',
    text: 'text-pink-700',
    iconColor: 'text-pink-500',
    border: 'border-pink-200/60',
    shadow: 'shadow-pink-200/50',
    gradient: 'from-pink-600 to-pink-700',
  },
  emerald: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-200/60',
    shadow: 'shadow-emerald-200/50',
    gradient: 'from-emerald-600 to-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50/80',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
    border: 'border-amber-200/60',
    shadow: 'shadow-amber-200/50',
    gradient: 'from-amber-600 to-amber-700',
  },
};

export function PYQCard({
  title,
  subtitle,
  count,
  icon: Icon,
  color,
  onClick,
  isLocked,
  delay = 0,
  description,
}: PYQCardProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const style = VARIANTS[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'group relative flex h-[310px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-[2.5rem] border p-6 transition-all duration-300',
        style.bg,
        style.border,
        'shadow-md hover:shadow-2xl active:shadow-sm',
        style.shadow,
        isLocked && 'opacity-60 grayscale-[0.5]'
      )}
    >
      {/* Dynamic Background Noise/Glow */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
      <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[60px] opacity-20", style.bg.split('/')[0])} />

      {/* Top Bar: Search Pill + Plus Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <FolderOpen className={cn('h-3.5 w-3.5', style.iconColor)} />
          <span className="text-[10px] font-black tracking-wider text-slate-900 uppercase">
            {hi ? 'विषय' : 'Topics'}
          </span>
        </div>

        <div
          className={cn('rounded-full bg-white/40 p-2 border border-white/60 transition-all duration-500 group-hover:bg-white group-hover:shadow-lg', style.text)}
        >
          <Plus className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
        </div>
      </div>

      {/* Centered Visual (Floating Icon) */}
      <div className="relative -mt-2 flex flex-1 items-center justify-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div
            className={cn(
              'absolute inset-0 rounded-full opacity-30 blur-2xl',
              style.bg.split(' ')[0].replace('50', '300')
            )}
          />

          <div className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br shadow-2xl ring-4 ring-white/50',
                style.gradient
              )}
            >
              <Icon className="h-10 w-10 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Content: Title & Stats */}
      <div className="relative z-10 space-y-4">
        <div>
          <h3 className="line-clamp-2 text-2xl leading-none font-black text-slate-950 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-600/80">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-xl border border-white/60 bg-white/90 px-3 py-1.5 text-[10px] font-black tracking-widest text-slate-800 uppercase shadow-sm backdrop-blur-sm">
            <Sparkles className={cn('mr-2 h-3 w-3', style.iconColor)} />
            {count} {hi ? 'प्रश्न' : 'Questions'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
