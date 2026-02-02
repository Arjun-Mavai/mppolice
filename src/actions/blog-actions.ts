'use server'

import { db } from "@/db";
import { contentBlogs, mppscUsers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function uploadBlog(data: any) {
    const user = await verifyAuth();
    if (!user) return { success: false, error: "Unauthorized" };

    // Admin Check
    const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
    if (!dbUser || dbUser.role !== 'admin') {
        return { success: false, error: "Forbidden: Admin only" };
    }

    try {
        const { title, slug, description, category, imageUrl, readingTime, contentJson, contentType } = data;
        
        // Parse JSON content to ensure it's valid before saving
        const content = JSON.parse(contentJson);

        await db.insert(contentBlogs).values({
            id: crypto.randomUUID(),
            title,
            slug,
            description,
            category,
            imageUrl,
            readingTime: parseInt(readingTime),
            content,
            contentType: contentType || 'blog', // Default to blog
            isPublished: true, // Auto publish for now
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath('/blogs');
        return { success: true };
    } catch (error: any) {
        console.error("Upload Blog Error:", error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return { success: false, error: "Slug already exists" };
        }
        return { success: false, error: "Failed to create blog post" };
    }
}

import { unstable_cache } from "next/cache";

export const getCachedBlogs = unstable_cache(
    async () => {
        try {
            const blogs = await db.select().from(contentBlogs).orderBy(desc(contentBlogs.createdAt));
            return blogs;
        } catch (error) {
            console.error("Get Blogs Error:", error);
            return [];
        }
    },
    ['blogs-list'],
    { revalidate: 3600, tags: ['blogs'] }
);

export async function getBlogs() {
    return await getCachedBlogs();
}

export async function getBlogBySlug(slug: string) {
    try {
        const blog = await db.select().from(contentBlogs).where(eq(contentBlogs.slug, slug)).get();
        return blog;
    } catch (error) {
        console.error("Get Blog Error:", error);
        return null;
    }
}
