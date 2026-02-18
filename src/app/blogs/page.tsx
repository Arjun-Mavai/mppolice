import { verifyAuth } from '@/lib/auth';
import { getBlogs, getBlogCounts } from '@/services/blog-service';
import BlogsClient from './BlogsClient';

export const metadata = {
  title: 'MPPSC Study Blogs & Articles | MPPSC Knowledge',
  description:
    'Read high-quality articles, strategies, and notes for MPPSC preparation. Covering History, Geography, Polity, and MP Special topics.',
};

// Removed 'force-dynamic' to allow caching/ISR.
// The `getBlogs` action uses `unstable_cache` with revalidation tags.
// When an admin uploads a blog, `revalidateTag` is called, ensuring fresh content.
export const dynamic = 'auto';

import { Suspense } from 'react';

export default async function BlogsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <div className="hidden lg:col-span-1 lg:block">
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
              </div>
              <div className="space-y-6 lg:col-span-3">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[360px] animate-pulse rounded-[2.5rem] bg-slate-50" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <BlogsContent />
    </Suspense>
  );
}

async function BlogsContent() {
  // Fetch initial data (Page 1), counts, and user on server in parallel.
  const [counts, blogsResult, user] = await Promise.all([
    getBlogCounts(),
    // MATCH CLIENT DEFAULT: Client defaults to 'Free' tab, so we must fetch Free blogs initially.
    // Otherwise, the 'Free' tab will show Premium (locked) blogs from the 'All' fetch.
    getBlogs({ page: 1, limit: 10, unitId: 'All', isFreeAccess: true }),
    verifyAuth(),
  ]);

  const { blogs, pagination } = blogsResult;

  return (
    <BlogsClient
      initialBlogs={blogs}
      initialPagination={pagination}
      initialCounts={counts}
      user={user}
    />
  );
}
