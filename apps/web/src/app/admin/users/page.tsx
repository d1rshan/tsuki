import { AdminPage } from "@/modules/admin/components/admin-page";
import { AdminUsersTable } from "@/modules/admin/components/admin-users-table";
import { requireAdmin } from "@/modules/admin/lib/admin";

export default async function AdminUsersPage() {
  await requireAdmin();

  return (
    <AdminPage title="Users">
      <div className="overflow-x-hidden">
        <AdminUsersTable />
      </div>
    </AdminPage>
  );
}
