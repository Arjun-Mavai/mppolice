'use client';

import type { ReactNode } from 'react';
import {
  parseExplanationStream,
  parseQuestionExtendedData,
} from '@/lib/mppolice/explanation-schema';
import type { ExplanationExtended } from '@/lib/mppolice/explanation-schema';
import {
  Lightbulb,
  ListOrdered,
  Sparkles,
  GraduationCap,
  Route,
  BookOpen,
  AlertOctagon,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  extendedData: unknown;
  explanation?: string | null;
  explanationEn?: string | null;
  isHi: boolean;
}

function pickArr(isHi: boolean, hi: string[], en?: string[]): string[] {
  if (!isHi && en && en.length > 0) return en;
  return hi;
}

function pickStr(isHi: boolean, hi: string | undefined, en?: string | undefined): string | undefined {
  if (!isHi && en && en.trim()) return en;
  return hi;
}

/** UI chrome — not from JSON; sets “human tutor” expectation */
const FRAMING = {
  math: {
    hi: 'नीचे हर चरण अलग से लिखा है — जैसे कोई शिक्षक बोर्ड पर समझाता है। एक-एक करके पढ़ो।',
    en: 'Each step is spelled out like a tutor at the board — read slowly, in order.',
  },
  reasoning: {
    hi: 'पहले सोच का सिलसिला, फिर नियम, फिर गलत विकल्प क्यों कटते हैं — ऐसे ही एग्जाम में दिमाग चलाना है।',
    en: 'We walk the logic first, name the pattern, then show why wrong options fail — that’s how to think in the exam.',
  },
  gk: {
    hi: 'सिर्फ याद नहीं — समझ भी। तथ्य + याद रखने का तरीका + आगे क्या पढ़ना है, सब यहीं है।',
    en: 'Not just facts — context + how to remember + what to revise next, in one place.',
  },
} as const;

function SectionTitle({
  icon,
  label,
  className,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-2 flex items-center gap-2', className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/[0.04]">
        {icon}
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.18em]">{label}</span>
    </div>
  );
}

