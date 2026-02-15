'use client';

import { usePwa } from '@/hooks/usePwa';

export default function PwaRegistry() {
  usePwa(); // This hook handles SW registration and Install Prompt listening
  return null; // Render nothing
}
