import { Suspense } from "react";
import { AdminUsersTable } from "@/modules/admin/components/admin-users-table";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const { user } = await auth();
  if (!user || (user.role !== "admin" && user.role !== "owner")) {
    redirect("/");
  }

  return (
    <div className="flex w-full flex-col gap-6 overflow-x-hidden">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black uppercase tracking-tighter">USERS</h1>
      </div>

      <Suspense fallback={<div className="h-24 w-full animate-pulse bg-muted rounded-md" />}>
        <AdminUsersTable />
      </Suspense>
    </div>
  );
}
