import { getBlogBySlug, getCachedBlogs } from "@/actions/blog-actions";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogContentRenderer from "./BlogContentRenderer";

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

    return (
        <BlogContentRenderer blog={blog} />
    );
}
