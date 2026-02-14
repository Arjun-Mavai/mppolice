'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    BarChart3, 
    BrainCircuit, 
    TrendingUp, 
    Trophy, 
    History, 
    Clock, 
    ChevronRight, 
    Target, 
    AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";

interface DashboardViewProps {
    data: {
        overallScore: number;
        totalTests: number;
        mastery: {
            id: string;
            name: string;
            percentage: number;
            status: string;
            color: string;
        }[];
        aiSuggestion: string;
        recentActivity: any[];
    } | null;
    userName?: string;
}

export function DashboardView({ data, userName }: DashboardViewProps) {
    const router = useRouter();
    const { language } = useSettingsStore();
    const hi = language === 'hi';
    
    if (!data) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    const { overallScore, totalTests, mastery, aiSuggestion, recentActivity } = data;
    const weakAreas = mastery.filter((m) => m.percentage < 50).slice(0, 3);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Average Score</div>
                        <div className="text-3xl font-bold text-slate-900">{overallScore}%</div>
                    </div>
                </Card>
                <Card className="p-6 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <History size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Tests Taken</div>
                        <div className="text-3xl font-bold text-slate-900">{totalTests}</div>
                    </div>
                </Card>
                 <Card className="p-6 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-slate-500">Strongest Unit</div>
                        <div className="text-xl font-bold text-slate-900 truncate max-w-[150px]">
                            {mastery[0]?.name || "N/A"}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                 {/* Main Column (2/3) */}
                 <div className="lg:col-span-2 space-y-8">
                     {/* Mastery Chart */}
                     <div className="space-y-6">
                         <div className="flex items-center justify-between">
                             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                 <BarChart3 className="w-5 h-5 text-indigo-600" /> Subject Mastery
                             </h3>
                             <Badge variant="outline" className="bg-white">Real-time Analysis</Badge>
                         </div>
                         
                         <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl rounded-3xl p-8 space-y-8 relative overflow-hidden">
                              {/* Background Glow */}
                              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                              <div className="flex justify-between items-end relative z-10">
                                   <div>
                                       <div className="text-slate-400 font-medium mb-1">Overall Performance</div>
                                       <div className="text-4xl font-bold text-white flex items-center gap-2">
                                           {overallScore}% 
                                           {totalTests > 0 && <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 px-2 py-1 rounded">Active</span>}
                                       </div>
                                   </div>
                               </div>

                               <div className="space-y-6 relative z-10">
                                   {mastery.length === 0 && (
                                       <div className="text-slate-500 italic text-sm">No test data available yet.</div>
                                   )}
                                   {mastery.map((item) => (
                                       <div key={item.id} className="space-y-2 group">
                                           <div className="flex justify-between text-sm">
                                               <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                                               <span className={`font-bold ${
                                                   item.color === 'emerald' ? 'text-emerald-400' : 
                                                   item.color === 'amber' ? 'text-amber-400' : 'text-red-400'
                                               }`}>
                                                   {item.status} ({item.percentage}%)
                                               </span>
                                           </div>
                                           <Progress 
                                                value={item.percentage} 
                                                className="h-3 bg-slate-800" 
                                                indicatorClassName={`bg-gradient-to-r ${
                                                    item.color === 'emerald' ? 'from-emerald-500 to-emerald-400' : 
                                                    item.color === 'amber' ? 'from-amber-500 to-amber-400' : 
                                                    'from-red-500 to-red-400'
                                                }`} 
                                            />
                                       </div>
                                   ))}
                               </div>
                         </Card>
                     </div>

                     {/* Recent Test History */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                 <History className="w-5 h-5 text-indigo-600" /> Recent Test History
                             </h3>
                        </div>
                        <Card className="border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                {recentActivity.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {recentActivity.map((activity: any, idx: number) => {
                                            const accuracy = Math.round((activity.score / (activity.totalMarks || 1)) * 100);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => router.push(`/syllabus/analytics/history/${activity.id}`)}
                                                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                                                            accuracy >= 80 ? "bg-emerald-50 text-emerald-600" :
                                                            accuracy >= 60 ? "bg-amber-50 text-amber-600" : 
                                                            "bg-red-50 text-red-600"
                                                        )}>
                                                            {accuracy}%
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                                {hi ? (activity.testTitleHi || activity.testTitle || "Practice Test") : (activity.testTitle || "Practice Test")}
                                                            </div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                                <Clock size={12} />
                                                                {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">
                                        No tests taken yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                     </div>
                 </div>

                 {/* Right Column (1/3) */}
                 <div className="space-y-8">
                     {/* AI Coach Suggestion */}
                     <div className="space-y-6">
                         <div className="flex items-center justify-between">
                             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                 <BrainCircuit className="w-5 h-5 text-purple-600" /> Smart Coach
                             </h3>
                             <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Beta</Badge>
                         </div>
                         <Card className="bg-slate-950 text-white border-2 border-slate-800 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                            <CardContent className="p-6 text-center space-y-6 relative z-10">
                                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-display font-black text-lg tracking-tight">Coach Says:</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed italic">"{aiSuggestion}"</p>
                                </div>
                                <Button className="w-full h-10 bg-indigo-600 text-white hover:bg-indigo-500 font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-indigo-600/20" onClick={() => router.push('/syllabus/quiz/pyq')}>
                                        START TEST SERIES
                                </Button>
                            </CardContent>
                        </Card>
                     </div>

                     {/* Focus Areas */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                 <AlertCircle className="w-5 h-5 text-red-500" /> Focus Areas
                             </h3>
                         </div>
                        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                            <CardContent className="p-6 space-y-5">
                                {weakAreas.length > 0 ? weakAreas.map((area, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm font-medium mb-1.5">
                                            <span className="text-slate-700">{area.name}</span>
                                            <span className="text-red-600">{area.percentage}% Acc.</span>
                                        </div>
                                        <Progress value={area.percentage} className="h-2 bg-white [&>div]:bg-red-500" />
                                    </div>
                                )) : (
                                    <div className="text-center text-sm text-slate-500 py-4">
                                        No weak areas identified yet! Keep it up!
                                    </div>
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
        </div>
    );
}
