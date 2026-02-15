'use server';

// Blog Actions — Admin blog upload + cached blog fetching
// revalidateTag se on-demand cache bust hota h, unstable_cache se data cache hota h
import { db } from '@/db';
import { contentBlogs, mppscUsers } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { CACHE } from '@/lib/cache';
import { eq } from 'drizzle-orm';
import * as blogService from '@/services/blog-service';

/**
 * uploadBlog — Admin-only server action, blog DB me daalti h
 * Auth check → Admin check → JSON parse → DB insert → Cache bust
 */
export async function uploadBlog(data: any) {
  const user = await verifyAuth();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Admin check — sirf admin hi blog upload kar sakta h
  const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
  if (!dbUser || dbUser.role !== 'admin') {
    return { success: false, error: 'Forbidden: Admin only' };
  }

  try {
    const { imageUrl, contentJson } = data;
    const parsed = JSON.parse(contentJson);

    if (!parsed.metadata || !parsed.content) {
      return { success: false, error: "Invalid JSON: Must contain 'metadata' and 'content' keys" };
    }

    const { metadata, content } = parsed;

    if (!metadata.title || !metadata.slug || !metadata.category) {
      return { success: false, error: 'Missing required metadata: title, slug, or category' };
    }

    // Content bilingual hona chahiye — hi aur en dono keys zaroori
    if (!content.hi || !content.en) {
      return { success: false, error: "Content must have both 'hi' and 'en' keys" };
    }

    await db.insert(contentBlogs).values({
      id: crypto.randomUUID(),
      title: metadata.title,
      slug: metadata.slug,
      description: metadata.description || '',
      category: metadata.category,
      imageUrl: imageUrl || null,
      readingTime: parseInt(metadata.readingTime) || 5,
      content,
      contentType: metadata.type || 'blog',
      unitId: metadata.unit || null,
      topicId: metadata.topic || null, // Store the topic string directly as provided
      isPremium: metadata.isPremium !== undefined ? metadata.isPremium : true, // Legacy flag
      isFreeAccess: metadata.isPremium === false || metadata.isFreeAccess === true, // Free if not premium
      isLiteAccess: false, // Default: not for lite
      isProAccess: true, // Default: pro users can access
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Cache bust — blog list aur specific slug dono ka cache hata do
    revalidatePath('/blogs');
    revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 }); // Bust list cache
    revalidateTag(CACHE.BLOGS.TAGS.DETAIL(metadata.slug), { expire: 0 }); // Bust detail cache

    return { success: true };
  } catch (error: any) {
    logger.error('Upload Blog Error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return { success: false, error: 'Slug already exists' };
    }
    return { success: false, error: error.message || 'Failed to create blog post' };
  }
}

/**
 * toggleBlogPremium — Toggle premium status of a blog
 */
export async function toggleBlogPremium(blogId: string, isPremium: boolean) {
  const user = await verifyAuth();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Admin check
  const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
  if (!dbUser || dbUser.role !== 'admin') {
    return { success: false, error: 'Forbidden: Admin only' };
  }

  try {
    await db
      .update(contentBlogs)
      .set({
        isPremium,
        isFreeAccess: !isPremium, // Keep in sync
        updatedAt: new Date(),
      })
      .where(eq(contentBlogs.id, blogId));

    revalidatePath('/blogs');
    revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });

    // Also fetch slug to revalidate detail page
    const blog = await db
      .select({ slug: contentBlogs.slug })
      .from(contentBlogs)
      .where(eq(contentBlogs.id, blogId))
      .get();
    if (blog) {
      revalidateTag(CACHE.BLOGS.TAGS.DETAIL(blog.slug), { expire: 0 });
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Toggle Blog Premium Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * getCachedBlogs — unstable_cache se wrapped, 1 hour cache
 * Used for generateStaticParams to fetch ALL blogs
 */
export const getCachedBlogs = blogService.getCachedBlogs;

/**
 * getBlogCounts — Fetch counts of blogs per unit with caching
 * Zero impact on performance due to server-side caching
 */
export const getBlogCounts = blogService.getBlogCounts;

/**
 * getBlogs — Paginated, filtered blog fetcher
 */
export async function getBlogs(params: any = {}) {
  return blogService.getBlogs(params);
}

/**
 * getBlogBySlug — slug se specific blog fetch, 1 hour cached
 * revalidateTag('blog-{slug}') se on-demand bust hoga
 */
export const getBlogBySlug = blogService.getBlogBySlug;
