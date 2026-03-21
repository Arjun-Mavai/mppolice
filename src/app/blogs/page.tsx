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

export default async function BlogsPage() {
  return <BlogsContent />;
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