function renderMath(stream: Extract<ExplanationExtended, { stream: 'math_quant' }>, isHi: boolean) {
  const steps = pickArr(isHi, stream.steps, stream.stepsEn);
  const frame = isHi ? FRAMING.math.hi : FRAMING.math.en;

  return (
    <div
      className={cn(
        'mt-3 overflow-hidden rounded-2xl border shadow-sm',
        'border-indigo-200/70 bg-gradient-to-b from-indigo-50/90 via-white to-violet-50/40'
      )}
    >
      <div className="border-b border-indigo-100/90 bg-indigo-500/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-indigo-900">
          <GraduationCap className="h-5 w-5 shrink-0 text-indigo-600" />
          <span className="text-xs font-black uppercase tracking-widest text-indigo-800">
            {isHi ? 'गणित · सरल कदम' : 'Math · gentle steps'}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-700 sm:text-sm">{frame}</p>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <SectionTitle
          icon={<ListOrdered className="h-3.5 w-3.5 text-indigo-600" />}
          label={isHi ? 'चरण दर चरण' : 'Step by step'}
          className="text-indigo-800"
        />
        <div className="space-y-2.5">
          {steps.map((s, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-xl border border-indigo-100/80 bg-white/95 px-3 py-2.5 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:px-4 sm:py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-sm">
                {i + 1}
              </span>
              <p className="min-w-0 flex-1 text-[13px] leading-[1.55] text-slate-800 sm:text-[14px]">{s}</p>
            </div>
          ))}
        </div>

        {pickStr(isHi, stream.shortcut, stream.shortcutEn) && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<Sparkles className="h-3.5 w-3.5 text-emerald-600" />}
              label={isHi ? 'शॉर्टकट (जल्दी करने का तरीका)' : 'Shortcut (exam speed)'}
              className="text-emerald-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-emerald-950 sm:text-[14px]">
              {pickStr(isHi, stream.shortcut, stream.shortcutEn)}
            </p>
          </div>
        )}

        {pickStr(isHi, stream.trap, stream.trapEn) && (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<AlertOctagon className="h-3.5 w-3.5 text-rose-600" />}
              label={isHi ? 'यहाँ फंसते हैं (धोखा)' : 'Where students slip (trap)'}
              className="text-rose-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-rose-950 sm:text-[14px]">
              {pickStr(isHi, stream.trap, stream.trapEn)}
            </p>
          </div>
        )}

        {pickStr(isHi, stream.memoryTip, stream.memoryTipEn) && (
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<Lightbulb className="h-3.5 w-3.5 text-sky-600" />}
              label={isHi ? 'याद रखने की ट्रिक' : 'Memory hook'}
              className="text-sky-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-sky-950 sm:text-[14px]">
              {pickStr(isHi, stream.memoryTip, stream.memoryTipEn)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderReasoning(stream: Extract<ExplanationExtended, { stream: 'reasoning' }>, isHi: boolean) {
  const chain = pickArr(isHi, stream.chain, stream.chainEn);
  const frame = isHi ? FRAMING.reasoning.hi : FRAMING.reasoning.en;

  return (
    <div
      className={cn(
        'mt-3 overflow-hidden rounded-2xl border shadow-sm',
        'border-violet-200/70 bg-gradient-to-b from-violet-50/90 via-white to-fuchsia-50/30'
      )}
    >
      <div className="border-b border-violet-100/90 bg-violet-500/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-violet-950">
          <GitBranch className="h-5 w-5 shrink-0 text-violet-600" />
          <span className="text-xs font-black uppercase tracking-widest text-violet-900">
            {isHi ? 'तर्क · सोच का रास्ता' : 'Reasoning · how to think'}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-700 sm:text-sm">{frame}</p>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <SectionTitle
            icon={<Route className="h-3.5 w-3.5 text-violet-600" />}
            label={isHi ? 'सोच का सिलसिला' : 'Chain of thought'}
            className="text-violet-900"
          />
          <div className="relative space-y-0 border-l-2 border-violet-200 pl-4">
            {chain.map((s, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500 shadow-sm" />
                <p className="text-[13px] leading-[1.55] text-slate-800 sm:text-[14px]">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {pickStr(isHi, stream.pattern, stream.patternEn) && (
          <div className="rounded-xl border border-violet-200/70 bg-white/95 p-3 sm:p-4">
            <SectionTitle
              icon={<Sparkles className="h-3.5 w-3.5 text-violet-600" />}
              label={isHi ? 'पैटर्न / नियम' : 'Pattern / rule'}
              className="text-violet-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-slate-800 sm:text-[14px]">
              {pickStr(isHi, stream.pattern, stream.patternEn)}
            </p>
          </div>
        )}

        {pickStr(isHi, stream.elimination, stream.eliminationEn) && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 sm:p-4">
            <SectionTitle
              icon={<AlertOctagon className="h-3.5 w-3.5 text-amber-700" />}
              label={isHi ? 'गलत विकल्प क्यों कटते हैं' : 'Why wrong options fail'}
              className="text-amber-950"
            />
            <p className="text-[13px] font-medium leading-relaxed text-amber-950 sm:text-[14px]">
              {pickStr(isHi, stream.elimination, stream.eliminationEn)}
            </p>
          </div>
        )}

        {pickStr(isHi, stream.memoryTip, stream.memoryTipEn) && (
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<Lightbulb className="h-3.5 w-3.5 text-sky-600" />}
              label={isHi ? 'अगली बार याद रखना' : 'Quick recall next time'}
              className="text-sky-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-sky-950 sm:text-[14px]">
              {pickStr(isHi, stream.memoryTip, stream.memoryTipEn)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function renderGk(stream: Extract<ExplanationExtended, { stream: 'gk_science' }>, isHi: boolean) {
  const facts = pickArr(isHi, stream.facts, stream.factsEn);
  const mnemonics = pickArr(isHi, stream.mnemonics ?? [], stream.mnemonicsEn);
  const related = pickArr(isHi, stream.related ?? [], stream.relatedEn);
  const frame = isHi ? FRAMING.gk.hi : FRAMING.gk.en;

  return (
    <div
      className={cn(
        'mt-3 overflow-hidden rounded-2xl border shadow-sm',
        'border-amber-200/70 bg-gradient-to-b from-amber-50/80 via-white to-orange-50/25'
      )}
    >
      <div className="border-b border-amber-100/90 bg-amber-500/[0.08] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-amber-950">
          <BookOpen className="h-5 w-5 shrink-0 text-amber-700" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-950">
            {isHi ? 'GK / GS · समझ के साथ' : 'GK / GS · with context'}
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-700 sm:text-sm">{frame}</p>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <SectionTitle
            icon={<ListOrdered className="h-3.5 w-3.5 text-amber-700" />}
            label={isHi ? 'मुख्य बातें (एक-एक करके)' : 'Main points (one by one)'}
            className="text-amber-950"
          />
          <ul className="space-y-2">
            {facts.map((s, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-xl border border-amber-100/90 bg-white/95 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500 text-[11px] font-black text-white">
                  ✓
                </span>
                <span className="text-[13px] leading-[1.55] text-slate-800 sm:text-[14px]">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {mnemonics.length > 0 && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<Sparkles className="h-3.5 w-3.5 text-amber-700" />}
              label={isHi ? 'दिमाग में बैठ जाए (हुक)' : 'Sticky hooks (mnemonics)'}
              className="text-amber-950"
            />
            <ul className="list-disc space-y-1.5 pl-5 text-[13px] font-medium leading-relaxed text-amber-950 sm:text-[14px]">
              {mnemonics.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {related.length > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 sm:p-4">
            <SectionTitle
              icon={<Route className="h-3.5 w-3.5 text-slate-600" />}
              label={isHi ? 'आगे ये भी देख लो' : 'Also revise'}
              className="text-slate-700"
            />
            <p className="text-[13px] leading-relaxed text-slate-700 sm:text-[14px]">{related.join(' · ')}</p>
          </div>
        )}

        {pickStr(isHi, stream.memoryTip, stream.memoryTipEn) && (
          <div className="rounded-xl border border-sky-200/80 bg-sky-50/90 p-3 sm:p-4">
            <SectionTitle
              icon={<Lightbulb className="h-3.5 w-3.5 text-sky-600" />}
              label={isHi ? 'एग्जाम वाली टिप' : 'Exam-day tip'}
              className="text-sky-900"
            />
            <p className="text-[13px] font-medium leading-relaxed text-sky-950 sm:text-[14px]">
              {pickStr(isHi, stream.memoryTip, stream.memoryTipEn)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function StructuredExplanationBlock({
  extendedData,
  explanation,
  explanationEn,
  isHi,
}: Props) {
  const ext = parseQuestionExtendedData(extendedData);
  let stream = parseExplanationStream(ext?.explanation);
  if (
    !stream &&
    extendedData &&
    typeof extendedData === 'object' &&
    'explanation' in extendedData
  ) {
    stream = parseExplanationStream((extendedData as Record<string, unknown>).explanation);
  }

  if (!stream && !explanation && !explanationEn) return null;

  const plain = isHi ? explanation : explanationEn || explanation || '';

  if (!stream) {
    if (!plain) return null;
    return (
      <div className="mt-3 border-t pt-2 text-xs text-slate-600">
        <span className="mb-1 block font-semibold">Explanation:</span>
        {plain}
      </div>
    );
  }

  if (stream.stream === 'math_quant') {
    return renderMath(stream, isHi);
  }

  if (stream.stream === 'reasoning') {
    return renderReasoning(stream, isHi);
  }

  if (stream.stream === 'gk_science') {
    return renderGk(stream, isHi);
  }

  return null;
}
