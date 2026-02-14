import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Quote } from '@/data/quotes';
import { cn } from '@/lib/utils';
import { Quote as QuoteIcon, Heart, Share2, X, Check } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';
import { useState } from 'react';

interface CardProps {
  quote: Quote;
  onSwipe: (direction: 'left' | 'right') => void;
  onSave?: (quote: Quote) => void;
  index: number;
  draggable: boolean;
}

// Helper to determine gradient based on category (Apple Style Pastels)
const getCategoryGradient = (category: string) => {
  switch (category) {
    case 'Science':
      return 'from-blue-50 to-indigo-50 border-blue-100';
    case 'Wisdom':
      return 'from-amber-50 to-orange-50 border-amber-100';
    case 'Love':
      return 'from-rose-50 to-pink-50 border-rose-100';
    case 'Spirituality':
      return 'from-purple-50 to-violet-50 border-purple-100';
    case 'Nature':
      return 'from-emerald-50 to-teal-50 border-emerald-100';
    case 'Motivation':
      return 'from-yellow-50 to-amber-50 border-yellow-100';
    default:
      return 'from-gray-50 to-slate-50 border-gray-100';
  }
};

export const Card = ({ quote, onSwipe, onSave, index, draggable }: CardProps) => {
  const { savedQuotes, viewedQuotes } = useAppStore();
  const baseId = quote.id.split('-')[0];
  const isSaved = savedQuotes.some((q) => q.id === baseId);
  const isViewed = viewedQuotes.includes(baseId);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]); // More subtle rotation
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Background color overlay for swipe indication (Both standard dismiss/pass colors or neutral)
  const overlayOpacity = useTransform(x, [-150, 0, 150], [0.5, 0, 0.5]);
  const overlayColor = useTransform(
    x,
    [-150, 0, 150],
    ['rgba(239, 68, 68)', 'rgba(255, 255, 255)', 'rgba(100, 116, 139)'] // Red to Slate (Neutral)
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        zIndex: 100 - index,
        y: index * 12, // Tighter stack
        scale: 1 - index * 0.04,
      }}
      drag={draggable ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{
        scale: 1 - index * 0.04,
        opacity: 1 - index * 0.2,
        y: index * 12,
      }}
      exit={{ x: x.get() < 0 ? -200 : 200, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }} // Apple-like snap
      className={cn(
        'absolute top-0 aspect-[3/5] h-full w-full max-w-[360px] rounded-[2.5rem]',
        'border bg-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition-shadow duration-300',
        // Gradient background layer
        'before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-br before:opacity-100',
        getCategoryGradient(quote.category),
        draggable
          ? 'cursor-grab hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] active:cursor-grabbing'
          : 'cursor-default',
        'flex touch-none flex-col justify-between overflow-hidden will-change-transform select-none'
      )}
    >
      {/* Dynamic Mesh Orbs (Apple Music Vibe) */}
      <div className="pointer-events-none absolute top-[-20%] left-[-20%] z-0 h-[40%] w-[80%] rounded-full bg-white/40 mix-blend-overlay blur-[80px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] z-0 h-[50%] w-[60%] rounded-full bg-gradient-to-t from-white/60 to-transparent blur-[60px]" />

      {/* Glassmorphic Overlay for Swipe Feedback */}
      <motion.div
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay"
      />

      {/* Swipe Indicators (Apple Style Icons) */}
      <motion.div
        style={{ opacity: useTransform(x, [50, 100], [0, 1]) }}
        className="absolute top-8 left-8 z-20 rounded-full bg-green-500 p-3 text-white shadow-lg"
      >
        <Check size={32} strokeWidth={3} /> {/* Visual: Save/Green, Action: Next */}
      </motion.div>
      <motion.div
        style={{ opacity: useTransform(x, [-100, -50], [1, 0]) }}
        className="absolute top-8 right-8 z-20 rounded-full bg-red-500 p-3 text-white shadow-lg"
      >
        <X size={32} strokeWidth={3} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-8 pt-12">
        {/* Category Pill */}
        <div className="mb-10 flex items-center justify-center gap-2">
          <span className="rounded-full border border-white/20 bg-black/5 px-5 py-2 text-[11px] font-bold tracking-[0.2em] text-gray-500/80 uppercase shadow-sm backdrop-blur-md">
            {quote.category}
          </span>

          {/* Viewed Tag */}
          {isViewed && (
            <span className="flex items-center gap-1 rounded-full border border-indigo-200/50 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-indigo-600 uppercase shadow-sm backdrop-blur-md">
              <Check size={9} strokeWidth={4} /> Viewed
            </span>
          )}
        </div>

        {/* Quote Text (Lyrics View Style) */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <QuoteIcon className="mb-8 h-10 w-10 fill-current text-gray-900/10" />
          <h2 className="font-display text-3xl leading-[1.2] font-bold tracking-tight text-gray-900 drop-shadow-sm md:text-4xl">
            {quote.text}
          </h2>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto border-t border-white/20 bg-white/40 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left">
            <p className="mb-1 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Author
            </p>
            <p className="text-sm font-semibold text-gray-800">{quote.author}</p>
          </div>

          {onSave && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => {
                e.stopPropagation();
                onSave(quote);
              }}
              className={cn(
                'rounded-full border p-3 shadow-sm transition-all',
                isSaved
                  ? 'border-red-100 bg-red-50 text-red-500 shadow-red-100'
                  : 'border-gray-100 bg-white text-gray-400 hover:text-red-500 hover:shadow-md'
              )}
            >
              <Heart size={20} className={cn(isSaved && 'fill-current')} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
