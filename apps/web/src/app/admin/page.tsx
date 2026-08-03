import { headers } from "next/headers";

import { authClient } from "@tsuki/auth/client";

import { AdminPage } from "@/modules/admin/components/admin-page";
import { AdminDashboardStats } from "@/modules/admin/components/admin-dashboard-stats";
import { requireAdmin } from "@/modules/admin/lib/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const { data } = await authClient.admin.listUsers({
    query: { limit: 1 },
    fetchOptions: {
      headers: await headers(),
    },
  });

  const totalUsers = data?.total ?? 0;

  return (
    <AdminPage title="Overview">
      <AdminDashboardStats totalUsers={totalUsers} />
    </AdminPage>
  );
}
