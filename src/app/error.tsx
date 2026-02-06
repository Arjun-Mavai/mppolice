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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Floating background elements */}
      <motion.div
        className="absolute top-10 right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [-50, 0, -50],
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
        <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-100/50 backdrop-blur-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />

          <div className="p-8 md:p-12">
            {/* Error Icon */}
            <motion.div
              className="flex justify-center mb-8"
              variants={itemVariants}
            >
              <motion.div
                className="relative"
                variants={floatingVariants}
                animate="animate"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30" />
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div className="text-center space-y-4 mb-8" variants={itemVariants}>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Something went wrong!
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {error.message || 'An unexpected error occurred. Don\'t worry, your progress is safe.'}
              </p>
              {error.digest && (
                <p className="text-sm text-slate-500 font-mono bg-slate-50 rounded-lg p-3 border border-slate-200">
                  Error ID: {error.digest}
                </p>
              )}
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                <h3 className="font-semibold text-blue-900 mb-2">What happened?</h3>
                <p className="text-sm text-blue-800">
                  A momentary glitch. Usually resolved by retrying.
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-4 border border-indigo-200/50">
                <h3 className="font-semibold text-indigo-900 mb-2">Need Help?</h3>
                <p className="text-sm text-indigo-800">
                  If this persists, our support team is ready to help.
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={itemVariants}
            >
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span>Try Again</span>
              </motion.button>

              <motion.button
                onClick={() => router.push('/syllabus')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 py-3 rounded-xl font-semibold text-blue-600 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                <span>Go to Syllabus</span>
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.div
              className="mt-8 pt-6 border-t border-slate-200 text-center"
              variants={itemVariants}
            >
              <p className="text-sm text-slate-500">
                Issues persisting?{' '}
                <a
                  href="mailto:support@mppsc.com"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Contact Support
                </a>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative cards floating around */}
        <motion.div
          className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200 hidden md:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-slate-700">
              95% Pass Rate
            </span>
          </div>
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200 hidden md:block"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: 0.5,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm font-medium text-slate-700">
              4.9 ⭐ Rating
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

