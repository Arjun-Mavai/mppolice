import Link, { LinkProps } from 'next/link';
import React from 'react';

// Extend LinkProps to include transitionTypes if it's not already in the types
// (It might be missing in some TS definitions depending on version, so we add it optionally)
interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  // Allows customizing the transition per link, defaults to 'slide'
  transitionTypes?: string[]; 
  [key: string]: any; // Allow other props like styles, aria-*, etc.
}

/**
 * A wrapper around Next.js Link that enables View Transitions by default.
 * Usage: Replace `import Link from 'next/link'` with `import { TransitionLink as Link } from '@/components/ui/transition-link'`
 */
export function TransitionLink({ 
  children, 
  transitionTypes = ['slide'], // Default global transition type
  className,
  ...props 
}: TransitionLinkProps) {
  return (
    // @ts-ignore - transitionTypes might not be in the strict type definition yet depending on the exact version
    <Link {...props} className={className} transitionTypes={transitionTypes}>
      {children}
    </Link>
  );
}
