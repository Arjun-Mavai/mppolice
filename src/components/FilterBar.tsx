'use client';

import { useState, useMemo } from 'react';
import { Category, Quote } from '@/data/quotes';
import { CategorySelector } from '@/components/CategorySelector';
import { cn } from '@/lib/utils';
import { Filter, User, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  category: Category;
  setCategory: (c: Category) => void;
  author: string | null;
  setAuthor: (a: string | null) => void;
  onLockedClick: () => void;
  availableQuotes: Quote[]; // Used to derive authors
  categories?: Category[]; // Computed categories from server
}

export const FilterBar = ({
  category,
  setCategory,
  author,
  setAuthor,
  onLockedClick,
  availableQuotes,
  categories,
}: FilterBarProps) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);

  // Derive unique authors for the selected category
  const authors = useMemo(() => {
    const categoryQuotes = availableQuotes.filter((q) => q.category === category);
    const uniqueAuthors = Array.from(new Set(categoryQuotes.map((q) => q.author)));
    return uniqueAuthors.sort();
  }, [category, availableQuotes]);

  return (
    <div className="relative z-50 flex w-full flex-col items-center gap-4">
      {/* Visual Controls Container */}
      <div className="flex items-center gap-6">
        {/* Category Toggle (Icon Only) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => {
              setIsCategoriesOpen(!isCategoriesOpen);
              setIsAuthorsOpen(false); // Close others
            }}
            className={cn(
              'rounded-full border p-3 shadow-sm transition-all duration-300',
              isCategoriesOpen
                ? 'scale-110 border-gray-900 bg-gray-900 text-white'
                : 'border-white/50 bg-white/80 text-gray-500 backdrop-blur-md hover:bg-white hover:text-gray-900'
            )}
          >
            <Filter size={20} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {isCategoriesOpen ? 'Close' : category}
          </span>
        </div>

        {/* Author Toggle (Icon Only) */}
        {authors.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => {
                setIsAuthorsOpen(!isAuthorsOpen);
                setIsCategoriesOpen(false); // Close others
              }}
              className={cn(
                'rounded-full border p-3 shadow-sm transition-all duration-300',
                isAuthorsOpen
                  ? 'scale-110 border-gray-900 bg-gray-900 text-white'
                  : 'border-white/50 bg-white/80 text-gray-500 backdrop-blur-md hover:bg-white hover:text-gray-900'
              )}
            >
              <User size={20} />
            </button>
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {isAuthorsOpen ? 'Close' : author || 'All Authors'}
            </span>
          </div>
        )}
      </div>

      {/* Expanded Sections */}
      <AnimatePresence mode="wait">
        {/* Category Section */}
        {isCategoriesOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="w-full overflow-hidden"
          >
            <CategorySelector
              selected={category}
              onSelect={(c) => {
                setCategory(c);
                setAuthor(null);
                // setIsCategoriesOpen(false); // Keep open for browsing or close? User said "immersive", maybe keep open until clicked away.
              }}
              onLockedClick={onLockedClick}
              categories={categories}
            />
          </motion.div>
        )}

        {/* Author Section */}
        {isAuthorsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="w-full overflow-hidden"
          >
            <div className="w-full">
              <div
                className="no-scrollbar flex w-full justify-center overflow-x-auto scroll-smooth px-1 pb-2 md:overflow-visible"
                onWheel={(e) => {
                  if (window.innerWidth < 768 && e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex w-max items-center space-x-2 px-4 md:w-full md:flex-wrap md:justify-center md:gap-2 md:space-x-1">
                  <button
                    onClick={() => setAuthor(null)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                      author === null
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    All
                  </button>

                  {authors.map((auth) => (
                    <button
                      key={auth}
                      onClick={() => setAuthor(auth)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
                        author === auth
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {auth}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
