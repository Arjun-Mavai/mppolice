'use client';

/**
 * MP Police Paper I — explanations match `extendedData.explanation` in uploads:
 * gk_science | reasoning | math_quant (see `explanation-schema.ts`).
 */

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle, Sigma, Link2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function PremiumExplanationSection() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-purple-200 bg-purple-50 px-4 py-1 text-sm text-purple-700"
          >
            {hi ? 'JSON-संरचित व्याख्या' : 'Structured explanation JSON'}
          </Badge>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {hi ? (
              <>
                सिर्फ उत्तर नहीं — <span className="text-slate-700">वही फील्ड्स जो अपलोड में जाते हैं।</span>
              </>
            ) : (
              <>
                More than the key — <span className="text-slate-700">the same fields as your AI uploads.</span>
              </>
            )}
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">
            {hi
              ? 'प्रत्येक MCQ के साथ `explanation` टेक्स्ट + `extendedData.explanation` में stream: gk_science, reasoning, या math_quant — बल्क JSON जैसा ही ढांचा।'
              : 'Each MCQ ships with plain `explanation` text plus `extendedData.explanation` using stream `gk_science`, `reasoning`, or `math_quant` — exactly how bulk uploads are shaped.'}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-slate-700 to-purple-600 opacity-10 blur-xl" />
            <Card className="relative z-10 overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl">
              <div className="border-b border-slate-100 bg-slate-50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold leading-snug text-slate-900">
                    {hi
                      ? 'मध्य प्रदेश की “गंगा” किस नदी को कहा जाता है?'
                      : 'Which river is called the “Ganga of Madhya Pradesh”?'}
                    <br />
                    <span className="mt-1 block text-base font-medium text-slate-500">
                      {hi
                        ? 'उदाहरण: stream — gk_science (facts / mnemonics / related / memoryTip)'
                        : 'Example: stream — gk_science (facts / mnemonics / related / memoryTip)'}
                    </span>
                  </h3>
                  <Badge className="shrink-0 bg-slate-200 text-slate-600 hover:bg-slate-200">GK · Geo</Badge>
                </div>
              </div>

              <div className="space-y-6 p-6 md:p-8">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      {hi ? 'सही विकल्प' : 'Correct option'}
                    </div>
                    <div className="font-bold text-slate-900">Betwa (बेतवा)</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-emerald-500" />
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-700">
                        <CheckCircle2 size={16} /> facts[]
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {hi
                          ? 'प्रदूषण प्रोफाइल गंगा जैसी होने के कारण बेतवा को “म.प्र. की गंगा” कहते हैं।'
                          : 'Pollution parallels with the Ganges earn Betwa the “Ganga of MP” tag.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-amber-500" />
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-amber-700">
                        <Brain size={16} /> mnemonics[]
                      </h4>
                      <p className="rounded-lg border border-amber-100 bg-amber-50 p-2 text-sm italic leading-relaxed text-slate-700">
                        “Betwa = Beta (son) of Raisen” → Kumra Gaon origin cue.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-700">
                        <Link2 size={16} /> related[]
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {hi
                          ? 'नर्मदा = म.प्र. की जीवन रेखा; “गंगा वाला” लेबल बेतवा से जोड़ें, नर्मदा से नहीं।'
                          : 'Narmada = lifeline of MP; keep the “Ganga of MP” label on Betwa, not Narmada.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-red-500" />
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-red-700">
                        <AlertTriangle size={16} /> memoryTip
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {hi
                          ? 'एक ही सवाल में दोनों नदियाँ दे देंगे — पहले पूछो: प्रदूषण टैग या ड्रेनेज टैग?'
                          : 'Traps mix both rivers — ask: is the stem about pollution branding or drainage?'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-10 lg:pt-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">stream: reasoning</h3>
                <p className="leading-relaxed text-slate-600">
                  {hi
                    ? '`chain[]` से स्टेप-बाय-स्टेप लॉजिक, वैकल्पिक `pattern`, `elimination`, और `memoryTip`।'
                    : '`chain[]` walks the logic, with optional `pattern`, `elimination`, and `memoryTip`.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Sigma size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">stream: math_quant</h3>
                <p className="leading-relaxed text-slate-600">
                  {hi
                    ? '`steps[]` में हल के चरण, साथ में `shortcut`, `trap`, और `memoryTip` — सरल अंकगणित लेवल।'
                    : '`steps[]` for working, plus `shortcut`, `trap`, and `memoryTip` at constable arithmetic depth.'}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">stream: gk_science</h3>
                <p className="leading-relaxed text-slate-600">
                  {hi
                    ? '`facts[]` तेज रिवीजन, `mnemonics[]` याद रखने के लिए, `related[]` आस-पास के MCQ के लिए।'
                    : '`facts[]` for rapid revision, `mnemonics[]` to retain, `related[]` to chain similar MCQs.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
