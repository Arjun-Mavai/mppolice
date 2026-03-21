'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  FileText,
  ShieldCheck,
  Target,
  AlertCircle,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import type { YearlySubjectQuestions } from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

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

export default function YearlyProofClient({ data }: { data: YearlySubjectQuestions }) {
  const router = useRouter();
  const { language, setLanguage } = useSettingsStore();
  const isHindi = language === 'hi';

  return (
    <div className="min-h-screen bg-[#FDFEFE]/40 pb-20 relative overflow-hidden">
      {/* Apple-style background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-100/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-5%] h-[400px] w-[400px] rounded-full bg-pink-100/10 blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 relative z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="group mb-8 rounded-full bg-white/50 hover:bg-white shadow-sm border border-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {isHindi ? 'वापस जाएं' : 'Back'}
        </Button>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 space-y-4">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <div className="space-y-4 text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10">
                   <Calendar className="h-3.5 w-3.5 text-slate-400" />
                   {data.year} {isHindi ? 'के सभी प्रश्न' : 'Questions List'} — Verified
               </div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">{data.subject}</h1>
               <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                 <ShieldCheck className="h-5 w-5 text-emerald-500" />
                 <p className="text-lg font-black text-slate-500">
                   {isHindi 
                     ? `Checkout Questions (${data.questions.length})`
                     : `Checkout Questions (${data.questions.length})`}
                 </p>
               </div>
             </div>

             <Button
               variant="outline"
               size="sm"
               onClick={() => setLanguage(isHindi ? 'en' : 'hi')}
               className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm bg-white self-center sm:self-start"
             >
               {isHindi ? 'English' : 'हिंदी'}
             </Button>
           </div>
           
           <div className="p-5 rounded-[2rem] backdrop-blur-3xl bg-white/40 border border-white/50 flex items-start gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.03)] saturate-150 relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay pointer-events-none" />
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-black text-amber-900 leading-relaxed uppercase tracking-tight relative z-10">
                 {isHindi 
                   ? "हमने यहाँ केवल Unique प्रश्न दिखाए हैं। यदि कोई प्रश्न एकाधिक टॉपिक्स में आता है, तो वह यहाँ एक ही बार दिखेगा।"
                   : "Unique questions only. Multi-topic questions are shown once for perfect accuracy."}
              </p>
           </div>
        </motion.div>

        <div className="grid gap-4">
           {data.questions.map((q, i) => (
              <Card key={q.id} className="rounded-[2rem] border border-slate-200/60 bg-white p-6 pt-14 shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="absolute top-5 left-6 flex h-7 px-3 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-black text-white shadow-lg shadow-slate-900/20">
                    Q.{q.questionOrder}
                  </div>
                  
                  <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2 border-b border-slate-50 pb-3">
                         <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-blue-100 bg-blue-50 text-blue-600 rounded-lg py-0.5">
                            {q.topicTitle}
                         </Badge>
                         <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                            <Target className="h-3 w-3 text-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                               {q.testTitle}
                            </span>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[1.1rem] font-black text-slate-800 leading-[1.6] [text-shadow:1px_1px_2px_rgba(0,0,0,0.15)] selection:bg-blue-100 italic">
                          {isHindi ? q.questionText : q.questionTextEn || q.questionText}
                        </p>
                        
                        {isHindi && q.questionTextEn && (
                          <div className="relative pl-4 border-l-2 border-slate-100 py-1">
                            <p className="text-sm font-bold text-slate-400 italic leading-relaxed tracking-tight [text-shadow:1px_1px_1px_rgba(0,0,0,0.05)]">
                              {q.questionTextEn}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Options Display */}
                      <div className="space-y-3 mt-2">
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
                               <div className="flex items-center gap-4">
                                  <div className={cn(
                                     "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                                     isCorrect 
                                       ? "border-emerald-500 bg-emerald-500 text-white" 
                                       : "border-slate-200 text-slate-400"
                                  )}>
                                     {String.fromCharCode(65 + idx)}
                                  </div>
                                  <span className={cn(
                                    "text-base sm:text-lg leading-relaxed",
                                    isCorrect ? "font-bold text-emerald-900" : "font-medium"
                                  )}>
                                    {optionText}
                                  </span>
                               </div>
                               
                               {isCorrect && (
                                 <div className="shrink-0">
                                   <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow-sm">
                                      <CheckCircle2 className="h-4 w-4 text-white" />
                                   </div>
                                 </div>
                               )}
                            </div>
                          );
                        })}
                      </div>

                      { (q.explanation || q.explanationEn) && (
                        <div className="mt-4 p-4 sm:p-5 rounded-[1.5rem] bg-slate-50/50 border border-slate-100/80 relative overflow-hidden group/fact transition-all hover:bg-white hover:shadow-md">
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
           ))}

           {data.questions.length === 0 && (
              <Card className="rounded-[2.5rem] border-dashed border-slate-200 p-20 text-center bg-white/50">
                 <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold italic">कोई सवाल नहीं मिला।</p>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
