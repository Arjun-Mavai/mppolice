import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, FileText, CheckCircle2, Sparkles, Lightbulb, X, RefreshCw, Lock } from "lucide-react";
import { TopicData } from "@/app/syllabus/[unitId]/UnitContent";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useEffect, useState, useTransition } from "react";
import { getRevisionCount, markTopicRevised } from "@/features/syllabus/actions/revision";
import { useSettingsStore } from "@/store/useSettingsStore";
import { logger } from "@/lib/logger";

interface SyllabusTopicSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: TopicData | null;
  unitTitle: string;
  unitId: string;
  language?: 'hi' | 'en';
}

export function SyllabusTopicSheet({
  open,
  onOpenChange,
  topic,
  unitTitle,
  unitId,
  language = 'hi'
}: SyllabusTopicSheetProps) {

  // Apun user ko store se utha raha — guest check ke liye
  const { user } = useSettingsStore();
  const [revisionCount, setRevisionCount] = useState<number | undefined>(0);
  const [isPending, startTransition] = useTransition();
  const [isRevising, setIsRevising] = useState(false);

  // Jab sheet khule aur topic ho, tabhi revision count fetch kar — guest ke liye skip
  useEffect(() => {
     if (open && topic && user) {
         getRevisionCount(topic.id.toString()).then(count => {
             logger.debug("Fetched revision count:", count);
             setRevisionCount(count);
         });
     } else {
         setRevisionCount(0);
     }
  }, [open, topic, user]);

  const handleMarkRevised = () => {
      // Guest user? — premium feature batao, API call mat karo
      if (!user) {
          toast.info(
              language === 'hi' 
                  ? 'रिवीज़न ट्रैकिंग प्रीमियम फीचर है — लॉगिन करें!' 
                  : 'Revision tracking is a premium feature — please login!',
              { duration: 3000 }
          );
          return;
      }
      if (!topic || isRevising) return;
      setIsRevising(true);
      const targetUnitId = unitId || topic.unitId;
      logger.debug("Marking revised:", topic.id, targetUnitId);
      
      startTransition(async () => {
          try {
              const res = await markTopicRevised(topic.id.toString(), targetUnitId);
              if (res.success && res.count) {
                  setRevisionCount(res.count);
                  toast.success(language === 'hi' ? 'पुनरीक्षण दर्ज किया गया!' : 'Revision recorded!');
              } else {
                  toast.error(res.error || "Failed to save revision");
              }
          } catch {
              toast.error("Failed to save revision");
          } finally {
              setTimeout(() => setIsRevising(false), 1000);
          }
      });
  };

  // Revision Button — guest ke liye lock icon, logged user ke liye proper count
  const RevisionButton = () => (
    <div className="flex items-center gap-3">
        {/* Revision count — proper counter badge feel, sirf logged user ko dikhao */}
        {user && revisionCount !== undefined && revisionCount > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm font-black text-emerald-700 tabular-nums">{revisionCount}</span>
                <span className="text-[10px] text-emerald-500 font-medium">
                    {revisionCount === 1 
                        ? (language === 'hi' ? 'बार' : 'time') 
                        : (language === 'hi' ? 'बार' : 'times')}
                </span>
            </div>
        )}
        <Button 
            size="sm"
            onClick={handleMarkRevised}
            disabled={isPending || isRevising}
            className={cn(
                "rounded-full font-bold transition-all items-center gap-2 text-xs h-9 px-4 shadow-md hover:shadow-lg active:scale-95",
                !user
                    ? "bg-slate-200 text-slate-500 hover:bg-slate-300 border border-slate-300"
                    : revisionCount && revisionCount > 0 
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 border-0"
                        : "bg-slate-900 text-white hover:bg-slate-800"
            )}
        >
            {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : !user ? <Lock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-4 h-4" />}
            {language === 'hi' ? 'रिवाइज्ड' : 'Mark Revised'} 
        </Button>
    </div>
  );

  if (!topic) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="right" className="w-full sm:w-[540px] sm:max-w-none p-0 border-l border-slate-200 shadow-2xl outline-none" showCloseButton={false}>
        <div className="sr-only">
          <SheetTitle>{topic.front}</SheetTitle>
        </div>
        <div className="h-full flex flex-col bg-slate-50">
          
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-slate-200 bg-white sticky top-0 z-20 flex flex-col gap-4 shadow-sm">
             {/* Top Row: Unit Badge + Close */}
             <div className="flex items-center justify-between">
                 <Badge variant="outline" className="text-slate-500 border-slate-200 font-medium truncate max-w-[200px]">
                    {unitTitle}
                 </Badge>
                 
                 <div className="flex items-center gap-2">
                     {/* Removed Button from here */}
                     <SheetClose asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors">
                             <X className="w-4 h-4" />
                         </Button>
                     </SheetClose>
                 </div>
             </div>

             <div>
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-display tracking-tight">
                    {topic.front}
                    </h2>
                     {topic.mnemonic && (
                        <div className="shrink-0">
                             <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100" title="Mnemonic Available">
                                <Lightbulb className="w-5 h-5 fill-amber-600/20" />
                             </div>
                        </div>
                    )}
                </div>
                <p className="mt-2 text-slate-600 font-medium leading-relaxed border-l-4 border-slate-400 pl-4 py-1 bg-slate-50/50 rounded-r-lg text-sm sm:text-base">
                    {topic.back}
                </p>
             </div>
          </div>


          <ScrollArea className="h-[calc(100vh-200px)] flex-1 p-0 w-full">
            <div className="p-5 md:p-6 space-y-8 pb-32">
              
               {/* 1. Mnemonic Section (If available) */}
               {topic.mnemonic ? (
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm uppercase tracking-wider">
                            <Brain className="w-4 h-4" /> {language === 'hi' ? 'याद रखने की ट्रिक' : 'Memory Trick'}
                        </div>
                        <RevisionButton />
                     </div>
                     <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Brain className="w-24 h-24" />
                        </div>
                        <h4 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-1.5 opacity-80">MNEMONIC</h4>
                        <div className="text-xl sm:text-2xl font-black tracking-wide font-mono leading-relaxed">
                           {topic.mnemonic}
                        </div>
                     </div>
                  </div>
               ) : (
                   /* Fallback Button Location if no Mnemonic */
                   <div className="flex justify-end">
                       <RevisionButton />
                   </div>
               )}

               {/* 2. Key Facts (Points) */}
               {topic.important_facts && topic.important_facts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wider">
                     <CheckCircle2 className="w-4 h-4" /> {language === 'hi' ? 'महत्वपूर्ण तथ्य' : 'Key Facts'}
                  </div>
                  <ul className="grid gap-3">
                     {topic.important_facts.map((fact, i) => (
                         <li key={i} className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200/60 items-start hover:border-emerald-200 hover:shadow-md transition-all group">
                             <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform font-bold text-xs ring-4 ring-emerald-50/50">
                                 {i + 1}
                             </div>
                             <span className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">{fact}</span>
                         </li>
                     ))}
                  </ul>
               </div>
               )}

               {/* 3. PYQ Section */}
               {topic.pyq && topic.pyq.length > 0 && (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wider">
                     <FileText className="w-4 h-4" /> {language === 'hi' ? 'विगत वर्षों के प्रश्न' : 'Past Year Questions (PYQs)'}
                  </div>
                  
                  <div className="space-y-4">
                     {topic.pyq.map((item, idx) => (
                         <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-colors">
                             <div className="absolute top-0 right-0 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-bl-xl group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors uppercase tracking-wider">
                                 {item.year || 'PYQ'} • {item.type || 'PRELIMS'}
                             </div>
                             <p className="font-bold text-slate-800 mb-3 pr-8 pt-2 text-base sm:text-lg leading-snug">
                                 "{item.question}"
                             </p>
                             {item.strategy && (
                                <div className="bg-rose-50/50 rounded-lg p-3 text-sm text-slate-700 border border-rose-100 flex gap-3 items-start">
                                    <Sparkles className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-bold text-rose-700 block text-xs uppercase tracking-wide mb-0.5">Strategy / Hint</span>
                                        {item.strategy}
                                    </div>
                                </div>
                             )}
                         </div>
                     ))}
                  </div>
               </div>
               )}

               {/* Fallback if no content */}
               {(!topic.important_facts?.length && !topic.pyq?.length && !topic.mnemonic) && (
                   <div className="py-12 text-center space-y-3 opacity-60">
                       <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                           <Sparkles className="w-8 h-8 text-slate-400" />
                       </div>
                       <p className="text-slate-500 font-medium">Content is being curated by our Team.</p>
                       <p className="text-xs text-slate-400">Check back soon for deep notes on {topic.front}.</p>
                   </div>
               )}

            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
