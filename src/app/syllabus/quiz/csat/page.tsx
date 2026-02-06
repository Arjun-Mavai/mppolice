import { getCachedCSATTests } from '@/actions/test-actions';
import CSATPageClient from './CSATPageClient';

// Server Component
export default async function CSATPage() {
    const tests = await getCachedCSATTests();
    return <CSATPageClient initialTests={tests} />;
}
