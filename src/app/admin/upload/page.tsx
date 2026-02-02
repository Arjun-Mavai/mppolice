import { requireAdmin } from "@/lib/auth-admin";
import AdminUploadClient from "./AdminUploadClient";

export default async function AdminUploadPage() {
    await requireAdmin();

    return <AdminUploadClient />;
}
