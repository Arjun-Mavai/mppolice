"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bhai ye MPPSC related facts + motivation h - loading ke time user ko engage rakho
const QUOTES = [
  "🏛️ MP ka sabse bada jila: Chhindwara (area me)",
  "📊 Tumhara rank calculate ho raha h...",
  "📖 MPPSC Prelims me 2 papers hote h - GS + CSAT",
  "🎯 MP me total 52 districts h (2024 tak)",
  "⏳ Thoda sabr karo, result aa raha h...",
  "🏆 Toppers bhi pehle fail hue the, consistency matters!",
  "📝 MP ki rajdhani: Bhopal, judicial capital: Jabalpur",
  "💡 Negative marking h 1/3 — guess mat karo!",
  "🌊 Narmada MP ki sabse lambi nadi h",
  "🔥 Mehnat rang layegi, bas loading khatam hone do...",
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
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[200px]">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-base sm:text-lg font-medium text-slate-500 max-w-sm"
        >
          {QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
