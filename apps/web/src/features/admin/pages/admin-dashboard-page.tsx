import { Suspense } from "react";

import { LoadingIndicator } from "@/shared/components/loading-indicator";

import { AdminDashboardStats } from "../components/admin-dashboard-stats";
import { AdminPage } from "../components/admin-page";
import { getUserCount } from "../data";

export function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingIndicator label="Loading overview" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  const totalUsers = await getUserCount();

  return (
    <AdminPage title="Overview">
      <AdminDashboardStats totalUsers={totalUsers} />
    </AdminPage>
  );
}
