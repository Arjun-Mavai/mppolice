"use client";

import Link from "next/link";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Badge } from "@/components/ui/badge";
import { Clock, Lock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BlogCardProps {
  blog: any;
  index?: number;
  isLocked?: boolean;
}

const variants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-400',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200/40'
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    icon: 'text-pink-400',
    border: 'border-pink-100',
    shadow: 'shadow-pink-200/40'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-400',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200/40'
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-400',
    border: 'border-amber-100',
    shadow: 'shadow-amber-200/40'
  }
};

const bgEmojis = ["📖", "📝", "💡", "🧠", "🎯", "📊", "⚖️", "📜", "🔍", "🎓"];

export function BlogCard({ blog, index = 0, isLocked }: BlogCardProps) {
  const { setLockModalOpen, language } = useSettingsStore();

  const colorVariant = (['blue', 'pink', 'emerald', 'amber'] as const)[index % 4];
  const style = variants[colorVariant];
  const mainEmoji = bgEmojis[index % bgEmojis.length];

  // Bilingual Title Splitting logic
  const splitTitle = (blog.title || '').split('|');
  const displayTitle = splitTitle.length > 1 
    ? (language === 'hi' ? splitTitle[1].trim() : splitTitle[0].trim())
    : blog.title;

  // Optional: Apply same split to description if it exists
  const splitDesc = (blog.description || '').split('|');
  const displayDesc = splitDesc.length > 1
    ? (language === 'hi' ? splitDesc[1].trim() : splitDesc[0].trim())
    : blog.description;

  const displayReadTime = index % 2 === 0 ? 5 : 6;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      setLockModalOpen(true);
    }
  };

  const CardContent = (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group cursor-pointer w-full h-[360px] rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden border transition-all duration-500",
        style.bg,
        style.border,
        "shadow-sm hover:shadow-2xl",
        style.shadow,
        isLocked && "grayscale-[0.4] opacity-90"
      )}
    >
      {/* 🎭 PREMIUM EMOJI PATTERN BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none select-none overflow-hidden">
        <div className="grid grid-cols-4 gap-12 rotate-12 scale-150">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="text-4xl">{bgEmojis[(i + index) % bgEmojis.length]}</div>
          ))}
        </div>
      </div>

      {/* Top Bar: Unit/Category + Lock Icon */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          {blog.unitId && (
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white flex items-center gap-2">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                colorVariant === 'emerald' ? 'bg-emerald-500' : 
                colorVariant === 'blue' ? 'bg-blue-500' : 
                colorVariant === 'pink' ? 'bg-pink-500' : 'bg-amber-500'
              )} />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                Unit {blog.unitId.replace('unit_', '')}
              </span>
            </div>
          )}
          {blog.isFreeAccess && (
            <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-emerald-200">
              <Sparkles className="w-3 h-3" />
              Free
            </div>
          )}
        </div>
        
        {isLocked && (
          <div className="p-2.5 rounded-full bg-white/50 text-amber-600 border border-white/50">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Middle Area: Big Featured Emoji */}
      <div className="flex-1 flex items-center justify-center relative -mt-4">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={cn("absolute inset-0 rounded-full blur-3xl opacity-30", style.bg)} />
          <div className="relative text-8xl drop-shadow-2xl transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 animate-float">
            {mainEmoji}
          </div>
        </div>
      </div>

      {/* Bottom Content: Title & Meta */}
      <div className="relative z-10 space-y-4">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 leading-[1.1] tracking-tighter group-hover:text-slate-800 transition-colors line-clamp-3">
            {displayTitle}
          </h3>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
            <div className="flex items-center gap-1">
              <Clock size={12} className={style.icon} />
              <span>{displayReadTime} Min Read</span>
            </div>
            {isLocked ? (
              <span className="text-amber-500">Premium Content</span>
            ) : (
              <div className="flex items-center gap-1 text-slate-900 group-hover:translate-x-1 transition-transform">
                Read Now <ArrowRight size={10} className="ml-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/30 rounded-full blur-3xl group-hover:bg-white/50 transition-colors duration-500" />
    </motion.div>
  );

  if (isLocked) {
    return (
      <div onClick={handleClick} className="block group h-full">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/blogs/${blog.slug}`} className="block group h-full">
      {CardContent}
    </Link>
  );
}
