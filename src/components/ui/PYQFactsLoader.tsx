'use client';

import React, { useEffect, useState } from 'react';
import { Brain, BookOpen, Trophy, Zap, Lightbulb, Globe } from 'lucide-react';
import Image from 'next/image';

// ─── Shared facts pool ────────────────────────────────────────────────────────
const FACTS = [
  {
    emoji: '🏆',
    category: 'Current Affairs 2026',
    title: 'BAFTA 2026 – भारत का गर्व',
    hi: 'मणिपुर की फिल्म "Boong" ने BAFTA 2026 में Best Children\'s & Family Film award जीता। यह इस category में जीतने वाली पहली Indian film है।',
    en: 'Manipur\'s "Boong" won BAFTA 2026 Best Children\'s & Family Film — first Indian film in this category. Director: Lakshmipriya Devi.',
    color: 'from-orange-500/20 to-amber-500/20',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-400',
  },
  {
    emoji: '🌊',
    category: 'MP Geography',
    title: 'नर्मदा – MP की जीवन रेखा',
    hi: 'नर्मदा नदी प्रायद्वीपीय भारत की सबसे लंबी पश्चिम-प्रवाहित नदी है। यह अमरकंटक (MP) से निकलकर अरब सागर में मिलती है।',
    en: 'Narmada is the longest west-flowing river of peninsular India, originating from Amarkantak in MP and draining into the Arabian Sea.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/10 text-blue-400',
  },
  {
    emoji: '🚀',
    category: 'Science & Technology',
    title: 'Chandrayaan-3 – World First',
    hi: 'चंद्रयान-3 ने 23 अगस्त 2023 को चंद्रमा के दक्षिणी ध्रुव पर लैंड किया। भारत ऐसा करने वाला विश्व का पहला देश बना।',
    en: 'Chandrayaan-3 landed near Moon\'s South Pole on Aug 23, 2023. India became the FIRST country to achieve this feat.',
    color: 'from-indigo-500/20 to-violet-500/20',
    border: 'border-indigo-500/30',
    badge: 'bg-indigo-500/10 text-indigo-400',
  },
  {
    emoji: '🐯',
    category: 'MP GK',
    title: 'Tiger State of India',
    hi: 'मध्यप्रदेश को "Tiger State of India" कहा जाता है — देश में सबसे अधिक बाघ यहाँ हैं। कान्हा और बांधवगढ़ प्रसिद्ध Tiger Reserves हैं।',
    en: 'MP has the highest tiger population in India and is called "Tiger State". Kanha & Bandhavgarh are famous Project Tiger reserves.',
    color: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    emoji: '⚖️',
    category: 'Indian Polity',
    title: 'संविधान – Key Facts',
    hi: 'भारतीय संविधान 26 जनवरी 1950 को लागू हुआ। यह विश्व का सबसे लंबा लिखित संविधान है। मूल में 395 अनुच्छेद, 22 भाग और 8 अनुसूचियां थीं।',
    en: 'India\'s Constitution came into effect on 26 Jan 1950 — world\'s longest written constitution. Originally: 395 Articles, 22 parts, 8 schedules.',
    color: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/10 text-violet-400',
  },
  {
    emoji: '🌍',
    category: 'International Relations',
    title: 'G20 Summit 2023 – India',
    hi: 'भारत ने 2023 में G20 की अध्यक्षता की। New Delhi Summit का theme था "वसुधैव कुटुम्बकम"। African Union को स्थायी सदस्य बनाया गया।',
    en: 'India held G20 Presidency in 2023. "Vasudhaiva Kutumbakam" was the theme. African Union admitted as permanent G20 member.',
    color: 'from-orange-500/20 to-emerald-500/20', // Tiranga feel
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-400',
  },
  {
    emoji: '🏛️',
    category: 'History – MP',
    title: 'सांची स्तूप – UNESCO Site',
    hi: 'सांची स्तूप अशोक ने तीसरी शताब्दी ईसा पूर्व में बनवाया। यह UNESCO World Heritage Site है और भारत का सबसे बड़ा स्तूप है।',
    en: 'Sanchi Stupa was built by Emperor Ashoka in 3rd century BC. It is a UNESCO World Heritage Site and the largest stupa in India.',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/10 text-rose-400',
  },
  {
    emoji: '📊',
    category: 'Economy',
    title: 'India – 5th Largest Economy',
    hi: 'भारत 2023 में GDP के आधार पर विश्व की 5वीं सबसे बड़ी अर्थव्यवस्था बना। 2047 तक Viksit Bharat बनने का लक्ष्य है।',
    en: 'India surpassed UK to become world\'s 5th largest economy (GDP) in 2023. Viksit Bharat 2047 aims for developed nation status.',
    color: 'from-teal-500/20 to-cyan-500/20',
    border: 'border-teal-500/30',
    badge: 'bg-teal-500/10 text-teal-400',
  },
];

const STEPS = [Brain, BookOpen, Trophy, Zap];
const STEP_LABELS = ['Authenticating...', 'Syncing Portal...', 'Readying Insights...', 'Jai Hind!'];

// ─── Types ────────────────────────────────────────────────────────────────────
interface PYQFactsLoaderProps {
  variant?: 'page' | 'overlay';
  label?: string;
  theme?: 'dark' | 'light';
}

