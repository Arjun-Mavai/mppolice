'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-6 font-sans selection:bg-indigo-500/30">
      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 bg-[grid-pattern] opacity-[0.03]" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Minimal 404 Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[140px] font-black text-slate-900 leading-none select-none tracking-tighter drop-shadow-2xl text-stroke-2 text-white">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 transform rotate-[-6deg] backdrop-blur-xl group hover:rotate-0 transition-transform duration-300">
                <span className="text-5xl filter drop-shadow-lg">🤔</span>
             </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-4"
        >
            <h2 className="text-3xl font-black text-white tracking-tight">
                Page not found
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
        </motion.div>

        {/* Action Links */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3 pt-4"
        >
            <Link 
                href="/app" 
                className="group relative flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-[0.98] overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Home className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Return Home</span>
            </Link>
            
            <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
            </button>
        </motion.div>

        {/* Footer Support Link */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <p className="text-xs text-slate-500 font-medium">
                Need help? <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 hover:underline decoration-indigo-500/30 underline-offset-4 transition-colors">Contact Support</Link>
            </p>
        </motion.div>
      </div>
    </div>
  );
}
