'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomFact, type CurrentAffairsFact } from '@/data/current-affairs-data';

interface GlobalLoaderProps {
  isLoading?: boolean;
}

export default function GlobalLoader({ isLoading = true }: GlobalLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFact, setCurrentFact] = useState<CurrentAffairsFact | null>(null);

  useEffect(() => {
    setMounted(true);
    // Set initial fact
    setCurrentFact(getRandomFact());

    // Rotate facts every 4 seconds
    const interval = setInterval(() => {
      setCurrentFact(getRandomFact());
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/5 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative flex flex-col items-center max-w-lg px-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-transparent border-t-electric-blue border-r-electric-blue"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          style={{
            width: '72px',
            height: '72px',
            margin: 'auto',
          }}
        />

        {/* Core logo box */}
        <motion.div
          className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-electric-blue to-[#00D0E0] flex items-center justify-center shadow-lg"
          animate={{
            boxShadow: [
              '0 0 20px 0 rgba(0, 240, 255, 0.3)',
              '0 0 30px 0 rgba(0, 240, 255, 0.5)',
              '0 0 20px 0 rgba(0, 240, 255, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="text-white font-bold text-xl tracking-tighter">MP</span>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm uppercase tracking-widest">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
            >
              <Loader2 className="w-4 h-4 text-electric-blue" />
            </motion.div>
            <span>Loading...</span>
          </div>
        </motion.div>

        {/* Current Affairs Fact Card */}
        <AnimatePresence mode="wait">
          {currentFact && (
            <motion.div
              key={currentFact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-24 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-slate-200 max-w-md"
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-electric-blue" />
                <span className="text-xs font-bold text-electric-blue uppercase tracking-wider">
                  {currentFact.subject}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">{currentFact.tag}</span>
              </div>
              
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {currentFact.title}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                {currentFact.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
