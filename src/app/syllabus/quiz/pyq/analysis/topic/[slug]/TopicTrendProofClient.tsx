'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  TrendingUp,
  Zap,
  ChevronRight,
  ShieldCheck,
  History,
  Target,
  Search,
  Calculator,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import { RenderTableQuestion } from '@/features/tests/utils/questionFormatter';
import type { TopicTrendProof } from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';

// Helper to parse options safely
const getParsedOptions = (opts: any) => {
  if (!opts) return [];
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
};

export default function TopicTrendProofClient({ proof }: { proof: TopicTrendProof }) {
  const router = useRouter();
  const [activeYear, setActiveYear] = useState<number>(proof.currentYear);
  const { language, setLanguage } = useSettingsStore();

  const delta = proof.currentQuestions.length - proof.prevQuestions.length;
  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#FDFEFE]/40 pb-20 relative overflow-hidden">
      {/* Apple-style background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-100/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] h-[400px] w-[400px] rounded-full bg-pink-100/10 blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group mb-8 rounded-full bg-white/50 hover:bg-white shadow-sm border border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {isHindi ? 'वापस जाएं' : 'Back'}
        </Button>

        {/* Proof Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20">
                   <ShieldCheck className="h-3.5 w-3.5" />
                   100% Data Proof Verified
                 </div>
                 {delta > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-100">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{delta} {isHindi ? 'अधिक' : 'More'}
                    </div>
                 )}
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                  {isHindi ? proof.topicTitle : proof.topicTitleEn || proof.topicTitle}
                </h1>
                <p className="text-lg font-bold text-slate-500 leading-relaxed">
                  {isHindi 
                    ? `यह प्रमाण है कि ${proof.currentYear} में इस टॉपिक से ${proof.currentQuestions.length} सवाल आए, जबकि ${proof.prevYear} में सिर्फ ${proof.prevQuestions.length} थे।`
                    : `Evidence that ${proof.currentQuestions.length} questions were asked in ${proof.currentYear}, up from ${proof.prevQuestions.length} in ${proof.prevYear}.`}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
              className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm bg-white self-center sm:self-start h-auto py-2.5 px-5"
            >
              {isHindi ? 'English' : 'हिंदी'}
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid - Vertical Layout for clarity */}
        <div className="flex flex-col gap-4 mb-8">
           <Card className={cn(
             "rounded-[2rem] border-2 transition-all p-6 cursor-pointer",
             activeYear === proof.currentYear ? "border-emerald-500 bg-emerald-50/50 shadow-xl" : "border-slate-100 bg-white hover:border-slate-200"
           )} onClick={() => setActiveYear(proof.currentYear)}>
              <div className="flex justify-between items-start mb-4">
                 <div className={cn("p-3 rounded-2xl", activeYear === proof.currentYear ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400")}>
                    <Calendar className="h-6 w-6" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{isHindi ? 'नया साल' : 'New Year'}</span>
                    <Badge className={activeYear === proof.currentYear ? "bg-emerald-600" : "bg-slate-200 text-slate-500"}>{proof.currentYear}</Badge>
                 </div>
              </div>
              <div className="text-3xl font-black text-slate-900">{proof.currentQuestions.length}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isHindi ? 'प्रश्न पूछे गए' : 'Questions'}</div>
           </Card>

           <Card className={cn(
             "rounded-[2rem] border-2 transition-all p-6 cursor-pointer",
             activeYear === proof.prevYear ? "border-slate-400 bg-slate-50 shadow-xl" : "border-slate-100 bg-white hover:border-slate-200"
           )} onClick={() => setActiveYear(proof.prevYear)}>
              <div className="flex justify-between items-start mb-4">
                 <div className={cn("p-3 rounded-2xl", activeYear === proof.prevYear ? "bg-slate-600 text-white" : "bg-slate-50 text-slate-400")}>
                    <History className="h-6 w-6" />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{isHindi ? 'पिछला साल' : 'Previous'}</span>
                    <Badge className={activeYear === proof.prevYear ? "bg-slate-800" : "bg-slate-200 text-slate-500"}>{proof.prevYear}</Badge>
                 </div>
              </div>
              <div className="text-3xl font-black text-slate-900">{proof.prevQuestions.length}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{isHindi ? 'प्रश्न पूछे गए' : 'Questions'}</div>
           </Card>
        </div>

        {/* Calculation Logic Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
           <Card className="rounded-[2rem] border-dashed border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3 mb-4">
                 <Calculator className="h-5 w-5 text-slate-400" />
                 <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest">{isHindi ? 'ट्रेंड की गणना' : 'Trend Calculation'}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-black text-slate-800 flex-wrap">
                 <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{isHindi ? 'नया साल' : 'New Year'} ({proof.currentYear})</span>
                    <span>{proof.currentQuestions.length} Qs</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase shrink-0">{isHindi ? 'घटाया' : 'MINUS'}</span>
                 <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{isHindi ? 'पिछला साल' : 'Previous'} ({proof.prevYear})</span>
                    <span>{proof.prevQuestions.length} Qs</span>
                 </div>
                 <span className="text-[10px] font-black text-slate-300 uppercase shrink-0">{isHindi ? 'बराबर' : 'EQUALS'}</span>
                 <span className={cn("px-4 py-2 rounded-2xl text-white font-black shadow-lg shadow-current/20", delta >= 0 ? "bg-emerald-600" : "bg-rose-600")}>
                    {delta >= 0 ? `+${delta}` : delta} {isHindi ? 'ट्रेंड' : 'Trend'}
                 </span>
              </div>
           </Card>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-400" />
              {activeYear} {isHindi ? 'के सभी प्रश्न' : 'Questions List'}
            </h2>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-inner">
              Count: {activeYear === proof.currentYear ? proof.currentQuestions.length : proof.prevQuestions.length}
            </div>
          </div>

          <div className="grid gap-4">
            {(activeYear === proof.currentYear ? proof.currentQuestions : proof.prevQuestions).map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="rounded-[2rem] border border-slate-200/60 bg-white p-6 pt-14 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-5 left-6 flex h-7 px-3 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white shadow-lg shadow-slate-900/20">
                    Q.{q.questionOrder}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-50 pb-3">
                         <div className="flex items-center gap-1.5 bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <Target className="h-4 w-4 text-emerald-500" />
                            <span className="text-[11px] sm:text-[13px] font-black text-emerald-900 uppercase tracking-tight">
                               {isHindi ? q.testTitle : q.testTitleEn || q.testTitle}
                            </span>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <div 
                          className="prose prose-slate prose-sm max-w-none text-slate-800 sm:prose-base"
                          dangerouslySetInnerHTML={{ 
                            __html: (isHindi ? q.questionText : q.questionTextEn || q.questionText)
                              .replace(/\n/g, '<br/>')
                              .replace(/(?:\r\n|\r|\n)/g, '<br/>')
                          }} 
                        />
                        
                        {isHindi && q.questionTextEn && (
                          <div className="relative pl-4 border-l-2 border-slate-100 py-1">
                            <p className="text-sm font-bold text-slate-400 italic leading-relaxed tracking-tight">
                              {q.questionTextEn}
                            </p>
                          </div>
                        )}

                        {/* Options Display */}
                        <div className="space-y-3 mt-4">
                          {getParsedOptions(q.options).map((opt: any, idx: number) => {
                            const correctIdx = Number(q.correctAnswer);
                            const isCorrect = !isNaN(correctIdx) && correctIdx === idx;
                            
                            let optionText = opt;
                            if (typeof opt === 'object' && opt !== null) {
                               // Handle object options {text: "...", textEn: "..."}
                               optionText = isHindi 
                                 ? opt.text || opt.textEn || JSON.stringify(opt)
                                 : opt.textEn || opt.text || JSON.stringify(opt);
                            }

                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "relative flex items-center justify-between rounded-xl border-2 p-4 transition-all sm:p-5",
                                  isCorrect 
                                    ? "bg-emerald-50 border-emerald-500 shadow-sm" 
                                    : "bg-white border-slate-100 text-slate-500"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                                      isCorrect
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-slate-300 bg-white text-slate-400"
                                    )}
                                  >
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span
                                    className={cn(
                                      "flex-1 text-sm font-medium leading-relaxed",
                                      isCorrect ? "text-emerald-800" : "text-slate-600"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: optionText }}
                                  />
                                </div>
                                {isCorrect && (
                                  <CheckCircle2 className="ml-3 h-5 w-5 text-emerald-500" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      { (q.explanation || q.explanationEn) && (
                        <div className="mt-4 p-5 sm:p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100/80 relative overflow-hidden group/fact transition-all hover:bg-white hover:shadow-md">
                           <PremiumExplanation 
                             explanation={q.explanation || ''} 
                             explanationEn={q.explanationEn} 
                             language={isHindi ? 'hi' : 'en'}
                             compact={true}
                           />
                        </div>
                      )}
                  </div>
                </Card>
              </motion.div>
            ))}

            {(activeYear === proof.currentYear ? proof.currentQuestions : proof.prevQuestions).length === 0 && (
               <Card className="rounded-[2.5rem] border-dashed border-slate-200 p-12 text-center bg-white/50">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                     <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-slate-400 font-bold">इस साल इस टॉपिक से कोई सवाल नहीं आया।</p>
               </Card>
            )}
          </div>
        </div>

        {/* Final Affirmation */}
        {delta > 0 && activeYear === proof.currentYear && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="mt-12 p-8 rounded-[2.5rem] bg-emerald-900 text-white text-center shadow-2xl relative overflow-hidden group"
           >
              <div className="absolute top-0 right-0 h-32 w-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <Zap className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black mb-2">{isHindi ? 'Explosive Trend Verified' : 'Explosive Trend Verified'}</h3>
              <p className="text-emerald-100 font-medium mb-6">
                 {isHindi 
                   ? `यह ${delta} अतिरिक्त सवाल दिखाते हैं कि आयोग इस विषय पर आक्रामक हो रहा है। इसे बिल्कुल मिस न करें!`
                   : `These ${delta} extra questions prove the Commission is becoming aggressive on this topic. Don't miss it!`}
              </p>
              <div className="flex justify-center gap-2">
                 <div className="h-1.5 w-12 rounded-full bg-emerald-500"></div>
                 <div className="h-1.5 w-4 rounded-full bg-emerald-700"></div>
                 <div className="h-1.5 w-4 rounded-full bg-emerald-700"></div>
              </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
