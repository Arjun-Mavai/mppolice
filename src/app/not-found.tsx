'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Minimal 404 Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-[120px] font-black text-slate-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 transform rotate-[-6deg]">
                <span className="text-4xl">🤔</span>
             </div>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-3"
        >
            <h2 className="text-2xl font-bold text-slate-900">
                Page not found / पृष्ठ नहीं मिला
            </h2>
            <p className="text-slate-500 text-lg">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
        </motion.div>

        {/* Action Links */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-3"
        >
            <Link 
                href="/app" 
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
                <Home className="w-4 h-4" />
                Return Home (होमपेज)
            </Link>
            
            <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
                <ArrowLeft className="w-4 h-4" />
                Go Back (पीछे जाएं)
            </button>
        </motion.div>

        {/* Footer Support Link */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            <p className="text-xs text-slate-400">
                Need help? <a href="/contact" className="text-indigo-600 hover:underline">Contact Support</a>
            </p>
        </motion.div>
      </div>
    </div>
  );
}
