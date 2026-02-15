'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const CARDS = [
  { id: 1, text: 'Focus is the new IQ.', author: 'Cal Newport', color: 'bg-indigo-500' },
  { id: 2, text: 'Stillness speaks.', author: 'Eckhart Tolle', color: 'bg-purple-500' },
  { id: 3, text: 'Less, but better.', author: 'Dieter Rams', color: 'bg-pink-500' },
  { id: 4, text: 'He who has a why to live.', author: 'Nietzsche', color: 'bg-orange-500' },
];

export const CardDemoAnimation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CARDS.length);
    }, 3000); // Change card every 3 seconds

    return () => clearInterval(timer);
  }, []);

  // Display only 2 cards at a time to create the stack effect
  const visibleCards = [CARDS[currentIndex], CARDS[(currentIndex + 1) % CARDS.length]];

  return (
    <div className="perspective-1000 pointer-events-none relative mx-auto flex h-64 w-full max-w-sm items-center justify-center select-none md:h-80">
      <AnimatePresence mode="popLayout">
        {visibleCards.map((card, i) => {
          // i=0 is front (active), i=1 is background (next)
          const isFront = i === 0;

          return (
            <motion.div
              key={`${card.id}-${currentIndex}`} // Unique key to force re-render/animation
              layout
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{
                scale: isFront ? 1 : 0.9,
                y: isFront ? 0 : 30,
                opacity: isFront ? 1 : 0.5,
                zIndex: isFront ? 10 : 5,
              }}
              exit={{
                x: 200,
                opacity: 0,
                rotate: 15,
                transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-xl"
            >
              <div className={`h-12 w-12 rounded-full ${card.color} mb-4 opacity-20`} />

              <h3 className="font-display mb-2 text-xl leading-tight font-bold text-gray-800">
                "{card.text}"
              </h3>
              <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">
                {card.author}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
