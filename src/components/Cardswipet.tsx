import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { Quote } from "@/data/quotes";
import { cn } from "@/lib/utils";
import { Quote as QuoteIcon, Heart, Share2, X, Check } from "lucide-react";
import { useAppStore } from "@/hooks/useAppStore";
import { useState } from "react";

interface CardProps {
  quote: Quote;
  onSwipe: (direction: "left" | "right") => void;
  onSave?: (quote: Quote) => void;
  index: number;
  draggable: boolean;
}

// Helper to determine gradient based on category (Apple Style Pastels)
const getCategoryGradient = (category: string) => {
  switch (category) {
    case 'Science': return "from-blue-50 to-indigo-50 border-blue-100";
    case 'Wisdom': return "from-amber-50 to-orange-50 border-amber-100";
    case 'Love': return "from-rose-50 to-pink-50 border-rose-100";
    case 'Spirituality': return "from-purple-50 to-violet-50 border-purple-100";
    case 'Nature': return "from-emerald-50 to-teal-50 border-emerald-100";
    case 'Motivation': return "from-yellow-50 to-amber-50 border-yellow-100";
    default: return "from-gray-50 to-slate-50 border-gray-100";
  }
};

export const Card = ({ quote, onSwipe, onSave, index, draggable }: CardProps) => {
  const { savedQuotes, viewedQuotes } = useAppStore();
  const baseId = quote.id.split('-')[0];
  const isSaved = savedQuotes.some(q => q.id === baseId);
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
    ["rgba(239, 68, 68)", "rgba(255, 255, 255)", "rgba(100, 116, 139)"] // Red to Slate (Neutral)
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
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
      drag={draggable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ scale: 0.9, opacity: 0, y: 50 }}
      animate={{ 
        scale: 1 - index * 0.04, 
        opacity: 1 - index * 0.2,
        y: index * 12 
      }}
      exit={{ x: x.get() < 0 ? -200 : 200, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }} // Apple-like snap
      className={cn(
        "absolute top-0 w-full h-full max-w-[360px] aspect-[3/5] rounded-[2.5rem]",
        "bg-white/80 backdrop-blur-3xl border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-shadow duration-300",
        // Gradient background layer
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-100 before:z-[-1]", 
        getCategoryGradient(quote.category),
        draggable ? "cursor-grab active:cursor-grabbing hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)]" : "cursor-default",
        "select-none touch-none will-change-transform overflow-hidden flex flex-col justify-between"
      )}
    >
        {/* Dynamic Mesh Orbs (Apple Music Vibe) */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[40%] bg-white/40 blur-[80px] rounded-full pointer-events-none z-0 mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-gradient-to-t from-white/60 to-transparent blur-[60px] rounded-full pointer-events-none z-0" />

        {/* Glassmorphic Overlay for Swipe Feedback */}
        <motion.div 
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
            className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
        />

        {/* Swipe Indicators (Apple Style Icons) */}
        <motion.div style={{ opacity: useTransform(x, [50, 100], [0, 1]) }} className="absolute top-8 left-8 p-3 bg-green-500 text-white rounded-full shadow-lg z-20">
            <Check size={32} strokeWidth={3} /> {/* Visual: Save/Green, Action: Next */}
        </motion.div>
        <motion.div style={{ opacity: useTransform(x, [-100, -50], [1, 0]) }} className="absolute top-8 right-8 p-3 bg-red-500 text-white rounded-full shadow-lg z-20">
            <X size={32} strokeWidth={3} />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-8 flex-1 flex flex-col pt-12">
             {/* Category Pill */}
            <div className="flex justify-center mb-10 items-center gap-2">
                <span className="px-5 py-2 bg-black/5 backdrop-blur-md rounded-full text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500/80 shadow-sm border border-white/20">
                    {quote.category}
                </span>
                
                {/* Viewed Tag */}
                {isViewed && (
                     <span className="px-3 py-1.5 bg-indigo-500/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase text-indigo-600 shadow-sm border border-indigo-200/50 flex items-center gap-1">
                        <Check size={9} strokeWidth={4} /> Viewed
                     </span>
                )}
            </div>

            {/* Quote Text (Lyrics View Style) */}
            <div className="flex-1 flex flex-col justify-center items-center text-center">
                <QuoteIcon className="w-10 h-10 text-gray-900/10 mb-8 fill-current" />
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-[1.2] tracking-tight drop-shadow-sm">
                    {quote.text}
                </h2>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 bg-white/40 backdrop-blur-xl border-t border-white/20 mt-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col text-left">
                     <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Author</p>
                    <p className="text-sm font-semibold text-gray-800">
                        {quote.author}
                    </p>
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
                            "p-3 rounded-full transition-all shadow-sm border",
                            isSaved 
                                ? "bg-red-50 text-red-500 border-red-100 shadow-red-100" 
                                : "bg-white text-gray-400 border-gray-100 hover:text-red-500 hover:shadow-md"
                        )}
                    >
                        <Heart 
                            size={20} 
                            className={cn(isSaved && "fill-current")}
                        />
                    </motion.button>
                )}
            </div>
        </div>
    </motion.div>
  );
};
