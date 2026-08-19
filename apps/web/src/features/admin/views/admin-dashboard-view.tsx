import { Suspense } from "react";

import { Loader } from "@/shared/components/loader";

import { AdminDashboardStats } from "../components/admin-dashboard-stats";
import { AdminPage } from "../components/admin-page";
import { getUserCount } from "../data";

export function AdminDashboardView() {
  return (
    <Suspense fallback={<Loader />}>
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
