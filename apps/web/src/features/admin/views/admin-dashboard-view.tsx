import { Users } from "lucide-react";

import { AdminDashboardStatsCard } from "../components/admin-dashboard-stats-card";
import { AdminPage } from "../components/admin-page";
import { getUserCount } from "../data";

export function AdminDashboardView() {
  return (
    <AdminPage title="Overview">
      <div className="grid gap-4 md:max-w-sm">
        <AdminDashboardStatsCard label="Total Users" icon={Users} value={getUserCount} />
      </div>
    </AdminPage>
  );
}
