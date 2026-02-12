import { getBlogs } from "@/services/blog-service";
import AdminBlogsClient from "./AdminBlogsClient";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { mppscUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminBlogsPage() {
    // Auth Check
    const user = await verifyAuth();
    if (!user) redirect('/login');

    const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
    if (!dbUser || dbUser.role !== 'admin') redirect('/dashboard');

    const { blogs, pagination } = await getBlogs({ page: 1, limit: 10 });

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <AdminBlogsClient initialBlogs={blogs} initialPagination={pagination} />
            </div>
        </div>
    );
}
