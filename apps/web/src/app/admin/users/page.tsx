import { headers } from "next/headers";

import { authClient } from "@/lib/auth-client";
import { AdminUsersTable } from "@/components/admin/admin-users-table";

export default async function AdminUsersPage() {
  const { data } = await authClient.admin.listUsers({
    query: { limit: 100 },
    fetchOptions: {
      headers: await headers(),
    },
  });

  const users = data?.users ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">USERS</h1>
      </div>

      <AdminUsersTable users={users} />
    </div>
  );
}
