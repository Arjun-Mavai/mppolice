// import React from 'react';
// import { Loader2 } from 'lucide-react';

// export default function GlobalLoader() {
//     return (
//         <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
//             <div className="relative">
//                 <div className="h-16 w-16 rounded-xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 animate-bounce">
//                     <span className="text-white font-bold text-xl tracking-tighter">MP</span>
//                 </div>
//                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
//                     <div className="flex items-center gap-2 text-slate-900 font-bold text-sm uppercase tracking-widest">
//                         <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
//                         Loading...
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalLoaderProps {
  isLoading?: boolean;
}

export default function GlobalLoader({ isLoading = true }: GlobalLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        className="relative flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-transparent border-t-blue-600 border-r-blue-400"
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
          className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30"
          animate={{
            boxShadow: [
              '0 0 20px 0 rgba(37, 99, 235, 0.3)',
              '0 0 30px 0 rgba(37, 99, 235, 0.5)',
              '0 0 20px 0 rgba(37, 99, 235, 0.3)',
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
              <Loader2 className="w-4 h-4 text-blue-600" />
            </motion.div>
            <span>Loading...</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
