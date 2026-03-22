import Link, { LinkProps } from 'next/link';
import React from 'react';

type TransitionCapableLinkProps = LinkProps & {
  className?: string;
  children: React.ReactNode;
  transitionTypes?: string[];
};

interface TransitionLinkProps extends Omit<TransitionCapableLinkProps, 'transitionTypes'> {
  children: React.ReactNode;
  transitionTypes?: string[]; 
}

const TransitionCapableLink = Link as unknown as React.ComponentType<TransitionCapableLinkProps>;

/**
 * A wrapper around Next.js Link that enables View Transitions by default.
 * Usage: Replace `import Link from 'next/link'` with `import { TransitionLink as Link } from '@/components/ui/transition-link'`
 */
export function TransitionLink({ children, transitionTypes = ['slide'], className, ...props }: TransitionLinkProps) {
  return (
    <TransitionCapableLink {...props} className={className} transitionTypes={transitionTypes}>
      {children}
    </TransitionCapableLink>
  );
}
