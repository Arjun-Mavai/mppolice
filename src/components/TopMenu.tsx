'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, User, X, Home, LayoutDashboard, ChevronRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Category, Quote } from '@/data/quotes';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CategorySelector } from '@/components/CategorySelector';
import { logger } from '@/lib/logger';

interface TopMenuProps {
  category: Category;
  setCategory: (c: Category) => void;
  author: string | null;
  setAuthor: (a: string | null) => void;
  onLockedClick: () => void;
  availableQuotes: Quote[];
  categories?: Category[];
}

export const TopMenu = ({
  category,
  setCategory,
  author,
  setAuthor,
  onLockedClick,
  availableQuotes,
  categories,
}: TopMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'authors'>('categories');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  // Derive unique authors for the selected category
  const authors = useMemo(() => {
    const categoryQuotes = availableQuotes.filter((q) => q.category === category);
    const uniqueAuthors = Array.from(new Set(categoryQuotes.map((q) => q.author)));
    return uniqueAuthors.sort();
  }, [category, availableQuotes]);

  // Filtered lists based on search
  const filteredCategories = (categories || []).filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuthors = authors.filter((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="z-1000 rounded-full border border-white/50 bg-white/80 p-3 text-gray-700 shadow-sm backdrop-blur-md transition-all hover:shadow-md active:scale-95"
        >
          <LayoutDashboard size={20} />
        </button>
      )}
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 z-999 flex h-full w-[85%] max-w-sm flex-col border-l border-white/20 bg-white/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <h2 className="font-display text-xl font-bold text-gray-900">Menu</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogout}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  >
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-3 p-4">
                <Link
                  href="/app"
                  onClick={() => setIsOpen(false)}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Home size={24} className="text-gray-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold tracking-wider uppercase">Home</span>
                </Link>
                <Link
                  href="/app/profile"
                  onClick={() => setIsOpen(false)}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-purple-50 hover:text-purple-600"
                >
                  <User size={24} className="text-gray-400 group-hover:text-purple-500" />
                  <span className="text-xs font-bold tracking-wider uppercase">Profile hi</span>
                </Link>
              </div>

              {/* Search Input */}
              <div className="mt-4 px-6">
                <input
                  type="text"
                  placeholder="Search categories or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border-none bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Tabs */}
              <div className="mt-2 flex items-center border-b border-gray-100 px-6">
                <button
                  onClick={() => setActiveTab('categories')}
                  className={cn(
                    'relative flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors',
                    activeTab === 'categories'
                      ? 'text-indigo-600'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  Categories
                  {activeTab === 'categories' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('authors')}
                  className={cn(
                    'relative flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors',
                    activeTab === 'authors'
                      ? 'text-indigo-600'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  Authors
                  {activeTab === 'authors' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'categories' ? (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {filteredCategories.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                          No categories found.
                        </p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setAuthor(null);
                              // Optional: Close menu on selection? User might want to browse.
                            }}
                            className={cn(
                              'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                              category === cat
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'border border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:shadow-sm'
                            )}
                          >
                            {cat}
                            {category === cat && <CheckIcon />}
                          </button>
                        ))
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="authors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-2"
                    >
                      <button
                        onClick={() => setAuthor(null)}
                        className={cn(
                          'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                          author === null
                            ? 'bg-gray-900 text-white shadow-md'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        All Authors
                        {author === null && <CheckIcon />}
                      </button>

                      {filteredAuthors.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                          No authors found matching "{searchTerm}".
                        </p>
                      ) : (
                        filteredAuthors.map((auth) => (
                          <button
                            key={auth}
                            onClick={() => setAuthor(auth)}
                            className={cn(
                              'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
                              author === auth
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'border border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:shadow-sm'
                            )}
                          >
                            {auth}
                            {author === auth && <CheckIcon />}
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Info */}
              <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                <p className="text-center text-xs text-gray-400">Mindful App v1.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const CheckIcon = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="rounded-full bg-white/20 p-1"
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </motion.div>
);
