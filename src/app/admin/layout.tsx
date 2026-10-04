import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import AdminShell from './AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await verifyAuth();

  if (!user) {
    redirect('/login?reason=admin_auth_required');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminShell>{children}</AdminShell>;
}
