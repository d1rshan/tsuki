"use client";

import { authClient } from "@/lib/auth-client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

export type UserData = typeof authClient.$Infer.Session.user;

export function AdminUsersTable({ users }: { users: UserData[] }) {
  return (
    <DataTable
      columns={columns}
      data={users}
      searchKey="email"
      searchPlaceholder="Search users by email..."
    />
  );
}
