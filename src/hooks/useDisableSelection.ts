import { useEffect } from 'react';

export function useDisableSelection(
  ref: React.RefObject<HTMLElement | null>,
  requireLogin: boolean
) {
  // Completely disabled to allow copy-paste everywhere
  return;
}

