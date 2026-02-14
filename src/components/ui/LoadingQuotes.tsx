'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bhai ye MPPSC related facts + motivation h - loading ke time user ko engage rakho
const QUOTES = [
  '🏛️ MP ka sabse bada jila: Chhindwara (area me)',
  '📊 Tumhara rank calculate ho raha h...',
  '📖 MPPSC Prelims me 2 papers hote h - GS + CSAT',
  '🎯 MP me total 52 districts h (2024 tak)',
  '⏳ Thoda sabr karo, result aa raha h...',
  '🏆 Toppers bhi pehle fail hue the, consistency matters!',
  '📝 MP ki rajdhani: Bhopal, judicial capital: Jabalpur',
  '💡 Negative marking h 1/3 — guess mat karo!',
  '🌊 Narmada MP ki sabse lambi nadi h',
  '🔥 Mehnat rang layegi, bas loading khatam hone do...',
];

export function LoadingQuotes() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-sm text-base font-medium text-slate-500 sm:text-lg"
        >
          {QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
