'use server'

import { db } from "@/db";
import { contentBlogs, mppscUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";
import { CACHE, cachedData } from "@/lib/cache";
import { unstable_cache } from "next/cache";
export async function uploadBlog(data: any) {
    const user = await verifyAuth();
    if (!user) return { success: false, error: "Unauthorized" };

    // Admin Check
    const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
    if (!dbUser || dbUser.role !== 'admin') {
        return { success: false, error: "Forbidden: Admin only" };
    }

    try {
        const { imageUrl, contentJson } = data;
        
        // Parse and validate JSON structure
        const parsed = JSON.parse(contentJson);
        
        if (!parsed.metadata || !parsed.content) {
            return { success: false, error: "Invalid JSON: Must contain 'metadata' and 'content' keys" };
        }

        const { metadata, content } = parsed;

        // Validate required metadata fields
        if (!metadata.title || !metadata.slug || !metadata.category) {
            return { success: false, error: "Missing required metadata: title, slug, or category" };
        }

        // Validate content structure
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

        revalidatePath('/blogs');
        revalidateTag(CACHE.BLOGS.TAGS.ALL, 'default');
        revalidateTag(CACHE.BLOGS.TAGS.DETAIL(metadata.slug), 'default');
        
        return { success: true };
    } catch (error: any) {
        logger.error("Upload Blog Error:", error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return { success: false, error: "Slug already exists" };
        }
        return { success: false, error: error.message || "Failed to create blog post" };
    }
}



export const getCachedBlogs = cachedData(
    async () => {
        try {
            const blogs = await db.select().from(contentBlogs).orderBy(desc(contentBlogs.createdAt));
            return blogs;
        } catch (error) {
            logger.error("Get Blogs Error:", error);
            return [];
        }
    },
    ['blogs-list'],
    CACHE.BLOGS.GET_ALL.tags,
    CACHE.BLOGS.GET_ALL.revalidate
);

export async function getBlogs() {
    return await getCachedBlogs();
}

export const getBlogBySlug = async (slug: string) => {
    return await unstable_cache(
        async () => {
            try {
                const blog = await db.select().from(contentBlogs).where(eq(contentBlogs.slug, slug)).get();
                return blog;
            } catch (error) {
                logger.error("Get Blog Error:", error);
                return null;
            }
        },
        [`blog-${slug}`],
        {
            revalidate: CACHE.BLOGS.GET_BY_SLUG(slug).revalidate,
            tags: CACHE.BLOGS.GET_BY_SLUG(slug).tags
        }
    )();
};
