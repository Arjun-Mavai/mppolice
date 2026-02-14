'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SideDrawer = ({ isOpen, onClose, title, children, className }: SideDrawerProps) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm" // High z-index
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 right-0 z-[101] flex h-full w-[90%] max-w-md flex-col border-l bg-white shadow-2xl',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {title || 'Details'}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scroll-smooth p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
