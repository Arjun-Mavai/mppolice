"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart3, 
    TrendingUp, 
    Target, 
    Clock, 
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AnalyticsDashboardClientProps {
    analytics: any; // We can type this properly later based on getUserAnalytics return type
}

export default function AnalyticsDashboardClient({ analytics }: AnalyticsDashboardClientProps) {
  const router = useRouter();

  if (!analytics) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-center space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Sign in to view analytics</h2>
                  <Button onClick={() => router.push('/login')}>Go to Login</Button>
              </div>
          </div>
      )
  }

  const { overallScore, totalTests, mastery, recentActivity, aiSuggestion } = analytics;

  const overviewStats = [
    { label: "Tests Taken", value: totalTests.toString(), icon: <Target className="w-4 h-4 text-indigo-500" />, trend: "Total Attempts" },
    { label: "Avg. Score", value: `${overallScore}%`, icon: <BarChart3 className="w-4 h-4 text-emerald-500" />, trend: "Overall Performance" },
    { label: "Completion", value: `${Math.min(totalTests * 5, 100)}%`, icon: <Clock className="w-4 h-4 text-amber-500" />, trend: "Syllabus Covered" },
  ];

  const weakAreas = mastery.filter((m: any) => m.percentage < 50).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
       <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
           
           {/* Header */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                   <h1 className="text-3xl font-bold text-slate-900 font-display">Performance Analytics</h1>
                   <p className="text-slate-500">Track your progress and identify areas for improvement.</p>
               </div>
               <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-200" onClick={() => router.push('/syllabus/quiz')}>
                   <TrendingUp className="w-4 h-4 mr-2" /> Take New Test
               </Button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {overviewStats.map((stat, idx) => (
                   <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                   >
                       <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                           <CardContent className="p-6">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">{stat.icon}</div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{stat.trend}</span>
                               </div>
                               <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                               <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                           </CardContent>
                       </Card>
                   </motion.div>
               ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Main Chart Area */}
               <div className="lg:col-span-2 space-y-6">
                   <Card className="border-slate-200 shadow-sm">
                       <CardHeader>
                           <CardTitle className="text-lg font-bold text-slate-900">Subject Mastery</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-6">
                            {mastery.map((m: any, i: number) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-slate-700">{m.name}</span>
                                        <span className={cn(
                                            "font-bold",
                                            m.percentage >= 80 ? "text-emerald-600" :
                                            m.percentage >= 60 ? "text-amber-600" : "text-red-600"
                                        )}>{m.percentage}%</span>
                                    </div>
                                    <Progress value={m.percentage} className={cn(
                                        "h-2",
                                        m.percentage >= 80 ? "bg-emerald-100 [&>div]:bg-emerald-500" :
                                        m.percentage >= 60 ? "bg-amber-100 [&>div]:bg-amber-500" : "bg-red-100 [&>div]:bg-red-500"
                                    )} />
                                </div>
                            ))}
                            {mastery.length === 0 && (
                                <div className="text-center py-10 text-slate-400 italic">
                                    No tests taken yet. Start a test to see your mastery!
                                </div>
                            )}
                       </CardContent>
                   </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-slate-900">Recent Test History</CardTitle>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to Review</span>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {recentActivity.map((activity: any, idx: number) => {
                                const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)}
                                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-indigo-50/50 transition-all border border-slate-100 hover:border-indigo-100 cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110",
                                                accuracy >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                accuracy >= 60 ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                                                "bg-red-50 text-red-600 border border-red-100"
                                            )}>
                                                {accuracy}%
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-[15px] group-hover:text-indigo-600 transition-colors">
                                                    {activity.testTitle || "Practice Test"}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                                    <Clock size={12} />
                                                    {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                );
                            })}
                             {recentActivity.length === 0 && (
                                 <div className="text-center py-10">
                                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                         <Clock size={24} />
                                     </div>
                                     <p className="text-slate-400 font-medium">No tests taken yet.</p>
                                 </div>
                             )}
                        </CardContent>
                    </Card>
               </div>

               {/* Right Sidebar: AI & Weak Areas */}
               <div className="space-y-6">
                    {/* AI Suggestion Card */}
                   <Card className="bg-slate-950 text-white border-2 border-slate-800 shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                       <CardContent className="p-8 text-center space-y-6 relative z-10">
                           <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20">
                               <Target className="w-8 h-8" />
                           </div>
                           <div className="space-y-2">
                               <h3 className="font-display font-black text-xl tracking-tight">AI Coach Says:</h3>
                               <p className="text-slate-400 text-sm leading-relaxed italic">"{aiSuggestion}"</p>
                           </div>
                           <Button className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-500 font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-indigo-600/20" onClick={() => router.push('/syllabus/quiz')}>
                                START TEST SERIES
                           </Button>
                       </CardContent>
                   </Card>

                   <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                       <CardHeader>
                           <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                               <AlertCircle className="w-5 h-5 text-red-500" /> Focus Areas
                           </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-5">
                           {weakAreas.length > 0 ? weakAreas.map((area: any, idx: number) => (
                               <div key={idx}>
                                   <div className="flex justify-between text-sm font-medium mb-1.5">
                                       <span className="text-slate-700">{area.name}</span>
                                       <span className="text-red-600">{area.percentage}% Acc.</span>
                                   </div>
                                   <Progress value={area.percentage} className="h-2 bg-white [&>div]:bg-red-500" />
                               </div>
                           )) : (
                               <div className="text-center text-sm text-slate-500">No weak areas identified yet! Keep it up!</div>
                           )}
                           
                           {weakAreas.length > 0 && (
                            <Button variant="outline" className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 border-slate-200" onClick={() => router.push('/syllabus/quiz/units')}>
                                Practice Weak Areas
                            </Button>
                           )}
                       </CardContent>
                   </Card>
               </div>
           </div>
       </div>

     {/* Dialog removed as we now navigate to separate page */}
    </div>
  );
}
