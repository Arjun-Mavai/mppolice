import { requireAdmin } from '@/lib/auth-admin';
import { getAllBlogsForAdmin } from './actions';
import BlogAccessClient from './BlogAccessClient';

// ── Admin Blog Access Manager ──────────────────────────────────
export const dynamic = 'force-dynamic';

export default async function BlogAccessPage() {
    await requireAdmin();
    const blogs = await getAllBlogsForAdmin();

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <BlogAccessClient blogs={blogs} />
        </div>
    );
}
