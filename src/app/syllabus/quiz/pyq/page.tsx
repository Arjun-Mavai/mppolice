import { getCachedPYQTests } from '@/actions/test-actions';
import PYQPageClient from './PYQPageClient';

// Server Component
export default async function PYQPage() {
    // 1. Fetch Data (Cached)
    const tests = await getCachedPYQTests();

    // 2. Pass to Client Component
    return <PYQPageClient initialTests={tests} />;
}
