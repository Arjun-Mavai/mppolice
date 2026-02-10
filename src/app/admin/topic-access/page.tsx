import { requireAdmin } from '@/lib/auth-admin';
import { getAllTopicsForAdmin } from './actions';
import TopicAccessClient from './TopicAccessClient';

// ── Admin Topic Access Manager ──────────────────────────────────
// Force dynamic — admin ko always fresh data chahiye
export const dynamic = 'force-dynamic';

export default async function TopicAccessPage() {
    // Auth guard — sirf admin
    await requireAdmin();

    const topics = await getAllTopicsForAdmin();

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <TopicAccessClient topics={topics} />
        </div>
    );
}
