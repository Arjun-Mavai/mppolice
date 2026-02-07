// "use client"
// import { useRouter } from 'next/navigation';
//  import { useEffect } from 'react';
// import { logger } from '@/lib/logger';

// export default function Error({
//     error,
//     reset,
// }: {
//     error: Error & { digest?: string };
//     reset: () => void;
// }) {
//     const router = useRouter();
//     useEffect(() => {
//         // Log to error tracking service
//         logger.error('App Error:', error);
//     }, [error]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//             <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
//                 <div className="mb-6 flex justify-center">
//                     <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
//                         <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                         </svg>
//                     </div>
//                 </div>
//                 <h2 className="text-2xl font-bold text-slate-900 mb-2">
//                     Something went wrong!
//                 </h2>
//                 <p className="text-slate-600 mb-6 text-sm">
//                     {error.message || 'An unexpected error occurred. Please try again.'}
//                 </p>
//                 <div className="space-y-3">
//                     <button
//                         onClick={reset}
//                         className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
//                     >
//                         Try Again
//                     </button>
//                     <button
//                         onClick={() =>router.push("/")}
//                         className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
//                     >
//                         Go Home
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }




'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { logger } from '@/lib/logger';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    logger.error('App Error:', error);
  }, [error]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const floatingVariants: Variants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 selection:bg-indigo-500/30">
      {/* Premium Dark Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 bg-[grid-pattern] opacity-[0.03]" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="max-w-2xl w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Card */}
        <div className="bg-slate-900/50 rounded-3xl shadow-2xl shadow-black/50 border border-slate-800 backdrop-blur-xl overflow-hidden">
          {/* Top Gradient Line */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

          <div className="p-8 md:p-12 relative">
            {/* Background Glow inside card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/5 blur-[80px] pointer-events-none" />

            {/* Error Icon */}
            <motion.div
              className="flex justify-center mb-10"
              variants={itemVariants}
            >
              <motion.div
                className="relative"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20" />
                <div className="relative w-20 h-20 bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-slate-700 rounded-full border-2 border-slate-900" />
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-slate-700 rounded-full border-2 border-slate-900" />
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div className="text-center space-y-6 mb-10" variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
                {error.message || 'An unexpected error occurred. Don\'t worry, your progress is safe.'}
              </p>
              {error.digest && (
                <div className="inline-block">
                  <p className="text-xs text-slate-500 font-mono bg-slate-950/50 rounded-lg py-2 px-4 border border-slate-800">
                    Error ID: <span className="text-slate-400">{error.digest}</span>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto"
              variants={itemVariants}
            >
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
                <span className="relative z-10">Try Again</span>
              </motion.button>

              <motion.button
                onClick={() => router.push('/syllabus')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group px-6 py-4 rounded-xl font-bold text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                <span>Go to Syllabus</span>
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="mt-10 pt-8 border-t border-slate-800/50 text-center"
              variants={itemVariants}
            >
              <p className="text-sm text-slate-500">
                Issues persisting?{' '}
                <Link
                  href="/contact"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline decoration-indigo-500/30 underline-offset-4"
                >
                  Contact Support
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

