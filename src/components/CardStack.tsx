'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Card } from '@/components/Cardswipet';
import { Category, Quote } from '@/data/quotes';
import { useAppStore } from '@/hooks/useAppStore';

export const CardStack = ({
  category,
  authorFilter,
  initialQuotes,
}: {
  category: Category;
  authorFilter: string | null;
  initialQuotes: Quote[];
}) => {
  const [cards, setCards] = useState<Quote[]>([]);
  const { saveQuote, incrementSwipe, markAsViewed, viewedQuotes } = useAppStore();

  // Fisher-Yates shuffle helper
  const shuffle = (array: Quote[]) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    // Determine base quotes from prop OR fallback to empty
    const allQuotes = initialQuotes || [];

    // Filter by Category
    let filtered = allQuotes.filter((q) => q.category === category);

    // Apply Author Filter if selected
    if (authorFilter) {
      filtered = filtered.filter((q) => q.author === authorFilter);
    }

    // Initial Shuffle
    let shuffled = shuffle([...filtered]);

    // Ensure we have at least 3 cards to start (duplicate if needed for small sets)
    if (shuffled.length > 0 && shuffled.length < 3) {
      setCards([
        ...shuffled,
        ...shuffled.map((q) => ({
          ...q,
          id: q.id + '-dup-' + Math.random().toString(36).substr(2, 5),
        })),
      ]);
    } else {
      setCards(shuffled);
    }
  }, [category, authorFilter, initialQuotes]);

  const handleSwipe = (direction: 'left' | 'right', id: string, quote: Quote) => {
    incrementSwipe();

    // Extract base ID (remove -dup suffixes) to track viewed status correctly
    const baseId = id.split('-')[0];
    markAsViewed(baseId);

    if (direction === 'right') {
      // saveQuote(quote); // Disabled per user request. Right swipe is now just "Next".
    }

    setCards((prev) => {
      const newCards = prev.filter((c) => c.id !== id);

      if (newCards.length < 5) {
        // Fetch more based on current filter from initialQuotes
        const allQuotes = initialQuotes || [];
        let possibleQuotes = allQuotes.filter((q) => q.category === category);

        if (authorFilter) {
          possibleQuotes = possibleQuotes.filter((q) => q.author === authorFilter);
        }

        if (possibleQuotes.length === 0) return newCards;

        // Strategy: Prioritize Unseen Quotes -> Then Random Seen Quotes
        // 1. Filter out quotes currently in the stack (by base ID)
        const currentStackBaseIds = newCards.map((c) => c.id.split('-')[0]);
        const availablePool = possibleQuotes.filter((q) => !currentStackBaseIds.includes(q.id));

        // 2. Separate into Unseen and Seen
        const unseen = availablePool.filter((q) => !viewedQuotes.includes(q.id));
        const seen = availablePool.filter((q) => viewedQuotes.includes(q.id));

        // 3. Shuffle both groups
        const shuffledUnseen = shuffle([...unseen]);
        const shuffledSeen = shuffle([...seen]);

        // 4. Combine: Unseen first, then Seen
        const nextBatch = [...shuffledUnseen, ...shuffledSeen];

        // 5. Take top 5 (or fewer) and add unique IDs
        const toAdd = nextBatch.slice(0, 5).map((q) => ({
          ...q,
          id: q.id + '-' + Math.random().toString(36).substr(2, 9), // Ensure unique key for React
        }));

        return [...newCards, ...toAdd];
      }

      return newCards;
    });
  };

  if (cards.length === 0) return null;

  return (
    <div className="relative flex h-[600px] w-full max-w-sm items-center justify-center">
      <AnimatePresence mode="popLayout">
        {cards.slice(0, 3).map((card, index) => (
          <Card
            key={card.id}
            quote={card}
            index={index}
            draggable={index === 0}
            onSwipe={(dir) => {
              handleSwipe(dir, card.id, card);
            }}
            onSave={(q) => {
              saveQuote(q);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
