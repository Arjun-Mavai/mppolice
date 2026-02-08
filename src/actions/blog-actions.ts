'use server'

// Blog Actions — Admin blog upload + cached blog fetching
// revalidateTag se on-demand cache bust hota h, unstable_cache se data cache hota h
import { db } from "@/db";
import { contentBlogs, mppscUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";
import { CACHE, cachedData } from "@/lib/cache";

/**
 * uploadBlog — Admin-only server action, blog DB me daalti h
 * Auth check → Admin check → JSON parse → DB insert → Cache bust
 */
export async function uploadBlog(data: any) {
    const user = await verifyAuth();
    if (!user) return { success: false, error: "Unauthorized" };

    // Admin check — sirf admin hi blog upload kar sakta h
    const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
    if (!dbUser || dbUser.role !== 'admin') {
        return { success: false, error: "Forbidden: Admin only" };
    }

    try {
        const { imageUrl, contentJson } = data;
        const parsed = JSON.parse(contentJson);

        if (!parsed.metadata || !parsed.content) {
            return { success: false, error: "Invalid JSON: Must contain 'metadata' and 'content' keys" };
        }

        const { metadata, content } = parsed;

        if (!metadata.title || !metadata.slug || !metadata.category) {
            return { success: false, error: "Missing required metadata: title, slug, or category" };
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
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Cache bust — blog list aur specific slug dono ka cache hata do
        revalidatePath('/blogs');
        revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });
        revalidateTag(CACHE.BLOGS.TAGS.DETAIL(metadata.slug), { expire: 0 });

        return { success: true };
    } catch (error: any) {
        logger.error("Upload Blog Error:", error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return { success: false, error: "Slug already exists" };
        }
        return { success: false, error: error.message || "Failed to create blog post" };
    }
}

/**
 * getCachedBlogs — unstable_cache se wrapped, 1 hour cache
 * revalidateTag('blogs-list') se on-demand bust hoga
 */
export const getCachedBlogs = cachedData(
    async () => {
        try {
            return await db.select().from(contentBlogs).orderBy(desc(contentBlogs.createdAt));
        } catch (error) {
            logger.error("Get Blogs Error:", error);
            return [];
        }
    },
    ['blogs-list'],
    CACHE.BLOGS.GET_ALL.tags,
    CACHE.BLOGS.GET_ALL.revalidate
);

// Wrapper — consistent interface for blog list fetch
export async function getBlogs() {
    return await getCachedBlogs();
}

/**
 * getBlogBySlug — slug se specific blog fetch, 1 hour cached
 * revalidateTag('blog-{slug}') se on-demand bust hoga
 */
export const getBlogBySlug = async (slug: string) => {
    const { revalidate, tags } = CACHE.BLOGS.GET_BY_SLUG(slug);
    return await cachedData(
        async () => {
            try {
                return await db.select().from(contentBlogs).where(eq(contentBlogs.slug, slug)).get() ?? null;
            } catch (error) {
                logger.error("Get Blog Error:", error);
                return null;
            }
        },
        [`blog-${slug}`],
        tags,
        revalidate
    )();
};
