import { userDal } from "@tsuki/db";

import { UsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const users = await userDal.getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">USERS</h1>
      </div>

      <UsersClient users={users} />
    </div>
  );
}