// ─── Splash Component ───────────────────────────────────────────────────────
function SplashContent({ isDark }: { isDark: boolean }) {
  return (
    <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-1000">
      <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-orange-500/50 p-2 shadow-2xl shadow-orange-500/20">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-white/10 to-green-500/20 animate-pulse" />
        <Image
          src="/mp-police-logo.png"
          alt="MP Police Logo"
          width={200}
          height={200}
          className="relative z-10 animate-pulse"
        />
      </div>
      
      <div className="text-center">
        <h2 className={`text-2xl font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
          MP Police <span className="text-orange-500">Elite</span>
        </h2>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="h-1 w-12 bg-orange-500 rounded-full" />
          <div className="h-1 w-12 bg-white rounded-full" />
          <div className="h-1 w-12 bg-green-500 rounded-full" />
        </div>
        <p className={`mt-4 text-sm font-bold tracking-widest uppercase ${isDark ? 'text-orange-400/80' : 'text-orange-600/80'}`}>
          सत्यमेव जयते
        </p>
      </div>
    </div>
  );
}

// ─── Inner fact card (shared between variants) ────────────────────────────────
function FactCard({
  fact,
  visible,
  isDark,
  factIdx,
}: {
  fact: (typeof FACTS)[0];
  visible: boolean;
  isDark: boolean;
  factIdx: number;
}) {
  return (
    <div
      className={`w-full max-w-lg rounded-3xl border bg-gradient-to-br p-px transition-all duration-500 ${fact.border} ${fact.color}`}
    >
      <div
        className={`rounded-[calc(1.5rem-1px)] p-5 ${
          isDark ? 'bg-slate-900/90' : 'bg-white/95'
        } backdrop-blur-sm`}
      >
        <div className="mb-3 flex items-start gap-3">
          <span className="text-xl">{fact.emoji}</span>
          <div className="min-w-0 flex-1">
            <span
              className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${fact.badge}`}
            >
              {fact.category}
            </span>
            <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {fact.title}
            </p>
          </div>
          <Lightbulb className="h-4 w-4 shrink-0 animate-pulse text-amber-400" />
        </div>

        <div
          style={{ transition: 'opacity 0.35s, transform 0.35s' }}
          className={visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}
        >
          <p
            className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
          >
            {fact.hi}
          </p>
          <p
            className={`mt-2 border-t pt-2 text-xs italic leading-relaxed ${
              isDark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}
          >
            {fact.en}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {FACTS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === factIdx
                    ? `w-4 ${isDark ? 'bg-orange-500' : 'bg-orange-600'}`
                    : `w-1 ${isDark ? 'bg-white/15' : 'bg-slate-200'}`
                }`}
              />
            ))}
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Globe className="h-3 w-3" />
            MP Police Elite
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Spinner + steps ─────────────────────────────────────────────────────────
function SpinnerBlock({
  step,
  label,
  isDark,
}: {
  step: number;
  label: string;
  isDark: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`h-16 w-16 animate-spin rounded-full border-4 shadow-lg ${
            isDark
              ? 'border-orange-500/20 border-t-orange-500 shadow-orange-500/20'
              : 'border-slate-200 border-t-orange-600'
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image src="/mp-police-logo.png" alt="Logo" width={30} height={30} className="animate-pulse" />
        </div>
      </div>

      <div className="text-center">
        <p className={`text-sm font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {STEP_LABELS[step]}
        </p>
        <p className={`mt-0.5 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{label}</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((Icon, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 ${
                i <= step
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : isDark
                    ? 'bg-white/10 text-slate-600'
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-6 transition-all duration-700 ${
                  i < step ? 'bg-orange-500' : isDark ? 'bg-white/10' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PYQFactsLoader({
  variant = 'page',
  label = 'Initialising Elite Portal...',
  theme = 'dark',
}: PYQFactsLoaderProps) {
  const [factIdx, setFactIdx] = useState(() => Math.floor(Math.random() * FACTS.length));
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [isSplash, setIsSplash] = useState(true);

  const isDark = theme === 'dark';

  useEffect(() => {
    // 1. Splash first
    const splashTimer = setTimeout(() => {
      setIsSplash(false);
    }, 2500);

    // 2. Fact rotation loop
    const rotationId = setInterval(() => {
      if (isSplash) return;
      setVisible(false);
      setTimeout(() => {
        setFactIdx((currentIdx) => {
          let nextIdx;
          do {
            nextIdx = Math.floor(Math.random() * FACTS.length);
          } while (nextIdx === currentIdx && FACTS.length > 1);
          return nextIdx;
        });
        setVisible(true);
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
      }, 350);
    }, 3500);

    return () => {
      clearTimeout(splashTimer);
      clearInterval(rotationId);
    };
  }, [isSplash]);

  const fact = FACTS[factIdx];

  // ── overlay variant ────────────────────────────────────────────────────────
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 backdrop-blur-xl">
        <div className="flex w-full max-w-md flex-col items-center gap-10">
          {isSplash ? (
             <SplashContent isDark={true} />
          ) : (
            <>
              <SpinnerBlock step={step} label={label} isDark={true} />
              <FactCard fact={fact} visible={visible} isDark={true} factIdx={factIdx} />
            </>
          )}
        </div>
      </div>
    );
  }

  // ── page variant (default) ─────────────────────────────────────────────────
  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-12 px-4 py-16 ${
        isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'
      }`}
    >
      {isSplash ? (
         <SplashContent isDark={isDark} />
      ) : (
        <>
          <SpinnerBlock step={step} label={label} isDark={isDark} />
          <FactCard fact={fact} visible={visible} isDark={isDark} factIdx={factIdx} />
        </>
      )}
    </div>
  );
}

export default PYQFactsLoader;

