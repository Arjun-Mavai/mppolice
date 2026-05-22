'use client';

import React, { useRef } from 'react';
import { useDisableSelection } from '@/hooks/useDisableSelection';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisableSelectionForGuestsProps {
  children: React.ReactNode;
  isGuest: boolean;
  className?: string;
}

export function DisableSelectionForGuests({
  children,
  isGuest,
  className,
}: DisableSelectionForGuestsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply the hook only if the user is a guest (requireLogin = true basically means "we need to disable selection because they haven't logged in/paid")
  useDisableSelection(containerRef, isGuest);

  return (
    <div
      ref={containerRef}
      className={cn('relative group', className)}
    >
      {children}
      
      {/* Optional: Show a subtle lock icon indicating the content is protected when hovered */}
      {isGuest && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-1.5 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm shadow-sm z-10">
          <Lock size={12} className="text-amber-400" />
          <span className="font-medium">Protected</span>
        </div>
      )}
    </div>
  );
}
