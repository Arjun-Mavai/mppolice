'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Bhai ye MP Police related facts + motivation h - loading ke time user ko engage rakho
const QUOTES = [
  // --- Geography & Map Updates ---
  '🗺️ Update: MP me ab **55 Districts** hain! (Mauganj, Pandhurna, Maihar jud gaye)',
  '⛰️ MP ki sabse oonchi choti: **Dhupgarh (1350m)**, Mahadeo hills (Satpura) me h.',
  '📍 MP ka sabse Paschimi (Western) jila: **Alirajpur**, Sabse Purvi (Eastern): **Singrauli**.',

  // --- Capitals of MP ---
  '⚖️ Judicial Capital: **Jabalpur**, Energy Capital: **Singrauli**, Sports Capital: **Indore**.',
  '🎼 Music Capital: **Maihar**, Summer Capital: **Pachmarhi**.',

  // --- Exam Strategy (Strategic Value) ---
  '💡 Pro Tip: MP Police Prelims me **Negative Marking nahi hoti** (GS Paper 1) — Saare attempt karna!',
  '📚 Unit 10 par focus rakho: **MP ki Janjatiya (Tribes)** ab game-changer h.',
  '⏳ Loading... Tab tak socho: **Article 164** me Tribal Welfare Minister ka zikr kyu h?',

  // --- History & Culture (Unit 1) ---
  '🏛️ UNESCO Sites: Khajuraho (1986), Sanchi (1989), Bhimbetka (2003).',
  '🏹 MP ki sabse badi Janjati (Tribe): **Bhil** (Population wise), lekin Gond sabse bada Samuh (Group) h.',
  '🦁 **Kuno National Park** (Sheopur) me African Cheetahs ka naya ghar h.',

  // --- Polity & Economy (Unit 5 & 6) ---
  '🗳️ MP me **230 Vidhan Sabha seats** aur **29 Lok Sabha seats** hain.',
  '💰 **Soyabean State:** MP ko ab "Leopard State" aur "Tiger State" bhi kehte hain.',

  // --- Motivation & Loading ---
  '📊 Rank calculate ho rahi h... lekin asli competition tumhara khud se h.',
  '🔥 Sabr rakho, **Deputy Collector** wali feeling loading par h...',
  '🏆 Consistency matters! Roz ke 50 MCQs tumhe bheed se alag banayenge.',
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
