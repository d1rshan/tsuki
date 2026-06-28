import { headers } from "next/headers";

import { authClient } from "@tsuki/auth/client";
import { AdminDashboardStats } from "@/components/admin/admin-dashboard-stats";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const { user } = await auth();
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    redirect("/");
  }

  const { data } = await authClient.admin.listUsers({
    query: { limit: 1 },
    fetchOptions: {
      headers: await headers(),
    },
  });

  const totalUsers = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">OVERVIEW</h1>
      </div>

      <AdminDashboardStats totalUsers={totalUsers} />
    </div>
  );
}
