"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart3, 
    TrendingUp, 
    Target, 
    Clock, 
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Mock Data
const overviewStats = [
    { label: "Tests Taken", value: "12", icon: <Target className="w-4 h-4 text-indigo-500" />, trend: "+2 this week" },
    { label: "Avg. Score", value: "68%", icon: <BarChart3 className="w-4 h-4 text-emerald-500" />, trend: "+5% improvement" },
    { label: "Study Time", value: "14h", icon: <Clock className="w-4 h-4 text-amber-500" />, trend: "2h today" },
];

const recentActivity = [
    { title: "Unit 1: History of MP", score: 85, date: "Today, 10:30 AM", status: "Excellent" },
    { title: "Unit 3: Geography", score: 62, date: "Yesterday", status: "Good" },
    { title: "Full Length Mock #1", score: 45, date: "2 days ago", status: "Needs Focus" },
];

const weakAreas = [
    { topic: "MP Economy", accuracy: 30 },
    { topic: "Constitutional System", accuracy: 42 },
    { topic: "Tribes of MP", accuracy: 48 },
];

export default function AnalyticsDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
       <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
           
           {/* Header */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                   <h1 className="text-3xl font-bold text-slate-900 font-display">Performance Analytics</h1>
                   <p className="text-slate-500">Track your progress and identify areas for improvement.</p>
               </div>
               <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg" onClick={() => router.push('/syllabus/quiz')}>
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
                       <Card className="border-slate-200 shadow-sm">
                           <CardContent className="p-6">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
                                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.trend}</span>
                               </div>
                               <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                               <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                           </CardContent>
                       </Card>
                   </motion.div>
               ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               
               {/* Main Chart Area (Mock) */}
               <div className="lg:col-span-2 space-y-6">
                   <Card className="border-slate-200 shadow-sm">
                       <CardHeader>
                           <CardTitle className="text-lg font-bold text-slate-900">Score Progress</CardTitle>
                       </CardHeader>
                       <CardContent>
                           <div className="h-64 bg-slate-50 rounded-xl flex items-end justify-between p-6 gap-2 border border-slate-100 relative overflow-hidden">
                               {/* Mock Bars */}
                               {[40, 55, 45, 60, 65, 58, 72, 68, 85].map((h, i) => (
                                   <div key={i} className="w-full bg-indigo-100 rounded-t-sm relative group">
                                       <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.05, duration: 1 }}
                                            className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-600 transition-colors"
                                       />
                                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                           Score: {h}%
                                       </div>
                                   </div>
                               ))}
                           </div>
                       </CardContent>
                   </Card>

                   <Card className="border-slate-200 shadow-sm">
                       <CardHeader>
                           <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                           {recentActivity.map((activity, idx) => (
                               <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                   <div className="flex items-center gap-4">
                                       <div className={cn(
                                           "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                           activity.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                                           activity.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                       )}>
                                           {activity.score}
                                       </div>
                                       <div>
                                           <div className="font-bold text-slate-900 text-sm">{activity.title}</div>
                                           <div className="text-xs text-slate-500">{activity.date}</div>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <span className={cn(
                                           "text-xs font-bold px-2 py-1 rounded-full",
                                           activity.status === "Excellent" ? "bg-emerald-50 text-emerald-600" :
                                           activity.status === "Good" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                       )}>
                                           {activity.status}
                                       </span>
                                       <ChevronRight className="w-4 h-4 text-slate-300" />
                                   </div>
                               </div>
                           ))}
                       </CardContent>
                   </Card>
               </div>

               {/* Right Sidebar: Weak Areas */}
               <div className="space-y-6">
                   <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                       <CardHeader>
                           <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                               <AlertCircle className="w-5 h-5 text-red-500" /> Focus Areas
                           </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-5">
                           {weakAreas.map((area, idx) => (
                               <div key={idx}>
                                   <div className="flex justify-between text-sm font-medium mb-1.5">
                                       <span className="text-slate-700">{area.topic}</span>
                                       <span className="text-red-600">{area.accuracy}% Acc.</span>
                                   </div>
                                   <Progress value={area.accuracy} className="h-2 bg-white" />
                               </div>
                           ))}
                           <Button variant="outline" className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 border-slate-200">
                               Practice Weak Areas
                           </Button>
                       </CardContent>
                   </Card>

                   <Card className="bg-slate-900 text-white border-none shadow-xl">
                       <CardContent className="p-6 text-center space-y-4">
                           <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto text-yellow-400">
                               <Target className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="font-bold text-lg">Goal: 85% Accuracy</h3>
                               <p className="text-slate-400 text-sm">You are 17% away from your weekly target.</p>
                           </div>
                           <Button className="w-full bg-white text-slate-900 hover:bg-indigo-50 font-bold">
                               Keep Going
                           </Button>
                       </CardContent>
                   </Card>
               </div>
           </div>
       </div>
    </div>
  );
}
