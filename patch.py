import sys

with open("src/app/syllabus/quiz/revision/gk-one-liners/OneLinersModernClient.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import { QuickFeedback } from '@/components/QuickFeedback';",
    "import { QuickFeedback } from '@/components/QuickFeedback';\nimport { Languages } from 'lucide-react';"
)

# 2. Add BilingualToggleText & update renderWithLineBreaks
old_render = """const renderWithLineBreaks = (text: string | undefined) => {
  if (!text) return null;
  const lines = text.replace(/([,|])\s*/g, '$1\\n').split('\\n');
  return (
    <>
      {lines.map((line, i) => line.trim() ? (
        <span key={i} className={i > 0 ? "block mt-1" : ""}>
          {line.trim()}
        </span>
      ) : null)}
    </>
  );
};"""

new_render = """const renderWithLineBreaks = (text: string | undefined) => {
  if (!text) return null;
  const lines = text.replace(/([,\|।])\s*/g, '$1\\n').replace(/(\.)\s+/g, '$1\\n').split('\\n');
  return (
    <>
      {lines.map((line, i) => line.trim() ? (
        <span key={i} className={i > 0 ? "block mt-1.5" : ""}>
          {line.trim()}
        </span>
      ) : null)}
    </>
  );
};

function BilingualToggleText({ text, isHindi }: { text: string | undefined; isHindi: boolean }) {
  const React = require('react');
  const [showAlt, setShowAlt] = React.useState(false);
  if (!text) return null;

  let hindiPart = text;
  let englishPart = '';

  const match = text.match(/^(.*?)[ \\t]*[\\(\\/][ \\t]*(.*?)[ \\t]*[\\)]?$/);
  if (match) {
    const part1 = match[1].trim();
    const part2 = match[2].trim();
    if (/[\\u0900-\\u097F]/.test(part1)) {
      hindiPart = part1;
      englishPart = part2;
    } else {
      hindiPart = part2;
      englishPart = part1;
    }
  } else if (text.includes(' / ')) {
    const parts = text.split(' / ');
    if (parts.length === 2) {
      hindiPart = parts[0];
      englishPart = parts[1];
    }
  }

  const clean = (s: string) => {
    let res = s;
    res = res.replace(/^[\\s\\S]*?\\[.*?\\].*?\\s*/, '');
    res = res.replace(/^(Explanation in Hindi|Explanation in English|Hindi|English|Hinglish|In Hindi|In English)[):\]\\s]*\\s*/i, '');
    return res.trim();
  };
  
  hindiPart = clean(hindiPart);
  englishPart = clean(englishPart);

  if (!englishPart) {
    return <>{renderWithLineBreaks(hindiPart)}</>;
  }

  const primaryText = isHindi ? hindiPart : englishPart;
  const altText = isHindi ? englishPart : hindiPart;
  const altLabel = isHindi ? 'A/अ See in English' : 'A/अ हिंदी में देखें';

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="w-full">
         {renderWithLineBreaks(showAlt ? altText : primaryText)}
      </div>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAlt(!showAlt); }}
        className="mt-1 flex items-center gap-1.5 rounded-full bg-slate-100/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 active:scale-95"
      >
        <Languages size={12} />
        {showAlt ? (isHindi ? 'Back to Hindi' : 'Back to English') : altLabel}
      </button>
    </div>
  );
}"""
content = content.replace(old_render, new_render)

# 3. Format Bilingual remove prefixes
content = content.replace('// Strip [Category] tags at the beginning (e.g. "[मध्य प्रदेश का इतिहास]")\n  result = result.replace(/^\[.*?\]\s*/, \'\');\n  \n  // Remove common AI prefixes like "Hindi):" or "Explanation in Hindi:"\n  result = result.replace(/^(Explanation in Hindi|Explanation in English|Hindi|English|Hinglish|In Hindi|In English)[):\]\s]*\s*/i, \'\');', 'result = result.replace(/^\[.*?\]\s*/, \'\');\n  result = result.replace(/^(Explanation in Hindi|Explanation in English|Hindi|English|Hinglish|In Hindi|In English)[):\]\s]*\s*/i, \'\');')

# 4. Header UI
old_header = """<button
                           onClick={() => toggleExpand(f.id)}
                           className="flex w-full items-start gap-4 p-5 text-left sm:p-7"
                         >
                           <span className={cn(
                             "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-inner",
                             "bg-white",
                             color.text
                           )}>
                             {globalIdx}
                           </span>
                           <div className="min-w-0 flex-1">
                             <p className="text-[17px] font-bold leading-relaxed text-slate-900 sm:text-lg">
                               {formatBilingual(hi ? f.stemHi : f.stemEn || f.stemHi, hi)}
                             </p>
                             
                             <motion.p 
                               className={cn("mt-2 text-lg font-black sm:text-xl", color.text)}
                             >
                               {formatBilingual(hi ? f.answerHi : f.answerEn || f.answerHi, hi)}
                             </motion.p>

                             <div className="flex flex-wrap items-center gap-3 mt-4">
                               {activeSubject === 'All' && (
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">{f.subjectTag}</span>
                               )}
                               {revCount > 0 && (
                                 <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                   <CheckCircle2 size={10} />
                                   {revCount} {hi ? 'रिवीजन' : 'Revised'}
                                 </span>
                               )}
                               <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">
                                 {isExpanded ? (hi ? 'कम विवरण' : 'Less') : (hi ? 'विवरण' : 'Details')}
                               </span>
                             </div>
                           </div>
                           <span className="shrink-0 text-slate-300 mt-2">
                             {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                           </span>
                         </button>"""

