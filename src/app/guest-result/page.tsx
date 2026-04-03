import { GuestResultClient } from '@/features/tests/components/GuestResultClient';
import { verifyAuth } from '@/lib/auth';
import { ProductionErrorBoundary } from '@/components/ProductionErrorBoundary';

// Prevent caching for this page as it relies on client-side ephemeral store
export const dynamic = 'force-dynamic';

export default async function GuestResultPage() {
  const user = await verifyAuth();
  
  return (
    <ProductionErrorBoundary>
      <GuestResultClient userId={user?.id} />
    </ProductionErrorBoundary>
  );
}
