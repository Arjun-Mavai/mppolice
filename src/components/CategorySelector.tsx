'use client';

import { CATEGORIES, Category } from '@/data/quotes';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import { useAppStore } from '@/hooks/useAppStore';

const LOCKED_CATEGORIES: Category[] = [
  'Business',
  'Love',
  'Wisdom',
  'Philosophy',
  'Science',
  'Ted Wisdom',
  'Scientific Proven',
];

interface CategorySelectorProps {
  selected: Category;
  onSelect: (category: Category) => void;
  onLockedClick: () => void;
  categories?: Category[];
}

export const CategorySelector = ({
  selected,
  onSelect,
  onLockedClick,
  categories,
}: CategorySelectorProps) => {
  const { isPro } = useAppStore();
  const displayCategories = categories || CATEGORIES;

  return (
    <div className="no-scrollbar w-full overflow-x-auto px-4 pt-2 pb-4">
      <div className="flex w-max space-x-3">
        {displayCategories.map((category) => {
          const isLocked = !isPro && LOCKED_CATEGORIES.includes(category);

          return (
            <button
              key={category}
              onClick={() => {
                if (isLocked) {
                  onLockedClick();
                } else {
                  onSelect(category);
                }
              }}
              className={cn(
                'flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all duration-300 ease-out',
                selected === category
                  ? 'scale-105 border-black bg-black text-white shadow-lg'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50',
                isLocked && 'border-dashed bg-gray-50 text-gray-400 opacity-75'
              )}
            >
              {isLocked && <Lock size={12} />}
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};