new_header = """<button
                           onClick={() => toggleExpand(f.id)}
                           className="flex flex-col w-full items-start gap-2 px-3 py-3.5 sm:p-4 text-left relative"
                         >
                           <span className={cn(
                             "inline-flex items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                             color.text
                           )}>
                             Q{globalIdx}
                           </span>
                           <div className="min-w-0 flex-1 w-full mt-1">
                             <div className="text-[15px] font-bold leading-relaxed text-slate-900 sm:text-[16px]">
                               {renderWithLineBreaks(formatBilingual(hi ? f.stemHi : f.stemEn || f.stemHi, hi))}
                             </div>
                             
                             <div 
                               className={cn("mt-1.5 text-[16px] font-black sm:text-[17px]", color.text)}
                             >
                               {renderWithLineBreaks(formatBilingual(hi ? f.answerHi : f.answerEn || f.answerHi, hi))}
                             </div>

                             <div className="flex flex-wrap items-center gap-3 mt-4">
                               {activeSubject === 'All' && (
                                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">{f.subjectTag}</span>
                               )}
                               {revCount > 0 && (
                                 <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                   <CheckCircle2 size={10} />
                                   {revCount} {hi ? 'रिवीजन' : 'Revised'}
                                 </span>
                               )}
                               <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/60 px-2 py-0.5 rounded-md">
                                 {isExpanded ? (hi ? 'कम विवरण' : 'Less') : (hi ? 'विवरण' : 'Details')}
                               </span>
                             </div>
                           </div>
                           <span className="absolute top-4 right-4 shrink-0 text-slate-400/50 group-hover:text-slate-400 transition-colors">
                             {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                           </span>
                         </button>"""

content = content.replace(old_header, new_header)

# 5. Expandable Area Fixes
content = content.replace('<div className="p-5 sm:p-8 space-y-6">', '<div className="p-4 sm:p-5 space-y-5">')
content = content.replace('className="rounded-[1.5rem]', 'className="rounded-xl')

content = content.replace(
    """<p className="text-[14px] leading-relaxed font-bold text-rose-900/80">\n                                              {formatBilingual((hi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi)?.replace(/^⚠️\s*एग्जामिनर ट्रैप.*?:?\s*/i, ''), hi)}\n                                            </p>""",
    """<div className="text-[14px] leading-relaxed font-bold text-rose-900/80">\n                                              <BilingualToggleText text={(hi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi)?.replace(/^⚠️\s*एग्जामिनर ट्रैप.*?:?\s*/i, '')} isHindi={hi} />\n                                            </div>"""
)

content = content.replace(
    """<p className="text-[14px] font-bold text-amber-900 leading-relaxed italic">\n                                             {formatBilingual((hi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip)?.replace(/^🧠\s*मेमोरी ट्रिक.*?:?\s*/i, ''), hi)}\n                                           </p>""",
    """<div className="text-[14px] font-bold text-amber-900 leading-relaxed italic">\n                                             <BilingualToggleText text={(hi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip)?.replace(/^🧠\s*मेमोरी ट्रिक.*?:?\s*/i, '')} isHindi={hi} />\n                                           </div>"""
)

content = content.replace(
    """<p className="text-[14px] leading-relaxed font-bold text-sky-900/80">\n                                               {formatBilingual(hi ? f.extendedData.analogy : f.extendedData.analogyEn || f.extendedData.analogy, hi)}\n                                             </p>""",
    """<div className="text-[14px] leading-relaxed font-bold text-sky-900/80">\n                                               <BilingualToggleText text={hi ? f.extendedData.analogy : f.extendedData.analogyEn || f.extendedData.analogy} isHindi={hi} />\n                                             </div>"""
)

content = content.replace('उ. {formatBilingual(pyq.answer, hi)}', '{formatBilingual(pyq.answer, hi)}')

# 6. Reorder Explanation and Trick
# We will just swap their positions
trap_block = """{(f.extendedData.explanationHi || f.extendedData.explanationEn) && (
                                         <div className="rounded-xl bg-rose-50/50 p-5 border border-rose-100">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Info className="h-4 w-4 text-rose-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Examiner Trap</span>
                                            </div>
                                            <div className="text-[14px] leading-relaxed font-bold text-rose-900/80">
                                              <BilingualToggleText text={(hi ? f.extendedData.explanationHi : f.extendedData.explanationEn || f.extendedData.explanationHi)?.replace(/^⚠️\s*एग्जामिनर ट्रैप.*?:?\s*/i, '')} isHindi={hi} />
                                            </div>
                                         </div>
                                       )}"""
trick_block = """{f.extendedData.memoryTip && (
                                         <div className="group rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 shadow-inner">
                                           <div className="flex items-center gap-2 mb-2">
                                              <Sparkles className="h-4 w-4 text-amber-500" />
                                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">{hi ? 'ट्रिक' : 'Trick'}</span>
                                           </div>
                                           <div className="text-[14px] font-bold text-amber-900 leading-relaxed italic">
                                             <BilingualToggleText text={(hi ? f.extendedData.memoryTip : f.extendedData.memoryTipEn || f.extendedData.memoryTip)?.replace(/^🧠\s*मेमोरी ट्रिक.*?:?\s*/i, '')} isHindi={hi} />
                                           </div>
                                         </div>
                                       )}"""

content = content.replace(trap_block, "TRAP_PLACEHOLDER")
content = content.replace(trick_block, trap_block)
content = content.replace("TRAP_PLACEHOLDER", trick_block)


with open("src/app/syllabus/quiz/revision/gk-one-liners/OneLinersModernClient.tsx", "w") as f:
    f.write(content)

