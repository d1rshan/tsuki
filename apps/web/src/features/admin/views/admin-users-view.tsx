import { AdminPage } from "../components/admin-page";
import { AdminUsersTable } from "../components/admin-users-table";

export function AdminUsersView() {
  return (
    <AdminPage title="Users">
      <div className="overflow-x-hidden">
        <AdminUsersTable />
      </div>
    </AdminPage>
  );
}
