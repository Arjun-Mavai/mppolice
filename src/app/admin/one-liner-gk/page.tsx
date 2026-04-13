import { requireAdmin } from '@/lib/auth-admin';
import OneLinerGkAdminClient from './OneLinerGkAdminClient';

export default async function OneLinerGkAdminPage() {
  await requireAdmin();
  return <OneLinerGkAdminClient />;
}
