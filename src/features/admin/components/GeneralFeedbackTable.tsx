'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, AlertCircle, Sparkles, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface GeneralFeedback {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  rating: number;
  category: string;
  role?: string | null;
  location?: string | null;
  createdAt: string;
}

export function GeneralFeedbackTable() {
  const [feedbacks, setFeedbacks] = useState<GeneralFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/feedbacks');
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Failed to fetch general feedbacks', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'bug':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ui':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'feature_request':
        return 'bg-violet-100 text-violet-700 border-violet-200';
      case 'content':
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

  if (loading) return <div className="p-8 text-center text-slate-500">Loading app feedbacks...</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <h3 className="font-black text-slate-900">App Feedback & Suggestions</h3>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="text-xs font-bold text-emerald-700">Total: {feedbacks.length}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="w-[180px] font-bold">User Info</TableHead>
              <TableHead className="w-[120px] font-bold">Category</TableHead>
              <TableHead className="font-bold">Message</TableHead>
              <TableHead className="w-[90px] text-center font-bold">Rating</TableHead>
              <TableHead className="w-[100px] text-right font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare className="h-8 w-8 text-slate-300" />
                    <span>No app feedback received yet.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-slate-50">
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User size={12} className="text-slate-400" />
                        {item.name}
                      </div>
                      <div className="flex flex-col text-[10px] text-slate-400">
                        {item.email && <span className="truncate max-w-[150px]">{item.email}</span>}
                        {item.location && (
                          <span className="flex items-center gap-1 text-indigo-500">
                            <MapPin size={8} /> {item.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={cn(
                      'rounded-lg border text-[10px] font-bold uppercase',
                      getCategoryColor(item.category)
                    )}>
                      {item.category.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <p className="text-[13px] leading-relaxed text-slate-700 line-clamp-3">
                      {item.message}
                    </p>
                  </TableCell>
                  
                  <TableCell>
                    <div className={cn(
                      'flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 mx-auto w-fit',
                      getRatingColor(item.rating)
                    )}>
                      <span className="text-base font-black">{item.rating}</span>
                      <Star size={14} className="fill-current" />
                    </div>
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
