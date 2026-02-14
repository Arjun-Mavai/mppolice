'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Heart } from 'lucide-react';
import { Quote } from '@/data/quotes';

interface SavedQuotesProps {
  isOpen: boolean;
  onClose: () => void;
  savedQuotes: Quote[];
  onRemove: (id: string) => void;
}

export const SavedQuotes = ({ isOpen, onClose, savedQuotes, onRemove }: SavedQuotesProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col overflow-hidden border-l bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b bg-gray-50/50 p-6">
              <div className="flex items-center gap-2">
                <Heart className="fill-current text-red-500" size={20} />
                <h2 className="font-display text-xl font-bold text-gray-900">Your Collection</h2>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {savedQuotes.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {savedQuotes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center opacity-50">
                  <Heart size={48} className="text-gray-300" />
                  <p className="text-gray-500">
                    No saved quotes yet.
                    <br />
                    Swipe right or tap the heart to save.
                  </p>
                </div>
              ) : (
                savedQuotes.map((quote) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={quote.id}
                    className="group relative rounded-2xl border bg-gray-50 p-6 transition-colors hover:border-gray-200"
                  >
                    <button
                      onClick={() => onRemove(quote.id)}
                      className="absolute top-4 right-4 p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="mb-3 pr-8 leading-relaxed font-medium text-gray-800">
                      "{quote.text}"
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold tracking-wider uppercase">{quote.author}</span>
                      <span className="rounded-md border bg-white px-2 py-1">{quote.category}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
