'use server';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎛️ BLOG ACCESS ACTIONS — Admin se blog access flags toggle karo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Same pattern as test-access/topic-access
// Toggle DB flags → cache bust → fresh data
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { db } from '@/db';
import { contentBlogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-admin';
import { logger } from '@/lib/logger';
import { CACHE } from '@/lib/cache';

/**
 * getAllBlogsForAdmin — Sab blogs fetch with access flags
 * No cache — admin ko fresh data chahiye
 */
export async function getAllBlogsForAdmin() {
  await requireAdmin();

  const allBlogs = await db
    .select({
      id: contentBlogs.id,
      slug: contentBlogs.slug,
      title: contentBlogs.title,
      category: contentBlogs.category,
      unitId: contentBlogs.unitId,
      isPremium: contentBlogs.isPremium,
      isFreeAccess: contentBlogs.isFreeAccess,
      isLiteAccess: contentBlogs.isLiteAccess,
      isProAccess: contentBlogs.isProAccess,
      isPublished: contentBlogs.isPublished,
      isHidden: contentBlogs.isHidden,
      createdAt: contentBlogs.createdAt,
    })
    .from(contentBlogs)
    .orderBy(contentBlogs.createdAt);

  return allBlogs;
}

/**
 * toggleBlogAccess — Single blog ka ek flag toggle karo
 *
 * Legacy isPremium bhi sync me rakhta h:
 * - isFreeAccess = true → isPremium = false (kyuki free hai)
 * - isFreeAccess = false + isLiteAccess = false → isPremium = true
 */
export async function toggleBlogAccess(
  blogId: string,
  field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess',
  value: boolean
) {
  await requireAdmin();

  // Update the specific field
  await db
    .update(contentBlogs)
    .set({ [field]: value, updatedAt: new Date() })
    .where(eq(contentBlogs.id, blogId));

  // Sync legacy isPremium — agar free hai to premium false
  if (field === 'isFreeAccess' && value === true) {
    await db.update(contentBlogs).set({ isPremium: false }).where(eq(contentBlogs.id, blogId));
  }

  // Cache bust — blog pages re-fetch honge
  revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });
  revalidatePath('/blogs');

  // Blog slug bhi bust karo
  const blog = await db
    .select({ slug: contentBlogs.slug })
    .from(contentBlogs)
    .where(eq(contentBlogs.id, blogId))
    .get();
  if (blog) {
    revalidateTag(CACHE.BLOGS.TAGS.DETAIL(blog.slug), { expire: 0 });
  }

  logger.info(`Blog access updated: ${blogId} → ${field}=${value}`);

  return { success: true };
}

/**
 * bulkUpdateBlogAccess — Unit/category wise blog access set karo
 * unitId = 'all' → sab blogs update
 * unitId = 'unit_1' → sirf us unit ke blogs
 * unitId = 'no_unit' → unassigned blogs (unitId null)
 */
export async function bulkUpdateBlogAccess(
  field: 'isFreeAccess' | 'isLiteAccess' | 'isProAccess',
  value: boolean,
  unitId?: string
) {
  await requireAdmin();

  if (unitId && unitId !== 'all') {
    if (unitId === 'no_unit') {
      // Blogs without unitId
      await db
        .update(contentBlogs)
        .set({ [field]: value, updatedAt: new Date() })
        .where(sql`${contentBlogs.unitId} IS NULL`);
    } else {
      await db
        .update(contentBlogs)
        .set({ [field]: value, updatedAt: new Date() })
        .where(eq(contentBlogs.unitId, unitId));
    }
  } else {
    // All blogs
    await db.update(contentBlogs).set({ [field]: value, updatedAt: new Date() });
  }

  revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });
  revalidatePath('/blogs');

  logger.info(`Bulk blog access: ${unitId || 'all'} → ${field}=${value}`);

  return { success: true };
}

/**
 * toggleBlogHidden — Blog ko hide/unhide karo
 * Hidden blogs user ko nahi dikhenge
 */
export async function toggleBlogHidden(blogId: string, isHidden: boolean) {
  await requireAdmin();

  await db
    .update(contentBlogs)
    .set({ isHidden, updatedAt: new Date() })
    .where(eq(contentBlogs.id, blogId));

  revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });
  revalidatePath('/blogs');

  const blog = await db
    .select({ slug: contentBlogs.slug })
    .from(contentBlogs)
    .where(eq(contentBlogs.id, blogId))
    .get();
  if (blog) {
    revalidateTag(CACHE.BLOGS.TAGS.DETAIL(blog.slug), { expire: 0 });
  }

  logger.info(`Blog hidden toggled: ${blogId} → isHidden=${isHidden}`);
  return { success: true };
}

/**
 * deleteBlog — Blog ko permanent delete karo
 */
export async function deleteBlog(blogId: string) {
  await requireAdmin();

  try {
    // Slug fetch karo cache bust karne ke liye
    const blog = await db
      .select({ slug: contentBlogs.slug })
      .from(contentBlogs)
      .where(eq(contentBlogs.id, blogId))
      .get();

    await db.delete(contentBlogs).where(eq(contentBlogs.id, blogId));

    // Cache bust
    revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });
    revalidatePath('/blogs');
    if (blog) {
      revalidateTag(CACHE.BLOGS.TAGS.DETAIL(blog.slug), { expire: 0 });
    }

    logger.info(`Blog deleted: ${blogId}`);
    return { success: true };
  } catch (error: any) {
    logger.error('Delete Blog Error:', error);
    return { success: false, error: error.message };
  }
}
