import { userDal } from "@tsuki/db";

import { DashboardStats } from "@/components/admin/dashboard-stats";

export default async function AdminDashboardPage() {
  const users = await userDal.getAllUsers();
  const totalUsers = users.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">OVERVIEW</h1>
      </div>

      <DashboardStats totalUsers={totalUsers} />
    </div>
  );
}
