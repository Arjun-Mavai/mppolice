import { getBlogBySlug, getCachedBlogs } from '@/services/blog-service';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogContentRenderer from './BlogContentRenderer';
import { verifyAuth } from '@/lib/auth';
import { canAccessBlog } from '@/lib/access-control';
import Script from 'next/script';

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

  const title = `${blog.title} | MP Police 2026`;
  const description =
    blog.description || 'MP Police Study Material, Test Series, and Analytics - Mindful MP Police';
  const url = `/blogs/${slug}`;
  // Use specific blog image if available, otherwise use the new generic OG image
  const images = blog.imageUrl
    ? [{ url: blog.imageUrl }]
    : [
        {
          url: '/images/mppolice-blog-og.png',
          width: 1200,
          height: 630,
          alt: 'MP Police Blogs - Exam Date 26 April 2026',
        },
      ];

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mppolice.zenscroll.app'),
    title,
    description,
    keywords: [
      'MP Police',
      'MP Police 2026',
      'MP Police Test Series',
      'Best Test Series',
      'MP Police Notification',
      'MP',
      'Madhya Pradesh',
      blog.category,
      'MP Police Mains',
      'MP Police Prelims',
      'MP Police Syllabus',
      'MP Police Exam Date',
      'MP Police Result',
      'MP Police Cut Off',
      'MP Police Previous Year Papers',
      'MP Police Books',
      'MP Police Notes',
      'MP Police Online Coaching',

      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
      'mppolice online coaching',
      'mppolice online classes',
      'mppolice online preparation',
      'mppolice online study material',
      'mppolice online test series',
    ],
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'Mindful MP Police',
      locale: 'en_IN',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppolice.zenscroll.app';
  // Use specific blog image if available, otherwise use the new generic OG image
  const finalImageUrl = blog.imageUrl || `${baseUrl}/images/mppolice-blog-og.png`;

  // JSON-LD Article schema — helps Google show rich results for blog posts
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.description || '',
    image: [finalImageUrl],
    url: `${baseUrl}/blogs/${slug}`,
    datePublished: blog.createdAt || new Date().toISOString(),
    dateModified: blog.updatedAt || blog.createdAt || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Mindful MP Police',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mindful MP Police',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.png`,
      },
      url: baseUrl,
    },
    keywords: [
      'MP Police',
      'MP Police Test Series',
      'Best Test Series',
      blog.category,
      'MP Police Preparation',
    ].join(', '),
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogContentRenderer blog={safeBlog} isLocked={isLocked} />
    </>
  );
}
