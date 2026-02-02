import { getBlogBySlug } from "@/actions/blog-actions";
import { notFound } from "next/navigation";
import BlogContentRenderer from "./BlogContentRenderer"; // Client component for reading progress and rendering
import { Metadata } from "next";

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const blog = await getBlogBySlug(params.slug);
    if (!blog) return { title: 'Not Found' };
    
    return {
        title: `${blog.title} | MPPSC 2026`,
        description: blog.description || 'Study Material',
    };
}

export default async function BlogDetailPage({ params }: PageProps) {
    const blog = await getBlogBySlug(params.slug);

    if (!blog) {
        notFound();
    }

    return (
        <BlogContentRenderer blog={blog} />
    );
}
