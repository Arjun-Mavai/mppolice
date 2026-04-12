'use client';

import {
  parseExplanationStream,
  parseQuestionExtendedData,
} from '@/lib/mppolice/explanation-schema';
import { Lightbulb, ListOrdered, Sparkles } from 'lucide-react';

interface Props {
  extendedData: unknown;
  explanation?: string | null;
  explanationEn?: string | null;
  isHi: boolean;
}

export function StructuredExplanationBlock({
  extendedData,
  explanation,
  explanationEn,
  isHi,
}: Props) {
  const ext = parseQuestionExtendedData(extendedData);
  const stream =
    parseExplanationStream(ext?.explanation) ??
    parseExplanationStream(extendedData);

  if (!stream && !explanation && !explanationEn) return null;

  const plain = isHi
    ? explanation
    : explanationEn || explanation || '';

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
    return (
      <div className="mt-3 space-y-2 border-t pt-3 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-indigo-800">
          <ListOrdered className="h-4 w-4" />
          {isHi ? 'चरण-दर-चरण' : 'Step-by-step'}
        </div>
        <ol className="list-decimal space-y-1 pl-5">
          {stream.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {stream.shortcut && (
          <p className="rounded-lg bg-emerald-50 p-2 text-emerald-900">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />
            <span className="font-semibold">{isHi ? 'शॉर्टकट: ' : 'Shortcut: '}</span>
            {stream.shortcut}
          </p>
        )}
        {stream.trap && (
          <p className="rounded-lg bg-rose-50 p-2 text-rose-900">
            <span className="font-semibold">{isHi ? 'धोखा: ' : 'Trap: '}</span>
            {stream.trap}
          </p>
        )}
        {stream.memoryTip && (
          <p className="rounded-lg bg-blue-50 p-2 text-blue-900">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
            {stream.memoryTip}
          </p>
        )}
      </div>
    );
  }

  if (stream.stream === 'reasoning') {
    return (
      <div className="mt-3 space-y-2 border-t pt-3 text-xs text-slate-700">
        <div className="font-semibold text-indigo-800">
          {isHi ? 'तर्क श्रृंखला' : 'Reasoning chain'}
        </div>
        <ul className="list-disc space-y-1 pl-5">
          {stream.chain.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        {stream.pattern && (
          <p className="text-slate-600">
            <span className="font-semibold">{isHi ? 'पैटर्न: ' : 'Pattern: '}</span>
            {stream.pattern}
          </p>
        )}
        {stream.elimination && (
          <p className="text-slate-600">
            <span className="font-semibold">{isHi ? 'इलिमिनेशन: ' : 'Elimination: '}</span>
            {stream.elimination}
          </p>
        )}
        {stream.memoryTip && (
          <p className="rounded-lg bg-blue-50 p-2 text-blue-900">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
            {stream.memoryTip}
          </p>
        )}
      </div>
    );
  }

  if (stream.stream === 'gk_science') {
    return (
      <div className="mt-3 space-y-2 border-t pt-3 text-xs text-slate-700">
        <div className="font-semibold text-amber-900">
          {isHi ? 'महत्वपूर्ण तथ्य' : 'Key facts'}
        </div>
        <ul className="list-disc space-y-1 pl-5">
          {stream.facts.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
        {stream.mnemonics && stream.mnemonics.length > 0 && (
          <div className="rounded-lg bg-amber-50 p-2 text-amber-950">
            <span className="font-semibold">{isHi ? 'याद रखें: ' : 'Mnemonics: '}</span>
            {stream.mnemonics.join(' · ')}
          </div>
        )}
        {stream.related && stream.related.length > 0 && (
          <p className="text-slate-500">
            <span className="font-semibold">{isHi ? 'संबंधित: ' : 'Related: '}</span>
            {stream.related.join(', ')}
          </p>
        )}
        {stream.memoryTip && (
          <p className="rounded-lg bg-blue-50 p-2 text-blue-900">
            <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
            {stream.memoryTip}
          </p>
        )}
      </div>
    );
  }

  return null;
}
