"use client";

import Link from "next/link";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  blog: any;
  featured?: boolean;
  isLocked?: boolean;
}

export function BlogCard({ blog, featured, isLocked }: BlogCardProps) {
  // If locked, disable link or show lock modal on click?
  // Ideally, clicking a locked item opens the paywall.
  // For now, let's wrap in a div that handles click if locked, or Link if unlocked.
  
  const { setLockModalOpen } = useSettingsStore();

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (isLocked) {
        return (
            <div 
                onClick={(e) => {
                    e.preventDefault();
                    setLockModalOpen(true);
                }} 
                className="group h-full block cursor-pointer"
            >
                {children}
            </div>
        );
    }
    return <Link href={`/blogs/${blog.slug}`} className="group h-full block">{children}</Link>;
  };

  // Fallback Gradients (beautiful, modern)
  const fallbackGradients = [
    "bg-gradient-to-br from-rose-400 to-orange-300",
    "bg-gradient-to-br from-indigo-500 to-cyan-400", 
    "bg-gradient-to-br from-emerald-400 to-teal-600",
    "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    "bg-gradient-to-br from-amber-400 to-orange-500",
    "bg-gradient-to-br from-blue-500 to-indigo-600"
  ];
  
  // Deterministic random gradient based on title length
  const gradientClass = fallbackGradients[blog.title.length % fallbackGradients.length];

  return (
    <Wrapper>
      <Card className={cn(
        "h-full border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white relative",
        featured ? "border-indigo-100 shadow-md" : ""
      )}>
        <div className={cn("aspect-[16/9] w-full relative overflow-hidden", !blog.imageUrl && gradientClass)}>
          {blog.imageUrl ? (
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className={cn("w-full h-full object-cover transition-transform duration-700", !isLocked && "group-hover:scale-110", isLocked && "blur-[2px] grayscale-[50%]")} 
            />
          ) : (
             /* Fallback Design when no image */
            <div className="flex flex-col items-center justify-center h-full text-white/90 p-6 text-center">
              <BookOpen size={40} className="mb-2 opacity-80" />
              <span className="font-bold text-lg leading-tight line-clamp-2 opacity-90">{blog.title}</span>
            </div>
          )}
          
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
                <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold border border-slate-700 shadow-xl">
                    <Lock className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>Premium</span>
                </div>
            </div>
          )}

          {!isLocked && (
            <div className="absolute top-3 left-3 flex gap-2">
                {blog.unitId && (
                    <Badge className="bg-white/90 backdrop-blur-md text-indigo-700 font-bold shadow-sm capitalize px-2 py-0.5 text-[10px] border border-white/50">
                        Unit {blog.unitId.replace('unit_', '')}
                    </Badge>
                )}
                 {/* Logic change: don't show Free badge if premium. If Free, show explicit Free badge */}
                 {blog.isPremium === false && (
                    <Badge className="bg-emerald-500 text-white font-bold shadow-sm px-2 py-0.5 text-[10px]">
                        FREE
                    </Badge>
                 )}
            </div>
          )}
          
          {/* Overlay gradient for text legibility if needed, or hover effect */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div className="flex items-center gap-1">
               <Clock size={12} className="text-indigo-500" />
               <span>{blog.readingTime || 5} min</span>
            </div>
            <span>•</span>
            <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'New'}</span>
          </div>
          
          <div className="space-y-2">
            <h3 className={cn("font-bold text-slate-900 leading-tight transition-colors", featured ? "text-2xl" : "text-xl", !isLocked && "group-hover:text-indigo-600")}>
                {blog.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                {blog.description}
            </p>
          </div>

          {!isLocked && (
            <div className="pt-2 flex items-center text-indigo-600 font-bold text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                Read Article <ChevronRight size={16} className="ml-1" />
            </div>
          )}
          
          {isLocked && (
             <div className="pt-2 flex items-center text-slate-400 font-bold text-xs gap-1">
                Unlock to read
             </div>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
}
