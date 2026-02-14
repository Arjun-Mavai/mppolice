// Admin Content Manager — Blog/Vlog upload + Test/Quiz creation hub
// Route: /admin/content-manager
// Protected by requireAdmin() — only admin role users can access
import { requireAdmin } from '@/lib/auth-admin';
import AdminUploadClient from './AdminUploadClient';

export default async function AdminUploadPage() {
  await requireAdmin();

  return <AdminUploadClient />;
}
