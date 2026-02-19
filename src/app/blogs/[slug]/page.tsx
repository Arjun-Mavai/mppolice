import { getBlogBySlug, getCachedBlogs } from '@/services/blog-service';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogContentRenderer from './BlogContentRenderer';
import { verifyAuth } from '@/lib/auth';
import { canAccessBlog } from '@/lib/access-control';

// ISR: Revalidate every 7 days
export const revalidate = 604800;
export const dynamicParams = true; // Allow on-demand ISR for new blogs

export async function generateStaticParams() {
  const blogs = await getCachedBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Not Found' };

  return {
    title: `${blog.title} | MPPSC 2026`,
    description: blog.description || 'Study Material',
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  // 🔒 ACCESS CONTROL Logic
  // Server-Side check using cookies (No client spinner)
  let hasAccess = blog.isFreeAccess === true;

  if (!hasAccess) {
    const user = await verifyAuth();
    hasAccess = canAccessBlog(blog, user);
  }

  // If locked, strip sensitive content to prevent inspection hacks
  const isLocked = !hasAccess;
  const safeBlog = isLocked
    ? {
        ...blog,
        content: [], // Remove actual content
        // Ensure we keeping metadata for Hero/SEO
      }
    : blog;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppsc.zenscroll.app';

  // JSON-LD Article schema — helps Google show rich results for blog posts
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.description || '',
    url: `${baseUrl}/blogs/${slug}`,
    datePublished: blog.createdAt || new Date().toISOString(),
    dateModified: blog.updatedAt || blog.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Mindful MPPSC',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mindful MPPSC',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogContentRenderer blog={safeBlog} isLocked={isLocked} />
    </>
  );
}
