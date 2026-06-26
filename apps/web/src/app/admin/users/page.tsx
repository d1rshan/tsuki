import { userDal } from "@tsuki/db";

import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const users = await userDal.getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">USERS</h1>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
