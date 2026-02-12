"use server";

import { revalidateTag } from "next/cache";

export async function revalidateSyllabus() {
    revalidateTag("syllabus-base-data-v1" , {expire: 0});
    // Also revalidate the legacy tag if used
    revalidateTag("syllabus-topics" , {expire: 0});
    return { success: true, message: "Syllabus cache revalidated" };
}
