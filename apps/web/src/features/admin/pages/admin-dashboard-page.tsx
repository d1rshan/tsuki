import { AdminDashboardStats } from "../components/admin-dashboard-stats";
import { AdminPage } from "../components/admin-page";
import { getUserCount } from "../data";

export async function AdminDashboardPage() {
  const totalUsers = await getUserCount();

  return (
    <AdminPage title="Overview">
      <AdminDashboardStats totalUsers={totalUsers} />
    </AdminPage>
  );
}
