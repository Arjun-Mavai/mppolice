import { GuestResultClient } from '@/features/tests/components/GuestResultClient';

// Prevent caching for this page as it relies on client-side ephemeral store
export const dynamic = 'force-dynamic';

export default function GuestResultPage() {
  return <GuestResultClient />;
}
