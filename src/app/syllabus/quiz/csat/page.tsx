import { getCachedCSATTests } from '@/features/tests/actions/submission';
import CSATPageClient from './CSATPageClient';

// Server Component
export default async function CSATPage() {
    const tests = await getCachedCSATTests();
    return <CSATPageClient initialTests={tests} />;
}
