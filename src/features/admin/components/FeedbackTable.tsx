'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Feedback {
  id: string;
  userName?: string | null;
  userEmail?: string | null;
  testId?: string | null;
  testTitle?: string | null;
  comments?: string | null;
  overallRating: number;
  difficultyLevel: string;
  questionQuality: string;
  wouldRecommend: string;
  createdAt: string;
}

export function FeedbackTable() {
  const [sortBy, setSortBy] = useState<'rating' | 'latest'>('rating');
  const { data: rawFeedbacks = [], isLoading: loading } = useQuery<Feedback[]>({
    queryKey: ['admin-test-feedbacks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/test-feedbacks');
      if (!res.ok) throw new Error('Failed to fetch test feedbacks');
      const data = await res.json();
      return data.feedbacks || [];
    }
  });

  const feedbacks = useMemo(() => {
    return [...rawFeedbacks].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (b.overallRating !== a.overallRating) {
        return b.overallRating - a.overallRating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [rawFeedbacks, sortBy]);


  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'too_hard':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'too_easy':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'just_right':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-emerald-600 bg-emerald-50';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50';
    if (rating >= 2.5) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  // Calculate stats
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length).toFixed(1)
    : '0.0';
  
  const starCounts = {
    5: feedbacks.filter(f => f.overallRating === 5).length,
    4: feedbacks.filter(f => f.overallRating === 4).length,
    3: feedbacks.filter(f => f.overallRating === 3).length,
    2: feedbacks.filter(f => f.overallRating === 2).length,
    1: feedbacks.filter(f => f.overallRating === 1).length,
  };

  const excellentCount = feedbacks.filter(f => f.overallRating >= 4).length;
  const needsImprovement = feedbacks.filter(f => f.overallRating < 3).length;


  if (loading) return <div className="p-8 text-center text-slate-500">Loading test feedbacks...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Enhanced Header with Stats */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h3 className="font-black text-slate-900">Test Series Feedback</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Rating Breakdown - High End proper display */}
            <div className="flex flex-col gap-1 rounded-xl bg-white/80 p-3 shadow-inner border border-slate-200/50 min-w-[160px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star as keyof typeof starCounts];
                const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3 group">
                    <div className="flex items-center gap-1 w-10">
                      <span className="text-[10px] font-black text-slate-600">{star}</span>
                      <Star size={8} className="fill-slate-400 text-slate-400 group-hover:fill-amber-400 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]",
                          star >= 4 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : 
                          star === 3 ? "bg-gradient-to-r from-amber-400 to-amber-500" : 
                          "bg-gradient-to-r from-rose-400 to-rose-500"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black w-4 text-right",
                      count > 0 ? "text-slate-900" : "text-slate-300"
                    )}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>


            {/* Average Rating */}
            <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.05)] border border-slate-200">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Average</span>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-black text-slate-900 leading-none">{avgRating}</span>
                </div>
              </div>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'rating' ? 'latest' : 'rating')}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 shadow-md border active:scale-95",
                sortBy === 'latest' 
                  ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-indigo-500 shadow-indigo-200" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              )}
            >
              <TrendingUp className={cn("h-4 w-4", sortBy === 'latest' ? "text-white" : "text-indigo-600")} />
              {sortBy === 'latest' ? 'LATEST FIRST' : 'SCORE FIRST'}
            </button>

            {/* Total Count */}
            <div className="flex flex-col items-end rounded-xl bg-slate-900 px-4 py-2 text-white shadow-xl border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-1">Feedback</span>
              <span className="text-lg font-black leading-none">{feedbacks.length}</span>
            </div>
          </div>
        </div>
      </div>



      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[140px] font-bold">User</TableHead>
              <TableHead className="w-[180px] font-bold">Test Name</TableHead>
              <TableHead className="font-bold">User Feedback</TableHead>
              <TableHead className="w-[90px] text-center font-bold">Rating</TableHead>
              <TableHead className="w-[100px] font-bold">Difficulty</TableHead>
              <TableHead className="w-[100px] font-bold">Quality</TableHead>
              <TableHead className="w-[110px] font-bold">Recommend?</TableHead>
              <TableHead className="w-[100px] text-right font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                    <span>No feedback received yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item, index) => (
                <TableRow 
                  key={item.id}
                  className={cn(
                    'transition-colors hover:bg-slate-50',
                    item.overallRating >= 4 && 'bg-emerald-50/30',
                    item.overallRating < 3 && 'bg-rose-50/30'
                  )}
                >
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900">{item.userName || 'Anonymous'}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={item.userEmail || ''}>
                        {item.userEmail || 'No email'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-slate-700 line-clamp-2 leading-tight" title={item.testTitle || ''}>
                        {item.testTitle || 'Unknown Test'}
                      </span>
                      {item.testId && (
                        <span className="text-[9px] text-slate-400 font-mono">ID: {item.testId.slice(0, 8)}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="max-w-sm">
                    {item.comments ? (
                      <p className="text-[13px] leading-relaxed text-slate-700 line-clamp-2" title={item.comments}>
                        "{item.comments}"
                      </p>
                    ) : (
                      <span className="text-xs italic text-slate-400">No comment</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className={cn(
                      'flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 mx-auto w-fit',
                      getRatingColor(item.overallRating)
                    )}>
                      <span className="text-base font-black">{item.overallRating}</span>
                      <Star size={14} className="fill-current" />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border text-[10px] font-bold uppercase',
                      getDifficultyColor(item.difficultyLevel)
                    )}>
                      {item.difficultyLevel.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border-0 text-[10px] font-bold uppercase',
                      item.questionQuality === 'excellent' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      item.questionQuality === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      item.questionQuality === 'average' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                      'bg-rose-100 text-rose-700 border-rose-200'
                    )}>
                      {item.questionQuality}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border-0 text-[10px] font-bold uppercase',
                      item.wouldRecommend === 'definitely' ? 'bg-indigo-100 text-indigo-700' :
                      item.wouldRecommend === 'probably' ? 'bg-sky-100 text-sky-700' :
                      item.wouldRecommend === 'maybe' ? 'bg-slate-100 text-slate-700' : 
                      'bg-red-100 text-red-700'
                    )}>
                      {item.wouldRecommend}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-0.5 text-[10px] whitespace-nowrap">
                      <span className="font-bold text-slate-700">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
