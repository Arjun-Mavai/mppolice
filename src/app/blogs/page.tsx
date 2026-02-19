import { getBlogs, getBlogCounts } from '@/services/blog-service';
import BlogsClient from './BlogsClient';

export const metadata = {
  title: 'MPPSC Study Blogs & Articles | MPPSC Knowledge',
  description:
    'Read high-quality articles, strategies, and notes for MPPSC preparation. Covering History, Geography, Polity, and MP Special topics.',
};

// Force Static Generation
export const dynamic = 'force-static';
// Revalidate every hour (optional, since we use on-demand revalidation, but good safety net)
export const revalidate = 3600;

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
  // Fetch initial data (Page 1) and counts in parallel.
  // User is explicitly NOT fetched here to allow SSG.
  const [counts, blogsResult] = await Promise.all([
    getBlogCounts(),
    getBlogs({ page: 1, limit: 10, unitId: 'All', isFreeAccess: true }),
  ]);

  const { blogs, pagination } = blogsResult;

  return (
    <BlogsClient
      initialBlogs={blogs}
      initialPagination={pagination}
      initialCounts={counts}
      user={null} // Client will hydrate user from store
    />
  );
}
