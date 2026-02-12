import { requireAdmin } from "@/lib/auth-admin";
import { getUserDashboardData } from "./actions";
import UserDashboardClient from "./UserDashboardClient";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
    await requireAdmin();
    const users = await getUserDashboardData();
    return <UserDashboardClient users={users} />;
}
