"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
   "MPPSC clear karna hai na? Sabr rakho...",
  "Sabr ka phal rank hota hai...",
  "Calculating your dominance...",
  "Aapka result aa raha hai, wait kare...",
  "Toppers are not born, they are calculated...",
  "Checking if you beat the topper...",
  "Thoda sa wait, result is loading...",
  "Mehnat rang layegi, bas loading khatam hone do...",
 
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
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-medium text-slate-600 italic"
        >
          &quot;{QUOTES[index]}&quot;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
