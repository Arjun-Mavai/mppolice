'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ExpandableCardProps {
  id: string;
  defaultExpanded?: boolean;
  onToggle?: (id: string, isExpanded: boolean) => void;
  header: ReactNode;
  headerClassName?: string;
  children: ReactNode;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ExpandableCard({
  id,
  defaultExpanded = false,
  onToggle,
  header,
  headerClassName,
  children,
  className,
  gradientFrom = 'from-blue-500/20',
  gradientTo = 'to-cyan-500/20',
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(id, newState);
  };

  return (
    <div className="relative">
      <div className={cn(
        'absolute -inset-1 rounded-[2rem] opacity-20 blur-xl',
        `bg-gradient-to-r ${gradientFrom} ${gradientTo}`
      )} />
      <Card className={cn(
        'relative z-10 overflow-hidden rounded-[2rem] border-slate-800 bg-slate-900 shadow-2xl',
        className
      )}>
        <div
          className={cn(
            'flex cursor-pointer items-center justify-between border-b border-white/5 bg-transparent px-6 py-6',
            headerClassName
          )}
          onClick={handleToggle}
        >
          {header}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 shadow-inner transition-colors">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-blue-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
