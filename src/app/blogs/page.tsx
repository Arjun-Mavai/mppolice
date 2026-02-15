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

export default async function BlogsPage() {
  // Fetch initial data (Page 1) and counts on server. Fast, SEO-friendly.
  const counts = await getBlogCounts();
  const { blogs, pagination } = await getBlogs({ page: 1, limit: 10, unitId: 'All' });

  return <BlogsClient initialBlogs={blogs} initialPagination={pagination} initialCounts={counts} />;
}
