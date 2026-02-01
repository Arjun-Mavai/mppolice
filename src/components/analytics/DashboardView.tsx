'use client'

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, BrainCircuit, TrendingUp, Trophy, History, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
    } | null;
    userName?: string;
}

export function DashboardView({ data, userName }: DashboardViewProps) {
    if (!data) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    const { overallScore, totalTests, mastery, aiSuggestion } = data;

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

            <div className="grid lg:grid-cols-2 gap-8">
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

                 {/* AI Insights */}
                 <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                             <BrainCircuit className="w-5 h-5 text-purple-600" /> AI Insights
                         </h3>
                         <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Beta</Badge>
                     </div>

                     <Card className="border-slate-200 shadow-sm p-6 relative overflow-hidden h-fit">
                         <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white opacity-50"></div>
                         <div className="relative z-10 space-y-4">
                             <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex gap-4 items-start">
                                   <BrainCircuit className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                                   <div>
                                       <h4 className="font-bold text-purple-900 text-sm mb-1 uppercase tracking-wider">Smart Suggestion</h4>
                                       <p className="text-slate-700 leading-relaxed font-medium">
                                           {aiSuggestion}
                                       </p>
                                   </div>
                             </div>

                             <div className="pt-4 border-t border-slate-100">
                                 <h4 className="font-bold text-slate-900 mb-3 text-sm">Recommended Actions</h4>
                                 <ul className="space-y-3">
                                     <li className="flex items-center gap-3 text-sm text-slate-600">
                                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">1</div>
                                         <span>Review the topic <strong>{mastery.slice(-1)[0]?.name || "Basics"}</strong></span>
                                     </li>
                                     <li className="flex items-center gap-3 text-sm text-slate-600">
                                         <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">2</div>
                                         <span>Take a customized <strong>Topic Test</strong></span>
                                     </li>
                                 </ul>
                             </div>
                         </div>
                     </Card>
                 </div>
            </div>
        </div>
    );
}
