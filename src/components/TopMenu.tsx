"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, User, X, Home, LayoutDashboard, ChevronRight, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Category, Quote } from "@/data/quotes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CategorySelector } from "@/components/CategorySelector";
import { logger } from "@/lib/logger";

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
  const [activeTab, setActiveTab] = useState<"categories" | "authors">("categories");
  const [searchTerm, setSearchTerm] = useState("");
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
  const filteredCategories = (categories || []).filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuthors = authors.filter(a => 
    a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Trigger Button */}
    { !isOpen && <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-white/80 backdrop-blur-md border border-white/50 text-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 z-1000"
      >
       <LayoutDashboard size={20} />
      </button>
}
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl shadow-2xl z-50 flex flex-col border-l border-white/20 z-999"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-display font-bold text-gray-900">Menu</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                    <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                    <X size={24} className="text-gray-500" />
                    </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <Link
                  href="/app"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors gap-2 group"
                >
                  <Home size={24} className="text-gray-400 group-hover:text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link
                  href="/app/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-colors gap-2 group"
                >
                  <User size={24} className="text-gray-400 group-hover:text-purple-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Profile hi</span>
                </Link>
              </div>

              {/* Search Input */}
              <div className="px-6 mt-4">
                <input
                    type="text"
                    placeholder="Search categories or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-100 text-sm"
                />
              </div>

              {/* Tabs */}
              <div className="flex items-center px-6 mt-2 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("categories")}
                  className={cn(
                    "flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative",
                    activeTab === "categories" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Categories
                  {activeTab === "categories" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("authors")}
                  className={cn(
                    "flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-colors relative",
                    activeTab === "authors" ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  Authors
                  {activeTab === "authors" && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "categories" ? (
                    <motion.div
                      key="categories"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {filteredCategories.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
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
                                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group",
                                category === cat
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-white border border-gray-100 text-gray-600 hover:border-gray-200 hover:shadow-sm"
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
                          "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group",
                          author === null
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                         All Authors
                         {author === null && <CheckIcon />}
                      </button>
                      
                      {filteredAuthors.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            No authors found matching "{searchTerm}".
                        </p>
                      ) : (
                        filteredAuthors.map((auth) => (
                            <button
                            key={auth}
                            onClick={() => setAuthor(auth)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group",
                                author === auth
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-white border border-gray-100 text-gray-600 hover:border-gray-200 hover:shadow-sm"
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
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-center text-gray-400">
                    Mindful App v1.0
                </p>
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
        className="bg-white/20 p-1 rounded-full"
    >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    </motion.div>
);
