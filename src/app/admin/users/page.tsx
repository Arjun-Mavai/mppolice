import { requireAdmin } from '@/lib/auth-admin';
import UsersClient from './UsersClient';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 👥 ADMIN USERS PAGE — Server component (auth guard)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await requireAdmin();
  return <UsersClient />;
}
