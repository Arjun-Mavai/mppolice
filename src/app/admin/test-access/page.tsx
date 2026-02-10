import { requireAdmin } from '@/lib/auth-admin';
import TestAccessClient from './TestAccessClient';
import { getAllTestsForAdmin } from './actions';

// Server Component — Admin only, no caching
export const dynamic = 'force-dynamic';

export default async function TestAccessPage() {
    await requireAdmin();
    const tests = await getAllTestsForAdmin();
    return <TestAccessClient initialTests={tests} />;
}
